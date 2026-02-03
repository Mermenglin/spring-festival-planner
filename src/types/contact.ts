export interface BlessingRecord {
  isBlessed: boolean;
  blessingTime?: Date;
  blessingMethod?: 'in-person' | 'phone' | 'video' | 'message' | 'batch';
  gift?: string;
  redPacket?: string;
  note?: string;
  scheduleId?: string;  // 关联的日程ID
}

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone?: string;
  address?: string;
  note?: string;
  blessingRecord?: BlessingRecord;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactFormData {
  name: string;
  relationship: string;
  phone?: string;
  address?: string;
  note?: string;
  blessingRecord?: BlessingRecord;
}