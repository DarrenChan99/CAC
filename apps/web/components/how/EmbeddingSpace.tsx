"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import stats from "@/lib/how/stats.json";
import { Panel, Term } from "./Term";
import { Stage, textSprite, type SceneCtx, type SceneHandle } from "./three/Stage";

type Mode = "pca" | "tsne";
const E = stats.embeddings;
const people = stats.people;
const sims = E.centroid_sim as Record<string, number[]>;
const colorToken = (who: string) => {
  const i = people.findIndex((p) => p.id === who.replace("centroid:", ""));
  return i >= 0 ? `--color-series-${(i % 6) + 1}` : "--color-stranger";
};

/** Both projections, centred on the windows' mean and scaled to the same radius, so the cloud sits in the middle of the frame. */
const cache: Partial<Record<Mode, number[][]>> = {};
function projected(m: Mode): number[][] {
  if (cache[m]) return cache[m]!;
  const raw = E[m] as number[][];
  const wins = raw.filter((_, i) => !E.who[i].startsWith("centroid:"));
  const mean = [0, 1, 2].map((k) => wins.reduce((a, p) => a + p[k], 0) / wins.length);
  const r = Math.max(...raw.map((p) => Math.hypot(p[0] - mean[0], p[1] - mean[1], p[2] - mean[2])));
  return (cache[m] = raw.map((p) => p.map((v, k) => ((v - mean[k]) / r) * 1.9)));
}

interface Handle extends SceneHandle { setMode: (m: Mode) => void; drop: (who: string) => string }

function setupSpace({ scene, camera, controls, dom, color, setTip }: SceneCtx): Handle {
  camera.position.set(2.6, 1.8, 5);
  controls.minDistance = 3;
  controls.maxDistance = 9;

  const winIdx = E.who.map((w, i) => (w.startsWith("centroid:") ? -1 : i)).filter((i) => i >= 0);
  const cenIdx = people.map((p) => E.who.indexOf(`centroid:${p.id}`));
  const pos = new Float32Array(winIdx.length * 3);
  const col = new Float32Array(winIdx.length * 3);
  winIdx.forEach((src, k) => {
    const c = color(colorToken(E.who[src]));
    col.set([c.r, c.g, c.b], k * 3);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const dot = document.createElement("canvas");
  dot.width = dot.height = 64;
  const g = dot.getContext("2d")!;
  g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.075, map: new THREE.CanvasTexture(dot), alphaTest: 0.5, vertexColors: true, transparent: true }));
  scene.add(pts);

  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  scene.add(new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([v(-2.4, 0, 0), v(2.4, 0, 0), v(0, -2.4, 0), v(0, 2.4, 0), v(0, 0, -2.4), v(0, 0, 2.4)]),
    new THREE.LineBasicMaterial({ color: color("--color-muted"), transparent: true, opacity: 0.35 }),
  ));

  const cents = people.map((p) => {
    const c = color(colorToken(`centroid:${p.id}`));
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 2), new THREE.MeshBasicMaterial({ color: c }));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.1, depthWrite: false }));
    const name = textSprite(p.name, { px: 56, scale: 0.0034 });
    scene.add(core, halo, name);
    return { core, halo, name };
  });

  const from = new Float32Array(pos.length);
  const to = new Float32Array(pos.length);
  let cFrom = new Float32Array(people.length * 4); // x y z radius
  const cTo = new Float32Array(people.length * 4);
  let t0 = 0, dur = 0;

  const setMode = (m: Mode) => {
    from.set(pos);
    cFrom = Float32Array.from(cTo);
    const P = projected(m);
    winIdx.forEach((src, k) => to.set(P[src], k * 3));
    people.forEach((p, i) => {
      const c = P[cenIdx[i]];
      const d = winIdx
        .map((src, k) => (E.who[src] === p.id ? Math.hypot(to[k * 3] - c[0], to[k * 3 + 1] - c[1], to[k * 3 + 2] - c[2]) : -1))
        .filter((x) => x >= 0)
        .sort((a, b) => a - b);
      cTo.set([...c, d.length ? d[Math.floor(d.length * 0.9)] * 1.05 : 0.3], i * 4);
    });
    t0 = performance.now();
    dur = pos.every((x) => x === 0) ? 0 : 900;
  };
  setMode("pca");

  // a new clip flying in from above and landing on its dot
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 8, 40), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  marker.visible = ring.visible = false;
  scene.add(marker, ring);
  let landing: { k: number; t0: number } | null = null;
  const describe = (src: number) => {
    const who = E.who[src];
    const person = people.find((p) => p.id === who);
    const all = people.map((p) => ({ n: p.name, v: sims[p.id][src] }));
    const best = all.reduce((a, b) => (b.v > a.v ? b : a));
    return person ? `${person.name} · cosine to own voiceprint ${sims[person.id][src].toFixed(2)}` : `stranger · closest voiceprint: ${best.n} at ${best.v.toFixed(2)}`;
  };
  const drop = (who: string) => {
    const pool = winIdx.map((src, k) => ({ src, k })).filter(({ src }) => E.who[src] === who);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    landing = { k: pick.k, t0: performance.now() };
    marker.visible = ring.visible = true;
    ring.lookAt(camera.position);
    return describe(pick.src);
  };

  const ray = new THREE.Raycaster();
  ray.params.Points = { threshold: 0.07 };
  const ndc = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    const r = dom.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(pts)[0];
    if (!hit || hit.index === undefined) return setTip(null);
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, text: describe(winIdx[hit.index]) });
  };
  const onLeave = () => setTip(null);
  dom.addEventListener("pointermove", onMove);
  dom.addEventListener("pointerleave", onLeave);

  return {
    setMode,
    drop,
    update(t) {
      void t;
      const k = dur ? Math.min(1, (performance.now() - t0) / dur) : 1;
      const e = k * k * (3 - 2 * k);
      for (let i = 0; i < pos.length; i++) pos[i] = from[i] + (to[i] - from[i]) * e;
      geo.attributes.position.needsUpdate = true;
      cents.forEach(({ core, halo, name }, i) => {
        const q = [0, 1, 2, 3].map((j) => cFrom[i * 4 + j] + (cTo[i * 4 + j] - cFrom[i * 4 + j]) * e);
        core.position.set(q[0], q[1], q[2]);
        halo.position.set(q[0], q[1], q[2]);
        halo.scale.setScalar(Math.max(q[3], 0.01));
        name.position.set(q[0], q[1] + Math.max(q[3], 0.01) + 0.18, q[2]);
      });
      if (landing) {
        const f = Math.min(1, (performance.now() - landing.t0) / 1100), u = 1 - (1 - f) ** 3;
        const k = landing.k;
        marker.position.set(0, 3.2, 0).lerp(v(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]), u);
        ring.position.copy(marker.position);
        ring.scale.setScalar(1 + (f === 1 ? 0.15 * Math.sin(performance.now() / 160) : 0));
      }
    },
    dispose() {
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerleave", onLeave);
    },
  };
}

export function EmbeddingSpace() {
  const api = useRef<Handle | null>(null);
  const onHandle = useCallback((h: SceneHandle | null) => { api.current = h as Handle | null; }, []);
  const [mode, setMode] = useState<Mode>("pca");
  const [landed, setLanded] = useState<string | null>(null);
  useEffect(() => { api.current?.setMode(mode); }, [mode]);
  const btn = "min-h-[44px] rounded-full border border-tint px-4 text-f-small font-medium text-primary hover:bg-tint";

  return (
    <Panel
      title="Every voice lands in its own spot"
      sub={<>Each dot is 2 seconds of someone talking, turned into 192 numbers. Squashing those 192 numbers down to 3 lets us see them: dots from the same person end up in a tight cloud, and strangers (grey) scatter everywhere else. Two ways to squash: <Term k="pca">PCA</Term> keeps distances honest, <Term k="tsne">t-SNE</Term> pulls clouds apart so they are easier to see. Drag to rotate; hover a dot.</>}
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="How the 192 numbers are squashed to 3" className="flex rounded-full border border-tint p-0.5">
          {(["pca", "tsne"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
              className={`min-h-[44px] rounded-full px-4 text-f-small font-medium transition-colors ${mode === m ? "bg-primary text-white" : "text-primary hover:bg-tint"}`}>
              {m === "pca" ? "True distances" : "Clouds pulled apart"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-3 text-f-small">
          {people.map((p, i) => <span key={p.id} className="flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full" style={{ background: `var(--color-series-${(i % 6) + 1})` }} />{p.name}</span>)}
          <span className="flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full bg-stranger" />strangers</span>
        </div>
      </div>
      <Stage setup={setupSpace} onHandle={onHandle} height={440}>
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface/95 px-3 py-1 text-f-small font-medium">Drop in a new clip from:</span>
          {[...people.map((p) => ({ id: p.id, name: p.name })), { id: "stranger", name: "a stranger" }].map((o) => (
            <button key={o.id} onClick={() => setLanded(api.current?.drop(o.id) ?? null)} className={`${btn} bg-surface/95`}>{o.name}</button>
          ))}
          {landed && <span className="rounded-[10px] bg-surface/95 px-3 py-1 text-f-small" aria-live="polite">White dot lands: <b>{landed}</b></span>}
        </div>
      </Stage>
    </Panel>
  );
}
