/**
 * Icon Cloud 3D (canvas) — equivalente funcional ao Magic UI, sem React.
 */
"use strict";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function fibonacciSphere(count: number, scale: number) {
  const icons: { x: number; y: number; z: number; id: number }[] = [];
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * increment;
    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;
    icons.push({ x: x * scale, y: y * scale, z: z * scale, id: i });
  }
  return icons;
}

function project(icon: { x: number; y: number; z: number }, rot: { x: number; y: number }) {
  const cosX = Math.cos(rot.x);
  const sinX = Math.sin(rot.x);
  const cosY = Math.cos(rot.y);
  const sinY = Math.sin(rot.y);
  const rotatedX = icon.x * cosY - icon.z * sinY;
  const rotatedZ = icon.x * sinY + icon.z * cosY;
  const rotatedY = icon.y * cosX + rotatedZ * sinX;
  return { rotatedX, rotatedY, rotatedZ };
}

export function init(canvas: HTMLCanvasElement, imageUrls: string[]): void {
  if (!canvas || !imageUrls || !imageUrls.length) return;

  const LOGICAL = 400;
  const ICON = 40;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = LOGICAL * dpr;
  canvas.height = LOGICAL * dpr;
  canvas.style.width = LOGICAL + "px";
  canvas.style.height = LOGICAL + "px";
  const ctx = canvas.getContext("2d")!;
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const iconPositions = fibonacciSphere(imageUrls.length, 100);
  const iconCanvases: HTMLCanvasElement[] = [];
  const imagesLoaded: boolean[] = new Array(imageUrls.length).fill(false);
  let rotation: { x: number; y: number } = { x: 0, y: 0 };
  let isDragging = false;
  let lastMouse = { x: 0, y: 0 };
  let mousePos = { x: LOGICAL / 2, y: LOGICAL / 2 };
  let targetRotation: {
    x: number;
    y: number;
    startX: number;
    startY: number;
    startTime: number;
    duration: number;
  } | null = null;
  let raf = 0;

  function toLogical(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    const sx = LOGICAL / rect.width;
    const sy = LOGICAL / rect.height;
    return {
      x: (clientX - rect.left) * sx,
      y: (clientY - rect.top) * sy,
    };
  }

  imageUrls.forEach(function (src, index) {
    const off = document.createElement("canvas");
    off.width = ICON;
    off.height = ICON;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      offCtx.clearRect(0, 0, ICON, ICON);
      offCtx.save();
      offCtx.beginPath();
      offCtx.arc(ICON / 2, ICON / 2, ICON / 2, 0, Math.PI * 2);
      offCtx.closePath();
      offCtx.clip();
      offCtx.drawImage(img, 0, 0, ICON, ICON);
      offCtx.restore();
      imagesLoaded[index] = true;
    };
    img.onerror = function () {
      offCtx.fillStyle = "rgba(255,255,255,0.12)";
      offCtx.beginPath();
      offCtx.arc(ICON / 2, ICON / 2, ICON / 2, 0, Math.PI * 2);
      offCtx.fill();
      imagesLoaded[index] = true;
    };
    img.src = src;
    iconCanvases[index] = off;
  });

  function onPointerDown(clientX: number, clientY: number): void {
    const pos = toLogical(clientX, clientY);
    const x = pos.x;
    const y = pos.y;

    for (let i = 0; i < iconPositions.length; i++) {
      const icon = iconPositions[i];
      const p = project(icon, rotation);
      const screenX = LOGICAL / 2 + p.rotatedX;
      const screenY = LOGICAL / 2 + p.rotatedY;
      const sc = (p.rotatedZ + 200) / 300;
      const radius = 20 * sc;
      const dx = x - screenX;
      const dy = y - screenY;
      if (dx * dx + dy * dy < radius * radius) {
        const targetX = -Math.atan2(
          icon.y,
          Math.sqrt(icon.x * icon.x + icon.z * icon.z)
        );
        const targetY = Math.atan2(icon.x, icon.z);
        const dist = Math.hypot(targetX - rotation.x, targetY - rotation.y);
        const duration = Math.min(2000, Math.max(800, dist * 1000));
        targetRotation = {
          x: targetX,
          y: targetY,
          startX: rotation.x,
          startY: rotation.y,
          startTime: performance.now(),
          duration,
        };
        return;
      }
    }
    isDragging = true;
    lastMouse = { x: clientX, y: clientY };
  }

  function onPointerMove(clientX: number, clientY: number): void {
    mousePos = toLogical(clientX, clientY);
    if (isDragging) {
      rotation.x += (clientY - lastMouse.y) * 0.002;
      rotation.y += (clientX - lastMouse.x) * 0.002;
      lastMouse = { x: clientX, y: clientY };
    }
  }

  function onPointerUp(): void {
    isDragging = false;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionFactor = reduceMotion ? 0.12 : 1;

  // Estado do loop. Pausamos quando o canvas sai do viewport ou a aba fica oculta.
  let inView = true;
  let pageVisible = !document.hidden;
  let running = false;

  function start(): void {
    if (running || !inView || !pageVisible) return;
    running = true;
    raf = requestAnimationFrame(animate);
  }

  function stop(): void {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function animate(): void {
    if (!running) return;
    ctx.clearRect(0, 0, LOGICAL, LOGICAL);
    const centerX = LOGICAL / 2;
    const centerY = LOGICAL / 2;
    const maxD = Math.hypot(centerX, centerY);
    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const dist = Math.hypot(dx, dy);
    const speed = (0.003 + (dist / maxD) * 0.01) * motionFactor;

    if (targetRotation) {
      const elapsed = performance.now() - targetRotation.startTime;
      const progress = Math.min(1, elapsed / targetRotation.duration);
      const eased = easeOutCubic(progress);
      rotation.x =
        targetRotation.startX + (targetRotation.x - targetRotation.startX) * eased;
      rotation.y =
        targetRotation.startY + (targetRotation.y - targetRotation.startY) * eased;
      if (progress >= 1) targetRotation = null;
    } else if (!isDragging) {
      rotation.x += (dy / LOGICAL) * speed;
      rotation.y += (dx / LOGICAL) * speed;
    }

    const sorted = iconPositions
      .map(function (icon, index) {
        const p = project(icon, rotation);
        return { icon, index, rotatedX: p.rotatedX, rotatedY: p.rotatedY, rotatedZ: p.rotatedZ };
      })
      .sort(function (a, b) {
        return a.rotatedZ - b.rotatedZ;
      });

    sorted.forEach(function (row) {
      const sc = (row.rotatedZ + 200) / 300;
      const opacity = Math.max(0.2, Math.min(1, (row.rotatedZ + 150) / 200));
      ctx.save();
      ctx.translate(LOGICAL / 2 + row.rotatedX, LOGICAL / 2 + row.rotatedY);
      ctx.scale(sc, sc);
      ctx.globalAlpha = opacity;
      const cnv = iconCanvases[row.index];
      if (cnv && imagesLoaded[row.index]) {
        ctx.filter = "brightness(0) invert(1)";
        ctx.drawImage(cnv, -20, -20, 40, 40);
        ctx.filter = "none";
      }
      ctx.restore();
    });

    raf = requestAnimationFrame(animate);
  }

  canvas.addEventListener("mousedown", function (e) {
    onPointerDown(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", function (e) {
    onPointerMove(e.clientX, e.clientY);
  });
  window.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("mouseleave", onPointerUp);

  canvas.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      onPointerDown(t.clientX, t.clientY);
    },
    { passive: false }
  );
  canvas.addEventListener(
    "touchmove",
    function (e) {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      onPointerMove(t.clientX, t.clientY);
      lastMouse = { x: t.clientX, y: t.clientY };
    },
    { passive: false }
  );
  canvas.addEventListener("touchend", onPointerUp);
  canvas.addEventListener("touchcancel", onPointerUp);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        inView = !!(entries[0] && entries[0].isIntersecting);
        if (inView) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);
  }

  document.addEventListener("visibilitychange", function () {
    pageVisible = !document.hidden;
    if (pageVisible) start();
    else stop();
  });

  start();
}
