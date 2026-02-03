import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Layout, Button, Space, Typography, Card, Tag, Empty, Popconfirm, message, Timeline, Badge, Row, Col, Statistic, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, FireOutlined, GiftOutlined, HomeOutlined, CoffeeOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Schedule, ScheduleType } from '@/types';
import { useSchedule } from '@/store/scheduleStore';
import { useContact } from '@/store/contactStore';
import { useApp } from '@/store/appStore';
import ScheduleForm from '@/components/ScheduleForm';
import { scheduleTypeLabels, scheduleTypeColors } from '@/types';
import { createPortal } from 'react-dom';
import { formatLunar, solarToLunar, isFestival } from '@/utils/lunar';
import './CalendarView.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 春节日期范围（动态计算）
// 重要节日列表（这些日期不会被压缩）
const IMPORTANT_FESTIVALS = ['小年', '除夕', '春节', '元宵节'];

interface SpringFestivalDay {
  date: Date;
  dayjs: dayjs.Dayjs;
  lunarDay: string;
  lunarMonth: string;
  festival: string | null;
  isSpringFestival: boolean;
  isNewYearEve: boolean;
  isLittleNewYear: boolean;
  isImportant: boolean;
}

// Canvas烟花动画组件 - 五颜六色、散开后渐隐不落下
const CanvasFirework: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const fireworkCountRef = useRef(0);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const isCompletedRef = useRef(false);

  interface Projectile {
    x: number;
    y: number;
    targetY: number;
    vx: number;
    vy: number;
    color: string;
    trail: { x: number; y: number; alpha: number }[];
  }

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    alpha: number;
    decay: number;
    isFlash: boolean;
  }

  // 五颜六色 - 彩虹色系
  const rainbowColors = [
    '#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00', // 红-橙
    '#ffff00', '#ccff00', '#99ff00', '#66ff00', '#33ff00', '#00ff00', // 黄-绿
    '#00ff33', '#00ff66', '#00ff99', '#00ffcc', '#00ffff', // 绿-青
    '#00ccff', '#0099ff', '#0066ff', '#0033ff', '#0000ff', // 青-蓝
    '#3300ff', '#6600ff', '#9900ff', '#cc00ff', '#ff00ff', // 蓝-紫
    '#ff00cc', '#ff0099', '#ff0066', '#ff0033', '#ffffff', // 紫-白
  ];

  // 创建爆炸粒子 - 随机颜色、大小、速度
  const createExplosion = (x: number, y: number) => {
    const particleCount = 80 + Math.floor(Math.random() * 40);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2; // 完全随机角度
      const speed = 1 + Math.random() * 4; // 随机速度
      const size = 1 + Math.random() * 4; // 随机大小
      const decay = 0.01 + Math.random() * 0.02; // 随机衰减速度
      const color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size,
        alpha: 1,
        decay,
        isFlash: false,
      });
    }

    // 添加白色闪光粒子
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: '#ffffff',
        size: 2 + Math.random() * 2,
        alpha: 1,
        decay: 0.05,
        isFlash: true,
      });
    }
  };

  // 发射火箭
  const launchProjectile = () => {
    if (isCompletedRef.current) return;
    
    if (fireworkCountRef.current >= 88) {
      // 检查是否所有粒子都消失了
      if (particlesRef.current.length === 0 && projectilesRef.current.length === 0) {
        isCompletedRef.current = true;
        onComplete();
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
    const startY = canvas.height;
    const targetY = canvas.height * 0.15 + Math.random() * canvas.height * 0.3;
    const color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];

    projectilesRef.current.push({
      x: startX,
      y: startY,
      targetY,
      vx: 0,
      vy: -15 - Math.random() * 8,
      color,
      trail: [],
    });

    fireworkCountRef.current++;

    const delay = 60 + Math.random() * 120;
    setTimeout(launchProjectile, delay);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 绘制半透明灰色遮罩 - 可以看到后面内容
    ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制火箭
    projectilesRef.current = projectilesRef.current.filter(p => p.y > p.targetY);
    
    projectilesRef.current.forEach(p => {
      // 添加尾迹
      p.trail.push({ x: p.x, y: p.y, alpha: 1 });
      if (p.trail.length > 20) p.trail.shift();
      
      // 更新尾迹透明度
      p.trail.forEach((t, i) => {
        t.alpha = (i + 1) / p.trail.length * 0.5;
      });

      // 移动火箭
      p.y += p.vy;
      p.vy += 0.1;

      // 绘制尾迹
      p.trail.forEach((t, i) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.5 + i * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = t.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 绘制火箭头
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // 火箭头发光
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // 更新和绘制爆炸粒子 - 只散开不落下
    particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

    particlesRef.current.forEach(p => {
      // 粒子散开
      p.x += p.vx;
      p.y += p.vy;
      // 不加重力，粒子只是散开后渐隐，不落下
      
      // 速度逐渐减慢
      p.vx *= 0.98;
      p.vy *= 0.98;
      
      p.alpha -= p.decay;

      // 绘制粒子
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      // 粒子发光效果
      if (p.alpha > 0.6 && !p.isFlash) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.2;
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;

    // 检查是否结束
    if (fireworkCountRef.current >= 88) {
      if (particlesRef.current.length === 0 && projectilesRef.current.length === 0 && !isCompletedRef.current) {
        isCompletedRef.current = true;
        onComplete();
        return;
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 开始动画
    animate();
    launchProjectile();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 检测火箭到达目标并爆炸
  useEffect(() => {
    if (isCompletedRef.current) return;
    
    const checkExplosion = setInterval(() => {
      if (isCompletedRef.current) return;
      
      projectilesRef.current = projectilesRef.current.filter(p => {
        if (p.y <= p.targetY) {
          createExplosion(p.x, p.y);
          return false;
        }
        return true;
      });
    }, 16);

    return () => clearInterval(checkExplosion);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

const CalendarView: React.FC = () => {
  const { schedules, deleteSchedule } = useSchedule();
  const { contacts } = useContact();
  const { littleNewYearMode } = useApp();
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('timeline');
  const [defaultScheduleType, setDefaultScheduleType] = useState<ScheduleType | undefined>();
  const [showFirework, setShowFirework] = useState(false);

  // 根据小年设置计算开始日期
  const SPRING_FESTIVAL_START = useMemo(() => {
    // 2026年农历日期：
    // 北方小年：腊月二十三 = 2月1日
    // 南方小年：腊月二十四 = 2月2日
    return littleNewYearMode === 'north' ? dayjs('2026-02-01') : dayjs('2026-02-02');
  }, [littleNewYearMode]);

  const SPRING_FESTIVAL_END = dayjs('2026-03-03'); // 正月十五（元宵节，2026年3月3日）- 包含当天

  // 获取统计评价
  const getStatEvaluation = (count: number) => {
    if (count === 0) return '暂无安排，快去规划吧！';
    if (count <= 3) return '不错的开始！';
    if (count <= 6) return '充实满满！';
    return '春节达人！';
  };

  // 动态计算副标题
  const springSubtitle = useMemo(() => {
    const startDay = littleNewYearMode === 'north' ? '二十三' : '二十四';
    return `腊月${startDay} · 小年 至 正月十五 · 元宵节`;
  }, [littleNewYearMode]);

  // 获取某天的日程
  const getSchedulesByDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = dayjs(schedule.startDate);
      return scheduleDate.isSame(date, 'day');
    }).sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());
  };

  // 生成优化的春节日期列表（压缩无日程的日期）
  const springFestivalDays = useMemo(() => {
    const days: SpringFestivalDay[] = [];
    let current = SPRING_FESTIVAL_START.clone();

    while (current.isBefore(SPRING_FESTIVAL_END) || current.isSame(SPRING_FESTIVAL_END, 'day')) {
      const date = current.toDate();
      const lunar = solarToLunar(date);
      const festival = isFestival(date, littleNewYearMode);
      const isImportant = festival ? IMPORTANT_FESTIVALS.includes(festival) : false;

      days.push({
        date: date,
        dayjs: current.clone(),
        lunarDay: lunar.dayName,
        lunarMonth: lunar.monthName,
        festival: festival,
        isSpringFestival: lunar.month === 1 && lunar.day === 1,
        isNewYearEve: lunar.month === 12 && lunar.day === 30,
        isLittleNewYear: festival === '小年',
        isImportant,
      });

      current = current.add(1, 'day');
    }

    // 只显示有日程的日期和重要节日（小年、除夕、春节、元宵节）
    const filteredDays: SpringFestivalDay[] = [];
    
    days.forEach((day) => {
      const hasSchedule = getSchedulesByDate(day.date).length > 0;
      const isImportantFestival = day.festival && ['小年', '除夕', '春节', '元宵节'].includes(day.festival);
      
      // 只保留有日程的日期和重要节日
      if (hasSchedule || isImportantFestival) {
        filteredDays.push(day);
      }
    });

    // 按日期排序
    filteredDays.sort((a, b) => a.dayjs.valueOf() - b.dayjs.valueOf());

    return filteredDays;
  }, [schedules, SPRING_FESTIVAL_START, SPRING_FESTIVAL_END, littleNewYearMode]);

  const handleAddSchedule = (type?: ScheduleType) => {
    setEditingSchedule(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setDefaultScheduleType(type);
    setIsFormVisible(true);
  };

  const handleDateSelect = (date: Date) => {
    setStartDate(date);
    setEndDate(dayjs(date).add(1, 'hour').toDate());
    setEditingSchedule(undefined);
    setIsFormVisible(true);
  };

  const handleEventClick = (event: Schedule) => {
    setEditingSchedule(event);
    setStartDate(undefined);
    setEndDate(undefined);
    setIsFormVisible(true);
  };

const handleDeleteSchedule = (id: string) => {
      deleteSchedule(id);
      message.success('日程已删除');
    };

  const handleFormSave = () => {
    setIsFormVisible(false);
    setEditingSchedule(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setDefaultScheduleType(undefined);
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingSchedule(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setDefaultScheduleType(undefined);
  };

  const getContactNames = (contactIds?: string[]) => {
    if (!contactIds || contactIds.length === 0) return [];
    return contactIds
      .map(id => contacts.find((c: { id: string }) => c.id === id)?.name)
      .filter((name): name is string => name !== undefined);
  };

  // 统计
  const visitCount = schedules.filter(s => s.type === 'visit').length;
  const dinnerCount = schedules.filter(s => s.type === 'dinner').length;
  const familyCount = schedules.filter(s => s.type === 'family').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visit': return <GiftOutlined />;
      case 'dinner': return <CoffeeOutlined />;
      case 'family': return <HomeOutlined />;
      default: return <CheckCircleOutlined />;
    }
  };

  // 统计卡片双击处理
  const handleStatCardDoubleClick = (type: ScheduleType) => {
    if (type === 'visit') {
      // 拜年默认选择初一到初七
      const springFestivalDate = dayjs('2026-02-17'); // 2026年正月初一
      const randomDay = Math.floor(Math.random() * 7); // 0-6，初一到初七
      const selectedDate = springFestivalDate.add(randomDay, 'day');
      setStartDate(selectedDate.toDate());
      setEndDate(selectedDate.add(1, 'hour').toDate());
    }
    handleAddSchedule(type);
  };

  // 烟花按钮点击
  const handleFirework = () => {
    setShowFirework(true);
    message.success('🎆 烟花绽放！新春快乐！');
  };

  // 渲染时间线视图
  const renderTimelineView = () => (
    <div className="spring-timeline-container wide">
      <Timeline mode="alternate">
        {springFestivalDays.map((day, index) => {
          const daySchedules = getSchedulesByDate(day.date);
          const isToday = dayjs().isSame(day.date, 'day');
          
          return (
            <Timeline.Item
              key={index}
              dot={
                day.isSpringFestival ? (
                  <div className="festival-dot spring-festival" data-festival="春节">春</div>
                ) : day.isLittleNewYear ? (
                  <div className="festival-dot little-new-year" data-festival="小年">小年</div>
                ) : day.isNewYearEve ? (
                  <div className="festival-dot" data-festival="除夕">除夕</div>
                ) : day.festival ? (
                  <div className="festival-dot" data-festival={day.festival}>{day.festival.substring(0, 2)}</div>
                ) : (
                  <div className={`date-dot ${isToday ? 'today' : ''}`}>
                    {day.dayjs.format('DD')}
                  </div>
                )
              }
              label={
                <div className={`timeline-label ${day.isSpringFestival ? 'highlight' : ''}`}>
                  <div className="solar-date">{day.dayjs.format('MM月DD日')}</div>
                  <div className="lunar-date">{day.lunarMonth}{day.lunarDay}</div>
                  {day.festival && (
                    <Tag color="red" className="festival-tag">{day.festival}</Tag>
                  )}
                </div>
              }
            >
              <Card 
                className={`day-card ${isToday ? 'today-card' : ''} ${day.isSpringFestival ? 'spring-festival-card' : ''}`}
                size="small"
                onClick={() => handleDateSelect(day.date)}
                hoverable
              >
                {daySchedules.length === 0 ? (
                  <div className="empty-day">
                    <Text type="secondary">点击添加日程</Text>
                  </div>
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {daySchedules.map((schedule, sIndex) => (
                      <div 
                        key={sIndex} 
                        className="mini-schedule"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(schedule);
                        }}
                      >
                        <Badge 
                          color={scheduleTypeColors[schedule.type]}
                          text={
                            <Space>
                              {getTypeIcon(schedule.type)}
                              <Text strong>{schedule.title}</Text>
                              <Text type="secondary">
                                {dayjs(schedule.startDate).format('HH:mm')}
                              </Text>
                            </Space>
                          }
                        />
                        <Space size="small" className="schedule-actions">
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(schedule);
                            }}
                          />
                          <Popconfirm
                            title="确定删除此日程吗？"
                            onConfirm={(e) => {
                              e?.stopPropagation();
                              handleDeleteSchedule(schedule.id);
                            }}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button 
                              type="text" 
                              size="small" 
                              danger 
                              icon={<DeleteOutlined />}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Popconfirm>
                        </Space>
                      </div>
                    ))}
                  </Space>
                )}
              </Card>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );

  // 渲染列表视图
  const renderListView = () => (
    <div className="list-view-container">
      {schedules.length === 0 ? (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="empty-spring">
              <div className="spring-decoration">🧧 🏮 🧨</div>
              <Text>春节期间还没有安排行程</Text>
              <Text type="secondary">点击下方按钮开始规划您的春节日程吧！</Text>
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />} 
                onClick={() => handleAddSchedule()}
                style={{ marginTop: 16 }}
              >
                添加第一个日程
              </Button>
            </div>
          }
        />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {[...schedules]
            .sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf())
            .map((schedule) => (
            <Card
              key={schedule.id}
              size="small"
              className="schedule-detail-card"
              style={{ 
                borderLeft: `4px solid ${scheduleTypeColors[schedule.type]}`,
                marginBottom: 8 
              }}
            >
              <Row justify="space-between" align="middle">
                <Col flex="auto">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Tag color={scheduleTypeColors[schedule.type]}>
                        {getTypeIcon(schedule.type)} {scheduleTypeLabels[schedule.type]}
                      </Tag>
                      <Text strong style={{ fontSize: 16 }}>{schedule.title}</Text>
                    </Space>
                    <Space split={<Text type="secondary">|</Text>}>
                      <Text type="secondary">
                        <ClockCircleOutlined /> {dayjs(schedule.startDate).format('MM月DD日 HH:mm')} - {dayjs(schedule.endDate).format('HH:mm')}
                      </Text>
                      <Text type="secondary">
                        {formatLunar(schedule.startDate)}
                      </Text>
                      {schedule.location && (
                        <Text type="secondary">📍 {schedule.location}</Text>
                      )}
                    </Space>
                    {schedule.contacts && schedule.contacts.length > 0 && (
                      <div>
                        <Text type="secondary">联系人：</Text>
                        {getContactNames(schedule.contacts).map((name, i) => (
                          <Tag key={i} color="blue">{name}</Tag>
                        ))}
                      </div>
                    )}
                    {schedule.note && (
                      <Text type="secondary">💬 {schedule.note}</Text>
                    )}
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button
                      type="primary"
                      ghost
                      icon={<EditOutlined />}
                      onClick={() => handleEventClick(schedule)}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="确定删除此日程吗？"
                      onConfirm={() => handleDeleteSchedule(schedule.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      )}
    </div>
  );

  return (
    <Layout className="calendar-view spring-festival-theme">
      {/* 动画效果层 - Canvas烟花 */}
      {showFirework && (
        <CanvasFirework onComplete={() => setShowFirework(false)} />
      )}

      {/* 春节头部 */}
      <div className="spring-festival-header">
        <div className="header-content">
          <div className="header-icon-row">
            <span className="decoration-icon">🧧</span>
            <FireOutlined className="fire-icon" />
            <span className="decoration-icon">🏮</span>
          </div>
          <Title level={2} className="spring-title">
            🎉 2026春节欢乐时光
          </Title>
          <Text className="spring-subtitle">
            {springSubtitle}
          </Text>
          
          {/* 统计卡片 - 支持双击快速创建 */}
          <div className="spring-stats">
            <Row gutter={16} justify="center">
              <Col>
                <Card 
                  className="stat-card visit-card" 
                  size="small"
                  onDoubleClick={() => handleStatCardDoubleClick('visit')}
                  hoverable
                >
                  <Statistic 
                    title={<span className="stat-title">🎁 拜年行程</span>}
                    value={visitCount} 
                    valueStyle={{ color: '#ff4d4f', fontSize: '28px' }}
                    suffix={<span className="stat-evaluation">{getStatEvaluation(visitCount)}</span>}
                  />
                </Card>
              </Col>
              <Col>
                <Card 
                  className="stat-card dinner-card" 
                  size="small"
                  onDoubleClick={() => handleStatCardDoubleClick('dinner')}
                  hoverable
                >
                  <Statistic 
                    title={<span className="stat-title">🍽️ 聚餐安排</span>}
                    value={dinnerCount} 
                    valueStyle={{ color: '#fa8c16', fontSize: '28px' }}
                    suffix={<span className="stat-evaluation">{getStatEvaluation(dinnerCount)}</span>}
                  />
                </Card>
              </Col>
              <Col>
                <Card 
                  className="stat-card family-card" 
                  size="small"
                  onDoubleClick={() => handleStatCardDoubleClick('family')}
                  hoverable
                >
                  <Statistic 
                    title={<span className="stat-title">🏠 家庭活动</span>}
                    value={familyCount} 
                    valueStyle={{ color: '#52c41a', fontSize: '28px' }}
                    suffix={<span className="stat-evaluation">{getStatEvaluation(familyCount)}</span>}
                  />
                </Card>
              </Col>
              <Col>
                <Card className="stat-card total-card" size="small">
                  <Statistic 
                    title={<span className="stat-title">📅 总日程</span>}
                    value={schedules.length} 
                    valueStyle={{ color: '#1890ff', fontSize: '28px' }}
                    suffix={<span className="stat-evaluation">{getStatEvaluation(schedules.length)}</span>}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      <Content className="spring-content wide">
        {/* 标签页切换 */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="spring-tabs"
          centered
        >
          <TabPane 
            tab={<span><CalendarOutlined /> 时间线视图</span>} 
            key="timeline"
          >
            {renderTimelineView()}
          </TabPane>
          <TabPane 
            tab={<span><ClockCircleOutlined /> 列表视图</span>} 
            key="list"
          >
            <Card className="all-schedules-card" title="📋 全部日程一览">
              {renderListView()}
            </Card>
          </TabPane>
        </Tabs>
      </Content>

      {/* 使用 Portal 渲染固定按钮到 body，确保始终固定 */}
      {createPortal(
        <div className="fixed-action-buttons">
          <Space size="middle" direction="vertical">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => handleAddSchedule()}
              className="add-schedule-btn-fixed"
            >
              🎊 添加日程
            </Button>
            <Button
              size="large"
              className="firework-btn-fixed"
              icon={<FireOutlined />}
              onClick={handleFirework}
              disabled={showFirework}
            >
              🎆 放烟花
            </Button>
          </Space>
        </div>,
        document.body
      )}

      <ScheduleForm
        visible={isFormVisible}
        onCancel={handleFormCancel}
        onSave={handleFormSave}
        initialData={editingSchedule}
        startDate={startDate}
        endDate={endDate}
        defaultType={defaultScheduleType}
      />
    </Layout>
  );
};

export default CalendarView;
