"use client";

import * as THREE from "three";
import stats from "@/lib/how/stats.json";
import { Panel, Term } from "./Term";
import { Stage, textSprite, type SceneCtx } from "./three/Stage";

const rows = [...stats.people.map((p, i) => ({ name: p.name, v: (stats.centroids as Record<string, number[]>)[p.id], token: `--color-series-${(i % 6) + 1}` })), { name: "a stranger", v: stats.probe, token: "--color-stranger" }];
const maxAbs = Math.max(...rows.flatMap((r) => r.v.map(Math.abs)));

/** One ring of 192 bars per voiceprint: positive up, negative down. Different people, different signatures. */
function setupRings({ scene, camera, controls, color }: SceneCtx) {
  camera.position.set(0, 3.2, 6.6);
  controls.target.set(0, 0, 0);
  controls.minDistance = 3.5;
  controls.maxDistance = 11;
  const gap = 2.7, R0 = 0.95;
  const groups = rows.map((r, k) => {
    const g = new THREE.Group();
    g.position.x = (k - (rows.length - 1) / 2) * gap;
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), r.v.length);
    const base = color(r.token), dark = base.clone().multiplyScalar(0.5), m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    r.v.forEach((v, i) => {
      const a = (i / r.v.length) * Math.PI * 2, h = Math.max(0.02, (Math.abs(v) / maxAbs) * 1.1);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a);
      p.set(Math.cos(a) * R0, (v >= 0 ? h : -h) / 2, Math.sin(a) * R0);
      s.set(0.045, h, 0.045);
      mesh.setMatrixAt(i, m.compose(p, q, s));
      mesh.setColorAt(i, v >= 0 ? base : dark);
    });
    g.add(mesh);
    g.add(new THREE.Mesh(new THREE.TorusGeometry(R0, 0.008, 6, 96), new THREE.MeshBasicMaterial({ color: color("--color-muted") })));
    g.children[1].rotation.x = Math.PI / 2;
    const label = textSprite(r.name, { px: 56 });
    label.position.set(0, -1.55, 0);
    g.add(label);
    scene.add(g);
    return g;
  });
  return { update: (t: number) => groups.forEach((g, i) => { g.rotation.y = t * 0.25 + i; }) };
}

export function VoiceprintRings() {
  return (
    <Panel
      title="Every voice has its own pattern"
      sub={<>Each ring is one person&apos;s <Term k="centroid">voiceprint</Term>: 192 bars pointing up or down. The pattern is what identifies them. The last ring is a stranger, for comparison.</>}
    >
      <Stage setup={setupRings} height={400} />
    </Panel>
  );
}
