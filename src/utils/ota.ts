import { Alert, LayoutAnimation, Platform } from 'react-native';
import { Config } from '../config/environment';
import { log } from './logger';

// Track processed updates to avoid showing same alert multiple times
let lastProcessedBundleHash: string | null = null;
let isUpdateInProgress = false;

/**
 * Deletes the local OTA repository to force a clean clone.
 * This should only be used when manually requested, not on every startup.
 */
export const clearOTACache = async (folderName: string = '/src') => {
  try {
    const RNFS = require('react-native-fs');
    const repoDir = `${RNFS.DocumentDirectoryPath}${folderName}`;
    const dirExists = await RNFS.exists(repoDir);
    if (dirExists) {
      log(`🧹 Manually clearing OTA cache directory: ${repoDir}`);
      await RNFS.unlink(repoDir);
      log('✅ OTA cache cleared successfully - fresh clone will be performed');
      // Reset processed bundle hash so next check will show update
      lastProcessedBundleHash = null;
    } else {
      log('📦 No OTA cache found to clear');
    }
  } catch (e) {
    log(`❌ Failed to clear OTA cache: ${e}`);
  }
};

/**
 * Get MD5 hash of a bundle file to check if it's different
 */
const getBundleHash = async (filePath: string): Promise<string | null> => {
  try {
    const RNFS = require('react-native-fs');
    const content = await RNFS.readFile(filePath, 'utf8');
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (e) {
    log(`❌ Failed to get bundle hash: ${e}`);
    return null;
  }
};

export async function checkGitOTAUpdate({
  repoUrl = Config.OTA_REPO_URL,
  iosBranch = Config.OTA_BRANCH === 'development' ? 'iOS-dev' : 'iOS',
  androidBranch = Config.OTA_BRANCH,
  bundlePathIOS = 'ios/output/main.jsbundle',
  bundlePathAndroid = 'android/output/index.android.bundle',
  folderName = '/src',
  authorName = 'ayushnathvani',
  authorEmail = 'ayushn.itpathsolutions@gmail.com',
  onProgress,
  restartAfterInstall = false, // Changed to false by default to prevent auto-restart
  forceClearCache = true,
  silentCheck = false, // Add option for silent background checks
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
  forceClearCache?: boolean;
  silentCheck?: boolean;
} = {}) {
  const hotUpdate = require('react-native-ota-hot-update').default;

  // Check if OTA is enabled for current environment
  if (!Config.OTA_ENABLED) {
    log(`🚫 OTA check skipped - disabled in ${Config.ENVIRONMENT} environment`);
    if (!silentCheck) {
      Alert.alert(
        'OTA Disabled',
        `OTA updates are disabled in ${Config.ENVIRONMENT} environment`,
      );
    }
    return Promise.resolve();
  }

  // Prevent multiple simultaneous OTA checks
  if (isUpdateInProgress) {
    log('🚫 OTA check skipped - update already in progress');
    return Promise.resolve();
  }

  const branch = Platform.OS === 'ios' ? iosBranch : androidBranch;
  const bundlePath = Platform.OS === 'ios' ? bundlePathIOS : bundlePathAndroid;

  log(`🔍 Checking for OTA updates from ${branch} branch...`);
  log(`📁 Bundle path: ${bundlePath}`);
  log(`🌐 Repository: ${repoUrl}`);

  isUpdateInProgress = true;

  return new Promise<void>(async resolve => {
    const finishCheck = () => {
      isUpdateInProgress = false;
      resolve();
    };

    // Get current bundle version for logging
    const getCurrentVersion = async () => {
      try {
        const version = await hotUpdate.getCurrentVersion();
        log(`📦 Current version: ${version}`);
        return version;
      } catch (e) {
        log('📦 No current version found');
        return null;
      }
    };

    await getCurrentVersion(); // Log current version for debugging

    // Don't skip updates based on processed version - let bundle hash comparison handle it
    // This allows updates to work properly without clearing user data
    log('🔄 Checking for updates with smart bundle comparison');

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
      // ignore config errors; pull/clone may still proceed
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

      // Check if bundle file exists and has content
      try {
        const fileStats = await RNFS.stat(abs);
        if (!fileStats.isFile() || fileStats.size === 0) {
          log('📦 No new bundle found or bundle is empty');
          return false;
        }

        // Get bundle hash to check if it's different from current
        const bundleHash = await getBundleHash(abs);
        if (!bundleHash) {
          log('❌ Failed to get bundle hash');
          return false;
        }

        // Check if this bundle is different from last processed
        if (lastProcessedBundleHash === bundleHash) {
          log(`📦 Bundle unchanged - hash: ${bundleHash}`);
          return false;
        }

        log(`📦 New bundle detected - hash: ${bundleHash}`);
        log(`📦 Previous hash: ${lastProcessedBundleHash || 'none'}`);
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
        // Point to the unique file name so Hermes doesn't reuse bytecode cache
        const ok = await hotUpdate.setupExactBundlePath(dest);
        if (ok) {
          // Store bundle hash instead of timestamp for better tracking
          const bundleHash = await getBundleHash(abs);
          if (bundleHash) {
            await hotUpdate.setCurrentVersion(bundleHash);
            lastProcessedBundleHash = bundleHash; // Update processed hash
            log(`✅ New bundle installed with hash: ${bundleHash}`);

            // Force clear React Native caches only when installing new bundle
            if (forceClearCache) {
              try {
                // Clear Metro cache if available
                const globalAny = global as any;
                if (globalAny.__metro_global_prefix__) {
                  globalAny.__metro_global_prefix__ = undefined;
                }
                // Force garbage collection to clear cached modules
                if (globalAny.gc) {
                  globalAny.gc();
                }
                // Clear require cache for better module reloading
                if (globalAny.__r && globalAny.__r.clear) {
                  globalAny.__r.clear();
                }
                log('🧹 Cleared React Native module caches');
              } catch (e) {
                log(`⚠️ Cache clearing warning: ${e}`);
              }
            }

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
        log(`❌ Clone failed: ${msg}`);
        if (!silentCheck) {
          Alert.alert('Clone failed', msg);
        }
        finishCheck();
      },
      async onCloneSuccess() {
        log('✅ Clone successful - new repository cloned');
        try {
          hotUpdate.git.setConfig(folderName, {
            userName: 'user.name',
            email: authorName,
          });
          hotUpdate.git.setConfig(folderName, {
            userName: 'user.email',
            email: authorEmail,
          });
          const installed = await installVersionedBundle();
          if (installed) {
            log('🎉 New update available and installed!');
            Alert.alert('Update ready', 'Restart to apply changes', [
              { text: 'Later' },
              {
                text: 'Restart',
                onPress: () => hotUpdate.resetApp(),
              },
            ]);
          } else {
            log('ℹ️ No new update found during clone');
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
        log(`❌ Pull failed: ${msg}`);
        if (!silentCheck && !msg.includes('Already up to date')) {
          Alert.alert('Pull failed', msg);
        }
        finishCheck();
      },
      async onPullSuccess() {
        log('✅ Pull successful - checking for updates');
        try {
          const installed = await installVersionedBundle();
          if (installed) {
            log('🎉 New update found and installed!');
            Alert.alert('Update ready', 'Restart to apply changes', [
              { text: 'Later' },
              {
                text: 'Restart',
                onPress: () => hotUpdate.resetApp(),
              },
            ]);
          } else {
            log('ℹ️ No new updates available - already up to date');
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
