"use client";

import { useEffect, useRef } from "react";

type Droplet = {
  x: number;
  y: number;
  r: number;
  /** 蓄積した勢い。閾値を超えると流れ出す */
  momentum: number;
  /** 流れている最中かどうか */
  sliding: boolean;
  /** 横方向のふらつき */
  drift: number;
  life: number;
};

/**
 * 窓ガラスに付いた雨を描く。
 * 水滴が付着し、質量が閾値を超えると自重で流れ落ちて筋を残す。
 * 稀に雷が光り、その瞬間だけガラス全体が白く飛ぶ。
 */
const RainOnGlass = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // 水の筋を焼き付けておくレイヤー。毎フレーム薄く消していく
    const trail = document.createElement("canvas");
    const trailCtx = trail.getContext("2d");
    if (!trailCtx) return;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      trail.width = width * dpr;
      trail.height = height * dpr;
      trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      trailCtx.clearRect(0, 0, width, height);
    };

    resize();

    const droplets: Droplet[] = [];

    const spawn = (seed = false): Droplet => ({
      x: Math.random() * width,
      y: seed ? Math.random() * height : Math.random() * height * 0.35,
      r: 1.2 + Math.random() * 3.4,
      momentum: 0,
      sliding: false,
      drift: 0,
      life: 0,
    });

    // 最初から窓が濡れている状態にする
    const initialCount = Math.round((width * height) / 9000);
    for (let i = 0; i < initialCount; i++) droplets.push(spawn(true));

    const drawDroplet = (
      target: CanvasRenderingContext2D,
      d: Droplet,
      alpha: number
    ) => {
      const g = target.createRadialGradient(
        d.x - d.r * 0.35,
        d.y - d.r * 0.4,
        d.r * 0.1,
        d.x,
        d.y,
        d.r
      );
      g.addColorStop(0, `rgba(255,255,255,${0.5 * alpha})`);
      g.addColorStop(0.45, `rgba(198,216,238,${0.28 * alpha})`);
      g.addColorStop(1, `rgba(120,150,185,${0.05 * alpha})`);

      target.beginPath();
      target.fillStyle = g;
      target.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      target.fill();

      // 上部のハイライト。これがあるとガラスの水滴に見える
      target.beginPath();
      target.fillStyle = `rgba(255,255,255,${0.55 * alpha})`;
      target.arc(d.x - d.r * 0.3, d.y - d.r * 0.35, d.r * 0.22, 0, Math.PI * 2);
      target.fill();
    };

    let animationId = 0;
    let lightningTimer = 4000 + Math.random() * 6000;
    let last = performance.now();

    const flash = flashRef.current;

    const fireLightning = () => {
      if (!flash || reduceMotion) return;
      // 二度光る。稲妻はたいてい一度では終わらない
      flash.style.transition = "none";
      flash.style.opacity = "0.85";
      window.setTimeout(() => {
        flash.style.transition = "opacity 120ms ease-out";
        flash.style.opacity = "0";
      }, 60);
      window.setTimeout(() => {
        flash.style.transition = "none";
        flash.style.opacity = "0.6";
      }, 220);
      window.setTimeout(() => {
        flash.style.transition = "opacity 420ms ease-out";
        flash.style.opacity = "0";
      }, 300);
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;

      // 筋を少しずつ乾かす
      trailCtx.globalCompositeOperation = "destination-out";
      trailCtx.fillStyle = `rgba(0,0,0,${0.012 * dt})`;
      trailCtx.fillRect(0, 0, width, height);
      trailCtx.globalCompositeOperation = "source-over";

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(trail, 0, 0, width, height);

      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.life += dt;

        if (!d.sliding) {
          // 付着したまま少しずつ育ち、限界を超えると流れ出す
          d.r += 0.004 * dt;
          d.momentum += (d.r * 0.02 + Math.random() * 0.05) * dt;
          if (d.momentum > 1.6 && d.r > 2.2) {
            d.sliding = true;
          }
        } else {
          const speed = (d.r * 0.55 + d.momentum * 0.4) * dt;
          d.y += speed;
          d.drift += (Math.random() - 0.5) * 0.35 * dt;
          d.drift *= 0.9;
          d.x += d.drift;
          d.momentum += 0.03 * dt;

          // 通った跡に水の筋を残す
          trailCtx.beginPath();
          trailCtx.strokeStyle = `rgba(205,222,242,0.16)`;
          trailCtx.lineWidth = d.r * 0.75;
          trailCtx.lineCap = "round";
          trailCtx.moveTo(d.x - d.drift, d.y - speed);
          trailCtx.lineTo(d.x, d.y);
          trailCtx.stroke();

          // 流れながら少し痩せる。水を置いていくので
          d.r -= 0.012 * dt;

          // 止まっている滴を巻き込んで太る
          for (let j = droplets.length - 1; j >= 0; j--) {
            if (j === i) continue;
            const o = droplets[j];
            if (o.sliding) continue;
            const dx = o.x - d.x;
            const dy = o.y - d.y;
            if (dx * dx + dy * dy < (d.r + o.r) * (d.r + o.r)) {
              d.r = Math.sqrt(d.r * d.r + o.r * o.r);
              d.momentum += o.r * 0.15;
              droplets.splice(j, 1);
              if (j < i) i--;
            }
          }
        }

        drawDroplet(ctx, d, 1);

        if (d.y - d.r > height || d.r < 0.8) {
          droplets.splice(i, 1);
        }
      }

      // 新しい滴を降らせる
      const targetCount = Math.round((width * height) / 9000);
      const deficit = targetCount - droplets.length;
      if (deficit > 0) {
        const spawnCount = Math.min(deficit, Math.ceil(2 * dt));
        for (let i = 0; i < spawnCount; i++) {
          droplets.push(spawn(false));
        }
      }

      if (!reduceMotion) {
        lightningTimer -= dt * 16.67;
        if (lightningTimer <= 0) {
          fireLightning();
          lightningTimer = 6000 + Math.random() * 12000;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
      />
      <div
        ref={flashRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white"
        style={{ opacity: 0 }}
      />
    </>
  );
};

export default RainOnGlass;
