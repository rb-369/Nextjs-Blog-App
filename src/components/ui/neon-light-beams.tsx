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
  streakCount = 34,
  speed = 1.1,
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
    let width = 0;
    let height = 0;
    let dpr = 1;

    let isVisible = true;
    let tracks: Track[] = [];
    let streaks: Streak[] = [];

    const initTracks = () => {
      if (width === 0 || height === 0) return;
      tracks = [];
      const numTracks = 18;
      const palette = colors;

      for (let i = 0; i < numTracks; i++) {
        const color = palette[i % palette.length];

        // Sweeping S-curves directly echoing the footage:
        // Left bundle curving through center, and center bundle sweeping toward right
        const isLeftGroup = i < numTracks / 2;
        const subFactor = isLeftGroup ? i / (numTracks / 2 - 1) : (i - numTracks / 2) / (numTracks / 2 - 1);

        let p0: Point, p1: Point, p2: Point, p3: Point;

        if (isLeftGroup) {
          p0 = { x: width * (-0.05 + subFactor * 0.45), y: -30 };
          p1 = { x: width * (0.1 + subFactor * 0.55), y: height * 0.3 };
          p2 = { x: width * (0.2 + subFactor * 0.5), y: height * 0.65 };
          p3 = { x: width * (0.4 + subFactor * 0.65), y: height + 50 };
        } else {
          p0 = { x: width * (0.3 + subFactor * 0.6), y: -30 };
          p1 = { x: width * (0.45 + subFactor * 0.45), y: height * 0.35 };
          p2 = { x: width * (0.55 + subFactor * 0.4), y: height * 0.7 };
          p3 = { x: width * (0.65 + subFactor * 0.45), y: height + 50 };
        }

        tracks.push({
          p0,
          p1,
          p2,
          p3,
          color,
          glowColor: color,
        });
      }
    };

    const initStreaks = () => {
      if (tracks.length === 0) return;
      streaks = [];
      for (let i = 0; i < streakCount; i++) {
        const trackIndex = Math.floor(Math.random() * tracks.length);
        const track = tracks[trackIndex];
        streaks.push({
          trackIndex,
          progress: Math.random(),
          speed: (0.0035 + Math.random() * 0.007) * speed,
          length: 0.15 + Math.random() * 0.28,
          lineWidth: 2.0 + Math.random() * 3.0,
          color: track ? track.color : colors[0],
          glowColor: track ? track.glowColor : colors[0],
        });
      }
    };

    const resize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width || container.clientWidth;
      height = rect.height || container.clientHeight;
      if (width === 0 || height === 0) return;

      dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initTracks();
      initStreaks();
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

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
      if (!isVisible || width === 0 || height === 0 || tracks.length === 0) return;

      const delta = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mouseInfluenceX = (mouseRef.current.x - 0.5) * 50;
      const mouseInfluenceY = (mouseRef.current.y - 0.5) * 30;

      ctx.clearRect(0, 0, width, height);

      const timeSec = time * 0.001;

      // Draw faint baseline glowing guide curves for deep spatial geometry
      ctx.save();
      tracks.forEach((track, i) => {
        const wave = Math.sin(timeSec * 0.8 + i * 0.6) * 12;
        const p1: Point = { x: track.p1.x + mouseInfluenceX * 0.5 + wave, y: track.p1.y + mouseInfluenceY * 0.3 };
        const p2: Point = { x: track.p2.x + mouseInfluenceX * 0.8 - wave, y: track.p2.y + mouseInfluenceY * 0.5 };

        ctx.beginPath();
        ctx.moveTo(track.p0.x, track.p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, track.p3.x, track.p3.y);
        ctx.strokeStyle = track.color;
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
      ctx.restore();

      // Enable additive "screen" blending for vivid neon luminosity
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      streaks.forEach((streak) => {
        streak.progress += streak.speed * delta;
        if (streak.progress > 1 + streak.length) {
          streak.progress = 0;
          streak.trackIndex = Math.floor(Math.random() * tracks.length);
        }

        const track = tracks[streak.trackIndex];
        if (!track) return;

        const i = streak.trackIndex;
        const wave = Math.sin(timeSec * 0.8 + i * 0.6) * 12;
        const p1: Point = { x: track.p1.x + mouseInfluenceX * 0.5 + wave, y: track.p1.y + mouseInfluenceY * 0.3 };
        const p2: Point = { x: track.p2.x + mouseInfluenceX * 0.8 - wave, y: track.p2.y + mouseInfluenceY * 0.5 };

        const headT = Math.min(1, Math.max(0, streak.progress));
        const tailT = Math.min(1, Math.max(0, streak.progress - streak.length));

        if (headT <= 0 || tailT >= 1 || headT <= tailT) return;

        const steps = 18;
        const points: Point[] = [];
        for (let s = 0; s <= steps; s++) {
          const t = tailT + (headT - tailT) * (s / steps);
          points.push(getCubicBezierPoint(track.p0, p1, p2, track.p3, t));
        }

        if (points.length < 2) return;

        const headPoint = points[points.length - 1];
        const tailPoint = points[0];

        // 1. Broad Neon Atmospheric Aura
        ctx.save();
        ctx.shadowColor = streak.glowColor;
        ctx.shadowBlur = 24;
        ctx.lineWidth = streak.lineWidth * 2.8;

        const glowGrad = ctx.createLinearGradient(tailPoint.x, tailPoint.y, headPoint.x, headPoint.y);
        glowGrad.addColorStop(0, "rgba(0,0,0,0)");
        glowGrad.addColorStop(0.6, streak.glowColor);
        glowGrad.addColorStop(1, "#ffffff");

        ctx.strokeStyle = glowGrad;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let j = 1; j < points.length; j++) {
          ctx.lineTo(points[j].x, points[j].y);
        }
        ctx.stroke();
        ctx.restore();

        // 2. Focused Sharp Laser Core (White-hot energy stream)
        ctx.save();
        ctx.shadowColor = streak.glowColor;
        ctx.shadowBlur = 10;
        ctx.lineWidth = streak.lineWidth;

        const coreGrad = ctx.createLinearGradient(tailPoint.x, tailPoint.y, headPoint.x, headPoint.y);
        coreGrad.addColorStop(0, "rgba(0,0,0,0)");
        coreGrad.addColorStop(0.5, streak.color);
        coreGrad.addColorStop(0.85, "#ffffff");
        coreGrad.addColorStop(1, "#ffffff");

        ctx.strokeStyle = coreGrad;
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let j = 1; j < points.length; j++) {
          ctx.lineTo(points[j].x, points[j].y);
        }
        ctx.stroke();

        // 3. Head Spark
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = streak.glowColor;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(headPoint.x, headPoint.y, streak.lineWidth * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();
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
      {/* Gentle bottom fade so it transitions cleanly into the spotlight section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </div>
  );
}
