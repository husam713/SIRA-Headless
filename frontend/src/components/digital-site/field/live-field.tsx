"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { FIELD_GRID, FIELD_STILL_TICKS } from "@/components/digital-site/field/static-field";
import {
  createField,
  FIELD_DEFAULTS,
  hashSeed,
  type Field,
  type FieldAttractor,
  type FieldDirection,
  type FieldRect,
} from "@/lib/digital-site/route-field";

interface LiveFieldProps {
  readonly seedKey: string;
  readonly direction: FieldDirection;
  /** The still to fast-forward past, so the picture continues rather than restarts. */
  readonly stillTicks?: number;
  readonly stillObstacles?: readonly FieldRect[];
  /** Element id whose box the routes must keep clear of — the headline. */
  readonly protectId?: string;
  readonly label: string;
  /** The server's still. Stays in the tree; fades once the canvas is live. */
  readonly children: ReactNode;
}

/** Milliseconds per simulation step: about fourteen cells a second. */
const TICK_MS = 72;
const FADE_IN_TICKS = 6;
const DPR_CAP = 2;

interface Viewport {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

function fit(width: number, height: number): Viewport {
  // `xMidYMid slice`, the same fit as the SVG still.
  const scale = Math.max(width / FIELD_GRID, height / FIELD_GRID);
  return {
    width,
    height,
    scale,
    offsetX: (width - FIELD_GRID * scale) / 2,
    offsetY: (height - FIELD_GRID * scale) / 2,
  };
}

/**
 * The still, continued. A canvas that runs the same routing system the server
 * drew, from the same seed and the same tick, so the picture the page opened
 * on starts to move rather than being replaced — then bends its routes around
 * the pointer and keeps clear of the headline's real box.
 *
 * It costs nothing when it should cost nothing: it never starts under
 * `prefers-reduced-motion`, it pauses off-screen and in hidden tabs, and it
 * draws at most a few thousand short lines a frame.
 */
export function LiveField({
  seedKey,
  direction,
  stillTicks = FIELD_STILL_TICKS,
  stillObstacles = [],
  protectId,
  label,
  children,
}: LiveFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (context === null) return;

    const styles = getComputedStyle(canvas);
    const colors = {
      line: styles.getPropertyValue("--dg-lapis").trim() || "#1c34d8",
      node: styles.getPropertyValue("--dg-ink").trim() || "#101216",
      signal: styles.getPropertyValue("--dg-signal").trim() || "#ff4d1f",
    };

    const config = {
      ...FIELD_DEFAULTS,
      cols: FIELD_GRID,
      rows: FIELD_GRID,
      seed: hashSeed(seedKey),
      direction,
      obstacles: stillObstacles,
    };

    // Continue from the still: same seed, same obstacles, same tick.
    const field: Field = createField(config);
    for (let index = 0; index < stillTicks; index += 1) field.step(null);

    let viewport = fit(canvas.clientWidth, canvas.clientHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    let attractor: FieldAttractor | null = null;
    let attractorSeen = 0;
    let frame = 0;
    let running = false;
    let visible = true;
    let lastTick = performance.now();
    let disposed = false;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      viewport = fit(width, height);
      measureObstacles();
    };

    // The headline's real box, in cells, with a one-cell margin. Only new
    // routes honour it; routes the still already drew there fade in their
    // own time behind the paper scrim.
    const measureObstacles = () => {
      if (protectId === undefined) return;
      const element = document.getElementById(protectId);
      if (element === null) return;

      const box = element.getBoundingClientRect();
      const own = canvas.getBoundingClientRect();
      const toCellX = (px: number) => (px - own.left - viewport.offsetX) / viewport.scale;
      const toCellY = (px: number) => (px - own.top - viewport.offsetY) / viewport.scale;

      const x = Math.floor(toCellX(box.left)) - 1;
      const y = Math.floor(toCellY(box.top)) - 1;
      const right = Math.ceil(toCellX(box.right)) + 1;
      const bottom = Math.ceil(toCellY(box.bottom)) + 1;

      field.setObstacles([{ x, y, width: right - x, height: bottom - y }]);
    };

    const draw = (now: number) => {
      const progress = Math.min(1, (now - lastTick) / TICK_MS);
      const { scale, offsetX, offsetY } = viewport;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, viewport.width, viewport.height);
      context.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);
      context.lineJoin = "miter";
      context.lineCap = "square";
      context.lineWidth = 1.5 / scale;

      const nodeSize = 0.22;
      const tick = field.tick;

      for (const route of field.routes) {
        const points = route.points;
        if (points.length < 2) continue;

        const age = tick - route.bornTick + progress;
        let alpha = Math.min(1, age / FADE_IN_TICKS);
        if (route.doneTick !== null) {
          alpha = Math.min(alpha, Math.max(0, 1 - (tick - route.doneTick + progress) / field.config.linger));
        }
        if (alpha <= 0.01) continue;

        const active = route.doneTick === null;
        const last = points.length - 1;

        context.globalAlpha = alpha;
        context.strokeStyle = colors.line;
        context.beginPath();

        const first = points[0];
        if (first === undefined) continue;
        context.moveTo(first.x + 0.5, first.y + 0.5);

        for (let index = 1; index < last; index += 1) {
          const point = points[index];
          if (point !== undefined) context.lineTo(point.x + 0.5, point.y + 0.5);
        }

        // The head segment grows between ticks, so movement reads as
        // continuous rather than stepped.
        const previous = points[last - 1];
        const head = points[last];
        if (previous === undefined || head === undefined) continue;
        const t = active ? progress : 1;
        const headX = previous.x + (head.x - previous.x) * t + 0.5;
        const headY = previous.y + (head.y - previous.y) * t + 0.5;
        context.lineTo(headX, headY);
        context.stroke();

        // A node where the route ends; a signal-coloured one while it moves
        // near the pointer.
        const nearPointer =
          active &&
          attractor !== null &&
          (headX - 0.5 - attractor.x) ** 2 + (headY - 0.5 - attractor.y) ** 2 < attractor.reach ** 2;
        context.fillStyle = active ? (nearPointer ? colors.signal : colors.line) : colors.node;
        const size = active ? nodeSize * 0.9 : nodeSize;
        context.fillRect(headX - size / 2, headY - size / 2, size, size);
      }

      context.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (disposed) return;

      while (now - lastTick >= TICK_MS) {
        lastTick += TICK_MS;
        if (attractor !== null && now - attractorSeen > 1400) attractor = null;
        field.step(attractor);
      }

      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || disposed) return;
      running = true;
      lastTick = performance.now();
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const box = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;

      if (!inside) {
        attractor = null;
        return;
      }

      attractor = {
        x: (event.clientX - box.left - viewport.offsetX) / viewport.scale - 0.5,
        y: (event.clientY - box.top - viewport.offsetY) / viewport.scale - 0.5,
        radius: 2.4,
        reach: 8,
      };
      attractorSeen = performance.now();
    };

    const onPointerLeave = () => {
      attractor = null;
    };

    const onMotionChange = () => {
      if (reduced.matches) {
        stop();
        setLive(false);
      } else {
        setLive(true);
        sync();
      }
    };

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);

    const visibility = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { threshold: 0 },
    );
    visibility.observe(canvas);

    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    reduced.addEventListener("change", onMotionChange);

    resize();
    // Fonts settle the headline's final box a beat after first paint.
    const remeasure = window.setTimeout(measureObstacles, 900);
    setLive(true);
    sync();

    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      visibility.disconnect();
      window.clearTimeout(remeasure);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, [seedKey, direction, stillTicks, stillObstacles, protectId]);

  return (
    <div className="dg-hero__field" data-live={live ? "true" : "false"} role="img" aria-label={label}>
      {children}
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
