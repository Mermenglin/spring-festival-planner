import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Schedule } from '@/types';
import { storage, storageKeys } from '@/utils/storage';

interface ScheduleContextType {
  schedules: Schedule[];
  addSchedule: (data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => Schedule;
  updateSchedule: (id: string, data: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  getScheduleById: (id: string) => Schedule | undefined;
  getSchedulesByDate: (date: Date) => Schedule[];
  checkConflict: (startDate: Date, endDate: Date, excludeId?: string) => Schedule[];
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    return storage.get<Schedule[]>(storageKeys.SCHEDULES, []);
  });

  const addSchedule = useCallback((data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Schedule => {
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updated = [...schedules, newSchedule];
    setSchedules(updated);
    storage.set(storageKeys.SCHEDULES, updated);
    return newSchedule;
  }, [schedules]);

  const updateSchedule = useCallback((id: string, data: Partial<Schedule>) => {
    const updated = schedules.map(schedule => 
      schedule.id === id 
        ? { ...schedule, ...data, updatedAt: new Date() } 
        : schedule
    );
    setSchedules(updated);
    storage.set(storageKeys.SCHEDULES, updated);
  }, [schedules]);

  const deleteSchedule = useCallback((id: string) => {
    const updated = schedules.filter(schedule => schedule.id !== id);
    setSchedules(updated);
    storage.set(storageKeys.SCHEDULES, updated);
  }, [schedules]);

  const getScheduleById = useCallback((id: string) => {
    return schedules.find(schedule => schedule.id === id);
  }, [schedules]);

  const getSchedulesByDate = useCallback((date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startDate);
      return scheduleDate.toDateString() === date.toDateString();
    });
  }, [schedules]);

  const checkConflict = useCallback((startDate: Date, endDate: Date, excludeId?: string): Schedule[] => {
    return schedules.filter(schedule => {
      if (excludeId && schedule.id === excludeId) return false;
      
      const start = new Date(schedule.startDate).getTime();
      const end = new Date(schedule.endDate).getTime();
      const newStart = startDate.getTime();
      const newEnd = endDate.getTime();
      
      return (newStart < end && newEnd > start);
    });
  }, [schedules]);

  return (
    <ScheduleContext.Provider 
      value={{
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        getScheduleById,
        getSchedulesByDate,
        checkConflict,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within ScheduleProvider');
  }
  return context;
};