import { Lunar, Solar } from 'lunar-javascript';

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  dayName: string;
  yearName: string;
  ganzhiYear: string;
  ganzhiMonth: string;
  ganzhiDay: string;
  zodiac: string;
}

export const solarToLunar = (date: Date): LunarDate => {
  if (!date) {
    throw new Error('date is required');
  }
  
  // 确保是有效的 Date 对象
  if (!(date instanceof Date)) {
    throw new Error('date must be a Date object');
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    throw new Error('date is invalid');
  }
  
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    monthName: lunar.getMonthInChinese(),
    dayName: lunar.getDayInChinese(),
    yearName: lunar.getYearInChinese(),
    ganzhiYear: lunar.getYearInGanZhi(),
    ganzhiMonth: lunar.getMonthInGanZhi(),
    ganzhiDay: lunar.getDayInGanZhi(),
    zodiac: lunar.getYearShengXiao(),
  };
};

export const lunarToSolar = (year: number, month: number, day: number): Date => {
  const lunar = Lunar.fromYmd(year, month, day);
  const solar = lunar.getSolar();
  return solar.toDate();
};

export const formatLunar = (date: Date | string | null | undefined): string => {
  if (!date) {
    return '请选择日期';
  }
  
  // 如果是字符串，转换为 Date 对象
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return '无效日期';
  }
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    return '无效日期';
  }
  
  const lunar = solarToLunar(dateObj);
  return `农历${lunar.monthName}${lunar.dayName}`;
};

export const formatLunarFull = (date: Date | string | null | undefined): string => {
  if (!date) {
    return '未知日期';
  }
  
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return '无效日期';
  }
  
  if (isNaN(dateObj.getTime())) {
    return '无效日期';
  }
  
  const lunar = solarToLunar(dateObj);
  return `${lunar.yearName}年${lunar.monthName}${lunar.dayName}`;
};

export const isFestival = (date: Date | string | null | undefined, littleNewYearMode: 'north' | 'south' = 'north'): string | null => {
  if (!date) {
    return null;
  }
  
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return null;
  }
  
  if (isNaN(dateObj.getTime())) {
    return null;
  }
  
  const lunar = solarToLunar(dateObj);
  
  if (lunar.month === 1 && lunar.day === 1) return '春节';
  if (lunar.month === 1 && lunar.day === 15) return '元宵节';
  if (lunar.month === 5 && lunar.day === 5) return '端午节';
  if (lunar.month === 7 && lunar.day === 7) return '七夕节';
  if (lunar.month === 8 && lunar.day === 15) return '中秋节';
  if (lunar.month === 9 && lunar.day === 9) return '重阳节';
  if (lunar.month === 12 && lunar.day === 8) return '腊八节';
  
  // 小年：根据设置只返回对应的小年日期
  if (littleNewYearMode === 'north' && lunar.month === 12 && lunar.day === 23) return '小年';
  if (littleNewYearMode === 'south' && lunar.month === 12 && lunar.day === 24) return '小年';
  
  // 除夕：腊月最后一天（检查下一天是否是春节）
  if (lunar.month === 12) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextLunar = solarToLunar(nextDay);
    // 如果下一天是农历正月初一（春节），那么今天就是除夕
    if (nextLunar.month === 1 && nextLunar.day === 1) {
      return '除夕';
    }
  }
  
  return null;
};