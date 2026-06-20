"use client";

import { useEffect, useRef } from "react";

export default function CanvasVisualizer({ 
  audioFeatures, 
  theme, 
  isPlaying 
}: { 
  audioFeatures: any; 
  theme: string; 
  isPlaying: boolean; 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    // Derive some characteristics from audioFeatures (if available)
    const energy = audioFeatures?.energy || 0.5;
    const valence = audioFeatures?.valence || 0.5;
    
    // Theme colors
    const getColors = () => {
      switch (theme) {
        case "vaporwave":
          return { bg: "#1a0b2e", p1: "#ff00a0", p2: "#00d2ff" };
        case "cosmos":
          return { bg: "#000000", p1: "#ffffff", p2: "#a855f7" };
        case "ambient":
          return { bg: "#0f172a", p1: "#3b82f6", p2: "#10b981" };
        case "neon":
        default:
          return { bg: "#050505", p1: "#1DB954", p2: "#a855f7" };
      }
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * (energy * 10) + 1;
        
        // Base speed affected by energy and whether playing
        const speedMult = isPlaying ? (energy * 5) : 0.5;
        this.speedX = (Math.random() - 0.5) * speedMult;
        this.speedY = (Math.random() - 0.5) * speedMult;
        
        const colors = getColors();
        this.color = Math.random() > valence ? colors.p1 : colors.p2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const particleCount = Math.floor(energy * 200) + 50;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      const colors = getColors();
      
      // Create trailing effect by drawing semi-transparent background
      ctx.fillStyle = colors.bg + (isPlaying ? "40" : "80"); // Hex opacity
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Simulated Waveform if playing
      if (isPlaying) {
        ctx.beginPath();
        const centerY = canvas.height / 2;
        ctx.moveTo(0, centerY);
        
        for (let i = 0; i < canvas.width; i += 10) {
          // Sine wave affected by energy and time
          const time = Date.now() / 1000;
          const frequency = energy * 5;
          const amplitude = energy * 100 * Math.sin(time * 2 + i * 0.01);
          
          ctx.lineTo(i, centerY + Math.sin(i * 0.05 * frequency + time * 5) * amplitude);
        }
        
        ctx.strokeStyle = getColors().p1;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      init();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [audioFeatures, theme, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full object-cover transition-colors duration-1000"
    />
  );
}
