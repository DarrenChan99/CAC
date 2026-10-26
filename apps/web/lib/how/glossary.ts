/**
 * Every technical term on /how-it-works: the real name, and one plain sentence of
 * what it does and how ("X does Y by Z"). The same wording is expanded in
 * docs/technical-defense.md, so what is on screen can be defended out loud.
 */
export const glossary = {
  vad: { term: "voice activity detection (VAD)", gloss: "Finds where speech starts and stops by running a small neural network over 32 ms blocks, so silence and room noise are never turned into a voiceprint." },
  window: { term: "sliding window", gloss: "Scores the last 2 seconds of audio once per second, so the name appears quickly and keeps updating while someone talks." },
  stft: { term: "short-time Fourier transform", gloss: "Cuts the signal into 25 ms Hamming-windowed frames and measures how much energy sits at each frequency, turning a waveform into a spectrogram." },
  mel: { term: "80-bin log-Mel filterbank", gloss: "Groups spectrogram frequencies into 80 bands spaced like human hearing and takes the log, which matches how loudness is perceived and shrinks the dynamic range." },
  cmn: { term: "cepstral mean normalization", gloss: "Subtracts each band's average over time, which cancels a fixed microphone or room colouring so the same voice looks similar on different laptops." },
  ecapa: { term: "ECAPA-TDNN", gloss: "A time-delay neural network that turns a variable-length clip into one fixed 192-number voiceprint, trained so clips of the same person land close together and different people land far apart." },
  dilated: { term: "dilated 1-D convolution", gloss: "A convolution that skips frames (dilation 2, 3, 4) so each layer sees a wider stretch of time without extra weights." },
  res2: { term: "Res2Net block", gloss: "Splits the channels into 8 groups and passes each through its own convolution, feeding one group's output into the next, so a single block sees the signal at several time scales." },
  se: { term: "squeeze-excitation (SE)", gloss: "Averages each channel over time, passes it through two small layers and a sigmoid, then rescales the channels, so the network learns which feature channels matter for this clip." },
  mfa: { term: "multi-layer feature aggregation", gloss: "Concatenates the outputs of all three blocks before pooling, so shallow detail like pitch and deep detail like speaking style both reach the voiceprint." },
  asp: { term: "attentive statistical pooling", gloss: "Learns a weight for every frame with a small attention network, then computes a weighted mean and standard deviation over time, so frames carrying speaker information count more than silence or breaths." },
  xvector: { term: "x-vector embedding", gloss: "The fixed-size vector (192 numbers here) that summarises who is speaking, produced by the last fully-connected layer after pooling." },
  aam: { term: "additive angular margin softmax", gloss: "The training loss: it forces each speaker's embeddings into a tight cone on the unit sphere with a gap to other speakers, which is why a simple angle comparison works at test time." },
  voxceleb: { term: "VoxCeleb", gloss: "The public dataset of over a million utterances from thousands of celebrities that the pretrained model learned from; none of our family's voices were used to train it." },
  l2: { term: "L2 normalization", gloss: "Divides the vector by its length so only direction matters, which makes a dot product equal to the cosine of the angle between two voices." },
  cosine: { term: "cosine similarity", gloss: "The dot product of two unit vectors: 1 means the same direction, 0 means unrelated. It ignores loudness and measures only how alike the voices are." },
  centroid: { term: "voiceprint (centroid)", gloss: "The average of a person's enrollment embeddings, re-normalised, so a few short recordings become one stable reference point." },
  openset: { term: "open-set identification", gloss: "Answers 'who, or none of them' rather than forcing a pick from the enrolled list, by rejecting weak matches, so an unknown voice is never given a family member's name." },
  tau: { term: "threshold τ", gloss: "The minimum cosine score to name anyone, chosen from data so strangers almost never reach it while the family nearly always does." },
  margin: { term: "margin", gloss: "The required lead of the best match over the runner-up, so two similar-sounding relatives produce 'Someone new' instead of a coin flip." },
  hysteresis: { term: "hysteresis (stickiness)", gloss: "Keeps the current label until a different one wins on two windows in a row or the utterance ends, so the name does not flicker on a cough or a laugh." },
  whisper: { term: "Whisper ASR", gloss: "A transformer speech recogniser that returns words with timestamps and confidence, which are aligned to each speaker turn so every line has a name, a time and a transcript." },
  eer: { term: "equal error rate (EER)", gloss: "The point where wrongly accepting a stranger and wrongly rejecting a family member happen equally often; lower is better, and it is the standard single number for speaker verification." },
  det: { term: "detection error tradeoff (DET) curve", gloss: "Plots false-accept against false-reject across every possible threshold on log axes; a curve hugging the corner means the two voices are cleanly separable." },
  auc: { term: "ROC area under curve (AUC)", gloss: "The chance that a random family-member score outranks a random stranger score; 1.0 is perfect separation." },
  confusion: { term: "confusion matrix", gloss: "Rows are who really spoke, columns are what the system said; the diagonal is correct and 'Someone new' is a safe miss rather than a wrong name." },
  der: { term: "diarization error rate (DER)", gloss: "The share of call time that is missed speech, false alarm or the wrong speaker; the standard metric for 'who spoke when'." },
  pca: { term: "principal component analysis (PCA)", gloss: "A linear projection that finds the three directions in which the 192-d points vary most; distances stay faithful, so it is the honest view of the space." },
  tsne: { term: "t-SNE", gloss: "A non-linear projection that keeps near neighbours together and pulls clusters apart so they are easy to see, at the cost of distorting global distances." },
} as const;

export type TermKey = keyof typeof glossary;
