'use client';
import { useEffect, useRef } from 'react';
import { live, onPulse, type Pulse } from '@/lib/pulse';

type Wave = { born: number; x: number; strength: number; speed: number; hot: boolean };

/**
 * A terrain of waveform ridges behind the hero. It breathes on its own, ripples when a key is
 * pressed, swells with the microphone level and sends an orange shockwave when a wake word is
 * detected. Paused off screen; a single still frame under reduced motion.
 */
export function SignalCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext('2d');
    if (!element || !ctx) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const waves: Wave[] = [];
    let width = 0,
      height = 0,
      frame = 0,
      visible = true,
      heat = 0,
      level = 0;
    const start = performance.now();

    const resize = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = element.clientWidth;
      height = element.clientHeight;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (still.matches) draw(start + 4200);
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      level += ((live.listening ? live.level : 0) - level) * 0.12;
      heat *= 0.965;
      ctx.clearRect(0, 0, width, height);
      const rows = width < 700 ? 22 : 34;
      const points = width < 700 ? 56 : 104;
      const horizon = height * 0.3;
      const depth = height * 0.78;
      for (let i = 0; i < rows; i++) {
        const z = i / (rows - 1); // 0 = far, 1 = near
        const y0 = horizon + depth * z ** 1.7;
        const spread = 0.55 + z * 0.65;
        const amp = (6 + z * 46) * (0.55 + level * 2.2);
        ctx.beginPath();
        let energy = 0;
        for (let j = 0; j <= points; j++) {
          const u = j / points;
          const x = width / 2 + (u - 0.5) * width * spread * 1.25;
          const envelope = Math.exp(-(((u - 0.5) * 2.4) ** 2));
          let v =
            Math.sin(u * 9.3 + t * 0.9 + i * 0.41) * 0.55 +
            Math.sin(u * 23.1 - t * 1.7 + i * 0.23) * 0.28 +
            Math.sin(u * 51.0 + t * 2.9 - i * 0.6) * 0.17 * (0.4 + level * 1.6);
          for (const w of waves) {
            const age = (now - w.born) / 1000;
            const radius = age * w.speed;
            const d = Math.hypot((u - w.x) * 1.6, (1 - z) * 0.9);
            const ring = Math.exp(-(((d - radius) * 9) ** 2)) * Math.exp(-age * 1.4);
            v += ring * w.strength * 2.2;
          }
          const yy = y0 - v * amp * envelope;
          energy = Math.max(energy, Math.abs(v) * envelope);
          if (j) ctx.lineTo(x, yy);
          else ctx.moveTo(x, yy);
        }
        const glow = Math.min(1, energy * 0.55 + heat * 0.9 + level * 0.6);
        const alpha = 0.06 + z * 0.34;
        const r = Math.round(150 + 105 * glow),
          g = Math.round(150 - 60 * glow),
          b = Math.round(150 - 105 * glow);
        ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(0.95, alpha + glow * 0.35)})`;
        ctx.lineWidth = 0.6 + z * 1.1;
        ctx.stroke();
      }
      for (let k = waves.length - 1; k >= 0; k--)
        if (now - waves[k].born > 3200) waves.splice(k, 1);
    };

    const loop = (now: number) => {
      draw(now);
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const run = () => {
      if (!frame && !still.matches && visible && !document.hidden)
        frame = requestAnimationFrame(loop);
    };

    const offPulse = onPulse((p: Pulse) => {
      if (still.matches) return;
      const now = performance.now();
      if (p.kind === 'type')
        waves.push({
          born: now,
          x: 0.35 + Math.random() * 0.3,
          strength: 0.35,
          speed: 1.1,
          hot: false,
        });
      if (p.kind === 'calibrated' || p.kind === 'listen')
        waves.push({ born: now, x: 0.5, strength: 0.7, speed: 0.8, hot: false });
      if (p.kind === 'detect') {
        heat = 1;
        waves.push({ born: now, x: 0.5, strength: 1.4, speed: 0.75, hot: true });
      }
      if (waves.length > 24) waves.shift();
      run();
    });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    observer.observe(element);
    const onVisibility = () => run();
    document.addEventListener('visibilitychange', onVisibility);
    const sizer = new ResizeObserver(resize);
    sizer.observe(element);
    const onMotion = () => (still.matches ? draw(start + 4200) : run());
    still.addEventListener('change', onMotion);
    resize();
    run();
    return () => {
      cancelAnimationFrame(frame);
      offPulse();
      observer.disconnect();
      sizer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      still.removeEventListener('change', onMotion);
    };
  }, []);
  return <canvas ref={canvas} className="signal-canvas" aria-hidden="true" />;
}
