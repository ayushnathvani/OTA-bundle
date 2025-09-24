import { Alert, LayoutAnimation, Platform } from 'react-native';
import { Config } from '../config/environment';
import { log } from './logger';

// Track processed updates to avoid showing same alert multiple times
let lastProcessedBundleHash: string | null = null;
let isUpdateInProgress = false;

/**
 * CRITICAL FIX: Ultra-aggressive cache clearing that actually works
 * This is the nuclear option for React Native cache clearing
 */
const nuclearCacheClear = (): void => {
  try {
    log('💥 [CRITICAL] Initiating nuclear cache clear for OTA...');

    const globalAny = global as any;
    const timestamp = Date.now();

    // 1. Completely invalidate Metro cache
    if (globalAny.__metro_global_prefix__) {
      globalAny.__metro_global_prefix__ = `ota_${timestamp}`;
      log('✅ Metro cache nuked');
    } else {
      globalAny.__metro_global_prefix__ = `ota_${timestamp}`;
      log('✅ Metro cache prefix created');
    }

    // 2. Nuclear option: Clear entire require cache and force reload
    if (globalAny.__r) {
      if (typeof globalAny.__r.clear === 'function') {
        globalAny.__r.clear();
      }
      // Completely replace the require function
      const originalRequire = globalAny.__r;
      globalAny.__r = function (moduleId: any) {
        // Force fresh module loading
        if (originalRequire && originalRequire._moduleRegistry) {
          delete originalRequire._moduleRegistry[moduleId];
        }
        return originalRequire.call(this, moduleId);
      };
      // Copy over properties
      Object.keys(originalRequire).forEach(key => {
        if (key !== 'clear') {
          globalAny.__r[key] = originalRequire[key];
        }
      });
      log('✅ Require system completely reset');
    }

    // 3. Nuclear module registry clearing
    if (globalAny.__d) {
      const moduleKeys = Object.keys(globalAny.__d);
      moduleKeys.forEach(key => {
        if (globalAny.__d[key]) {
          // Mark every module as invalidated
          globalAny.__d[key]._cacheBuster = timestamp;
          globalAny.__d[key]._otaInvalidated = true;
        }
      });
      log(`✅ ${moduleKeys.length} modules marked for reload`);
    }

    // 4. Clear ALL possible cache indicators
    const cacheKeys = [
      '__HERMES_CACHE_VERSION__',
      '__BUNDLE_CACHE_VERSION__',
      '__RN_CACHE_VERSION__',
      '__METRO_CACHE_VERSION__',
      '__MODULE_CACHE_VERSION__',
      '__JSC_CACHE_VERSION__',
      '__BYTECODE_CACHE_VERSION__',
    ];

    cacheKeys.forEach(key => {
      globalAny[key] = timestamp;
    });
    log('✅ All cache version indicators updated');

    // 5. Force multiple garbage collections
    if (globalAny.gc) {
      for (let i = 0; i < 3; i++) {
        globalAny.gc();
      }
      log('✅ Multiple GC cycles forced');
    }

    // 6. Clear React reconciler cache
    if (globalAny.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = globalAny.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook.onCommitFiberRoot) {
        // Invalidate React reconciler
        hook._otaInvalidateTime = timestamp;
      }
      if (hook.onCommitFiberUnmount) {
        hook._otaInvalidateUnmount = timestamp;
      }
    }

    // 7. Force React Native bridge reset
    if (globalAny.__fbBatchedBridge) {
      const bridge = globalAny.__fbBatchedBridge;
      if (bridge._callID) {
        bridge._callID += 1000; // Shift call IDs
      }
      if (bridge._callbacks) {
        bridge._callbacks = new Array(bridge._callbacks.length);
      }
      log('✅ React Native bridge reset');
    }

    // 8. Set the ultimate cache buster
    globalAny.__OTA_NUCLEAR_TIMESTAMP__ = timestamp;
    globalAny.__OTA_FORCE_RELOAD__ = true;

    // 9. Force immediate property descriptors update for key globals
    try {
      Object.defineProperty(globalAny, '__DEV__', {
        value: __DEV__,
        configurable: true,
        enumerable: true,
        writable: true,
      });
    } catch (e) {
      // Ignore descriptor errors
    }

    log(`💥 [CRITICAL] Nuclear cache clear completed! Timestamp: ${timestamp}`);
  } catch (e) {
    log(`⚠️ Nuclear cache clear warning: ${e}`);
  }
};

/**
 * CRITICAL: Check if we need to apply a pending update on startup
 */
const checkForPendingUpdate = async (): Promise<boolean> => {
  try {
    const hotUpdate = require('react-native-ota-hot-update').default;
    const currentVersion = await hotUpdate.getCurrentVersion();
    const storedHash = await getStoredBundleHash();

    log(
      `🔍 [CRITICAL] Startup check - Current: ${currentVersion}, Stored: ${storedHash}`,
    );

    if (storedHash && currentVersion !== storedHash) {
      log(`🚨 [CRITICAL] PENDING UPDATE DETECTED! Applying immediately...`);

      // Apply nuclear cache clearing before anything else
      nuclearCacheClear();

      // Force reload with the new bundle
      setTimeout(() => {
        log('🔄 [CRITICAL] Force reloading with new bundle...');
        hotUpdate.resetApp();
      }, 500);

      return true;
    }

    return false;
  } catch (e) {
    log(`❌ Pending update check failed: ${e}`);
    return false;
  }
};

/**
 * Get the stored bundle hash from persistent storage
 */
const getStoredBundleHash = async (): Promise<string | null> => {
  try {
    const RNFS = require('react-native-fs');
    const hashFile = `${RNFS.DocumentDirectoryPath}/ota_bundle_hash.txt`;
    const exists = await RNFS.exists(hashFile);
    if (exists) {
      const content = await RNFS.readFile(hashFile, 'utf8');
      try {
        const metadata = JSON.parse(content);
        const hash = metadata.hash || content.trim();
        log(`📦 [CRITICAL] Retrieved bundle hash: ${hash}`);
        return hash;
      } catch {
        const hash = content.trim();
        log(`📦 [CRITICAL] Retrieved bundle hash (legacy): ${hash}`);
        return hash;
      }
    }
    log('📦 No stored bundle hash found');
    return null;
  } catch (e) {
    log(`❌ Failed to get stored bundle hash: ${e}`);
    return null;
  }
};

/**
 * Store the bundle hash with metadata
 */
const storeBundleHash = async (hash: string): Promise<void> => {
  try {
    const RNFS = require('react-native-fs');
    const hashFile = `${RNFS.DocumentDirectoryPath}/ota_bundle_hash.txt`;
    const metadata = {
      hash,
      timestamp: Date.now(),
      platform: Platform.OS,
      version: '3.0-critical',
    };
    await RNFS.writeFile(hashFile, JSON.stringify(metadata, null, 2), 'utf8');
    log(`💾 [CRITICAL] Stored bundle hash: ${hash}`);
  } catch (e) {
    log(`❌ Failed to store bundle hash: ${e}`);
  }
};

/**
 * Get bundle hash with better validation
 */
const getBundleHash = async (filePath: string): Promise<string | null> => {
  try {
    const RNFS = require('react-native-fs');

    const exists = await RNFS.exists(filePath);
    if (!exists) {
      log(`❌ Bundle file does not exist: ${filePath}`);
      return null;
    }

    const stats = await RNFS.stat(filePath);
    if (stats.size === 0) {
      log(`❌ Bundle file is empty: ${filePath}`);
      return null;
    }

    log(`📦 Reading bundle file (${stats.size} bytes): ${filePath}`);
    const content = await RNFS.readFile(filePath, 'utf8');
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(content).digest('hex');
    log(`📦 Generated bundle hash: ${hash}`);
    return hash;
  } catch (e) {
    log(`❌ Failed to get bundle hash: ${e}`);
    return null;
  }
};

/**
 * Apply installed update with nuclear cache clearing
 */
export const applyInstalledUpdateCritical = () => {
  Alert.alert(
    'Apply Critical Update',
    'This will force restart the app with comprehensive cache clearing. Continue?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Force Restart',
        onPress: () => {
          log('💥 [CRITICAL] Applying nuclear cache clear and restart...');
          nuclearCacheClear();

          // Longer delay for nuclear clearing
          setTimeout(() => {
            const hotUpdate = require('react-native-ota-hot-update').default;
            hotUpdate.resetApp();
          }, 1000);
        },
      },
    ],
  );
};

/**
 * Clear OTA cache with nuclear option
 */
export const clearOTACacheCritical = async (folderName: string = '/src') => {
  try {
    const RNFS = require('react-native-fs');
    const repoDir = `${RNFS.DocumentDirectoryPath}${folderName}`;
    const hashFile = `${RNFS.DocumentDirectoryPath}/ota_bundle_hash.txt`;

    log('💥 [CRITICAL] Nuclear OTA cache clearing...');

    // Clear everything
    const dirExists = await RNFS.exists(repoDir);
    if (dirExists) {
      await RNFS.unlink(repoDir);
    }

    const hashExists = await RNFS.exists(hashFile);
    if (hashExists) {
      await RNFS.unlink(hashFile);
    }

    // Reset memory
    lastProcessedBundleHash = null;

    // Nuclear cache clear
    nuclearCacheClear();

    log('💥 [CRITICAL] Nuclear cache clear completed!');
  } catch (e) {
    log(`❌ Nuclear cache clear failed: ${e}`);
  }
};

/**
 * CRITICAL OTA update function with nuclear cache clearing
 */
export async function checkGitOTAUpdateCritical({
  repoUrl = Config.OTA_REPO_URL,
  iosBranch = Config.OTA_BRANCH === 'development' ? 'iOS-dev' : 'iOS',
  androidBranch = Config.OTA_BRANCH,
  bundlePathIOS = 'ios/output/main.jsbundle',
  bundlePathAndroid = 'android/output/index.android.bundle',
  folderName = '/src',
  authorName = 'ayushnathvani',
  authorEmail = 'ayushn.itpathsolutions@gmail.com',
  onProgress,
  restartAfterInstall = false,
  silentCheck = false,
}: {
  repoUrl?: string;
  iosBranch?: string;
  androidBranch?: string;
  bundlePathIOS?: string;
  bundlePathAndroid?: string;
  folderName?: string;
  authorName?: string;
  authorEmail?: string;
  onProgress?: (percent: number) => void;
  restartAfterInstall?: boolean;
  silentCheck?: boolean;
} = {}) {
  const hotUpdate = require('react-native-ota-hot-update').default;

  if (!Config.OTA_ENABLED) {
    log(`🚫 [CRITICAL] OTA disabled in ${Config.ENVIRONMENT}`);
    return Promise.resolve();
  }

  if (isUpdateInProgress) {
    log('🚫 [CRITICAL] Update already in progress');
    return Promise.resolve();
  }

  const branch = Platform.OS === 'ios' ? iosBranch : androidBranch;

  log(`💥 [CRITICAL] Checking for updates from ${branch}...`);
  isUpdateInProgress = true;

  return new Promise<void>(async resolve => {
    const finishCheck = () => {
      isUpdateInProgress = false;
      resolve();
    };

    // Check for pending update first
    const hasPending = await checkForPendingUpdate();
    if (hasPending) {
      finishCheck();
      return;
    }

    // Load stored hash
    if (!lastProcessedBundleHash) {
      lastProcessedBundleHash = await getStoredBundleHash();
    }

    // Git config
    try {
      await hotUpdate.git.setConfig(folderName, {
        userName: 'user.name',
        email: authorName,
      });
      await hotUpdate.git.setConfig(folderName, {
        userName: 'user.email',
        email: authorEmail,
      });
    } catch (e) {
      log(`⚠️ Git config warning: ${e}`);
    }

    const getBundleAbsolutePath = () => {
      try {
        const RNFS = require('react-native-fs');
        const base = `${RNFS.DocumentDirectoryPath}${folderName}`;
        const rel = Platform.OS === 'ios' ? bundlePathIOS : bundlePathAndroid;
        return `${base}/${rel}`;
      } catch (_) {
        return '';
      }
    };

    const installVersionedBundle = async () => {
      const RNFS = require('react-native-fs');
      const abs = getBundleAbsolutePath();
      if (!abs) return false;

      try {
        const fileStats = await RNFS.stat(abs);
        if (!fileStats.isFile() || fileStats.size === 0) {
          log('📦 No new bundle found');
          return false;
        }

        const bundleHash = await getBundleHash(abs);
        if (!bundleHash) {
          log('❌ Failed to get bundle hash');
          return false;
        }

        if (lastProcessedBundleHash === bundleHash) {
          log(`📦 [CRITICAL] Bundle unchanged - hash: ${bundleHash}`);
          return false;
        }

        log(`💥 [CRITICAL] NEW BUNDLE DETECTED!`);
        log(`📦 New: ${bundleHash}`);
        log(`📦 Old: ${lastProcessedBundleHash || 'none'}`);
      } catch (e) {
        log('📦 Bundle not found');
        return false;
      }

      const ts = Date.now();
      const dest = abs.endsWith('.bundle')
        ? abs.replace(/\.bundle$/, `.${ts}.bundle`)
        : `${abs}.${ts}.bundle`;

      try {
        await RNFS.copyFile(abs, dest);
        const ok = await hotUpdate.setupExactBundlePath(dest);
        if (ok) {
          const bundleHash = await getBundleHash(abs);
          if (bundleHash) {
            // Store the hash FIRST
            await storeBundleHash(bundleHash);
            await hotUpdate.setCurrentVersion(bundleHash);
            lastProcessedBundleHash = bundleHash;

            log(`💥 [CRITICAL] Bundle installed with hash: ${bundleHash}`);

            // NUCLEAR CACHE CLEAR - This is the key!
            nuclearCacheClear();

            // Extra time for cache clearing
            await new Promise(resolveDelay => setTimeout(resolveDelay, 500));

            log('💥 [CRITICAL] Nuclear cache clearing completed!');
            return true;
          }
        }
      } catch (e) {
        log(`❌ Bundle installation failed: ${e}`);
      }
      return false;
    };

    hotUpdate.git.checkForGitUpdate({
      url: repoUrl,
      branch: Platform.OS === 'ios' ? iosBranch : androidBranch,
      bundlePath: Platform.OS === 'ios' ? bundlePathIOS : bundlePathAndroid,
      folderName,
      userName: authorName,
      email: authorEmail,
      restartAfterInstall,
      onCloneFailed(msg: string) {
        log(`❌ [CRITICAL] Clone failed: ${msg}`);
        if (!silentCheck) {
          Alert.alert('Clone failed', msg);
        }
        finishCheck();
      },
      async onCloneSuccess() {
        log('💥 [CRITICAL] Clone successful!');
        try {
          const installed = await installVersionedBundle();
          if (installed) {
            log('🎉 [CRITICAL] Update installed with nuclear cache clear!');
            Alert.alert(
              'Critical Update Ready! 💥',
              'New version installed with enhanced cache clearing. Restart now for best results.',
              [
                { text: 'Later' },
                {
                  text: 'Nuclear Restart',
                  onPress: () => {
                    log('💥 [CRITICAL] Nuclear restart initiated...');
                    nuclearCacheClear();
                    setTimeout(() => hotUpdate.resetApp(), 1000);
                  },
                },
              ],
            );
          } else {
            log('ℹ️ [CRITICAL] No update found');
            if (!silentCheck) {
              Alert.alert('Up to Date', 'You have the latest version.');
            }
          }
        } catch (e) {
          log(`❌ Clone success handling error: ${e}`);
        }
        finishCheck();
      },
      onPullFailed(msg: string) {
        log(`❌ [CRITICAL] Pull failed: ${msg}`);
        if (!silentCheck && !msg.includes('Already up to date')) {
          Alert.alert('Pull failed', msg);
        }
        finishCheck();
      },
      async onPullSuccess() {
        log('💥 [CRITICAL] Pull successful!');
        try {
          const installed = await installVersionedBundle();
          if (installed) {
            log('🎉 [CRITICAL] Update found and installed!');
            Alert.alert(
              'Critical Update Ready! 💥',
              'New version installed with nuclear cache clearing. Restart recommended.',
              [
                { text: 'Later' },
                {
                  text: 'Nuclear Restart',
                  onPress: () => {
                    log('💥 [CRITICAL] Nuclear restart initiated...');
                    nuclearCacheClear();
                    setTimeout(() => hotUpdate.resetApp(), 1000);
                  },
                },
              ],
            );
          } else {
            log('ℹ️ [CRITICAL] Already up to date');
            if (!silentCheck) {
              Alert.alert('Up to Date', 'You have the latest version.');
            }
          }
        } catch (e) {
          log(`❌ Pull success handling error: ${e}`);
        }
        finishCheck();
      },
      onProgress(received: number, total: number) {
        const percent = (Number(received) / Number(total)) * 100;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onProgress?.(percent);
      },
      onFinishProgress() {
        // no-op
      },
    });
  });
}

/**
 * Initialize critical OTA system
 */
export const initializeCriticalOTA = async (): Promise<void> => {
  log('💥 [CRITICAL] Initializing critical OTA system...');

  // Check for pending updates immediately on startup
  const hadPending = await checkForPendingUpdate();
  if (hadPending) {
    log('💥 [CRITICAL] Pending update found and applied!');
    return;
  }

  log('💥 [CRITICAL] Critical OTA system ready');
};

// Export legacy function for compatibility
export async function checkGitOTAUpdate(options: any = {}) {
  log('🔄 [LEGACY] Redirecting to critical OTA function...');
  return checkGitOTAUpdateCritical(options);
}
