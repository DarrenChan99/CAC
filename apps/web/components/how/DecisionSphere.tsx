"use client";

import * as THREE from "three";
import stats from "@/lib/how/stats.json";
import { Panel, Term } from "./Term";
import { Stage, textSprite, type SceneCtx, type SceneHandle } from "./three/Stage";

const TAU = stats.tau, MARGIN = stats.margin;
const A = stats.people[0], B = stats.people[1] ?? stats.people[0];
const sep = Math.acos(Math.min(0.99, Math.max(0, stats.cross_similarity[0]?.[1] ?? 0.25))); // real angle between the two voiceprints
const R = 1.6;

interface Probe { verdict: string; who: string | null }

function decide(sA: number, sB: number): Probe {
  const [best, second, who] = sA >= sB ? [sA, sB, A.name] : [sB, sA, B.name];
  if (best <= TAU) return { who: null, verdict: "below the cut-off → Someone new" };
  if (best - second <= MARGIN) return { who: null, verdict: "too close to call → Someone new" };
  return { who, verdict: `named ${who}` };
}

/** The decision rule on the unit sphere: voiceprints, their τ caps, the margin band, and every tested slice as a dot. */
function setupSphere({ scene, camera, controls, dom, color, setTip }: SceneCtx): SceneHandle {
  camera.position.set(1.4, 2.2, 5.6);
  controls.target.set(-0.9, 0, 0);
  controls.minDistance = 3.5;
  controls.maxDistance = 9;

  const a = new THREE.Vector3(Math.sin(-sep / 2), 0, Math.cos(-sep / 2));
  const b = new THREE.Vector3(Math.sin(sep / 2), 0, Math.cos(sep / 2));
  const up = new THREE.Vector3(0, 1, 0);
  const capAngle = Math.acos(TAU);

  scene.add(new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), new THREE.MeshBasicMaterial({ color: color("--color-bg"), transparent: true, opacity: 0.06, depthWrite: false })));
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.002, 36, 24), new THREE.MeshBasicMaterial({ color: color("--color-muted"), wireframe: true, transparent: true, opacity: 0.18 })));

  const cap = (dir: THREE.Vector3, token: string) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(R * 1.01, 48, 16, 0, Math.PI * 2, 0, capAngle), new THREE.MeshBasicMaterial({ color: color(token), transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide }));
    m.quaternion.setFromUnitVectors(up, dir);
    scene.add(m);
  };
  cap(a, "--color-series-1");
  cap(b, "--color-series-2");

  // margin band: points whose scores differ by less than MARGIN
  const n = a.clone().sub(b);
  const nl = n.length();
  n.normalize();
  const delta = Math.asin(Math.min(1, MARGIN / nl));
  const band = new THREE.Mesh(new THREE.SphereGeometry(R * 1.015, 64, 6, 0, Math.PI * 2, Math.PI / 2 - delta, 2 * delta), new THREE.MeshBasicMaterial({ color: color("--color-warn"), transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }));
  band.quaternion.setFromUnitVectors(up, n);
  scene.add(band);

  const arrow = (dir: THREE.Vector3, token: string, label: string) => {
    scene.add(new THREE.ArrowHelper(dir, new THREE.Vector3(), R * 1.12, color(token).getHex(), 0.18, 0.1));
    const s = textSprite(label, { px: 48, scale: 0.0026 });
    s.position.copy(dir).multiplyScalar(R * 1.4).add(new THREE.Vector3(0, 0.18, 0));
    scene.add(s);
  };
  arrow(a, "--color-series-1", `${A.name}'s voiceprint`);
  if (B !== A) arrow(b, "--color-series-2", `${B.name}'s voiceprint`);
  const bandLabel = textSprite("too close to call → “Someone new”", { px: 44, color: "#f4d9a0", scale: 0.0024 });
  bandLabel.position.set(0, R * 1.18, 0);
  scene.add(bandLabel);

  // every tested slice. Its two real scores place it in the plane of the two voiceprints; the rest of its length
  // (how much of the slice is neither person) lifts it off that plane, so strangers drift to the top.
  const E = stats.embeddings, sims = E.centroid_sim as Record<string, number[]>;
  const c = a.dot(b), det = 1 - c * c;
  const idx = E.who.map((w, i) => i).filter((i) => !E.who[i].startsWith("centroid:"));
  const P = new Float32Array(idx.length * 3), K = new Float32Array(idx.length * 3);
  idx.forEach((src, k) => {
    const sA = sims[A.id][src], sB = sims[B.id][src];
    const ca = (sA - c * sB) / det, cb = (sB - c * sA) / det; // coefficients on a and b
    const flat = new THREE.Vector3().addScaledVector(a, ca).addScaledVector(b, cb);
    const h = Math.sqrt(Math.max(0, 1 - flat.lengthSq()));
    flat.y = h;
    flat.multiplyScalar(R * 1.02).toArray(P, k * 3);
    const t = color(E.who[src] === A.id ? "--color-series-1" : E.who[src] === B.id ? "--color-series-2" : "--color-stranger");
    K.set([t.r, t.g, t.b], k * 3);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(P, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(K, 3));
  const dot = document.createElement("canvas");
  dot.width = dot.height = 64;
  const g = dot.getContext("2d")!;
  g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.075, map: new THREE.CanvasTexture(dot), alphaTest: 0.5, vertexColors: true, transparent: true }));
  scene.add(pts);

  const ray = new THREE.Raycaster();
  ray.params.Points = { threshold: 0.07 };
  const ndc = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    const r = dom.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(pts)[0];
    if (!hit || hit.index === undefined) return setTip(null);
    const src = idx[hit.index], who = E.who[src], person = stats.people.find((p) => p.id === who);
    const d = decide(sims[A.id][src], sims[B.id][src]);
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, text: `${person ? `${person.name} speaking` : "a stranger"} · ${A.name} ${sims[A.id][src].toFixed(2)}, ${B.name} ${sims[B.id][src].toFixed(2)} · ${d.verdict}` });
  };
  const onLeave = () => setTip(null);
  dom.addEventListener("pointermove", onMove);
  dom.addEventListener("pointerleave", onLeave);
  return { dispose() { dom.removeEventListener("pointermove", onMove); dom.removeEventListener("pointerleave", onLeave); } };
}

export function DecisionSphere() {
  return (
    <Panel
      title="The same rule, in 3-D"
      sub={<>The flat map above, wrapped onto a ball so you can see one more thing. Each voiceprint claims a cap around it (the <Term k="tau">cut-off</Term>); the amber band is where two caps meet and the answer is “Someone new” (the <Term k="margin">margin</Term>). Dots are the same real test slices. The higher a dot sits, the less it resembles <i>either</i> person, so strangers float to the top. This ball shows 3 of the 192 dimensions.</>}
    >
      <Stage setup={setupSphere} height={460} />
    </Panel>
  );
}
