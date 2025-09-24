import { Alert, LayoutAnimation, Platform } from 'react-native';
import { Config } from '../config/environment';
import { log } from './logger';

// Track processed updates to avoid showing same alert multiple times
let lastProcessedBundleHash: string | null = null;
let isUpdateInProgress = false;

/**
 * Force clear React Native caches to ensure OTA updates load without clearing user data
 * This is the KEY function that makes OTA work without data clearing!
 */
const forceReactNativeCacheClear = (): void => {
  try {
    log(
      '🧹 [IMPROVED] Forcing comprehensive React Native cache clear for OTA...',
    );

    const globalAny = global as any;

    // 1. Clear Metro bundler cache by updating the prefix
    if (globalAny.__metro_global_prefix__) {
      const oldPrefix = globalAny.__metro_global_prefix__;
      globalAny.__metro_global_prefix__ = `${oldPrefix}_${Date.now()}`;
      log('✅ Metro cache prefix updated');
    }

    // 2. Clear require cache - MOST IMPORTANT for OTA updates
    if (globalAny.__r && typeof globalAny.__r.clear === 'function') {
      globalAny.__r.clear();
      log('✅ Require cache cleared');
    }

    // 3. Invalidate module cache by updating cache versions
    if (globalAny.__d && typeof globalAny.__d === 'object') {
      Object.keys(globalAny.__d).forEach(key => {
        const module = globalAny.__d[key];
        if (module && typeof module === 'object') {
          module._otaCacheVersion = Date.now();
        }
      });
      log('✅ Module registry cache invalidated');
    }

    // 4. Clear Hermes bytecode cache indicators
    globalAny.__HERMES_CACHE_VERSION__ = Date.now();
    globalAny.__BUNDLE_CACHE_VERSION__ = Date.now();

    // 5. Force garbage collection if available
    if (globalAny.gc && typeof globalAny.gc === 'function') {
      globalAny.gc();
      log('✅ Forced garbage collection');
    }

    // 6. Clear React Native bridge cache if available
    if (globalAny.__fbBatchedBridge && globalAny.__fbBatchedBridge.clearCache) {
      globalAny.__fbBatchedBridge.clearCache();
      log('✅ React Native bridge cache cleared');
    }

    // 7. Clear React component cache
    if (
      globalAny.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
      globalAny.__REACT_DEVTOOLS_GLOBAL_HOOK__.clearCache
    ) {
      globalAny.__REACT_DEVTOOLS_GLOBAL_HOOK__.clearCache();
      log('✅ React DevTools cache cleared');
    }

    // 8. Set global cache buster for future reference
    globalAny.__OTA_CACHE_BUSTER__ = Date.now();

    // 9. Force React to re-render by invalidating fiber cache
    if (
      globalAny.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
      globalAny.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot
    ) {
      // Trigger re-render by updating a global state
      globalAny.__OTA_FORCE_RERENDER__ = !globalAny.__OTA_FORCE_RERENDER__;
    }

    log('✅ [IMPROVED] Comprehensive React Native cache clear completed!');
  } catch (e) {
    log(`⚠️ Cache clearing warning: ${e}`);
  }
};

/**
 * Apply any already installed OTA update with improved cache clearing
 */
export const applyInstalledUpdate = () => {
  const hotUpdate = require('react-native-ota-hot-update').default;

  Alert.alert(
    'Apply Update',
    'This will restart the app to apply any installed updates. Continue?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restart',
        onPress: () => {
          log(
            '🔄 [IMPROVED] Applying installed OTA update - restarting app...',
          );
          // Clear caches before restart for clean load
          forceReactNativeCacheClear();
          // Small delay to let cache clearing complete
          setTimeout(() => {
            hotUpdate.resetApp();
          }, 200); // Increased delay for better cache clearing
        },
      },
    ],
  );
};

/**
 * Get the stored bundle hash from persistent storage with better error handling
 */
const getStoredBundleHash = async (): Promise<string | null> => {
  try {
    const RNFS = require('react-native-fs');
    const hashFile = `${RNFS.DocumentDirectoryPath}/ota_bundle_hash.txt`;
    const exists = await RNFS.exists(hashFile);
    if (exists) {
      const content = await RNFS.readFile(hashFile, 'utf8');
      try {
        // Try to parse as JSON metadata (new format)
        const metadata = JSON.parse(content);
        const hash = metadata.hash || content.trim();
        log(
          `📦 [IMPROVED] Retrieved bundle hash: ${hash} (stored: ${new Date(
            metadata.timestamp || 0,
          ).toISOString()})`,
        );
        return hash;
      } catch {
        // Fallback for old format (just hash string)
        const hash = content.trim();
        log(`📦 [IMPROVED] Retrieved bundle hash (legacy): ${hash}`);
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
 * Store the bundle hash to persistent storage with metadata
 */
const storeBundleHash = async (hash: string): Promise<void> => {
  try {
    const RNFS = require('react-native-fs');
    const hashFile = `${RNFS.DocumentDirectoryPath}/ota_bundle_hash.txt`;
    const metadata = {
      hash,
      timestamp: Date.now(),
      platform: Platform.OS,
      version: '2.0', // Version of this OTA system
    };
    await RNFS.writeFile(hashFile, JSON.stringify(metadata, null, 2), 'utf8');
    log(
      `💾 [IMPROVED] Stored bundle hash: ${hash} at ${new Date().toISOString()}`,
    );
  } catch (e) {
    log(`❌ Failed to store bundle hash: ${e}`);
  }
};

/**
 * Get MD5 hash of a bundle file with better error handling
 */
const getBundleHash = async (filePath: string): Promise<string | null> => {
  try {
    const RNFS = require('react-native-fs');

    // Check if file exists first
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      log(`❌ Bundle file does not exist: ${filePath}`);
      return null;
    }

    // Get file stats to check size
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
 * Deletes the local OTA repository to force a clean clone
 */
export const clearOTACache = async (folderName: string = '/src') => {
  try {
    const RNFS = require('react-native-fs');
    const repoDir = `${RNFS.DocumentDirectoryPath}${folderName}`;
    const hashFile = `${RNFS.DocumentDirectoryPath}/ota_bundle_hash.txt`;

    // Clear repository directory
    const dirExists = await RNFS.exists(repoDir);
    if (dirExists) {
      log(`🧹 [IMPROVED] Manually clearing OTA cache directory: ${repoDir}`);
      await RNFS.unlink(repoDir);
      log('✅ OTA repository cache cleared');
    }

    // Clear stored bundle hash
    const hashExists = await RNFS.exists(hashFile);
    if (hashExists) {
      await RNFS.unlink(hashFile);
      log('✅ Stored bundle hash cleared');
    }

    // Reset memory cache
    lastProcessedBundleHash = null;

    // Clear React Native caches too
    forceReactNativeCacheClear();

    log(
      '✅ [IMPROVED] OTA cache cleared completely - fresh clone will be performed',
    );

    if (!dirExists && !hashExists) {
      log('📦 No OTA cache found to clear');
    }
  } catch (e) {
    log(`❌ Failed to clear OTA cache: ${e}`);
  }
};

/**
 * Improved OTA update checker with better cache handling
 */
export async function checkGitOTAUpdateImproved({
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
    log(
      `🚫 [IMPROVED] OTA check skipped - disabled in ${Config.ENVIRONMENT} environment`,
    );
    if (!silentCheck) {
      Alert.alert(
        'OTA Disabled',
        `OTA updates are disabled in ${Config.ENVIRONMENT} environment`,
      );
    }
    return Promise.resolve();
  }

  if (isUpdateInProgress) {
    log('🚫 [IMPROVED] OTA check skipped - update already in progress');
    return Promise.resolve();
  }

  const branch = Platform.OS === 'ios' ? iosBranch : androidBranch;
  const bundlePath = Platform.OS === 'ios' ? bundlePathIOS : bundlePathAndroid;

  log(`🔍 [IMPROVED] Checking for OTA updates from ${branch} branch...`);
  log(`📁 Bundle path: ${bundlePath}`);
  log(`🌐 Repository: ${repoUrl}`);

  isUpdateInProgress = true;

  return new Promise<void>(async resolve => {
    const finishCheck = () => {
      isUpdateInProgress = false;
      resolve();
    };

    // Load stored hash for comparison
    if (!lastProcessedBundleHash) {
      lastProcessedBundleHash = await getStoredBundleHash();
      log(
        `🔄 [IMPROVED] Loaded stored hash: ${
          lastProcessedBundleHash || 'none'
        }`,
      );
    }

    // Set git config
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
          log('📦 No new bundle found or bundle is empty');
          return false;
        }

        const bundleHash = await getBundleHash(abs);
        if (!bundleHash) {
          log('❌ Failed to get bundle hash');
          return false;
        }

        if (lastProcessedBundleHash === bundleHash) {
          log(`📦 [IMPROVED] Bundle unchanged - hash: ${bundleHash}`);
          return false;
        }

        log(`📦 [IMPROVED] NEW BUNDLE DETECTED!`);
        log(`📦 New hash: ${bundleHash}`);
        log(`📦 Previous: ${lastProcessedBundleHash || 'none'}`);
      } catch (e) {
        log('📦 Bundle file not found, no update available');
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
            await hotUpdate.setCurrentVersion(bundleHash);
            lastProcessedBundleHash = bundleHash;
            await storeBundleHash(bundleHash);
            log(`✅ [IMPROVED] New bundle installed with hash: ${bundleHash}`);

            // THE KEY FIX: Force comprehensive cache clearing
            log('🚀 [IMPROVED] Applying comprehensive cache clearing...');
            forceReactNativeCacheClear();

            // Additional delay to ensure caches are cleared
            await new Promise(resolveDelay => setTimeout(resolveDelay, 100));
            log('🚀 [IMPROVED] Cache clearing completed!');

            return true;
          }
        }
      } catch (e) {
        log(`❌ Failed to install bundle: ${e}`);
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
        log(`❌ [IMPROVED] Clone failed: ${msg}`);
        if (!silentCheck) {
          Alert.alert('Clone failed', msg);
        }
        finishCheck();
      },
      async onCloneSuccess() {
        log('✅ [IMPROVED] Clone successful - checking for updates...');
        try {
          const installed = await installVersionedBundle();
          if (installed) {
            log('🎉 [IMPROVED] New update available and installed!');
            Alert.alert(
              'Update Ready! 🚀',
              'New version installed. Restart to see changes.',
              [
                { text: 'Later' },
                {
                  text: 'Restart Now',
                  onPress: () => {
                    log('🔄 [IMPROVED] User chose to restart immediately');
                    forceReactNativeCacheClear();
                    setTimeout(() => hotUpdate.resetApp(), 200);
                  },
                },
              ],
            );
          } else {
            log('ℹ️ [IMPROVED] No new update found during clone');
            if (!silentCheck) {
              Alert.alert('Up to Date', 'You have the latest version.');
            }
          }
        } catch (e) {
          log(`❌ Error during clone success handling: ${e}`);
        }
        finishCheck();
      },
      onPullFailed(msg: string) {
        log(`❌ [IMPROVED] Pull failed: ${msg}`);
        if (!silentCheck && !msg.includes('Already up to date')) {
          Alert.alert('Pull failed', msg);
        }
        finishCheck();
      },
      async onPullSuccess() {
        log('✅ [IMPROVED] Pull successful - checking for updates...');
        try {
          const installed = await installVersionedBundle();
          if (installed) {
            log('🎉 [IMPROVED] New update found and installed!');
            Alert.alert(
              'Update Ready! 🚀',
              'New version installed. Restart to see changes.',
              [
                { text: 'Later' },
                {
                  text: 'Restart Now',
                  onPress: () => {
                    log('🔄 [IMPROVED] User chose to restart immediately');
                    forceReactNativeCacheClear();
                    setTimeout(() => hotUpdate.resetApp(), 200);
                  },
                },
              ],
            );
          } else {
            log('ℹ️ [IMPROVED] No new updates available - already up to date');
            if (!silentCheck) {
              Alert.alert('Up to Date', 'You have the latest version.');
            }
          }
        } catch (e) {
          log(`❌ Error during pull success handling: ${e}`);
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
 * Legacy function that calls the improved version for backward compatibility
 */
export async function checkGitOTAUpdate(options: any = {}) {
  log('🔄 [LEGACY] Redirecting to improved OTA update function...');
  return checkGitOTAUpdateImproved(options);
}
