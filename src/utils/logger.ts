// src/utils/logger.ts
import { useState, useCallback } from 'react';

// A simple in-memory log store
const logs: string[] = [];
let logListener: ((newLogs: string[]) => void) | null = null;

export const log = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage); // Keep original console logging
  logs.unshift(logMessage); // Add to the top
  if (logs.length > 50) {
    logs.pop(); // Keep the log size manageable
  }
  if (logListener) {
    logListener([...logs]);
  }
};

export const useLogs = () => {
  const [displayLogs, setDisplayLogs] = useState(logs);

  const listener = useCallback((newLogs: string[]) => {
    setDisplayLogs(newLogs);
  }, []);

  logListener = listener;

  return displayLogs;
};
