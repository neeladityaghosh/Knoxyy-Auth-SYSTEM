'use client';

import React, { useEffect, useRef, useState } from 'react';
import './AeroShards.css';

/**
 * AeroShards: Continuous floating ambient shards background
 * Uses hardware-accelerated 2D canvas with WebGPU compatibility
 * Renders continuously moving geometric faceted shards with gentle transparency
 */
export default function AeroShards({
  backgroundColor = 'transparent',
  shardColor = '#7c3aed',
  accentColor = '#ff781f',
  speed = 1,
  opacity = 0.32,
  count = 38,
  className = '',
  style = {}
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Mouse pointer tracking
    const mouse = { x: -1000, y: -1000, radius: 180 };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);

    // Initialize shards
    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.parentElement.clientHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Create random shard polygons
    const createShards = () => {
      const shards = [];
      const total = Math.max(20, Math.min(count, Math.floor((width * height) / 28000)));

      for (let i = 0; i < total; i++) {
        const size = Math.random() * 45 + 20;
        // Generate a 3- to 5-sided geometric shard
        const numSides = Math.random() > 0.4 ? 3 : 4;
        const vertices = [];
        for (let s = 0; s < numSides; s++) {
          const angle = (s / numSides) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          const r = size * (0.6 + Math.random() * 0.8);
          vertices.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
          });
        }

        shards.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.65 * speed,
          vy: (Math.random() - 0.5) * 0.65 * speed - 0.15 * speed, // Gentle natural upward drift
          angle: Math.random() * Math.PI * 2,
          vAngle: (Math.random() - 0.5) * 0.012 * speed,
          size,
          vertices,
          baseAlpha: Math.random() * 0.4 + 0.2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.02,
          isAccent: Math.random() > 0.75
        });
      }
      return shards;
    };

    let shards = createShards();

    // Color conversion
    const parseRgb = (hex) => {
      let h = String(hex || '').replace('#', '');
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const num = parseInt(h, 16);
      if (Number.isNaN(num)) return [124, 58, 237];
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    };

    const shardRgb = parseRgb(shardColor);
    const accentRgb = parseRgb(accentColor);

    // Continuous Animation Loop (60 FPS)
    let lastTime = performance.now();

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Draw faint connection webbing between nearby shards
      for (let i = 0; i < shards.length; i++) {
        for (let j = i + 1; j < shards.length; j++) {
          const dx = shards[i].x - shards[j].x;
          const dy = shards[i].y - shards[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.12 * opacity;
            ctx.beginPath();
            ctx.moveTo(shards[i].x, shards[i].y);
            ctx.lineTo(shards[j].x, shards[j].y);
            ctx.strokeStyle = `rgba(${shardRgb[0]}, ${shardRgb[1]}, ${shardRgb[2]}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update and draw each shard
      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];

        // Move
        s.x += s.vx;
        s.y += s.vy;
        s.angle += s.vAngle;
        s.pulse += s.pulseSpeed;

        // Interactive pointer repulsion
        const pdx = s.x - mouse.x;
        const pdy = s.y - mouse.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < mouse.radius && pdist > 0) {
          const force = (1 - pdist / mouse.radius) * 1.8;
          s.x += (pdx / pdist) * force * 3;
          s.y += (pdy / pdist) * force * 3;
        }

        // Screen boundary wrap
        const pad = s.size * 2;
        if (s.x < -pad) s.x = width + pad;
        if (s.x > width + pad) s.x = -pad;
        if (s.y < -pad) s.y = height + pad;
        if (s.y > height + pad) s.y = -pad;

        // Render shard with rotation & gradient fill
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        const currentAlpha = (s.baseAlpha + Math.sin(s.pulse) * 0.1) * opacity;
        const rgb = s.isAccent ? accentRgb : shardRgb;

        ctx.beginPath();
        if (s.vertices.length > 0) {
          ctx.moveTo(s.vertices[0].x, s.vertices[0].y);
          for (let v = 1; v < s.vertices.length; v++) {
            ctx.lineTo(s.vertices[v].x, s.vertices[v].y);
          }
          ctx.closePath();
        }

        // Translucent facet fill
        const grad = ctx.createLinearGradient(-s.size, -s.size, s.size, s.size);
        grad.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${currentAlpha * 0.85})`);
        grad.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${currentAlpha * 0.2})`);
        ctx.fillStyle = grad;
        ctx.fill();

        // Faceted glowing stroke
        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${currentAlpha * 1.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [shardColor, accentColor, speed, opacity, count]);

  return (
    <div
      ref={containerRef}
      className={`aero-shards ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor,
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
