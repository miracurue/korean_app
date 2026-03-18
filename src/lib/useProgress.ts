/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';

export interface ProgressState {
  id: string | number;
  type: 'video' | 'audio' | 'reader';
  title: string;
  source?: string;
  timestamp: number;
  duration?: number;
  lastAccessed: number;
  isLocal?: boolean;
}

export function useProgress(type: 'video' | 'audio' | 'reader') {
  const [history, setHistory] = useState<ProgressState[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(`klingua_progress_${type}`);
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }
  }, [type]);

  const saveProgress = (state: Omit<ProgressState, 'lastAccessed' | 'type'>) => {
    let currentHistory = [...history];
    const existingIndex = currentHistory.findIndex(h => h.id === state.id);
    
    const newState: ProgressState = {
      ...state,
      type,
      lastAccessed: Date.now()
    };

    if (existingIndex >= 0) {
      currentHistory[existingIndex] = newState;
    } else {
      currentHistory.unshift(newState);
    }
    
    // Keep only last 20
    currentHistory = currentHistory.sort((a, b) => b.lastAccessed - a.lastAccessed).slice(0, 20);
    
    setHistory(currentHistory);
    localStorage.setItem(`klingua_progress_${type}`, JSON.stringify(currentHistory));
  };

  const getProgress = (id: string | number) => {
    return history.find(h => h.id === id);
  };
  
  const getLastProgress = () => {
    return history.length > 0 ? history[0] : null;
  };

  return {
    history,
    saveProgress,
    getProgress,
    getLastProgress
  };
}
