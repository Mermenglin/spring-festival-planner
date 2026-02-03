import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Theme, ViewMode, AppSettings, LittleNewYearMode } from '@/types';
import { storage, storageKeys } from '@/utils/storage';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  littleNewYearMode: LittleNewYearMode;
  setLittleNewYearMode: (mode: LittleNewYearMode) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  viewMode: 'month',
  littleNewYearMode: 'north', // 默认北方小年（腊月廿三）
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return storage.get<AppSettings>(storageKeys.SETTINGS, defaultSettings).theme || 'light';
  });
  
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    return storage.get<AppSettings>(storageKeys.SETTINGS, defaultSettings).viewMode || 'month';
  });

  const [littleNewYearMode, setLittleNewYearModeState] = useState<LittleNewYearMode>(() => {
    return storage.get<AppSettings>(storageKeys.SETTINGS, defaultSettings).littleNewYearMode || 'north';
  });

  const settings: AppSettings = { theme, viewMode, littleNewYearMode };

  useEffect(() => {
    storage.set(storageKeys.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setViewMode = useCallback((newMode: ViewMode) => {
    setViewModeState(newMode);
  }, []);

  const setLittleNewYearMode = useCallback((newMode: LittleNewYearMode) => {
    setLittleNewYearModeState(newMode);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    if (newSettings.theme !== undefined) {
      setThemeState(newSettings.theme);
    }
    if (newSettings.viewMode !== undefined) {
      setViewModeState(newSettings.viewMode);
    }
    if (newSettings.littleNewYearMode !== undefined) {
      setLittleNewYearModeState(newSettings.littleNewYearMode);
    }
  }, []);

  return (
    <AppContext.Provider 
      value={{
        theme,
        toggleTheme,
        setTheme,
        viewMode,
        setViewMode,
        littleNewYearMode,
        setLittleNewYearMode,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};