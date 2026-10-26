"use client";

import { useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import stats from "@/lib/how/stats.json";
import { Panel, Term } from "./Term";
import { Stage, textSprite, type SceneCtx, type SceneHandle } from "./three/Stage";

const TAU = stats.tau, MARGIN = stats.margin;
const A = stats.people[0], B = stats.people[1] ?? stats.people[0];
const sep = Math.acos(Math.min(0.99, Math.max(0, stats.cross_similarity[0]?.[1] ?? 0.25))); // real angle between the two voiceprints
const R = 1.6;

interface Probe { sA: number; sB: number; verdict: string; who: string | null }

function decide(sA: number, sB: number): Probe {
  const [best, second, who] = sA >= sB ? [sA, sB, A.name] : [sB, sA, B.name];
  if (best <= TAU) return { sA, sB, who: null, verdict: "below τ → Someone new" };
  if (best - second <= MARGIN) return { sA, sB, who: null, verdict: "too close to call → Someone new" };
  return { sA, sB, who, verdict: `named ${who}` };
}

/** The decision rule on the unit sphere: voiceprints, their τ caps, the margin band, and a probe voice moving through them. */
function setupSphere({ scene, camera, controls, color }: SceneCtx): SceneHandle & { onProbe?: (p: Probe) => void } {
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
  const bandLabel = textSprite("margin band: too close to call", { px: 44, color: "#f4d9a0", scale: 0.0024 });
  bandLabel.position.set(0, R * 1.18, 0);
  scene.add(bandLabel);

  // the probe: slerps through a list of waypoints on the sphere
  const mid = a.clone().add(b).normalize();
  const far = new THREE.Vector3(-0.2, 0.3, -1).normalize();
  const side = new THREE.Vector3(0.1, 1, 0.5).normalize();
  const way = [a, mid, b, side, far, a.clone().lerp(far, 0.6).normalize(), a];
  const probe = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const tail: THREE.Vector3[] = [];
  const trail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
  const ray = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
  scene.add(probe, trail, ray);

  const SEG = 2.2; // seconds per waypoint
  let sent = 0;
  const h: SceneHandle & { onProbe?: (p: Probe) => void } = {
    update(t: number) {
      const f = (t / SEG) % (way.length - 1), i = Math.floor(f), u = f - i, e = u * u * (3 - 2 * u);
      const p = way[i].clone().lerp(way[i + 1], e).normalize().multiplyScalar(R);
      probe.position.copy(p);
      tail.push(p.clone());
      if (tail.length > 60) tail.shift();
      trail.geometry.setFromPoints(tail);
      ray.geometry.setFromPoints([new THREE.Vector3(), p]);
      if (t - sent > 0.1) {
        sent = t;
        const q = p.clone().normalize();
        h.onProbe?.(decide(q.dot(a), q.dot(b)));
      }
    },
  };
  return h;
}

export function DecisionSphere() {
  const [probe, setProbe] = useState<Probe | null>(null);
  const onHandle = useCallback((h: SceneHandle | null) => { if (h) (h as { onProbe?: (p: Probe) => void }).onProbe = setProbe; }, []);
  useEffect(() => () => setProbe(null), []);
  const bar = (v: number, token: string) => (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-tint">
      <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${Math.max(0, Math.min(1, v)) * 100}%`, background: `var(${token})` }} />
      <div className="absolute inset-y-0 w-0.5 bg-text" style={{ left: `${TAU * 100}%` }} />
    </div>
  );
  return (
    <Panel
      title="From score to name"
      sub={<>The decision on the unit sphere (3 of the 192 dimensions, real angle between the two voiceprints). A voice is named only inside a <Term k="tau" /> cap, and not in the <Term k="margin" /> band where two caps overlap.</>}
    >
      <Stage setup={setupSphere} onHandle={onHandle} height={460}>
        <div className="pointer-events-none absolute left-4 top-4 w-[260px] rounded-[12px] bg-surface/95 p-3 text-f-small shadow-lg">
          <div className="pb-1 text-f-label text-muted">live probe voice</div>
          <div className="flex items-center justify-between"><span>{A.name}</span><span className="tabular-nums">{probe?.sA.toFixed(2) ?? "–"}</span></div>
          {bar(probe?.sA ?? 0, "--color-series-1")}
          {B !== A && (
            <>
              <div className="mt-2 flex items-center justify-between"><span>{B.name}</span><span className="tabular-nums">{probe?.sB.toFixed(2) ?? "–"}</span></div>
              {bar(probe?.sB ?? 0, "--color-series-2")}
            </>
          )}
          <div className={`mt-3 rounded-[8px] px-2 py-1 font-semibold ${probe?.who ? "bg-tint text-primary" : "bg-warn-bg text-warn"}`}>{probe?.verdict ?? "…"}</div>
          <div className="mt-1 text-f-label text-muted">τ = {TAU} (black tick) · margin = {MARGIN}</div>
        </div>
      </Stage>
    </Panel>
  );
}
