import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { checkGitOTAUpdate, clearOTACache } from '../utils/ota';
import { Config } from '../config/environment';
import { log } from '../utils/logger';

export const useOTAManager = () => {
  const appState = useRef(AppState.currentState);
  const otaIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<Date | null>(null);
  const hasCheckedOnStartup = useRef(false);
  const [_isChecking, setIsChecking] = useState(false);
  const [_lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const checkForUpdates = useCallback(async (isManual = false) => {
    if (!Config.OTA_ENABLED) {
      log('🚫 OTA check skipped - OTA disabled in current environment');
      return;
    }

    // Skip automatic checks if we've already checked on startup
    if (!isManual && hasCheckedOnStartup.current) {
      log(
        '🚫 OTA check skipped - already checked on startup, use manual check',
      );
      return;
    }

    const now = new Date();
    log(
      `🔄 OTA check starting at ${now.toLocaleTimeString()} (${
        isManual ? 'manual' : 'startup'
      })`,
    );
    setIsChecking(true);
    lastCheckRef.current = now;
    setLastCheckTime(now);

    if (!isManual) {
      hasCheckedOnStartup.current = true;
    }

    try {
      await checkGitOTAUpdate({
        restartAfterInstall: false, // Never auto-restart
        silentCheck: !isManual, // Silent for automatic checks, show alerts for manual
      });
      log(
        `✅ OTA check completed successfully at ${new Date().toLocaleTimeString()}`,
      );
    } catch (error) {
      log(
        `❌ OTA check failed at ${new Date().toLocaleTimeString()}: ${error}`,
      );
    } finally {
      setIsChecking(false);
    }
  }, []);

  const stopPeriodicCheck = useCallback(() => {
    if (otaIntervalRef.current) {
      clearInterval(otaIntervalRef.current);
      otaIntervalRef.current = null;
      log('⏹️ Stopped periodic OTA checks');
    }
  }, []);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      log(`📱 App state changed: ${appState.current} → ${nextAppState}`);

      // Don't check for updates when app comes to foreground to prevent alert loops
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        log('🔄 App came to foreground - skipping OTA check to prevent alerts');
      } else if (nextAppState.match(/inactive|background/)) {
        log('⏸️ App going to background');
        stopPeriodicCheck();
      }
      appState.current = nextAppState;
    },
    [stopPeriodicCheck],
  );

  useEffect(() => {
    const initialize = async () => {
      log('🚀 OTA Manager initialized');
      log(
        `📋 Config: OTA_ENABLED=${Config.OTA_ENABLED}, BRANCH=${Config.OTA_BRANCH}`,
      );

      // Don't clear cache on every startup - only when manually requested
      // This allows OTA updates to work without clearing user data
      log('📦 Preserving OTA cache for better update experience');

      // Only check once when component mounts (app startup)
      log('🔄 Performing single startup OTA check');
      checkForUpdates(false); // false = startup check (silent)

      // Don't start periodic checks to prevent alert loops
      log('🚫 Periodic checks disabled to prevent alert loops');
    };

    initialize();

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      log('🧹 OTA Manager cleanup');
      stopPeriodicCheck();
      subscription?.remove();
    };
  }, [checkForUpdates, handleAppStateChange, stopPeriodicCheck]);

  return {
    isUpdateInProgress: _isChecking,
    checkForUpdates: () => checkForUpdates(true), // Manual check is always with UI
    clearOTACache,
    getStatus: () => ({
      isEnabled: Config.OTA_ENABLED,
      checkInterval: Config.OTA_CHECK_INTERVAL,
      lastCheck: lastCheckRef.current,
      branch: Config.OTA_BRANCH,
    }),
  };
};

export default useOTAManager;
