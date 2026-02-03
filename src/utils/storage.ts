// 辅助函数：将对象中的日期字符串转换为 Date 对象
const parseDates = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => parseDates(item));
  }
  
  // 处理对象
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      // 检查日期字段
      if (['startDate', 'endDate', 'createdAt', 'updatedAt', 'blessingTime', 'lastContactTime'].includes(key)) {
        const value = obj[key];
        if (typeof value === 'string') {
          result[key] = new Date(value);
        } else {
          result[key] = value;
        }
      } else {
        result[key] = parseDates(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
};

const STORAGE_KEYS = {
  SCHEDULES: 'spring-festival-planner-schedules',
  CONTACTS: 'spring-festival-planner-contacts',
  SETTINGS: 'spring-festival-planner-settings',
};

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      const parsed = JSON.parse(item);
      // 解析日期字段
      return parseDates(parsed);
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  exportData(): string {
    const data = {
      schedules: this.get(STORAGE_KEYS.SCHEDULES, []),
      contacts: this.get(STORAGE_KEYS.CONTACTS, []),
      settings: this.get(STORAGE_KEYS.SETTINGS, null),
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.schedules) {
        this.set(STORAGE_KEYS.SCHEDULES, data.schedules);
      }
      if (data.contacts) {
        this.set(STORAGE_KEYS.CONTACTS, data.contacts);
      }
      if (data.settings) {
        this.set(STORAGE_KEYS.SETTINGS, data.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },
};

export const storageKeys = STORAGE_KEYS;