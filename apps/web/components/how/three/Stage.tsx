"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export interface Tip { x: number; y: number; text: string }

export interface SceneCtx {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  dom: HTMLCanvasElement;
  reduce: boolean;
  /** A design token (e.g. "--color-series-1") as a three.js colour. */
  color: (token: string) => THREE.Color;
  setTip: (t: Tip | null) => void;
}

/** What a scene returns: a per-frame update, cleanup, and any methods its React wrapper wants to call. */
export interface SceneHandle {
  update?: (t: number, dt: number) => void;
  dispose?: () => void;
  [method: string]: unknown;
}

export const token = (name: string) => new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim());

/** White-on-transparent text as a camera-facing sprite, for labels inside a scene. */
export function textSprite(text: string, { color = "#ffffff", px = 56, scale = 0.0045 }: { color?: string; px?: number; scale?: number } = {}) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const font = `600 ${px}px Inter, system-ui, sans-serif`;
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 16;
  c.width = w;
  c.height = px + 20;
  g.font = font;
  g.fillStyle = color;
  g.textBaseline = "middle";
  g.fillText(text, 8, c.height / 2 + 2);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  sprite.scale.set(w * scale, c.height * scale, 1);
  sprite.renderOrder = 10;
  return sprite;
}

/**
 * One WebGL canvas, sized by CSS (so it is correct on retina screens), paused while
 * off-screen, disposed on unmount. A scene is a plain `setup(ctx)` function.
 */
export function Stage({
  setup,
  onHandle,
  height = 440,
  autoRotate = false,
  children,
}: {
  setup: (ctx: SceneCtx) => SceneHandle | void;
  onHandle?: (h: SceneHandle | null) => void;
  height?: number;
  autoRotate?: boolean;
  children?: ReactNode;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [tip, setTip] = useState<Tip | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setTimeout(() => setFailed(true));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const dom = renderer.domElement;
    dom.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
    host.appendChild(dom);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.5, 7);
    const controls = new OrbitControls(camera, dom);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = autoRotate && !reduce;
    controls.autoRotateSpeed = 0.8;

    const ctx: SceneCtx = { scene, camera, renderer, controls, dom, reduce, color: token, setTip };
    const handle: SceneHandle = setup(ctx) ?? {};
    onHandle?.(handle);

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false); // CSS owns the canvas box; this sets only the pixel buffer
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(host);

    let raf = 0, last = performance.now(), t = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.1)); // the first rAF timestamp can precede `last`
      last = now;
      if (!visible) return;
      t += dt;
      handle.update?.(t, dt);
      controls.update();
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      handle.dispose?.();
      onHandle?.(null);
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((x) => { (x as THREE.MeshBasicMaterial).map?.dispose(); x.dispose(); });
      });
      renderer.dispose();
      dom.remove();
    };
  }, [setup, onHandle, autoRotate, reduce]);

  return (
    <div className="relative overflow-hidden rounded-[12px] bg-stage" style={{ height }}>
      <div ref={mount} className="h-full w-full" />
      {children}
      {failed && <p className="absolute inset-0 flex items-center justify-center text-f-body text-white">WebGL is unavailable in this browser.</p>}
      {tip && (
        <div className="pointer-events-none absolute z-20 max-w-[320px] rounded-[8px] bg-surface px-3 py-1.5 text-f-small shadow-lg" style={{ left: tip.x + 14, top: tip.y + 14 }}>
          {tip.text}
        </div>
      )}
    </div>
  );
}
