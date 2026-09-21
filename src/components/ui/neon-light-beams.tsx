"use client";

import React, { useEffect, useRef } from "react";

interface NeonLightBeamsProps {
  className?: string;
  colors?: string[];
  streakCount?: number;
  speed?: number;
  interactive?: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface Track {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
  width: number;
  color: string;
  glowColor: string;
}

interface Streak {
  trackIndex: number;
  progress: number;
  speed: number;
  length: number;
  lineWidth: number;
  color: string;
  glowColor: string;
}

function getCubicBezierPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const oneMinusT = 1 - t;
  const oneMinusT2 = oneMinusT * oneMinusT;
  const oneMinusT3 = oneMinusT2 * oneMinusT;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x:
      oneMinusT3 * p0.x +
      3 * oneMinusT2 * t * p1.x +
      3 * oneMinusT * t2 * p2.x +
      t3 * p3.x,
    y:
      oneMinusT3 * p0.y +
      3 * oneMinusT2 * t * p1.y +
      3 * oneMinusT * t2 * p2.y +
      t3 * p3.y,
  };
}

export default function NeonLightBeams({
  className = "",
  colors = ["#10b981", "#00f5a0", "#059669", "#34d399", "#38bdf8"],
  streakCount = 28,
  speed = 1,
  interactive = true,
}: NeonLightBeamsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);
    let dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

    let isVisible = true;
    let tracks: Track[] = [];
    let streaks: Streak[] = [];

    const initTracks = () => {
      tracks = [];
      const numTracks = 14;
      const palette = colors;

      for (let i = 0; i < numTracks; i++) {
        const factor = i / (numTracks - 1);
        const color = palette[i % palette.length];

        // S-curve sweeping from top left/center downward toward bottom right, matching the reference footage
        const startX = width * (0.05 + factor * 0.45);
        const startY = -40;

        const cp1X = width * (0.15 + factor * 0.7);
        const cp1Y = height * 0.35;

        const cp2X = width * (0.35 + factor * 0.55);
        const cp2Y = height * 0.65;

        const endX = width * (0.55 + factor * 0.5);
        const endY = height + 40;

        tracks.push({
          p0: { x: startX, y: startY },
          p1: { x: cp1X, y: cp1Y },
          p2: { x: cp2X, y: cp2Y },
          p3: { x: endX, y: endY },
          width: 1 + Math.random() * 1.5,
          color,
          glowColor: color,
        });
      }
    };

    const initStreaks = () => {
      streaks = [];
      for (let i = 0; i < streakCount; i++) {
        const trackIndex = Math.floor(Math.random() * tracks.length);
        const track = tracks[trackIndex];
        streaks.push({
          trackIndex,
          progress: Math.random(),
          speed: (0.003 + Math.random() * 0.006) * speed,
          length: 0.12 + Math.random() * 0.22,
          lineWidth: 1.5 + Math.random() * 2.5,
          color: track ? track.color : colors[0],
          glowColor: track ? track.glowColor : colors[0],
        });
      }
    };

    const resize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initTracks();
      initStreaks();
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    // Visibility observer to save battery when user scrolls away
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Mouse move handling
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || !container) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseRef.current.targetX = Math.max(0, Math.min(1, x));
      mouseRef.current.targetY = Math.max(0, Math.min(1, y));
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const delta = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mouseInfluenceX = (mouseRef.current.x - 0.5) * 60;
      const mouseInfluenceY = (mouseRef.current.y - 0.5) * 40;

      ctx.clearRect(0, 0, width, height);

      // Subtle dynamic wave motion over time
      const timeSec = time * 0.001;

      // Draw faint baseline guide tracks for depth
      ctx.save();
      tracks.forEach((track, i) => {
        const wave = Math.sin(timeSec + i * 0.7) * 15;
        const p1: Point = { x: track.p1.x + mouseInfluenceX * 0.6 + wave, y: track.p1.y + mouseInfluenceY * 0.4 };
        const p2: Point = { x: track.p2.x + mouseInfluenceX * 0.9 - wave, y: track.p2.y + mouseInfluenceY * 0.6 };

        ctx.beginPath();
        ctx.moveTo(track.p0.x, track.p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, track.p3.x, track.p3.y);
        ctx.strokeStyle = track.color;
        ctx.globalAlpha = 0.07;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.restore();

      // Render glowing streaks
      streaks.forEach((streak) => {
        streak.progress += streak.speed * delta;
        if (streak.progress > 1 + streak.length) {
          streak.progress = 0;
          streak.trackIndex = Math.floor(Math.random() * tracks.length);
        }

        const track = tracks[streak.trackIndex];
        if (!track) return;

        const i = streak.trackIndex;
        const wave = Math.sin(timeSec + i * 0.7) * 15;
        const p1: Point = { x: track.p1.x + mouseInfluenceX * 0.6 + wave, y: track.p1.y + mouseInfluenceY * 0.4 };
        const p2: Point = { x: track.p2.x + mouseInfluenceX * 0.9 - wave, y: track.p2.y + mouseInfluenceY * 0.6 };

        const headT = Math.min(1, Math.max(0, streak.progress));
        const tailT = Math.min(1, Math.max(0, streak.progress - streak.length));

        if (headT <= 0 || tailT >= 1 || headT <= tailT) return;

        // Sample points along the curve segment
        const steps = 16;
        const points: Point[] = [];
        for (let s = 0; s <= steps; s++) {
          const t = tailT + (headT - tailT) * (s / steps);
          points.push(getCubicBezierPoint(track.p0, p1, p2, track.p3, t));
        }

        if (points.length < 2) return;

        const headPoint = points[points.length - 1];
        const tailPoint = points[0];

        // 1. Broad Neon Outer Glow
        ctx.save();
        ctx.shadowColor = streak.glowColor;
        ctx.shadowBlur = 18;
        ctx.lineWidth = streak.lineWidth * 2.2;

        const glowGrad = ctx.createLinearGradient(tailPoint.x, tailPoint.y, headPoint.x, headPoint.y);
        glowGrad.addColorStop(0, "rgba(0,0,0,0)");
        glowGrad.addColorStop(0.7, streak.glowColor);
        glowGrad.addColorStop(1, "#ffffff");

        ctx.strokeStyle = glowGrad;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let j = 1; j < points.length; j++) {
          ctx.lineTo(points[j].x, points[j].y);
        }
        ctx.stroke();
        ctx.restore();

        // 2. Focused Sharp Laser Core (Crisp inner glow + White Hot Head)
        ctx.save();
        ctx.shadowColor = streak.glowColor;
        ctx.shadowBlur = 8;
        ctx.lineWidth = streak.lineWidth;

        const coreGrad = ctx.createLinearGradient(tailPoint.x, tailPoint.y, headPoint.x, headPoint.y);
        coreGrad.addColorStop(0, "rgba(0,0,0,0)");
        coreGrad.addColorStop(0.6, streak.color);
        coreGrad.addColorStop(0.9, "#ffffff");
        coreGrad.addColorStop(1, "#ffffff");

        ctx.strokeStyle = coreGrad;
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let j = 1; j < points.length; j++) {
          ctx.lineTo(points[j].x, points[j].y);
        }
        ctx.stroke();

        // 3. Bright Head Photon Spark
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = streak.glowColor;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(headPoint.x, headPoint.y, streak.lineWidth * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [colors, streakCount, speed, interactive]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none relative w-full h-full overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      {/* Soft Vignette Overlay so that page content, headlines, and cards remain 100% sharp and readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_95%)] opacity-80" />
    </div>
  );
}
