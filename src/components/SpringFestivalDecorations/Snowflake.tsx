import React, { useState, useEffect } from 'react';
import './SpringFestivalDecorations.css';

interface SnowflakeProps {
  id: string;
  onClick: (id: string) => void;
}

const Snowflake: React.FC<SnowflakeProps> = ({ id, onClick }) => {
  // 初始位置随机分布在屏幕各处（包括屏幕上方和内部）
  const [position, setPosition] = useState({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight - 50, // 随机分布在屏幕上方和内部
  });
  const [isExploding, setIsExploding] = useState(false);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; vx: number; vy: number; alpha: number }>>([]);

  // 雪花大小（随机）
  const size = 2 + Math.random() * 4;
  // 下落速度（随机，更慢）
  const speed = 0.5 + Math.random() * 0.5;
  // 左右摇摆幅度
  const sway = Math.random() * 2 - 1;
  // 透明度
  const opacity = 0.3 + Math.random() * 0.3;

  useEffect(() => {
    let animationFrame: number;
    let x = position.x;
    let y = position.y;
    let swayOffset = 0;

    const animate = () => {
      if (isExploding) {
        // 爆炸动画
        setParticles(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.05, // 重力更小
          alpha: p.alpha - 0.01, // 消散更慢
        })).filter(p => p.alpha > 0));

        if (particles.length === 0) {
          return;
        }
      } else {
        // 正常飘落
        y += speed;
        swayOffset += 0.02;
        x += Math.sin(swayOffset) * sway;

        // 超出屏幕底部，重置到顶部
        if (y > window.innerHeight + 20) {
          y = -20;
          x = Math.random() * window.innerWidth;
        }

        setPosition({ x, y });
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isExploding, particles]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExploding(true);

    // 创建爆炸粒子
    const particleCount = 8 + Math.floor(Math.random() * 4);
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const particleSpeed = 2 + Math.random() * 3;
      newParticles.push({
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * particleSpeed,
        vy: Math.sin(angle) * particleSpeed,
        alpha: 1,
      });
    }
    setParticles(newParticles);

    // 通知父组件移除雪花
    setTimeout(() => {
      onClick(id);
    }, 500);
  };

  return (
    <>
      {!isExploding && (
        <div
          className="snowflake"
          onClick={handleClick}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${size}px`,
            height: `${size}px`,
            opacity,
          }}
        >
          <div className="snowflake-shape">❄</div>
        </div>
      )}
      {isExploding && particles.map((p, i) => (
        <div
          key={i}
          className="snowflake-particle"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${size * 0.5}px`,
            height: `${size * 0.5}px`,
            opacity: p.alpha,
          }}
        />
      ))}
    </>
  );
};

export default Snowflake;