import React, { useState } from 'react';
import { Layout, Menu, ConfigProvider, theme } from 'antd';
import { CalendarOutlined, ContactsOutlined, SettingOutlined, FireOutlined } from '@ant-design/icons';
import { ScheduleProvider } from '@/store/scheduleStore';
import { ContactProvider } from '@/store/contactStore';
import { AppProvider, useApp } from '@/store/appStore';
import CalendarView from '@/pages/CalendarView';
import Contacts from '@/pages/Contacts';
import Settings from '@/pages/Settings';
import SpringFestivalDecorations from '@/components/SpringFestivalDecorations/SpringFestivalDecorations';
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

const renderContent = (currentKey: MenuKey) => {
  switch (currentKey) {
    case 'calendar':
      return <CalendarView />;
    case 'contacts':
      return <Contacts />;
    case 'settings':
      return <Settings />;
    default:
      return <CalendarView />;
  }
};

const AppContent: React.FC = () => {
  const [currentKey, setCurrentKey] = useState<MenuKey>('calendar');
  const { darkAlgorithm, defaultAlgorithm } = theme;
  const { theme: currentTheme } = useApp();

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#ff4d4f',
        },
      }}
    >
      {/* 全局春节装饰 */}
      <SpringFestivalDecorations />
      
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
          {renderContent(currentKey)}
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
          <AppContent />
        </AppProvider>
      </ContactProvider>
    </ScheduleProvider>
  );
};

export default App;