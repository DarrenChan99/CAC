"use client";

import * as THREE from "three";
import stats from "@/lib/how/stats.json";
import { Panel, Term } from "./Term";
import { Stage, textSprite, type SceneCtx } from "./three/Stage";

const S = stats.signal;
const W = 5.4, D = 2.4, H = 1.5;

/** The real log-Mel spectrogram of an enrollment clip as a height-field, with its waveform and VAD segments on the floor. */
function setupSpectrogram({ scene, camera, controls, color }: SceneCtx) {
  camera.position.set(-0.5, 2.5, 4.7);
  controls.target.set(0, 0.35, 0.1);
  controls.minDistance = 3.5;
  controls.maxDistance = 10;

  const R = S.logmel.length, C = S.logmel[0].length;
  const lo = color("--color-stage").lerp(color("--color-series-1"), 0.35), mid = color("--color-series-1"), hi = color("--color-accent");
  const pos = new Float32Array(R * C * 3), col = new Float32Array(R * C * 3);
  const c = new THREE.Color();
  for (let r = 0; r < R; r++)
    for (let k = 0; k < C; k++) {
      const v = S.logmel[r][k] / 255, i = r * C + k;
      pos.set([(k / (C - 1) - 0.5) * W, v * H, (0.5 - r / (R - 1)) * D], i * 3);
      (v < 0.5 ? c.copy(lo).lerp(mid, v * 2) : c.copy(mid).lerp(hi, (v - 0.5) * 2)).toArray(col, i * 3);
    }
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
  geo.computeVertexNormals();
  scene.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(-2, 5, 4);
  scene.add(sun);

  // floor plate and VAD speech segments
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.3, D + 0.3), new THREE.MeshBasicMaterial({ color: color("--color-bg"), transparent: true, opacity: 0.08 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  scene.add(floor);
  S.vad.forEach(([a, b]) => {
    const w = ((b - a) / S.seconds) * W;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, 0.14), new THREE.MeshBasicMaterial({ color: color("--color-accent") }));
    seg.position.set((a / S.seconds - 0.5) * W + w / 2, 0.015, D / 2 + 0.28);
    scene.add(seg);
  });

  // waveform envelope, mirrored, in front of the spectrogram
  const up: THREE.Vector3[] = [], down: THREE.Vector3[] = [];
  const peak = Math.max(...S.envelope, 1e-6);
  S.envelope.forEach((e, i) => {
    const x = (i / (S.envelope.length - 1) - 0.5) * W, h = (e / peak) * 0.32;
    up.push(new THREE.Vector3(x, 0.36 + h, D / 2 + 0.62));
    down.push(new THREE.Vector3(x, 0.36 - h, D / 2 + 0.62));
  });
  const wm = new THREE.LineBasicMaterial({ color: color("--color-accent") });
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(up), wm), new THREE.Line(new THREE.BufferGeometry().setFromPoints(down), wm));

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

  return { update: (t: number) => { scan.position.x = (((t * 0.18) % 1) - 0.5) * W; } };
}

export function Spectrogram3D() {
  return (
    <Panel
      title="What the model actually hears"
      sub={<>A real {S.seconds}-second recording, turned into a <Term k="mel">map of pitch over time</Term> and drawn as terrain. The ridges are a voice; the bars along the front mark where <Term k="vad">speech was found</Term>.</>}
    >
      <Stage setup={setupSpectrogram} height={440} autoRotate />
    </Panel>
  );
}
