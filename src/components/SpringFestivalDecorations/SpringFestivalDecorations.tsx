import React, { useState, useEffect } from 'react';
import Snowflake from './Snowflake';
import './SpringFestivalDecorations.css';

// 正式灯笼组件 - 简洁优雅版
const Lantern: React.FC<{ side: 'left' | 'right'; position: number; delay: number }> = ({ side, position, delay }) => {
  return (
    <div className={`elegant-lantern swaying-lantern ${side}`} style={{ top: position, animationDelay: `${delay}s` }}>
      <div className="lantern-chain"></div>
      <div className="lantern-main">
        <div className="lantern-cap"></div>
        <div className="lantern-glass">
          <span className="lantern-character">福</span>
        </div>
        <div className="lantern-base"></div>
        <div className="lantern-fringes">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
};

// 祥云装饰 - 更淡雅
const Cloud: React.FC<{ delay: number; top: number; direction: 'left' | 'right' }> = ({ delay, top, direction }) => {
  return (
    <div
      className={`floating-cloud ${direction}`}
      style={{
        animationDelay: `${delay}s`,
        top: `${top}px`,
      }}
    >
      <svg viewBox="0 0 100 40" className="cloud-svg">
        <path d="M10,30 Q20,10 35,25 T60,20 T85,25 T95,30" fill="none" stroke="rgba(255,77,79,0.15)" strokeWidth="2"/>
      </svg>
    </div>
  );
};

// 梅花装饰
const PlumBlossom: React.FC<{ delay: number; left: string; top: string }> = ({ delay, left, top }) => {
  return (
    <div
      className="plum-blossom"
      style={{
        animationDelay: `${delay}s`,
        left,
        top,
      }}
    >
      <svg viewBox="0 0 30 30" className="blossom-svg">
        <circle cx="15" cy="15" r="3" fill="#ff4d4f"/>
        <circle cx="15" cy="8" r="2.5" fill="#ff7875"/>
        <circle cx="22" cy="15" r="2.5" fill="#ff7875"/>
        <circle cx="15" cy="22" r="2.5" fill="#ff7875"/>
        <circle cx="8" cy="15" r="2.5" fill="#ff7875"/>
        <circle cx="20" cy="10" r="2" fill="#ff9c9c"/>
        <circle cx="20" cy="20" r="2" fill="#ff9c9c"/>
        <circle cx="10" cy="20" r="2" fill="#ff9c9c"/>
        <circle cx="10" cy="10" r="2" fill="#ff9c9c"/>
      </svg>
    </div>
  );
};

// 主装饰组件
const SpringFestivalDecorations: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: string }>>([]);

  // 初始化雪花
  useEffect(() => {
    const initialSnowflakes = Array.from({ length: 60 }, (_, i) => ({
      id: `snow-${i}-${Date.now()}`,
    }));
    setSnowflakes(initialSnowflakes);
  }, []);

  const handleSnowflakeClick = (id: string) => {
    setSnowflakes(prev => prev.filter(s => s.id !== id));

    // 如果雪花太少，添加新的
    setTimeout(() => {
      setSnowflakes(prev => {
        if (prev.length < 30) {
          return [...prev, { id: `snow-new-${Date.now()}` }];
        }
        return prev;
      });
    }, 1000);
  };

  return (
    <div className="spring-festival-decorations">
      {/* 顶部装饰条 - 简洁金红条纹 */}
      <div className="header-accent-bar">
        <div className="accent-line"></div>
      </div>

      {/* 雪花飘落 */}
      {snowflakes.map(snow => (
        <Snowflake key={snow.id} id={snow.id} onClick={handleSnowflakeClick} />
      ))}

      {/* 两侧灯笼 - 对称优雅，带摆动效果 */}
      <Lantern side="left" position={20} delay={0} />
      <Lantern side="left" position={140} delay={0.5} />
      <Lantern side="right" position={20} delay={0.2} />
      <Lantern side="right" position={140} delay={0.7} />

      {/* 祥云 - 淡雅 */}
      <Cloud delay={0} top={80} direction="left" />
      <Cloud delay={8} top={120} direction="right" />
      <Cloud delay={16} top={100} direction="left" />

      {/* 角落梅花 */}
      <PlumBlossom delay={0} left="3%" top="20%" />
      <PlumBlossom delay={2} left="5%" top="60%" />
      <PlumBlossom delay={1} left="92%" top="25%" />
      <PlumBlossom delay={3} left="94%" top="65%" />
    </div>
  );
};

export default SpringFestivalDecorations;
