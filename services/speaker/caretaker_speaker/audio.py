"""Audio IO. Everything downstream expects 16 kHz mono float32."""
import queue

import numpy as np
import soundfile as sf

SR = 16000


def load_wav(path) -> np.ndarray:
    x, sr = sf.read(str(path), dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    if sr != SR:
        import torch, torchaudio.functional as F
        x = F.resample(torch.from_numpy(x), sr, SR).numpy()
    return x


class MicStream:
    """Mic -> queue of float32 blocks. The callback only enqueues; ML runs elsewhere."""

    def __init__(self, block=512):
        import sounddevice as sd
        self.q: queue.Queue = queue.Queue()
        self._s = sd.InputStream(samplerate=SR, channels=1, dtype="float32",
                                 blocksize=block, callback=self._cb)

    def _cb(self, indata, frames, t, status):
        self.q.put(indata[:, 0].copy())

    def __enter__(self):
        self._s.start()
        first = self.q.get(timeout=3)
        for _ in range(SR // len(first)):  # ~1 s
            first = np.concatenate([first, self.q.get(timeout=3)])
        if float(np.sqrt((first ** 2).mean())) == 0.0:
            raise RuntimeError("Mic returns silence: grant Terminal microphone access.")
        return self

    def __exit__(self, *a):
        self._s.stop()
        self._s.close()
