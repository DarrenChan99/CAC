"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import stats from "@/lib/how/stats.json";
import { Panel, Term } from "./Term";
import { Stage, textSprite, type SceneCtx, type SceneHandle } from "./three/Stage";

const d = stats.distributions;
const rows = [
  { key: "stranger" as const, label: "stranger", token: "--color-stranger" },
  { key: "other_person" as const, label: "another family member", token: "--color-series-2" },
  { key: "target" as const, label: "same person", token: "--color-series-1" },
];
const X0 = -3.6, X1 = 3.6;
const xOf = (v: number) => X0 + ((v - d.bins[0]) / (d.bins[d.bins.length - 1] - d.bins[0])) * (X1 - X0);

/** The score distributions as three ridges of 3-D bars with the threshold as a plane. */
function setupScores({ scene, camera, controls, color }: SceneCtx) {
  camera.position.set(1.8, 5.2, 5.6);
  controls.target.set(0, 0.3, 0.2);
  controls.minDistance = 4;
  controls.maxDistance = 11;
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.3);
  sun.position.set(-2, 5, 4);
  scene.add(sun);

  const share = rows.map((r) => { const t = d[r.key].reduce((a, b) => a + b, 0) || 1; return d[r.key].map((v) => v / t); });
  const top = Math.max(...share.flat());
  const bars: { m: THREE.Mesh; h: number; delay: number }[] = [];
  rows.forEach((r, k) => {
    const z = (k - 1) * 1.5;
    const mat = new THREE.MeshLambertMaterial({ color: color(r.token) });
    share[k].forEach((v, i) => {
      const x0 = xOf(d.bins[i]), x1 = xOf(d.bins[i + 1]);
      const h = Math.max((v / top) * 2.4, 0.001);
      const m = new THREE.Mesh(new THREE.BoxGeometry((x1 - x0) * 0.86, 1, 0.7), mat);
      m.position.set((x0 + x1) / 2, 0, z);
      m.scale.y = 0.001;
      scene.add(m);
      bars.push({ m, h, delay: i * 0.02 + k * 0.25 });
    });
    const l = textSprite(r.label, { px: 46, scale: 0.0027 });
    l.position.set(X0 - 0.2, 0.15, z + 0.5);
    l.center.set(1, 0.5);
    scene.add(l);
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.9), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
  plane.rotation.y = Math.PI / 2;
  plane.position.set(xOf(d.tau), 1.45, 0);
  scene.add(plane);
  const tl = textSprite("cut-off", { px: 52, scale: 0.003 });
  tl.position.set(xOf(d.tau), 3.1, 0);
  scene.add(tl);
  [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
    const a = textSprite(String(v), { px: 40, scale: 0.0026 });
    a.position.set(xOf(v), -0.1, 2.35);
    scene.add(a);
  });
  const ax = textSprite("how alike to the voiceprint (cosine) →", { px: 44, scale: 0.0028 });
  ax.position.set(0, -0.15, 2.95);
  scene.add(ax);

  return {
    setTau(tau: number) { plane.position.x = tl.position.x = xOf(tau); },
    update(t: number) {
      bars.forEach(({ m, h, delay }) => {
        const u = Math.min(1, Math.max(0, (t - 0.3 - delay) / 0.9)), e = 1 - (1 - u) ** 3;
        m.scale.y = Math.max(h * e, 0.001);
        m.position.y = m.scale.y / 2;
      });
    },
  };
}

export function Scores3D({ tau = d.tau }: { tau?: number }) {
  const api = useRef<(SceneHandle & { setTau: (t: number) => void }) | null>(null);
  const latest = useRef(tau);
  const onHandle = useCallback((h: SceneHandle | null) => { api.current = h as typeof api.current; api.current?.setTau(latest.current); }, []);
  useEffect(() => { latest.current = tau; api.current?.setTau(tau); }, [tau]);
  return (
    <Panel title="The same scores, as a landscape" sub={<>The flat histogram above, standing up. Rotate it: the three ridges are the right person, another family member and strangers. The pane is the <Term k="tau">cut-off</Term>. Only the green ridge should poke through to its right, and the pane moves when you drag the slider.</>}>
      <Stage setup={setupScores} onHandle={onHandle} height={420} />
    </Panel>
  );
}
