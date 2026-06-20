"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useSpotifyPlayer } from "../providers/SpotifyPlayerProvider";

// Simple deterministic RNG based on string seed
function sfc32(a: number, b: number, c: number, d: number) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    let t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

export type GameMode = 'catcher' | 'dodge' | 'zen';

export default function CanvasVisualizer({ 
  audioFeatures, 
  theme, 
  isPlaying,
  trackId = "default",
  gameMode = "catcher",
  lyricsData
}: { 
  audioFeatures: any; 
  theme: string; 
  isPlaying: boolean; 
  trackId?: string;
  gameMode?: GameMode;
  lyricsData?: any;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const { playbackState } = useSpotifyPlayer();

  const parsedLyrics = useMemo(() => {
    if (!lyricsData?.syncedLyrics) return [];
    const lines = lyricsData.syncedLyrics.split("\n");
    const parsed = [];
    for (const line of lines) {
      const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
      if (match && match[3].trim()) {
        const mins = parseInt(match[1]);
        const secs = parseFloat(match[2]);
        const timeMs = (mins * 60 + secs) * 1000;
        parsed.push({ timeMs, text: match[3].trim() });
      }
    }
    return parsed;
  }, [lyricsData]);

  useEffect(() => {
    // Reset score when mode changes
    setScore(0);
    setCombo(0);
  }, [gameMode, trackId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let orbs: VibeOrb[] = [];
    let mouse = { x: -1000, y: -1000, isDown: false };
    
    // Seed RNG based on track ID
    const seed = cyrb128(trackId);
    const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

    const energy = audioFeatures?.energy || 0.6;
    const valence = audioFeatures?.valence || 0.5;
    
    const getColors = () => {
      if (gameMode === 'dodge') {
        return { bg: "#110000", p1: "#ff0000", p2: "#ff4400", orb: "#000" };
      }
      switch (theme) {
        case "vaporwave":
          return { bg: "#1a0b2e", p1: "#ff00a0", p2: "#00d2ff", orb: "#fcd34d" };
        case "cosmos":
          return { bg: "#000000", p1: "#ffffff", p2: "#a855f7", orb: "#fbbf24" };
        case "ambient":
          return { bg: "#0f172a", p1: "#3b82f6", p2: "#10b981", orb: "#fef08a" };
        case "neon":
        default:
          return { bg: "#050505", p1: "#1DB954", p2: "#a855f7", orb: "#ffffff" };
      }
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      baseSpeedX: number;
      baseSpeedY: number;
      color: string;

      constructor(x?: number, y?: number, isExplosion = false) {
        this.x = x ?? Math.random() * canvas!.width;
        this.y = y ?? Math.random() * canvas!.height;
        this.size = Math.random() * (energy * 8) + 1;
        
        const speedMult = isPlaying ? (energy * 3) : 0.2;
        
        if (isExplosion) {
          const angle = Math.random() * Math.PI * 2;
          const power = Math.random() * 10 + 5;
          this.baseSpeedX = Math.cos(angle) * power;
          this.baseSpeedY = Math.sin(angle) * power;
        } else {
          this.baseSpeedX = (Math.random() - 0.5) * speedMult;
          this.baseSpeedY = (Math.random() - 0.5) * speedMult;
        }

        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        
        const colors = getColors();
        this.color = Math.random() > valence ? colors.p1 : colors.p2;
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (gameMode === 'dodge' && isPlaying) {
          // Attract slowly to mouse
          if (dist < 300) {
            const force = (300 - dist) / 300;
            this.speedX += (dx / dist) * force * 0.2;
            this.speedY += (dy / dist) * force * 0.2;
          }
          
          // Collision check!
          if (dist < this.size + 15 && mouse.x > 0) {
            setScore(0);
            setCombo(0);
            // Explosion pushback
            this.speedX = -(dx / dist) * 10;
            this.speedY = -(dy / dist) * 10;
          }
        } else {
          // Repel from mouse
          if (dist < 150) {
            const force = (150 - dist) / 150;
            this.speedX -= (dx / dist) * force * 2;
            this.speedY -= (dy / dist) * force * 2;
          } else {
            // Return to base speed
            this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
            this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
          }
        }

        // Limit max speed in dodge mode
        if (gameMode === 'dodge') {
          const maxSpeed = 5;
          const currentSpeed = Math.sqrt(this.speedX**2 + this.speedY**2);
          if (currentSpeed > maxSpeed) {
            this.speedX = (this.speedX / currentSpeed) * maxSpeed;
            this.speedY = (this.speedY / currentSpeed) * maxSpeed;
          }
        }

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

    class VibeOrb {
      x: number;
      y: number;
      maxRadius: number;
      radius: number;
      life: number;
      maxLife: number;
      active: boolean;

      constructor() {
        this.x = rand() * (canvas!.width - 100) + 50;
        this.y = rand() * (canvas!.height - 200) + 50; 
        this.maxRadius = rand() * 20 + 30; 
        this.radius = 0;
        this.maxLife = 100;
        this.life = this.maxLife;
        this.active = true;
      }

      update() {
        if (!this.active) return;
        this.life--;
        
        if (this.life > this.maxLife - 20) {
          this.radius += (this.maxRadius - this.radius) * 0.2;
        } else if (this.life < 20) {
          this.radius *= 0.8;
        }

        if (this.life <= 0) {
          this.active = false;
          setCombo(0);
        }
      }

      draw() {
        if (!this.active || !ctx) return;
        const colors = getColors();
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = colors.orb;
        ctx.fillStyle = colors.orb;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = colors.orb;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const ringRadius = this.maxRadius + ((this.maxLife - this.life) * 0.5);
        ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
      }
      
      checkClick(mx: number, my: number) {
        if (!this.active) return false;
        const dist = Math.sqrt((this.x - mx) ** 2 + (this.y - my) ** 2);
        if (dist < this.radius + 20) {
          this.active = false;
          return true;
        }
        return false;
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Dodge mode has fewer particles so it's fair
      const countMult = gameMode === 'dodge' ? 0.5 : 1;
      const particleCount = Math.floor((energy * 200) + 50) * countMult;
      
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseOut = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleMouseClick = (e: MouseEvent) => {
      if (gameMode !== 'catcher') return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      for (let i = 0; i < 20; i++) {
        particles.push(new Particle(mx, my, true));
      }
      if (particles.length > 400) {
        particles.splice(0, 20); 
      }
      
      let hit = false;
      orbs.forEach(orb => {
        if (orb.checkClick(mx, my)) {
          hit = true;
        }
      });
      
      if (hit) {
        setScore(s => s + 100 + (combo * 10));
        setCombo(c => c + 1);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseout", handleMouseOut);
    canvas.addEventListener("mousedown", handleMouseClick);

    let lastSpawn = 0;
    const spawnInterval = 1500 - (energy * 1000); 
    
    let lastDodgeTick = 0;
    
    let activeLyricIndex = -1;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (!ctx || !canvas) return;
      
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Logic to track exact playback position natively in the loop
      let currentPos = 0;
      if (isPlaying && playbackState) {
        currentPos = playbackState.position + (performance.now() - playbackState.timestamp);
      }

      // Check lyrics for explosions!
      if (isPlaying && parsedLyrics.length > 0) {
        let newIdx = -1;
        for (let i = 0; i < parsedLyrics.length; i++) {
          if (parsedLyrics[i].timeMs <= currentPos) {
            newIdx = i;
          } else {
            break;
          }
        }
        if (newIdx !== activeLyricIndex && newIdx !== -1) {
          activeLyricIndex = newIdx;
          // Spawn a massive central explosion synced to the new vocal line!
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          for (let i = 0; i < 40; i++) {
            particles.push(new Particle(cx, cy, true));
          }
        }
      }
      
      const colors = getColors();
      
      ctx.fillStyle = colors.bg + (isPlaying ? "40" : "80"); 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      
      if (isPlaying) {
        if (gameMode === 'catcher') {
          if (timestamp - lastSpawn > spawnInterval) {
            lastSpawn = timestamp;
            if (rand() > 0.3) {
              orbs.push(new VibeOrb());
            }
          }
        } else if (gameMode === 'dodge') {
          if (timestamp - lastDodgeTick > 100) {
            lastDodgeTick = timestamp;
            if (mouse.x > 0) { // If mouse is on screen
              setScore(s => s + 1);
            }
          }
        }
      }

      if (gameMode === 'catcher') {
        orbs = orbs.filter(orb => orb.active || orb.life > 0);
        orbs.forEach(orb => {
          orb.update();
          orb.draw();
        });
      }

      if (isPlaying) {
        ctx.beginPath();
        const centerY = canvas.height / 2;
        ctx.moveTo(0, centerY);
        
        for (let i = 0; i < canvas.width; i += 10) {
          const time = timestamp / 1000;
          const frequency = energy * 5;
          const amplitude = energy * 100 * Math.sin(time * 2 + i * 0.01);
          ctx.lineTo(i, centerY + Math.sin(i * 0.05 * frequency + time * 5) * amplitude);
        }
        
        ctx.strokeStyle = colors.p1;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    init();
    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      init();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseout", handleMouseOut);
      canvas.removeEventListener("mousedown", handleMouseClick);
    };
  }, [audioFeatures, theme, isPlaying, trackId, gameMode, combo, parsedLyrics, playbackState]);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className={`w-full h-full object-cover transition-colors duration-1000 ${gameMode === 'dodge' ? 'cursor-none' : 'cursor-crosshair'}`}
      />
      {gameMode !== 'zen' && (
        <div className={`absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <span className={`text-5xl font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-widest uppercase ${gameMode === 'dodge' ? 'text-red-500' : 'text-white'}`}>
            {score}
          </span>
          <span className={`text-xl font-bold transition-transform duration-200 ${combo > 2 ? 'text-primary scale-110' : 'text-gray-400'}`}>
            {gameMode === 'dodge' ? 'Survive!' : (combo > 0 ? `${combo}x Combo` : 'Catch the Vibes!')}
          </span>
        </div>
      )}
    </>
  );
}
