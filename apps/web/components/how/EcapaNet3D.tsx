"use client";

import * as THREE from "three";
import stats from "@/lib/how/stats.json";
import { glossary } from "@/lib/how/glossary";
import { Panel, Term } from "./Term";
import { Stage, textSprite, type SceneCtx } from "./three/Stage";

const emb = stats.signal.embedding;

/** ECAPA-TDNN as a 3-D network: data pulses flow left to right through the real layer sizes. */
function setupEcapa({ scene, camera, controls, dom, color, setTip }: SceneCtx) {
  camera.position.set(0, 2.0, 7.6);
  controls.target.set(0.9, -0.1, 0);
  controls.minDistance = 5;
  controls.maxDistance = 14;

  const tone = (token: string, op = 1) => new THREE.MeshBasicMaterial({ color: color(token), transparent: op < 1, opacity: op, depthWrite: op >= 1 });
  const picks: THREE.Object3D[] = [];
  const add = (m: THREE.Object3D, tip: string) => { m.userData.tip = tip; picks.push(m); scene.add(m); return m; };
  const name = (t: string, x: number, sub = "") => {
    const s = textSprite(t, { px: 56 });
    s.position.set(x, -1.5, 0);
    scene.add(s);
    if (sub) {
      const u = textSprite(sub, { px: 42, color: "#c9d6cc" });
      u.position.set(x, -1.9, 0);
      scene.add(u);
    }
  };

  add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.5, 1.9), tone("--color-accent", 0.75)), "Input: 80 mel bands × T frames, after cepstral mean normalization");
  name("log-Mel", -5, "80 × T");
  add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.7, 1.7), tone("--color-series-1")), "Conv1D stem: kernel 5, 1024 channels, ReLU + BatchNorm");
  scene.children[scene.children.length - 1].position.x = -4;
  name("Conv1D", -4, "k5 · 1024 ch");

  const outs: number[] = [];
  for (let b = 0; b < 3; b++) {
    const cx = -2.5 + b * 1.5;
    outs.push(cx + 0.55);
    const g = new THREE.Group();
    for (let s = 0; s < 8; s++) {
      const sl = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.3, 1.5), tone("--color-series-3", 0.55 + s * 0.05));
      sl.position.x = cx - 0.45 + s * 0.13;
      g.add(sl);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 8, 40), tone("--color-series-2"));
    ring.rotation.y = Math.PI / 2;
    ring.position.set(cx, 1.05, 0);
    g.add(ring);
    add(g, `SE-Res2Block ${b + 1}: dilation ${b + 2}. ${glossary.res2.gloss} Orange ring = squeeze-excitation: ${glossary.se.gloss}`);
    name(`SE-Res2 ${b + 1}`, cx, `dilation ${b + 2}`);
  }

  const mfaX = 2.1;
  const mfa = add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.7, 2.1), tone("--color-series-4")), glossary.mfa.gloss);
  mfa.position.x = mfaX;
  name("MFA", mfaX, "3 × 1024 → 3072");
  outs.forEach((x, i) => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x, 0.7, 0), new THREE.Vector3((x + mfaX) / 2, 2.1 + i * 0.25, 0), new THREE.Vector3(mfaX - 0.2, 0.9, 0));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)), new THREE.LineBasicMaterial({ color: color("--color-accent") })));
  });

  const aspX = 3.75;
  const cone = add(new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.7, 28, 1, true), tone("--color-series-5", 0.28)), glossary.asp.gloss);
  cone.rotation.z = -Math.PI / 2;
  cone.position.x = aspX;
  const bars = Array.from({ length: 22 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 0.06), tone("--color-series-5"));
    m.position.set(aspX - 0.62, 0, (i / 21 - 0.5) * 1.7);
    scene.add(m);
    return m;
  });
  name("pooling", aspX, "attention → μ, σ");

  const fc = add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.6, 0.6), tone("--color-series-6")), "Fully-connected layer: 6144 → 192");
  fc.position.x = 5.35;
  name("FC", 5.35, "6144 → 192");

  // the real 192-d voiceprint of the clip, as a spiky ring
  const pm = Math.max(...emb.map(Math.abs));
  const ring = emb.map((v, i) => {
    const a = (i / emb.length) * Math.PI * 2, r = 0.55 + (v / pm) * 0.38;
    return new THREE.Vector3(6.85, Math.sin(a) * r, Math.cos(a) * r);
  });
  const ringLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ring), new THREE.LineBasicMaterial({ color: color("--color-accent") }));
  add(ringLine, "The real 192-number voiceprint of this clip, one point per dimension, unit length");
  name("x-vector", 6.85, "192-d, unit length");

  // flow line + pulses
  const flow = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5, 0, 0), new THREE.Vector3(6.85, 0, 0)]), new THREE.LineBasicMaterial({ color: color("--color-muted"), transparent: true, opacity: 0.5 }));
  scene.add(flow);
  const pulses = Array.from({ length: 5 }, () => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: color("--color-accent") }));
    scene.add(m);
    return m;
  });

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    const r = dom.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(picks, true)[0];
    let o: THREE.Object3D | null = hit?.object ?? null;
    while (o && !o.userData.tip) o = o.parent;
    setTip(o ? { x: e.clientX - r.left, y: e.clientY - r.top, text: o.userData.tip as string } : null);
  };
  const onLeave = () => setTip(null);
  dom.addEventListener("pointermove", onMove);
  dom.addEventListener("pointerleave", onLeave);

  return {
    update(t: number) {
      pulses.forEach((p, i) => {
        const u = (t * 0.11 + i / pulses.length) % 1;
        p.position.set(-5 + u * 11.85, 0, 0);
        p.scale.setScalar(0.7 + 0.5 * Math.sin(u * Math.PI));
      });
      bars.forEach((b, i) => {
        const w = 0.25 + 0.75 * Math.abs(Math.sin(t * 0.9 + i * 0.55)) * (0.4 + 0.6 * Math.exp(-((i - 11 - 5 * Math.sin(t * 0.3)) ** 2) / 30));
        b.scale.y = w * 1.5;
      });
    },
    dispose() {
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerleave", onLeave);
    },
  };
}

export function EcapaNet3D() {
  return (
    <Panel
      title="Inside the encoder"
      sub={<><Term k="ecapa" /> from input to voiceprint, drawn with its real layer sizes (20.8 M parameters, pretrained on <Term k="voxceleb" />, not trained on the family). Hover a block; drag to rotate.</>}
    >
      <Stage setup={setupEcapa} height={380} />
    </Panel>
  );
}
