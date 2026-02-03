import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Space, message, Tag } from 'antd';
import dayjs from 'dayjs';
import { ScheduleFormData, Schedule, scheduleTypeLabels, ScheduleType } from '@/types';
import { useSchedule } from '@/store/scheduleStore';
import { useContact } from '@/store/contactStore';
import { formatLunar, solarToLunar } from '@/utils/lunar';

// 自定义日期单元格，显示农历
const lunarDateCellRender = (value: dayjs.Dayjs | number, info: any) => {
  const date = dayjs.isDayjs(value) ? value : dayjs(value);
  const lunar = solarToLunar(date.toDate());
  // 对于showTime的DatePicker，只在日期模式下显示农历
  if (info?.type === 'date') {
    return (
      <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
        {lunar.dayName}
      </div>
    );
  }
  return null;
};

interface ScheduleFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
  initialData?: Schedule;
  startDate?: Date;
  endDate?: Date;
  defaultType?: ScheduleType;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  visible,
  onCancel,
  onSave,
  initialData,
  startDate,
  endDate,
  defaultType,
}) => {
  const [form] = Form.useForm<ScheduleFormData>();
  const { addSchedule, updateSchedule, checkConflict } = useSchedule();
  const { contacts } = useContact();
  const [showLunar, setShowLunar] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        const startDayjs = dayjs(initialData.startDate);
        form.setFieldsValue({
          ...initialData,
          startDate: startDayjs,
          endDate: dayjs(initialData.endDate),
        });
        setSelectedStartDate(startDayjs);
        setShowLunar(true);
      } else {
        // 默认时间为当天8点-9点
        const defaultStart = startDate ? dayjs(startDate).hour(8).minute(0) : dayjs().hour(8).minute(0);
        const defaultEnd = endDate ? dayjs(endDate).hour(9).minute(0) : dayjs().hour(9).minute(0);
        
        form.setFieldsValue({
          startDate: defaultStart,
          endDate: defaultEnd,
          type: defaultType || 'other',
        });
        setSelectedStartDate(defaultStart);
        setShowLunar(true);
      }
    }
  }, [visible, initialData, startDate, endDate, form, defaultType]);

  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedStartDate(date);
      // 自动设置结束时间为开始时间+1小时
      const endDate = date.add(1, 'hour');
      form.setFieldValue('endDate', endDate);
    }
    // 农历日期始终显示
    setShowLunar(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const startDate = values.startDate.toDate();
      const endDate = values.endDate.toDate();
      
      if (endDate <= startDate) {
        message.error('结束时间必须大于开始时间');
        return;
      }

      const conflicts = checkConflict(startDate, endDate, initialData?.id);
      if (conflicts.length > 0) {
        message.warning(`检测到 ${conflicts.length} 个时间冲突的日程`);
      }

      const scheduleData = {
        ...values,
        startDate,
        endDate,
      };

      if (initialData) {
        updateSchedule(initialData.id, scheduleData);
        message.success('日程更新成功');
      } else {
        addSchedule({
          ...scheduleData,
          blessingContacts: [],
          isFromBlessing: false,
        });
        
        message.success('日程添加成功');
      }

      form.resetFields();
      setSelectedStartDate(null);
      onSave();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedStartDate(null);
    onCancel();
  };

  return (
    <Modal
      title={initialData ? '编辑日程' : '添加日程'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      okText="保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="日程标题"
          name="title"
          rules={[{ required: true, message: '请输入日程标题' }]}
        >
          <Input placeholder="请输入日程标题" />
        </Form.Item>

        <Form.Item
          label="日程类型"
          name="type"
          rules={[{ required: true, message: '请选择日程类型' }]}
        >
          <Select placeholder="请选择日程类型">
            {Object.entries(scheduleTypeLabels).map(([value, label]) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Space style={{ width: '100%' }}>
          <Form.Item
            label="开始日期"
            name="startDate"
            rules={[{ required: true, message: '请选择开始日期' }]}
            style={{ flex: 1 }}
          >
            <DatePicker 
              showTime
              showNow={false}
              format="YYYY-MM-DD HH:mm"
              onChange={handleStartDateChange}
              style={{ width: '100%' }}
              cellRender={(current, info) => lunarDateCellRender(current, info)}
            />
          </Form.Item>

          <Form.Item
            label="结束日期"
            name="endDate"
            rules={[{ required: true, message: '请选择结束日期' }]}
            style={{ flex: 1 }}
          >
            <DatePicker
              showTime
              showNow={false}
              format="YYYY-MM-DD HH:mm"
              onChange={() => setShowLunar(true)}
              style={{ width: '100%' }}
              cellRender={(current, info) => lunarDateCellRender(current, info)}
            />
          </Form.Item>
        </Space>

        {showLunar && (
          <Form.Item label="农历日期">
            <Tag color="red">
              {selectedStartDate ? formatLunar(selectedStartDate.toDate()) : '请选择日期'}
            </Tag>
          </Form.Item>
        )}

        <Form.Item
          label="地点"
          name="location"
        >
          <Input placeholder="请输入地点" />
        </Form.Item>

        <Form.Item
          label="关联联系人"
          name="contacts"
        >
          <Select
            mode="multiple"
            placeholder="选择联系人"
            tagRender={(props: { label: React.ReactNode; value: string; closable: boolean; onClose: () => void }) => {
              const { label, value, closable, onClose } = props;
              const contact = contacts.find(c => c.id === value);
              return (
                <Tag
                  color="blue"
                  closable={closable}
                  onClose={onClose}
                  style={{ marginRight: 3 }}
                >
                  {contact?.name || label}
                </Tag>
              );
            }}
          >
            {contacts.map(contact => (
              <Select.Option key={contact.id} value={contact.id}>
                {contact.name} ({contact.relationship})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="备注"
          name="note"
        >
          <Input.TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>

        <Form.Item
          label="提前提醒"
          name="reminder"
        >
          <Select placeholder="选择提醒时间" allowClear>
            <Select.Option value={5}>5分钟前</Select.Option>
            <Select.Option value={15}>15分钟前</Select.Option>
            <Select.Option value={30}>30分钟前</Select.Option>
            <Select.Option value={60}>1小时前</Select.Option>
            <Select.Option value={120}>2小时前</Select.Option>
            <Select.Option value={1440}>1天前</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ScheduleForm;