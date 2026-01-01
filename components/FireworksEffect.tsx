
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface FireworksHandle {
  launch: () => void;
}

const FireworksEffect = forwardRef<FireworksHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);
  const animationFrameId = useRef<number>(0);

  const colors = ['#ff0044', '#00ffcc', '#ffff00', '#ff8800', '#0099ff', '#ff00ff'];

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    color: string;
    size: number;
    gravity: number;
    friction: number;

    constructor(x: number, y: number, color: string) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 12 + 2;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity;
      this.alpha = 1;
      this.color = color;
      this.size = Math.random() * 3 + 2;
      this.gravity = 0.15;
      this.friction = 0.96;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.01;
    }
  }

  useImperativeHandle(ref, () => ({
    launch: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const count = 80;
      const centerX = Math.random() * canvas.width;
      const centerY = Math.random() * (canvas.height * 0.5);
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      for (let i = 0; i < count; i++) {
        particles.current.push(new Particle(centerX, centerY, color));
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current = particles.current.filter(p => p.alpha > 0);
      particles.current.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[150]"
    />
  );
});

export default FireworksEffect;
