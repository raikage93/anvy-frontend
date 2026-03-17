import { useState, useEffect, useCallback } from 'react';
import type { DefaultInfo } from '../types';
import { STORAGE_KEY } from '../types';

export function useDefaultInfo() {
  const [defaultInfo, setDefaultInfo] = useState<DefaultInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDefaultInfo(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoaded(true);
  }, []);

  const saveInfo = useCallback((info: DefaultInfo) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    setDefaultInfo(info);
  }, []);

  const clearInfo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setDefaultInfo(null);
  }, []);

  return { defaultInfo, isLoaded, saveInfo, clearInfo };
}
