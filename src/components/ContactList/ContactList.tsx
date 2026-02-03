import React, { useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, App, Popconfirm, Tag, Badge, Tooltip, Card, DatePicker, Radio } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, GiftOutlined, CheckCircleOutlined, FireOutlined } from '@ant-design/icons';
import { Contact, ContactFormData } from '@/types';
import { useContact } from '@/store/contactStore';
import dayjs from 'dayjs';

interface ContactListProps {
  mode?: 'select' | 'manage';
  onSelect?: (contacts: Contact[]) => void;
  selectedIds?: string[];
}

const ContactList: React.FC<ContactListProps> = ({
  mode = 'manage',
  onSelect: _onSelect,
  selectedIds = [],
}) => {
  const { contacts, addContact, updateContact, deleteContact, searchContacts } = useContact();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [form] = Form.useForm<ContactFormData>();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rowSelection, setRowSelection] = useState<React.Key[]>(selectedIds);
  const [isBlessingModalVisible, setIsBlessingModalVisible] = useState(false);
  const [blessingContact, setBlessingContact] = useState<Contact | null>(null);
  const [blessingForm] = Form.useForm();
  const [blessingMethod, setBlessingMethod] = useState<'in-person' | 'phone' | 'video' | 'message' | 'batch'>('in-person');
  const { message } = App.useApp();

  const filteredContacts = searchContacts(searchKeyword);

  const handleAdd = () => {
    setEditingContact(undefined);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    form.setFieldsValue(contact);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteContact(id);
    message.success('联系人已删除');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingContact) {
        updateContact(editingContact.id, values);
        message.success('联系人更新成功');
      } else {
        addContact(values);
        message.success('联系人添加成功');
      }
      
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  // 拜年功能
  const handleBlessing = (contact: Contact) => {
    setBlessingContact(contact);
    const method = contact.blessingRecord?.blessingMethod || 'in-person';
    setBlessingMethod(method);
    blessingForm.setFieldsValue({
      blessingMethod: method,
      gift: contact.blessingRecord?.gift || '',
      redPacket: contact.blessingRecord?.redPacket || '',
      note: contact.blessingRecord?.note || '',
      blessingTime: contact.blessingRecord?.blessingTime ? dayjs(contact.blessingRecord.blessingTime) : dayjs().hour(8).minute(0),
    });
    setIsBlessingModalVisible(true);
  };

  const handleBlessingOk = async () => {
    try {
      const values = await blessingForm.validateFields();

      if (blessingContact) {
        const blessingTime = values.blessingTime ? values.blessingTime.toDate() : new Date();

        // 创建拜年记录（不自动创建日程）
        updateContact(blessingContact.id, {
          blessingRecord: {
            isBlessed: true,
            blessingTime: blessingTime,
            blessingMethod: values.blessingMethod,
            gift: values.gift,
            redPacket: values.redPacket,
            note: values.note,
          }
        });
        
        // 如果是上门拜年，提示用户可以创建日程
        if (values.blessingMethod === 'in-person') {
          message.success('🧧 拜年记录添加成功！如需创建上门拜年日程，请前往日历视图添加。');
        } else {
          message.success('🧧 拜年记录添加成功！祝您新春快乐！');
        }
      }

      blessingForm.resetFields();
      setIsBlessingModalVisible(false);
      setBlessingContact(null);
    } catch (error) {
      console.error('Blessing form validation failed:', error);
    }
  };

  const handleBlessingCancel = () => {
    blessingForm.resetFields();
    setIsBlessingModalVisible(false);
    setBlessingContact(null);
  };

  // 批量拜年
  const handleBatchBlessing = () => {
    const selectedContacts = contacts.filter(c => rowSelection.includes(c.id));
    if (selectedContacts.length === 0) {
      message.warning('请先选择要拜年的联系人');
      return;
    }
    
    Modal.confirm({
      title: '批量拜年确认',
      content: `确定要为选中的 ${selectedContacts.length} 位联系人添加拜年记录吗？`,
      okText: '确定拜年',
      cancelText: '取消',
      onOk: () => {
        selectedContacts.forEach(contact => {
          updateContact(contact.id, {
            blessingRecord: {
              isBlessed: true,
              blessingTime: new Date(),
              blessingMethod: 'batch',
            }
          });
        });
        message.success(`🧧 已成功为 ${selectedContacts.length} 位联系人拜年！`);
        setRowSelection([]);
      }
    });
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Contact) => (
        <Space>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{name}</span>
          {record.blessingRecord?.isBlessed && (
            <Tooltip title={`已于 ${dayjs(record.blessingRecord.blessingTime).format('MM月DD日 HH:mm')} 拜年`}>
              <Badge dot color="#ff4d4f">
                <FireOutlined style={{ color: '#ff4d4f' }} />
              </Badge>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '关系',
      dataIndex: 'relationship',
      key: 'relationship',
      render: (relationship: string) => (
        <Tag color="blue">{relationship}</Tag>
      ),
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone ? (
        <a href={`tel:${phone}`}>
          <PhoneOutlined /> {phone}
        </a>
      ) : '-',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (address: string) => address || '-',
    },
    {
      title: '拜年状态',
      key: 'blessingStatus',
      width: 120,
      render: (_: any, record: Contact) => {
        if (record.blessingRecord?.isBlessed) {
          return (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              已拜年
            </Tag>
          );
        }
        return (
          <Tag color="default">
            待拜年
          </Tag>
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (note: string) => note || '-',
    },
    ...(mode === 'manage' ? [{
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: any, record: Contact) => (
        <Space size="small">
          {!record.blessingRecord?.isBlessed ? (
            <Button
              type="primary"
              size="small"
              icon={<GiftOutlined />}
              onClick={() => handleBlessing(record)}
              style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
            >
              拜年
            </Button>
          ) : (
            <Button
              type="default"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleBlessing(record)}
            >
              拜年详情
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此联系人吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  // 统计
  const blessedCount = contacts.filter(c => c.blessingRecord?.isBlessed).length;
  const pendingCount = contacts.length - blessedCount;

  return (
    <div>
      {/* 统计卡片 */}
      <div style={{ marginBottom: 24 }}>
        <Space size="large">
          <Card size="small" style={{ background: '#fff1f0', borderColor: '#ffccc7' }}>
            <Space>
              <span style={{ fontSize: 24 }}>👥</span>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>总联系人</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }}>{contacts.length}</div>
              </div>
            </Space>
          </Card>
          <Card size="small" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Space>
              <span style={{ fontSize: 24 }}>🧧</span>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>已拜年</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>{blessedCount}</div>
              </div>
            </Space>
          </Card>
          <Card size="small" style={{ background: '#fff7e6', borderColor: '#ffd591' }}>
            <Space>
              <span style={{ fontSize: 24 }}>⏳</span>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>待拜年</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fa8c16' }}>{pendingCount}</div>
              </div>
            </Space>
          </Card>
        </Space>
      </div>

      {/* 工具栏 */}
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索联系人"
          allowClear
          onSearch={handleSearch}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
          style={{ width: 250 }}
        />
        {mode === 'manage' && (
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加联系人
            </Button>
            {rowSelection.length > 0 && (
              <Button 
                type="primary" 
                icon={<GiftOutlined />}
                onClick={handleBatchBlessing}
                style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
              >
                批量拜年 ({rowSelection.length})
              </Button>
            )}
          </>
        )}
      </Space>

      <Table
        dataSource={filteredContacts}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 条记录`,
        }}
        rowSelection={mode === 'manage' ? {
          selectedRowKeys: rowSelection,
          onChange: (selectedRowKeys: React.Key[]) => {
            setRowSelection(selectedRowKeys);
          },
        } : undefined}
      />

      {/* 联系人编辑弹窗 */}
      <Modal
        title={editingContact ? '编辑联系人' : '添加联系人'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="关系"
            name="relationship"
            rules={[{ required: true, message: '请输入关系' }]}
          >
            <Input placeholder="请输入关系（如：亲戚、朋友、同事等）" />
          </Form.Item>

          <Form.Item
            label="电话"
            name="phone"
          >
            <Input placeholder="请输入电话号码" />
          </Form.Item>

          <Form.Item
            label="地址"
            name="address"
          >
            <Input placeholder="请输入地址" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="note"
          >
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 拜年记录弹窗 */}
      <Modal
        title={
          <Space>
            <span style={{ fontSize: 24 }}>🧧</span>
            <span>{blessingContact?.blessingRecord?.isBlessed ? '拜年详情' : '添加拜年记录'}</span>
          </Space>
        }
        open={isBlessingModalVisible}
        onOk={handleBlessingOk}
        onCancel={handleBlessingCancel}
        okText={blessingContact?.blessingRecord?.isBlessed ? '更新' : '保存拜年记录'}
        cancelText="取消"
        width={500}
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#fff1f0', borderRadius: 8 }}>
          <Space>
            <span style={{ fontSize: 20 }}>👤</span>
            <span style={{ fontWeight: 'bold' }}>{blessingContact?.name}</span>
            <Tag color="blue">{blessingContact?.relationship}</Tag>
          </Space>
        </div>

        <Form form={blessingForm} layout="vertical">
          <Form.Item
            label="拜年方式"
            name="blessingMethod"
            rules={[{ required: true, message: '请选择拜年方式' }]}
          >
            <Radio.Group
              value={blessingMethod}
              onChange={(e) => {
                setBlessingMethod(e.target.value);
                blessingForm.setFieldsValue({ blessingMethod: e.target.value });
              }}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="in-person">
                  <Space>
                    <span>🏠 上门拜年</span>
                    {blessingMethod === 'in-person' && <Tag color="red">会自动创建日程</Tag>}
                  </Space>
                </Radio>
                <Radio value="phone">📞 电话拜年</Radio>
                <Radio value="video">📹 视频拜年</Radio>
                <Radio value="message">💬 信息拜年</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {blessingMethod === 'in-person' && (
            <Form.Item
              label="拜年时间"
              name="blessingTime"
              rules={[{ required: true, message: '请选择拜年时间' }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
                placeholder="选择上门拜年时间"
              />
            </Form.Item>
          )}

          <Form.Item
            label="礼物"
            name="gift"
          >
            <Input placeholder="如：水果礼盒、茶叶、保健品等" />
          </Form.Item>

          <Form.Item
            label="红包金额（元）"
            name="redPacket"
          >
            <Input placeholder="如：200、500等" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="note"
          >
            <Input.TextArea rows={3} placeholder="其他需要记录的信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactList;
