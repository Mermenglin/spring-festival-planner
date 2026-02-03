import React from 'react';
import { Layout, Typography, Card, Switch, Space, Button, message, Divider, Statistic, Row, Col } from 'antd';
import { SettingOutlined, SunOutlined, MoonOutlined, DownloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useApp } from '@/store/appStore';
import { useSchedule } from '@/store/scheduleStore';
import { useContact } from '@/store/contactStore';
import { storage } from '@/utils/storage';
import './Settings.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const Settings: React.FC = () => {
  const { theme, toggleTheme, littleNewYearMode, setLittleNewYearMode } = useApp();
  const { schedules } = useSchedule();
  const { contacts } = useContact();

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spring-festival-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('数据导出成功');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (storage.importData(content)) {
            message.success('数据导入成功，请刷新页面');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            message.error('数据导入失败');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      storage.clear();
      message.success('数据已清除，请刷新页面');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <Layout className="settings-page">
      <Content className="settings-content">
        <Card className="settings-header">
          <Space>
            <SettingOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
            <Title level={4} style={{ margin: 0 }}>
              设置
            </Title>
          </Space>
        </Card>

        <Card title="主题设置" className="settings-card">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="setting-item">
              <Space>
                {theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
                <Text>外观主题</Text>
              </Space>
              <Switch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                checkedChildren="暗"
                unCheckedChildren="亮"
              />
            </div>
            <Divider />
            <div className="setting-item">
              <Space>
                <Text>小年日期</Text>
              </Space>
              <Space>
                <Button 
                  type={littleNewYearMode === 'north' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setLittleNewYearMode('north')}
                >
                  北方 · 腊月廿三
                </Button>
                <Button 
                  type={littleNewYearMode === 'south' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setLittleNewYearMode('south')}
                >
                  南方 · 腊月廿四
                </Button>
              </Space>
            </div>
          </Space>
        </Card>

        <Card title="数据统计" className="settings-card">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="日程数量" value={schedules.length} valueStyle={{ color: '#ff4d4f' }} />
            </Col>
            <Col span={12}>
              <Statistic title="联系人数量" value={contacts.length} valueStyle={{ color: '#1890ff' }} />
            </Col>
          </Row>
        </Card>

        <Card title="数据管理" className="settings-card">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              block
            >
              导出数据备份
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={handleImport}
              block
            >
              导入数据备份
            </Button>
            <Divider />
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleClearData}
              block
            >
              清除所有数据
            </Button>
          </Space>
        </Card>

        <Card title="关于" className="settings-card">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>春节日程规划助手 v1.0.0</Text>
            <Text type="secondary">
              帮助您更好地规划春节假期时间，避免冲突，提高节日效率。
            </Text>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default Settings;