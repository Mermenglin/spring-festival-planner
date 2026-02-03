import dayjs from 'dayjs';

export const formatDate = (date: Date): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const formatDateTime = (date: Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const parseDate = (dateStr: string): Date => {
  return dayjs(dateStr).toDate();
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return dayjs(date1).isSame(date2, 'day');
};

export const isToday = (date: Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const addDays = (date: Date, days: number): Date => {
  return dayjs(date).add(days, 'day').toDate();
};

export const addHours = (date: Date, hours: number): Date => {
  return dayjs(date).add(hours, 'hour').toDate();
};

export const getStartOfDay = (date: Date): Date => {
  return dayjs(date).startOf('day').toDate();
};

export const getEndOfDay = (date: Date): Date => {
  return dayjs(date).endOf('day').toDate();
};

export const getStartOfWeek = (date: Date): Date => {
  return dayjs(date).startOf('week').toDate();
};

export const getEndOfWeek = (date: Date): Date => {
  return dayjs(date).endOf('week').toDate();
};

export const getStartOfMonth = (date: Date): Date => {
  return dayjs(date).startOf('month').toDate();
};

export const getEndOfMonth = (date: Date): Date => {
  return dayjs(date).endOf('month').toDate();
};