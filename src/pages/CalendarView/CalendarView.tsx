import React, { useState, useMemo } from 'react';
import { Layout, Button, Space, Typography, Card, Tag, Empty, Popconfirm, message, Timeline, Badge, Row, Col, Statistic, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, FireOutlined, GiftOutlined, HomeOutlined, CoffeeOutlined, CheckCircleOutlined, CalendarOutlined, CloseOutlined } from '@ant-design/icons';
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

interface CalendarViewProps {
  onFireworkClick: () => void;
  isPlaying: boolean;
  onStopFireworks: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onFireworkClick, isPlaying, onStopFireworks }) => {
  const { schedules, deleteSchedule } = useSchedule();
  const { contacts } = useContact();
  const { littleNewYearMode } = useApp();
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('timeline');
  const [defaultScheduleType, setDefaultScheduleType] = useState<ScheduleType | undefined>();

  // 根据小年设置计算开始日期
  const SPRING_FESTIVAL_START = useMemo(() => {
    return littleNewYearMode === 'north' ? dayjs('2026-02-01') : dayjs('2026-02-02');
  }, [littleNewYearMode]);

  const SPRING_FESTIVAL_END = dayjs('2026-03-03');

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

  // 生成优化的春节日期列表
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

    const filteredDays: SpringFestivalDay[] = [];
    
    days.forEach((day) => {
      const hasSchedule = getSchedulesByDate(day.date).length > 0;
      const isImportantFestival = day.festival && ['小年', '除夕', '春节', '元宵节'].includes(day.festival);
      
      if (hasSchedule || isImportantFestival) {
        filteredDays.push(day);
      }
    });

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

  const handleStatCardDoubleClick = (type: ScheduleType) => {
    if (type === 'visit') {
      const springFestivalDate = dayjs('2026-02-17');
      const randomDay = Math.floor(Math.random() * 7);
      const selectedDate = springFestivalDate.add(randomDay, 'day');
      setStartDate(selectedDate.toDate());
      setEndDate(selectedDate.add(1, 'hour').toDate());
    }
    handleAddSchedule(type);
  };

  const handleFirework = () => {
    onFireworkClick();
    message.success('🎆 烟花绽放！新春快乐！');
  };

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
            {isPlaying ? (
              <Button
                size="large"
                className="stop-firework-btn-fixed"
                icon={<CloseOutlined />}
                onClick={onStopFireworks}
                danger
              >
                停止烟花
              </Button>
            ) : (
              <Button
                size="large"
                className="firework-btn-fixed"
                icon={<FireOutlined />}
                onClick={handleFirework}
              >
                🎆 放烟花
              </Button>
            )}
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
