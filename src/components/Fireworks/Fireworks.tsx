import React, { useEffect, useRef, useCallback } from 'react';
import './Fireworks.css';

type FireworkType = 'circle' | 'heart' | 'star' | 'ring' | 'willow' | 'burst';
type Phase = 'normal' | 'finale' | 'showingText' | 'ending';

interface Firework {
  id: number;
  x: number;
  y: number;
  targetY: number;
  speed: number;
  color: string;
  hue: number;
  particles: Particle[];
  sparkles: Sparkle[];
  exploded: boolean;
  type: FireworkType;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  hue: number;
  size: number;
}

interface Sparkle {
  x: number;
  y: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  hue: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleOffset: number;
  color: string;
}

// 祝福语列表
const blessings = [
  '2026 新年快乐',
  '2026 万事如意', 
  '2026 恭喜发财',
  '2026 阖家欢乐',
  '2026 心想事成',
  '2026 龙年大吉',
  '2026 身体健康',
  '2026 财源广进',
];

interface FireworksProps {
  isPlaying: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

let globalFireworkId = 0;

const Fireworks: React.FC<FireworksProps> = ({ isPlaying, onPlayStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();
  const lastLaunchRef = useRef<number>(0);
  const fireworkCountRef = useRef<number>(0);
  const phaseRef = useRef<Phase>('normal');
  const blessingRef = useRef<string>('');
  const textShownTimeRef = useRef<number>(0);
  const animationStartTimeRef = useRef<number>(0);

  const springColors = [
    '#ff4d4f', '#ff7875', '#ffa39e', '#ffccc7', '#fff1f0',
    '#ffd700', '#ffed4e', '#fff566', '#fff9c4', '#fffbe6',
    '#ff6b6b', '#ff8585', '#ff9f9f', '#ffb8b8', '#ffd1d1'
  ];

  const fireworkTypes: FireworkType[] = [
    'circle', 'heart', 'star', 'ring', 'willow', 'burst'
  ];

  // 创建星星
  const createStars = useCallback((): Star[] => {
    const stars: Star[] = [];
    for (let i = 0; i < 60; i++) {
      const colorIndex = Math.floor(Math.random() * springColors.length);
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.6,
        size: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.5 + 0.2,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: springColors[colorIndex],
      });
    }
    return stars;
  }, []);

  // 创建普通烟花
  const createFirework = useCallback((isFinale = false): Firework => {
    const hue = Math.random() * 60 + 340;
    const color = springColors[Math.floor(Math.random() * springColors.length)];
    
    // 终场烟花集中在中心区域
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.35;
    
    if (isFinale) {
      // 终场烟花在中心区域较小范围内
      const spreadX = 150;
      const spreadY = 80;
      const x = centerX + (Math.random() - 0.5) * spreadX * 2;
      const targetY = centerY + (Math.random() - 0.5) * spreadY;
      
      return {
        id: ++globalFireworkId,
        x: Math.max(100, Math.min(window.innerWidth - 100, x)),
        y: window.innerHeight,
        targetY: Math.max(80, Math.min(window.innerHeight * 0.5, targetY)),
        speed: Math.random() * 3 + 14,
        color,
        hue,
        particles: [],
        sparkles: [],
        exploded: false,
        type: fireworkTypes[Math.floor(Math.random() * fireworkTypes.length)],
      };
    }
    
    // 普通烟花分散一些
    const spreadX = window.innerWidth * 0.25;
    const x = centerX + (Math.random() - 0.5) * spreadX * 2;
    const targetY = window.innerHeight * (0.15 + Math.random() * 0.2);
    
    return {
      id: ++globalFireworkId,
      x: Math.max(50, Math.min(window.innerWidth - 50, x)),
      y: window.innerHeight,
      targetY,
      speed: Math.random() * 4 + 15,
      color,
      hue,
      particles: [],
      sparkles: [],
      exploded: false,
      type: fireworkTypes[Math.floor(Math.random() * fireworkTypes.length)],
    };
  }, []);

  // 创建爆炸粒子
  const createParticles = useCallback((x: number, y: number, hue: number, type: FireworkType, isFinale = false): Particle[] => {
    const particles: Particle[] = [];
    const baseCount = isFinale ? 1.3 : 1;
    
    switch (type) {
      case 'heart': {
        const count = Math.floor(35 * baseCount);
        for (let i = 0; i < count; i++) {
          const t = (i / count) * Math.PI * 2;
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
          const scale = 0.15 + Math.random() * 0.03;
          
          particles.push({
            x, y,
            vx: hx * scale * (isFinale ? 1.2 : 1),
            vy: hy * scale * (isFinale ? 1.2 : 1),
            alpha: 1,
            decay: 0.022 + Math.random() * 0.01,
            color: `hsl(${hue + (Math.random() - 0.5) * 30}, 100%, 60%)`,
            hue,
            size: (1 + Math.random() * 0.5) * (isFinale ? 1.2 : 1),
          });
        }
        break;
      }
      
      case 'star': {
        const count = Math.floor(30 * baseCount);
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
          const isOuter = i % 2 === 0;
          const radius = isOuter ? 5 : 2;
          
          particles.push({
            x, y,
            vx: Math.cos(angle) * radius * 0.7 * (isFinale ? 1.2 : 1),
            vy: Math.sin(angle) * radius * 0.7 * (isFinale ? 1.2 : 1),
            alpha: 1,
            decay: 0.025 + Math.random() * 0.008,
            color: `hsl(${hue + (Math.random() - 0.5) * 40}, 100%, 60%)`,
            hue,
            size: (1 + Math.random() * 0.5) * (isFinale ? 1.2 : 1),
          });
        }
        break;
      }
      
      case 'ring': {
        const count = Math.floor(35 * baseCount);
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count;
          const velocity = (4 + Math.random() * 1) * (isFinale ? 1.2 : 1);
          
          particles.push({
            x, y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            alpha: 1,
            decay: 0.018 + Math.random() * 0.006,
            color: `hsl(${hue + (Math.random() - 0.5) * 20}, 100%, 65%)`,
            hue,
            size: (0.8 + Math.random() * 0.4) * (isFinale ? 1.2 : 1),
          });
        }
        break;
      }
      
      case 'willow': {
        const count = Math.floor(45 * baseCount);
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
          const velocity = (Math.random() * 3 + 2) * (isFinale ? 1.2 : 1);
          
          particles.push({
            x, y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 3,
            alpha: 1,
            decay: 0.012 + Math.random() * 0.005,
            color: `hsl(${hue + (Math.random() - 0.5) * 30}, 100%, 60%)`,
            hue,
            size: (0.8 + Math.random() * 0.4) * (isFinale ? 1.2 : 1),
          });
        }
        break;
      }
      
      case 'burst': {
        const count = Math.floor(45 * baseCount);
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = (Math.random() * 5 + 2.5) * (isFinale ? 1.3 : 1);
          
          particles.push({
            x, y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            alpha: 1,
            decay: 0.022 + Math.random() * 0.01,
            color: `hsl(${hue + (Math.random() - 0.5) * 60}, 100%, 65%)`,
            hue,
            size: (1.2 + Math.random() * 0.6) * (isFinale ? 1.2 : 1),
          });
        }
        break;
      }
      
      case 'circle':
      default: {
        const count = Math.floor(35 * baseCount);
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
          const velocity = (Math.random() * 4 + 3) * (isFinale ? 1.2 : 1);
          
          particles.push({
            x, y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            alpha: 1,
            decay: 0.02 + Math.random() * 0.008,
            color: `hsl(${hue + (Math.random() - 0.5) * 50}, 100%, 60%)`,
            hue,
            size: (1 + Math.random() * 0.5) * (isFinale ? 1.2 : 1),
          });
        }
        break;
      }
    }
    
    return particles;
  }, []);

  // 创建闪亮粒子
  const createSparkles = useCallback((x: number, y: number, hue: number): Sparkle[] => {
    const sparkles: Sparkle[] = [];
    for (let i = 0; i < 8; i++) {
      sparkles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vy: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        size: Math.random() * 2 + 0.5,
        color: `hsl(${hue + Math.random() * 40}, 100%, 70%)`,
        hue,
      });
    }
    return sparkles;
  }, []);

  // 绘制大尺寸文字
  const drawBlessingText = useCallback((ctx: CanvasRenderingContext2D, text: string, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // 设置字体：加粗、大号
    ctx.font = 'bold 80px "Microsoft YaHei", "SimHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const x = window.innerWidth / 2;
    const y = window.innerHeight * 0.4;
    
    // 绘制霓虹外发光效果
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ff4d4f'; // 红色外光圈
    ctx.fillStyle = '#ff4d4f';
    ctx.fillText(text, x, y);
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffd700'; // 金色内光圈
    ctx.fillStyle = '#ffd700';
    ctx.fillText(text, x, y);
    
    // 绘制核心文字
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
    
    // 描边增强清晰度
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y);
    
    ctx.restore();
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      fireworksRef.current = [];
      fireworkCountRef.current = 0;
      phaseRef.current = 'normal';
      blessingRef.current = '';
      textShownTimeRef.current = 0;
      animationStartTimeRef.current = 0;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 初始化星星
    starsRef.current = createStars();

    // 随机选择祝福语
    blessingRef.current = blessings[Math.floor(Math.random() * blessings.length)];
    animationStartTimeRef.current = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      
      // 清除画布 - 使用完全不透明的背景清除拖尾
      ctx.fillStyle = 'rgba(8, 4, 4, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制星星背景（带闪烁）
      const time = currentTime * 0.001;
      starsRef.current.forEach(star => {
        const twinkle = Math.sin(time * 2 + star.twinkleOffset) * 0.3 + 0.7;
        ctx.globalAlpha = star.alpha * twinkle;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 根据阶段发射烟花
      if (phaseRef.current === 'normal') {
        if (fireworkCountRef.current < 88 && fireworksRef.current.length < 8) {
          const launchInterval = 450;
          if (currentTime - lastLaunchRef.current > launchInterval) {
            const count = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
              setTimeout(() => {
                if (fireworksRef.current.length < 10) {
                  fireworksRef.current.push(createFirework());
                }
              }, i * 100);
            }
            fireworkCountRef.current += count;
            lastLaunchRef.current = currentTime;
          }
        } else if (fireworkCountRef.current >= 88 && fireworksRef.current.length === 0) {
          phaseRef.current = 'finale';
          lastLaunchRef.current = currentTime;
        }
      } else if (phaseRef.current === 'finale') {
        if (currentTime - lastLaunchRef.current > 500 && fireworksRef.current.length === 0) {
          // 终场：在一瞬间发射10个集中爆炸的烟花
          for (let i = 0; i < 10; i++) {
            setTimeout(() => {
              fireworksRef.current.push(createFirework(true));
            }, i * 30);
          }
          phaseRef.current = 'showingText';
          lastLaunchRef.current = currentTime;
        }
      } else if (phaseRef.current === 'showingText') {
        const allExploded = fireworksRef.current.every(f => f.exploded);
        const hasFireworks = fireworksRef.current.length >= 10;
        
        if (hasFireworks && allExploded) {
          if (textShownTimeRef.current === 0) {
            // 第一次进入，记录时间
            textShownTimeRef.current = currentTime;
          } else {
            // 计算文字显示时间
            const textElapsed = currentTime - textShownTimeRef.current;
            
            // 文字显示3秒后进入结束阶段
            if (textElapsed > 3000) {
              phaseRef.current = 'ending';
            }
          }
        }
        
        // 绘制文字（带渐入渐出效果）
        if (textShownTimeRef.current > 0) {
          const textElapsed = currentTime - textShownTimeRef.current;
          let textAlpha = 1;
          
          if (textElapsed < 800) {
            textAlpha = textElapsed / 800; // 渐入
          } else if (textElapsed > 2500) {
            textAlpha = Math.max(0, 1 - (textElapsed - 2500) / 1000); // 渐出
          }
          
          if (textAlpha > 0) {
            drawBlessingText(ctx, blessingRef.current, textAlpha);
          }

          if (textElapsed > 4000) {
            phaseRef.current = 'ending';
          }
        }
      } else if (phaseRef.current === 'ending') {
        if (onPlayStateChange) {
          onPlayStateChange(false);
        }
        return;
      }

      // 更新和绘制烟花
      fireworksRef.current = fireworksRef.current.filter(firework => {
        if (!firework.exploded) {
          // 火箭上升
          firework.y -= firework.speed;
          firework.speed *= 0.96;

          if (firework.y <= firework.targetY || firework.speed < 2) {
            firework.exploded = true;
            firework.particles = createParticles(firework.x, firework.y, firework.hue, firework.type, phaseRef.current === 'finale');
            firework.sparkles = createSparkles(firework.x, firework.y, firework.hue);
          }

          ctx.globalAlpha = 1;
          for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = firework.color;
            ctx.lineWidth = 4 - i;
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.8 - i * 0.2;
            ctx.beginPath();
            ctx.moveTo(firework.x, firework.y);
            ctx.lineTo(firework.x, firework.y + 12 + i * 4);
            ctx.stroke();
          }
          
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = firework.color;
          ctx.beginPath();
          ctx.arc(firework.x, firework.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          return true;
        } else {
          let hasVisibleParticles = false;
          
          for (let i = firework.particles.length - 1; i >= 0; i--) {
            const p = firework.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.vx *= 0.98;
            p.alpha -= p.decay;

            if (p.alpha > 0.01) {
              hasVisibleParticles = true;
              ctx.globalAlpha = p.alpha * 0.2;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.globalAlpha = p.alpha * 0.5;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.globalAlpha = p.alpha;
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          firework.sparkles = firework.sparkles.filter(sparkle => {
            sparkle.y += sparkle.vy;
            sparkle.alpha -= 0.015;
            if (sparkle.alpha > 0.01) {
              ctx.globalAlpha = sparkle.alpha;
              ctx.fillStyle = sparkle.color;
              ctx.shadowBlur = 5;
              ctx.shadowColor = sparkle.color;
              ctx.beginPath();
              ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
              return true;
            }
            return false;
          });

          return hasVisibleParticles || firework.sparkles.length > 0;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, createStars, createFirework, createParticles, createSparkles, drawBlessingText, onPlayStateChange]);

  if (!isPlaying) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fireworks-canvas"
    />
  );
};

export default Fireworks;
