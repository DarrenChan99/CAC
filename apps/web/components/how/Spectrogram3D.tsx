"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import stats from "@/lib/how/stats.json";
import { Panel, Term } from "./Term";
import { Stage, textSprite, type SceneCtx, type SceneHandle } from "./three/Stage";

const voices = [stats.signal, stats.signal2];
const nameOf = (id: string) => stats.people.find((p) => p.id === id)?.name ?? id;
const W = 5.4, D = 2.4, H = 1.5;

interface Handle extends SceneHandle { setVoice: (i: number) => void }

/** Real log-Mel spectrograms of two people's recordings as height-fields that morph between them, with waveform and VAD segments on the floor. */
function setupSpectrogram({ scene, camera, controls, color }: SceneCtx): Handle {
  camera.position.set(-0.5, 2.5, 4.7);
  controls.target.set(0, 0.35, 0.1);
  controls.minDistance = 3.5;
  controls.maxDistance = 10;

  const R = voices[0].logmel.length, C = voices[0].logmel[0].length;
  const at = (i: number, r: number, k: number) => { const m = voices[i].logmel; return m[r][Math.round((k / (C - 1)) * (m[r].length - 1))] / 255; };
  const lo = color("--color-stage").lerp(color("--color-series-1"), 0.35), mid = color("--color-series-1"), hi = color("--color-accent");
  const pos = new Float32Array(R * C * 3), col = new Float32Array(R * C * 3);
  const from = new Float32Array(R * C), to = new Float32Array(R * C), cur = new Float32Array(R * C);
  const c = new THREE.Color();
  for (let r = 0; r < R; r++)
    for (let k = 0; k < C; k++) pos.set([(k / (C - 1) - 0.5) * W, 0, (0.5 - r / (R - 1)) * D], (r * C + k) * 3);
  const idx: number[] = [];
  for (let r = 0; r < R - 1; r++)
    for (let k = 0; k < C - 1; k++) {
      const a = r * C + k;
      idx.push(a, a + C, a + 1, a + 1, a + C, a + C + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx);
  scene.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(-2, 5, 4);
  scene.add(sun);

  const shape = (f: number) => {
    for (let r = 0; r < R; r++)
      for (let k = 0; k < C; k++) {
        const i = r * C + k, v = from[i] + (to[i] - from[i]) * f;
        cur[i] = v;
        pos[i * 3 + 1] = v * H;
        (v < 0.5 ? c.copy(lo).lerp(mid, v * 2) : c.copy(mid).lerp(hi, (v - 0.5) * 2)).toArray(col, i * 3);
      }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.computeVertexNormals();
  };

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.3, D + 0.3), new THREE.MeshBasicMaterial({ color: color("--color-bg"), transparent: true, opacity: 0.08 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  scene.add(floor);

  // VAD segments and the mirrored waveform envelope belong to the clip on show
  const clip = new THREE.Group();
  scene.add(clip);
  const accent = new THREE.MeshBasicMaterial({ color: color("--color-accent") });
  const wm = new THREE.LineBasicMaterial({ color: color("--color-accent") });
  const showClip = (i: number) => {
    const S = voices[i];
    clip.clear();
    S.vad.forEach(([a, b]) => {
      const w = ((b - a) / S.seconds) * W;
      const seg = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, 0.14), accent);
      seg.position.set((a / S.seconds - 0.5) * W + w / 2, 0.015, D / 2 + 0.28);
      clip.add(seg);
    });
    const up: THREE.Vector3[] = [], down: THREE.Vector3[] = [];
    const peak = Math.max(...S.envelope, 1e-6);
    S.envelope.forEach((e, k) => {
      const x = (k / (S.envelope.length - 1) - 0.5) * W, h = (e / peak) * 0.32;
      up.push(new THREE.Vector3(x, 0.36 + h, D / 2 + 0.62));
      down.push(new THREE.Vector3(x, 0.36 - h, D / 2 + 0.62));
    });
    clip.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(up), wm), new THREE.Line(new THREE.BufferGeometry().setFromPoints(down), wm));
  };

  const label = (t: string, x: number, y: number, z: number, s = 1) => {
    const sp = textSprite(t, { px: 48 });
    sp.position.set(x, y, z);
    sp.scale.multiplyScalar(s);
    scene.add(sp);
  };
  label("time →", 0, -0.12, D / 2 + 1.0, 0.7);
  label("pitch ↑", -W / 2 - 0.55, 0.3, -D / 2 + 0.2, 0.7);
  label("speech found", -W / 2 + 0.2, 0.05, D / 2 + 0.28, 0.55);
  label("taller = louder", W / 2 - 0.3, H + 0.45, -D / 2, 0.6);

  // scan frame sweeping through time (outline only, so it never hides the terrain)
  const fy = H + 0.3, fz = D / 2 + 0.1;
  const scan = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -fz), new THREE.Vector3(0, fy, -fz), new THREE.Vector3(0, fy, fz), new THREE.Vector3(0, 0, fz)]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }),
  );
  scene.add(scan);

  let t0 = 0, dur = 0, started = false;
  const setVoice = (i: number) => {
    from.set(started ? cur : to);
    for (let r = 0; r < R; r++) for (let k = 0; k < C; k++) to[r * C + k] = at(i, r, k);
    if (!started) from.set(to);
    started = true;
    showClip(i);
    t0 = performance.now();
    dur = 700;
  };
  setVoice(0);

  return {
    setVoice,
    update(t: number) {
      scan.position.x = (((t * 0.18) % 1) - 0.5) * W;
      if (dur) {
        const k = Math.min(1, (performance.now() - t0) / dur);
        shape(k * k * (3 - 2 * k));
        if (k === 1) dur = 0;
      }
    },
  };
}

export function Spectrogram3D() {
  const api = useRef<Handle | null>(null);
  const [voice, setVoice] = useState(0);
  const latest = useRef(0);
  const onHandle = useCallback((h: SceneHandle | null) => { api.current = h as Handle | null; api.current?.setVoice(latest.current); }, []);
  useEffect(() => { latest.current = voice; api.current?.setVoice(voice); }, [voice]);
  const S = voices[voice];
  return (
    <Panel
      title="What the model actually hears"
      sub={<>A real {S.seconds}-second recording of {nameOf(S.person)}, turned into a <Term k="mel">map of pitch over time</Term> and drawn as terrain. The ridges are the voice; the bars along the front mark where <Term k="vad">speech was found</Term>. Switch voices: the terrain changes shape. The model never sees the words, only this shape.</>}
    >
      <div role="group" aria-label="Whose voice" className="mb-3 flex w-fit rounded-full border border-tint p-0.5">
        {voices.map((v, i) => (
          <button key={v.person} onClick={() => setVoice(i)} aria-pressed={voice === i}
            className={`min-h-[44px] rounded-full px-4 text-f-small font-medium transition-colors ${voice === i ? "bg-primary text-white" : "text-primary hover:bg-tint"}`}>
            {nameOf(v.person)}&apos;s voice
          </button>
        ))}
      </div>
      <Stage setup={setupSpectrogram} onHandle={onHandle} height={440} autoRotate />
    </Panel>
  );
}
