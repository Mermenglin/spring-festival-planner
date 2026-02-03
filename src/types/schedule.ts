export type ScheduleType = 'visit' | 'dinner' | 'family' | 'other';

export interface Schedule {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  type: ScheduleType;
  location?: string;
  note?: string;
  reminder?: number;
  contacts?: string[];
  blessingContacts?: string[];  // 拜年的联系人ID列表
  isFromBlessing?: boolean;    // 是否从拜年记录创建
  createdAt: Date;
  updatedAt: Date;
}

import type { Dayjs } from 'dayjs';

export interface ScheduleFormData {
  title: string;
  startDate: Dayjs;
  endDate: Dayjs;
  type: ScheduleType;
  location?: string;
  note?: string;
  reminder?: number;
  contacts?: string[];
}

export const scheduleTypeLabels: Record<ScheduleType, string> = {
  visit: '拜年',
  dinner: '聚餐',
  family: '家庭活动',
  other: '其他',
};

export const scheduleTypeColors: Record<ScheduleType, string> = {
  visit: '#ff4d4f',
  dinner: '#fa8c16',
  family: '#52c41a',
  other: '#1890ff',
};