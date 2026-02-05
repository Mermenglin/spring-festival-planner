import React, { useState, useEffect } from 'react';
import Snowflake from './Snowflake';
import './SpringFestivalDecorations.css';

// 传统红色灯笼组件
const Lantern: React.FC<{ side: 'left' | 'right'; position: number; delay: number }> = ({ side, position, delay }) => {
  return (
    <div className={`traditional-lantern ${side}`} style={{ top: position, animationDelay: `${delay}s` }}>
      <div className="lantern-chain"></div>
      <div className="lantern-body">
        <div className="lantern-cap top"></div>
        <div className="lantern-glow"></div>
        <div className="lantern-glass">
          <span className="lantern-character">福</span>
        </div>
        <div className="lantern-cap bottom"></div>
        <div className="lantern-fringes">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
};

// 祥云装饰
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
        <path d="M10,30 Q20,10 35,25 T60,20 T85,25 T95,30" 
              fill="none" 
              stroke="rgba(255,77,79,0.2)" 
              strokeWidth="2"/>
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
      <svg viewBox="0 0 40 40" className="blossom-svg">
        <circle cx="20" cy="20" r="4" fill="#ff4d4f"/>
        <circle cx="20" cy="10" r="3.5" fill="#ff7875"/>
        <circle cx="30" cy="20" r="3.5" fill="#ff7875"/>
        <circle cx="20" cy="30" r="3.5" fill="#ff7875"/>
        <circle cx="10" cy="20" r="3.5" fill="#ff7875"/>
        <circle cx="27" cy="13" r="2.5" fill="#ff9c9c"/>
        <circle cx="27" cy="27" r="2.5" fill="#ff9c9c"/>
        <circle cx="13" cy="27" r="2.5" fill="#ff9c9c"/>
        <circle cx="13" cy="13" r="2.5" fill="#ff9c9c"/>
      </svg>
    </div>
  );
};

// 红包雨效果
const RedPacket: React.FC<{ delay: number; left: string }> = ({ delay, left }) => {
  return (
    <div 
      className="red-packet-rain"
      style={{
        animationDelay: `${delay}s`,
        left,
      }}
    >
      <div className="red-packet">
        <div className="packet-top"></div>
        <div className="packet-body">
          <span className="packet-symbol">¥</span>
        </div>
      </div>
    </div>
  );
};

// 主装饰组件
const SpringFestivalDecorations: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: string }>>([]);
  const [showRedPackets, setShowRedPackets] = useState(true);

  // 初始化雪花
  useEffect(() => {
    const initialSnowflakes = Array.from({ length: 40 }, (_, i) => ({
      id: `snow-${i}-${Date.now()}`,
    }));
    setSnowflakes(initialSnowflakes);
    
    // 每30秒切换红包雨显示
    const interval = setInterval(() => {
      setShowRedPackets(prev => !prev);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSnowflakeClick = (id: string) => {
    setSnowflakes(prev => prev.filter(s => s.id !== id));

    setTimeout(() => {
      setSnowflakes(prev => {
        if (prev.length < 20) {
          return [...prev, { id: `snow-new-${Date.now()}` }];
        }
        return prev;
      });
    }, 1000);
  };

  return (
    <div className="spring-festival-decorations">
      {/* 顶部装饰条 */}
      <div className="header-accent-bar">
        <div className="accent-line"></div>
      </div>

      {/* 红包雨 */}
      {showRedPackets && (
        <>
          <RedPacket delay={0} left="10%" />
          <RedPacket delay={3} left="25%" />
          <RedPacket delay={6} left="40%" />
          <RedPacket delay={9} left="55%" />
          <RedPacket delay={12} left="70%" />
          <RedPacket delay={15} left="85%" />
        </>
      )}

      {/* 雪花飘落 */}
      {snowflakes.map(snow => (
        <Snowflake key={snow.id} id={snow.id} onClick={handleSnowflakeClick} />
      ))}

      {/* 两侧灯笼 - 传统红色 */}
      <Lantern side="left" position={30} delay={0} />
      <Lantern side="left" position={160} delay={0.8} />
      <Lantern side="right" position={30} delay={0.4} />
      <Lantern side="right" position={160} delay={1.2} />

      {/* 祥云 */}
      <Cloud delay={0} top={100} direction="left" />
      <Cloud delay={10} top={150} direction="right" />
      <Cloud delay={20} top={120} direction="left" />

      {/* 梅花 */}
      <PlumBlossom delay={0} left="5%" top="25%" />
      <PlumBlossom delay={2} left="8%" top="55%" />
      <PlumBlossom delay={1} left="92%" top="30%" />
      <PlumBlossom delay={3} left="95%" top="60%" />
    </div>
  );
};

export default SpringFestivalDecorations;
