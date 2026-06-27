"use client";

import { useEffect, useRef } from "react";

interface Icon {
  key: string;
  bg: string;
  fg: string;
  label: string;
  shape: "circle" | "round-square";
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotSpeed: number;
  scale: number;
  scaleDir: number;
  scaleSpeed: number;
}

const ICON_DEFS = [
  { key: "notion", bg: "#ffffff", fg: "#000000", label: "N", shape: "round-square" as const },
  { key: "github", bg: "#24292e", fg: "#ffffff", label: "GH", shape: "circle" as const },
  { key: "slack", bg: "#4a154b", fg: "#e01e5a", label: "#", shape: "round-square" as const },
  { key: "vscode", bg: "#0078d4", fg: "#ffffff", label: "<>", shape: "round-square" as const },
  { key: "browser", bg: "#1a73e8", fg: "#ffffff", label: "⊕", shape: "circle" as const },
  { key: "terminal", bg: "#1e1e1e", fg: "#33ff00", label: ">_", shape: "round-square" as const },
  { key: "textfile", bg: "#374151", fg: "#9ca3af", label: "≡", shape: "round-square" as const },
  { key: "bookmark", bg: "#6366f1", fg: "#ffffff", label: "⚑", shape: "circle" as const },
];

function createIcon(def: (typeof ICON_DEFS)[number], W: number, H: number): Icon {
  const r = 22;
  return {
    ...def,
    x: r + Math.random() * (W - r * 2),
    y: r + Math.random() * (H - r * 2),
    vx: (Math.random() - 0.5) * 1.4,
    vy: (Math.random() - 0.5) * 1.4,
    radius: r,
    rotation: (Math.random() - 0.5) * 0.4,
    rotSpeed: (Math.random() - 0.5) * 0.008,
    scale: 1,
    scaleDir: 1,
    scaleSpeed: 0.002 + Math.random() * 0.002,
  };
}

export default function HeroChaosCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let icons: Icon[] = [];
    let mouse: { x: number; y: number } | null = null;
    let animId: number | null = null;

    function resize() {
      if (!canvas || !wrap || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(dpr, dpr);
      icons.forEach((icon) => {
        icon.x = Math.max(icon.radius, Math.min(w - icon.radius, icon.x));
        icon.y = Math.max(icon.radius, Math.min(h - icon.radius, icon.y));
      });
    }

    function drawIcon(icon: Icon) {
      if (!ctx) return;
      const { x, y, radius, rotation, scale, bg, fg, label, shape } = icon;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      ctx.shadowColor = bg;
      ctx.shadowBlur = 10;

      const r = radius;
      if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();
      } else {
        const s = r * 1.7;
        const cr = s * 0.28;
        ctx.beginPath();
        ctx.roundRect(-s / 2, -s / 2, s, s, cr);
        ctx.fillStyle = bg;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.fillStyle = fg;
      const fontSize = label.length > 2 ? 9 : label.length > 1 ? 11 : 16;
      ctx.font = `700 ${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    function update() {
      if (!wrap) return;
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;

      icons.forEach((icon) => {
        if (mouse) {
          const dx = icon.x - mouse.x;
          const dy = icon.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90 && dist > 0) {
            const force = ((90 - dist) / 90) * 2.5;
            icon.vx += (dx / dist) * force;
            icon.vy += (dy / dist) * force;
          }
        }

        icon.vx *= 0.985;
        icon.vy *= 0.985;

        const speed = Math.sqrt(icon.vx * icon.vx + icon.vy * icon.vy);
        if (speed > 2.5) {
          icon.vx = (icon.vx / speed) * 2.5;
          icon.vy = (icon.vy / speed) * 2.5;
        }
        if (speed < 0.25) {
          icon.vx += (Math.random() - 0.5) * 0.3;
          icon.vy += (Math.random() - 0.5) * 0.3;
        }

        icon.x += icon.vx;
        icon.y += icon.vy;

        const r = icon.radius;
        if (icon.x - r < 0) { icon.x = r; icon.vx = Math.abs(icon.vx) * 0.8; }
        if (icon.x + r > W) { icon.x = W - r; icon.vx = -Math.abs(icon.vx) * 0.8; }
        if (icon.y - r < 0) { icon.y = r; icon.vy = Math.abs(icon.vy) * 0.8; }
        if (icon.y + r > H) { icon.y = H - r; icon.vy = -Math.abs(icon.vy) * 0.8; }

        icon.rotation += icon.rotSpeed;
        icon.scale += icon.scaleSpeed * icon.scaleDir;
        if (icon.scale > 1.06 || icon.scale < 0.94) icon.scaleDir *= -1;
      });
    }

    function render() {
      if (!ctx || !wrap) return;
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      ctx.clearRect(0, 0, W, H);
      icons.forEach(drawIcon);
    }

    function loop() {
      update();
      render();
      animId = requestAnimationFrame(loop);
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mouse = null; };

    wrap.addEventListener("mousemove", onMouseMove, { passive: true });
    wrap.addEventListener("mouseleave", onMouseLeave, { passive: true });

    resize();
    icons = ICON_DEFS.map((def) => createIcon(def, wrap.clientWidth, wrap.clientHeight));

    const resizeObs = new ResizeObserver(() => resize());
    resizeObs.observe(wrap);

    const visObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!animId) animId = requestAnimationFrame(loop);
        } else {
          if (animId) { cancelAnimationFrame(animId); animId = null; }
        }
      });
    }, { threshold: 0.1 });
    visObs.observe(canvas);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      wrap.removeEventListener("mousemove", onMouseMove);
      wrap.removeEventListener("mouseleave", onMouseLeave);
      resizeObs.disconnect();
      visObs.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="h-full w-full" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </div>
  );
}
