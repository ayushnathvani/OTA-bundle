import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { checkGitOTAUpdate } from '../utils/ota';
import { Config } from '../config/environment';

export const useOTAManager = () => {
  const appState = useRef(AppState.currentState);
  const otaIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkForUpdates = useCallback(async () => {
    if (!Config.OTA_ENABLED) return;

    try {
      await checkGitOTAUpdate({
        restartAfterInstall: Config.OTA_AUTO_RESTART,
      });
    } catch (error) {
      console.error('OTA check failed:', error);
    }
  }, []);

  const stopPeriodicCheck = useCallback(() => {
    if (otaIntervalRef.current) {
      clearInterval(otaIntervalRef.current);
      otaIntervalRef.current = null;
    }
  }, []);

  const startPeriodicCheck = useCallback(() => {
    if (otaIntervalRef.current) {
      clearInterval(otaIntervalRef.current);
    }

    otaIntervalRef.current = setInterval(() => {
      checkForUpdates();
    }, Config.OTA_CHECK_INTERVAL);
  }, [checkForUpdates]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, check for updates
        checkForUpdates();
        startPeriodicCheck();
      } else if (nextAppState.match(/inactive|background/)) {
        // App is going to background, stop periodic checks
        stopPeriodicCheck();
      }
      appState.current = nextAppState;
    },
    [checkForUpdates, startPeriodicCheck, stopPeriodicCheck],
  );

  useEffect(() => {
    // Initial check when component mounts
    checkForUpdates();

    // Start periodic checks
    startPeriodicCheck();

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      stopPeriodicCheck();
      subscription?.remove();
    };
  }, [
    checkForUpdates,
    startPeriodicCheck,
    handleAppStateChange,
    stopPeriodicCheck,
  ]);

  return {
    checkForUpdates,
    startPeriodicCheck,
    stopPeriodicCheck,
  };
};

export default useOTAManager;
