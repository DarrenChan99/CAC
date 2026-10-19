"""ECAPA-TDNN speaker embeddings (192-d, L2-normalized)."""
import numpy as np
import torch
from speechbrain.inference.speaker import EncoderClassifier

MIN_SAMPLES = 16000 // 2  # ECAPA is unreliable under ~0.5 s


class Embedder:
    def __init__(self, device="cpu"):
        self.model = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            savedir="pretrained/ecapa", run_opts={"device": device})
        self.device = device

    @torch.no_grad()
    def __call__(self, wav: np.ndarray) -> np.ndarray:
        """16 kHz float32 [T] -> unit vector [192]."""
        if len(wav) < MIN_SAMPLES:
            wav = np.pad(wav, (0, MIN_SAMPLES - len(wav)))
        x = torch.from_numpy(wav).float().unsqueeze(0).to(self.device)
        e = self.model.encode_batch(x).squeeze(1)  # [1,1,192] -> [1,192]
        assert e.shape == (1, 192), e.shape
        e = torch.nn.functional.normalize(e, dim=1)[0]
        return e.cpu().numpy()
