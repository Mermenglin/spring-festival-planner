export type { Schedule, ScheduleFormData, ScheduleType } from './schedule';
export { scheduleTypeLabels, scheduleTypeColors } from './schedule';
export type { Contact, ContactFormData } from './contact';

export type Theme = 'light' | 'dark';

export type ViewMode = 'month' | 'week' | 'day';

export type LittleNewYearMode = 'north' | 'south'; // 北方小年(腊廿三) vs 南方小年(腊廿四)

export interface AppSettings {
  theme: Theme;
  viewMode: ViewMode;
  littleNewYearMode: LittleNewYearMode;
}