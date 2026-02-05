import React, { useState } from 'react';
import { Layout, Menu, ConfigProvider, theme, App as AntApp } from 'antd';
import { CalendarOutlined, ContactsOutlined, SettingOutlined, FireOutlined } from '@ant-design/icons';
import { ScheduleProvider } from '@/store/scheduleStore';
import { ContactProvider } from '@/store/contactStore';
import { AppProvider, useApp } from '@/store/appStore';
import CalendarView from '@/pages/CalendarView';
import Contacts from '@/pages/Contacts';
import Settings from '@/pages/Settings';
import SpringFestivalDecorations from '@/components/SpringFestivalDecorations/SpringFestivalDecorations';
import Fireworks from '@/components/Fireworks';
import TechEffects from '@/components/TechEffects';
import './App.css';

const { Header, Content } = Layout;

type MenuKey = 'calendar' | 'contacts' | 'settings';

const menuItems = [
  {
    key: 'calendar',
    icon: <CalendarOutlined />,
    label: '日历视图',
  },
  {
    key: 'contacts',
    icon: <ContactsOutlined />,
    label: '联系人',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '设置',
  },
];

const renderContent = (currentKey: MenuKey, onFireworkClick: () => void, isPlaying: boolean, onStopFireworks: () => void) => {
  switch (currentKey) {
    case 'calendar':
      return <CalendarView onFireworkClick={onFireworkClick} isPlaying={isPlaying} onStopFireworks={onStopFireworks} />;
    case 'contacts':
      return <Contacts />;
    case 'settings':
      return <Settings />;
    default:
      return <CalendarView onFireworkClick={onFireworkClick} isPlaying={isPlaying} onStopFireworks={onStopFireworks} />;
  }
};

const AppContent: React.FC = () => {
  const [currentKey, setCurrentKey] = useState<MenuKey>('calendar');
  const [isFireworksPlaying, setIsFireworksPlaying] = useState(false);
  const { darkAlgorithm, defaultAlgorithm } = theme;
  const { theme: currentTheme } = useApp();

  const handleFireworkClick = () => {
    setIsFireworksPlaying(true);
  };

  const handleStopFireworks = () => {
    setIsFireworksPlaying(false);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#ff4d4f',
        },
      }}
    >
      {/* 全局春节装饰 - 播放烟花时隐藏以节省算力 */}
      {!isFireworksPlaying && <SpringFestivalDecorations />}
      
      {/* 烟花效果背景 */}
      {isFireworksPlaying && <Fireworks isPlaying={isFireworksPlaying} onPlayStateChange={setIsFireworksPlaying} />}
      
      {/* 科技感动画效果 */}
      <TechEffects />
      
      <Layout className="app-layout">
        <Header className="app-header">
          <div className="app-logo">
            <FireOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
            <span className="app-title">春节日程规划助手</span>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[currentKey]}
            items={menuItems}
            onClick={({ key }: { key: string }) => setCurrentKey(key as MenuKey)}
            className="app-menu"
          />
        </Header>
        <Content className="app-content">
          {renderContent(currentKey, handleFireworkClick, isFireworksPlaying, handleStopFireworks)}
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ScheduleProvider>
      <ContactProvider>
        <AppProvider>
          <AntApp>
            <AppContent />
          </AntApp>
        </AppProvider>
      </ContactProvider>
    </ScheduleProvider>
  );
};

export default App;
