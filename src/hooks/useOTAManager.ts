import { useEffect, useRef, useCallback, useState } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import {
  finalOTAUpdate,
  finalClearCache,
  finalApplyUpdate,
} from '../utils/ota-final-solution';
import { Config } from '../config/environment';
import { log } from '../utils/logger';

export const useOTAManager = () => {
  const appState = useRef(AppState.currentState);
  const otaIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<Date | null>(null);
  const [_isChecking, setIsChecking] = useState(false);
  const [_lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const checkForUpdates = useCallback(async (isManual = false) => {
    if (!Config.OTA_ENABLED) {
      log('🚫 OTA check skipped - OTA disabled in current environment');
      return;
    }
    // Alert.alert('data', 'call');
    Alert.alert('data', 'call');
    // For automatic checks, respect the check interval timing
    if (!isManual && lastCheckRef.current) {
      const timeSinceLastCheck = Date.now() - lastCheckRef.current.getTime();
      const minInterval = Config.OTA_CHECK_INTERVAL;

      if (minInterval > 0 && timeSinceLastCheck < minInterval) {
        const remainingTime = Math.ceil(
          (minInterval - timeSinceLastCheck) / 1000,
        );
        log(
          `🚫 OTA check skipped - too soon (${remainingTime}s remaining until next check)`,
        );
        return;
      }
    }

    const now = new Date();
    log(
      `🔄 OTA check starting at ${now.toLocaleTimeString()} (${
        isManual ? 'manual' : 'automatic'
      })`,
    );
    setIsChecking(true);
    lastCheckRef.current = now;
    setLastCheckTime(now);

    try {
      log('� [FINAL] Starting Final Solution OTA check...');
      await finalOTAUpdate({
        onProgress: percent => {
          log(`📈 [OTA] Download progress: ${percent.toFixed(1)}%`);
        },
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

  const startPeriodicCheck = useCallback(() => {
    // Only start periodic checks if interval is configured and OTA is enabled
    if (!Config.OTA_ENABLED || Config.OTA_CHECK_INTERVAL <= 0) {
      log('🚫 Periodic OTA checks disabled - interval is 0 or OTA disabled');
      return;
    }

    // Don't start if already running
    if (otaIntervalRef.current) {
      log('⏰ Periodic OTA checks already running');
      return;
    }

    log(
      `⏰ Starting periodic OTA checks every ${
        Config.OTA_CHECK_INTERVAL / 1000
      } seconds`,
    );

    otaIntervalRef.current = setInterval(() => {
      log('⏰ Periodic OTA check triggered');
      checkForUpdates(false); // false = automatic check
    }, Config.OTA_CHECK_INTERVAL);
  }, [checkForUpdates]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      log(`📱 App state changed: ${appState.current} → ${nextAppState}`);

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        log('🔄 App came to foreground - starting periodic OTA checks');
        startPeriodicCheck();

        // Also do an immediate check if enough time has passed
        checkForUpdates(false);
      } else if (nextAppState.match(/inactive|background/)) {
        log('⏸️ App going to background - stopping periodic OTA checks');
        stopPeriodicCheck();
      }
      appState.current = nextAppState;
    },
    [stopPeriodicCheck, startPeriodicCheck, checkForUpdates],
  );

  useEffect(() => {
    const initialize = async () => {
      log('🚀 OTA Manager initialized');
      log(
        `📋 Config: OTA_ENABLED=${Config.OTA_ENABLED}, BRANCH=${Config.OTA_BRANCH}, INTERVAL=${Config.OTA_CHECK_INTERVAL}ms`,
      );

      // Don't clear cache on every startup - only when manually requested
      // This allows OTA updates to work without clearing user data
      log('📦 Preserving OTA cache for better update experience');

      // Perform initial startup check
      log('🔄 Performing initial startup OTA check');
      await checkForUpdates(false); // false = startup check (silent)

      // Start periodic checks if configured
      startPeriodicCheck();
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
  }, [
    checkForUpdates,
    handleAppStateChange,
    stopPeriodicCheck,
    startPeriodicCheck,
  ]);

  return {
    isUpdateInProgress: _isChecking,
    checkForUpdates: () => checkForUpdates(true), // Manual check is always with UI
    clearOTACache: finalClearCache,
    applyUpdate: finalApplyUpdate,
    getStatus: () => ({
      isEnabled: Config.OTA_ENABLED,
      checkInterval: Config.OTA_CHECK_INTERVAL,
      lastCheck: lastCheckRef.current,
      branch: Config.OTA_BRANCH,
    }),
  };
};

export default useOTAManager;
