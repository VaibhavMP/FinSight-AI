import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  hue: number;
  opacity: number;
}

interface ShootingStar {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  trail: Array<{ x: number; y: number }>;
}

const NightSkyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const timeRef = useRef(0);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    setupCanvas();

    if (prefersReducedMotion) {
      ctx.fillStyle = "#0a0f1b";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#1e3a8a";
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 0.5;
        ctx.globalAlpha = Math.random() * 0.5 + 0.3;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return;
    }

    // Generate stars across layers
    const generateStars = () => {
      const stars: Star[] = [];
      const numStars = 200;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
          layer: Math.floor(Math.random() * 3),
        });
      }
      return stars;
    };

    // Generate nebulae
    const generateNebulae = () => {
      const nebulae: Nebula[] = [];
      const colors = [200, 250, 270, 280];
      for (let i = 0; i < 6; i++) {
        nebulae.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.7,
          radius: Math.random() * 250 + 150,
          hue: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.08 + 0.03,
        });
      }
      return nebulae;
    };

    starsRef.current = generateStars();
    nebulaeRef.current = generateNebulae();

    const lastShootingStar = { time: 0 };

    const animate = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Clear with gradient sky
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#0a0f1b");
      gradient.addColorStop(0.4, "#0c1427");
      gradient.addColorStop(1, "#101930");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw nebulae (soft glows)
      for (const neb of nebulaeRef.current) {
        ctx.save();
        ctx.globalAlpha = neb.opacity;
        const grad = ctx.createRadialGradient(
          neb.x, neb.y, 0, neb.x, neb.y, neb.radius
        );
        grad.addColorStop(0, `hsla(${neb.hue}, 70%, 55%, 0.4)`);
        grad.addColorStop(1, `hsla(${neb.hue}, 70%, 55%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw stars
      for (const star of starsRef.current) {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.opacity + twinkle * 0.1;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.layer === 0 ? "#ffffff" : star.layer === 1 ? "#aaccff" : "#88aaff";

        // Parallax movement for higher layers
        if (star.layer > 0) {
          star.x += 0.02 * (star.layer === 1 ? 1 : -1);
          if (star.x > width) star.x = 0;
          if (star.x < 0) star.x = width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Occasional sparkle for bright stars
        if (star.layer === 0 && star.size > 1.5 && twinkle > 0.8) {
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Shooting stars
      const now = Date.now();
      if (now - lastShootingStar.time > 4000 + Math.random() * 6000) {
        shootingStarsRef.current.push({
          x: -50,
          y: Math.random() * height * 0.4,
          targetX: width + 50,
          targetY: Math.random() * height * 0.4 + 50,
          progress: 0,
          speed: 0.0015 + Math.random() * 0.001,
          trail: [],
        });
        lastShootingStar.time = now;
      }

      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const ss = shootingStarsRef.current[i];
        ss.progress += ss.speed;
        if (ss.progress >= 1) {
          shootingStarsRef.current.splice(i, 1);
          continue;
        }
        ss.trail.push({
          x: ss.x + (ss.targetX - ss.x) * ss.progress,
          y: ss.y + (ss.targetY - ss.y) * ss.progress,
        });
        if (ss.trail.length > 20) ss.trail.shift();

        const currentX = ss.x + (ss.targetX - ss.x) * ss.progress;
        const currentY = ss.y + (ss.targetY - ss.y) * ss.progress;

        // Draw trail
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = ss.progress < 0.8 ? 0.5 * (1 - ss.progress) : 0;
        if (ss.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(ss.trail[0].x, ss.trail[0].y);
          for (let j = 1; j < ss.trail.length; j++) {
            ctx.lineTo(ss.trail[j].x, ss.trail[j].y);
          }
          ctx.stroke();
        }

        // Draw head
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [prefersReducedMotion]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />;
};

export default NightSkyBackground;
