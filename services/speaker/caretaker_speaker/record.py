"""Voice enrollment recorder: tiny local web page. `python -m caretaker_speaker.record`.

Each accepted sentence is saved to data/enroll/<id>/<session>/NN.wav the moment it passes
the quality check, so quitting mid-way loses nothing.
"""
import io
import json
import os
import re
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import numpy as np
import soundfile as sf

from .audio import SR, load_wav
from .enroll import ROOT

PORT = 8770
ENROLL = ROOT / "data" / "enroll"
REJECTED = ROOT / "data" / "rejected"  # outside enroll/ so voiceprints never read it
CONFIG = ROOT / "demo.config.json"
FRAME = SR // 50  # 20 ms
_lock = threading.Lock()

# One source of truth: also served at /api/limits so the page's live meter matches the check.
# Speech = a frame louder than (room noise + margin_db), never counted above quiet_db.
LIMITS = {"silent_db": -54, "quiet_db": -42, "clip_db": -1, "margin_db": 15, "min_speech_s": 2.0}


def _frame_db(wav: np.ndarray) -> np.ndarray:
    n = len(wav) // FRAME
    if n == 0:
        return np.array([-120.0])
    rms = np.sqrt((wav[: n * FRAME].reshape(n, FRAME) ** 2).mean(axis=1))
    return 20 * np.log10(np.maximum(rms, 1e-6))


def quality(wav: np.ndarray) -> tuple[str | None, dict]:
    """(None, stats) if usable, else (plain-language reason to retake, stats)."""
    L = LIMITS
    peak_db = 20 * np.log10(max(float(np.abs(wav).max()) if len(wav) else 0.0, 1e-6))
    db = _frame_db(wav)
    floor, level = float(np.percentile(db, 10)), float(np.percentile(db, 95))
    thr = min(max(floor + L["margin_db"], L["quiet_db"] - 10), L["quiet_db"])
    speech_s = float((db > thr).sum()) * FRAME / SR
    stats = {"speech_s": round(speech_s, 1), "level_db": round(level), "peak_db": round(float(peak_db)),
             "floor_db": round(floor)}
    if peak_db < L["silent_db"]:
        return "silent", stats
    if peak_db >= L["clip_db"]:
        return "clipped", stats
    if level < L["quiet_db"]:
        return "too quiet", stats
    if speech_s < L["min_speech_s"]:
        return "too short", stats
    return None, stats


def _atomic(path: Path, data: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_bytes(data)
    os.replace(tmp, path)


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def people() -> list[dict]:
    out = []
    for p in json.loads(CONFIG.read_text())["people"]:
        sessions = sorted(d for d in (ENROLL / p["id"]).glob("*") if d.is_dir())
        clips = [c for d in sessions for c in d.glob("*.wav")]
        seconds = sum(sf.info(str(c)).duration for c in clips)
        last = {"session": sessions[-1].name, "done": len(list(sessions[-1].glob("*.wav")))} if sessions else None
        out.append({"id": p["id"], "name": p["name"], "sessions": len(sessions),
                    "seconds": round(seconds), "last": last})
    return out


def add_person(name: str) -> dict:
    cfg = json.loads(CONFIG.read_text())
    pid = _slug(name)
    if not pid:
        raise ValueError("name needed")
    if not any(p["id"] == pid for p in cfg["people"]):
        cfg["people"].append({"id": pid, "name": name.strip()})
        _atomic(CONFIG, (json.dumps(cfg, indent=2, ensure_ascii=False) + "\n").encode())
    return {"id": pid}


class H(BaseHTTPRequestHandler):
    def _send(self, code, body: bytes, ctype="application/json"):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _json(self, obj, code=200):
        self._send(code, json.dumps(obj).encode())

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/":
            self._send(200, (Path(__file__).parent / "record.html").read_bytes(), "text/html; charset=utf-8")
        elif path == "/api/people":
            self._json(people())
        elif path == "/api/limits":
            self._json(LIMITS)
        else:
            self._send(404, b"")

    def do_POST(self):
        u = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(u.query).items()}
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        try:
            with _lock:
                if u.path == "/api/people":
                    self._json(add_person(json.loads(body)["name"]))
                elif u.path == "/api/clip":
                    self._json(self._clip(q, body))
                else:
                    self._send(404, b"")
        except (ValueError, KeyError, RuntimeError) as e:
            self._json({"ok": False, "reason": str(e)}, 400)

    def _clip(self, q, body):
        pid, session, n = _slug(q["id"]), _slug(q["session"]), int(q["n"])
        wav, sr = sf.read(io.BytesIO(body), dtype="float32")
        if sr != SR:
            raise ValueError("bad sample rate")
        reason, stats = quality(wav)
        if reason:  # keep failures: tune LIMITS on real takes instead of guessing
            _atomic(REJECTED / pid / f"{session}-{n:02d}-{reason.replace(' ', '-')}.wav", body)
            return {"ok": False, "reason": reason, "stats": stats}
        _atomic(ENROLL / pid / session / f"{n:02d}.wav", body)
        return {"ok": True, "stats": stats}

    def log_message(self, *a):
        pass


def main():
    url = f"http://localhost:{PORT}"
    try:
        srv = ThreadingHTTPServer(("127.0.0.1", PORT), H)
    except OSError:  # already running: just open it
        print("Recorder already running at", url)
        webbrowser.open(url)
        return
    print("Caretaker recorder at", url, "(Ctrl-C to stop)")
    webbrowser.open(url)
    srv.serve_forever()


if __name__ == "__main__":
    main()
