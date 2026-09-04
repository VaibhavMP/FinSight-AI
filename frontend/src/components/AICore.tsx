import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export type AI_CORE_STATE = "idle" | "processing" | "retrieval" | "analysis" | "generation" | "complete";

interface AICoreProps {
  state?: AI_CORE_STATE;
  size?: number;
  autoPulse?: boolean;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  speed: number;
  orbit: number;
  size: number;
}

const AICore: React.FC<AICoreProps> = ({
  state = "idle",
  size = 200,
  autoPulse = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);

  const stateColors: Record<AI_CORE_STATE, string> = {
    idle: "#00c8ff",
    processing: "#00c8ff",
    retrieval: "#8a2be2",
    analysis: "#ff69b4",
    generation: "#00ff88",
    complete: "#ffd700",
  };

  const stateLabels: Record<AI_CORE_STATE, string> = {
    idle: "Ready to analyze",
    processing: "Understanding your question",
    retrieval: "Searching financial documents",
    analysis: "Analyzing financial evidence",
    generation: "Preparing grounded response",
    complete: "Analysis complete",
  };

  // Generate orbiting particles
  const generateParticles = () => {
    const particles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      particles.push({
        id: i,
        angle: (i * 30) + Math.random() * 10,
        distance: 45 + Math.random() * 30,
        speed: 0.3 + Math.random() * 0.2,
        orbit: Math.floor(Math.random() * 3) + 1,
        size: 2 + Math.random() * 2,
      });
    }
    return particles;
  };

  useEffect(() => {
    particlesRef.current = generateParticles();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;

    const animate = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      ctx.clearRect(0, 0, size, size);

      // Draw outer ring
      ctx.strokeStyle = stateColors[state];
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Draw middle ring
      ctx.strokeStyle = stateColors[state];
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 95, 0, Math.PI * 2);
      ctx.stroke();

      // Draw inner ring (rotating)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(t * 0.3);
      ctx.strokeStyle = stateColors[state];
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Update and draw particles
      for (const p of particlesRef.current) {
        const orbitRadius = p.distance + Math.sin(t * 0.5 + p.id) * 5;
        const x = centerX + Math.cos(t * p.speed + p.angle) * orbitRadius;
        const y = centerY + Math.sin(t * p.speed + p.angle) * orbitRadius;

        // Draw particle
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = stateColors[state];
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connection line to center
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = stateColors[state];
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Draw connection lines between nearby particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const a1 = t * p1.speed + p1.angle;
          const a2 = t * p2.speed + p2.angle;
          const r1 = p1.distance;
          const r2 = p2.distance;
          const x1 = centerX + Math.cos(a1) * r1;
          const y1 = centerY + Math.sin(a1) * r1;
          const x2 = centerX + Math.cos(a2) * r2;
          const y2 = centerY + Math.sin(a2) * r2;
          const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          if (dist < 60) {
            ctx.globalAlpha = 0.1 * (1 - dist / 60);
            ctx.strokeStyle = stateColors[state];
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      // Central core glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
      gradient.addColorStop(0, stateColors[state]);
      gradient.addColorStop(1, "transparent");
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
      ctx.fill();

      // Central core
      ctx.globalAlpha = 1;
      ctx.fillStyle = stateColors[state];
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Glow around core
      const pulse = autoPulse ? Math.sin(t * 2) * 0.1 + 0.9 : 0.9;
      ctx.globalAlpha = 0.3 * pulse;
      ctx.fillStyle = stateColors[state];
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15 * (1 + pulse), 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [size, state, autoPulse]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        className="block"
        style={{ width: size, height: size }}
      />

      {/* Labels around the core */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute -top-12 text-cyan-300/60 text-xs font-mono tracking-wider">
          Retrieval
        </div>
        <div className="absolute -bottom-12 text-purple-300/60 text-xs font-mono tracking-wider">
          Analysis
        </div>
        <div className="absolute -left-16 text-blue-300/60 text-xs font-mono tracking-wider">
          Memory
        </div>
        <div className="absolute -right-16 text-emerald-300/60 text-xs font-mono tracking-wider">
          Knowledge
        </div>
      </div>

      {/* State label and status */}
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-6 text-center"
      >
        <div className="text-xs font-mono text-cyan-400/70 uppercase tracking-widest">
          AI Core
        </div>
        <div className="text-sm font-medium text-white/90 mt-1">
          {stateLabels[state]}
        </div>
      </motion.div>
    </div>
  );
};

export default AICore;
