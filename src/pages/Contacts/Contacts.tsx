import React from 'react';
import { Layout, Typography, Card, Space } from 'antd';
import { ContactsOutlined } from '@ant-design/icons';
import ContactList from '@/components/ContactList';
import { useContact } from '@/store/contactStore';
import './Contacts.css';

const { Content } = Layout;
const { Title } = Typography;

const Contacts: React.FC = () => {
  const { contacts } = useContact();

  return (
    <Layout className="contacts-page">
      <Content className="contacts-content">
        <Card className="contacts-header">
          <Space>
            <ContactsOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
            <Title level={4} style={{ margin: 0 }}>
              联系人管理
            </Title>
          </Space>
          <span style={{ color: '#8c8c8c' }}>共 {contacts.length} 位联系人</span>
        </Card>
        
        <Card className="contacts-list-card">
          <ContactList mode="manage" />
        </Card>
      </Content>
    </Layout>
  );
};

export default Contacts;