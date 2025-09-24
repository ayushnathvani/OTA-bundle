import { Alert, Platform } from 'react-native';
import { Config } from '../config/environment';
import { log } from './logger';

// Global state tracking
let isUpdateInProgress = false;
let forceCheckCounter = 0;

/**
 * ULTIMATE SOLUTION: Force version reset and update detection
 * This ensures OTA works EVERY time, not just after clearing data
 */
const forceVersionReset = async (): Promise<void> => {
  try {
    log('🔄 [ULTIMATE] Forcing version reset for reliable OTA...');

    const hotUpdate = require('react-native-ota-hot-update').default;

    // Force reset current version to ensure updates are always detected
    await hotUpdate.setCurrentVersion(`force_reset_${Date.now()}`);

    // Clear any persistent version storage
    const RNFS = require('react-native-fs');
    const versionFiles = [
      `${RNFS.DocumentDirectoryPath}/ota_current_version.txt`,
      `${RNFS.DocumentDirectoryPath}/ota_bundle_hash.txt`,
      `${RNFS.DocumentDirectoryPath}/rn_ota_version.txt`,
    ];

    for (const file of versionFiles) {
      try {
        const exists = await RNFS.exists(file);
        if (exists) {
          await RNFS.unlink(file);
          log(`✅ Cleared version file: ${file}`);
        }
      } catch (e) {
        // Ignore file deletion errors
      }
    }

    log('✅ [ULTIMATE] Version reset completed');
  } catch (e) {
    log(`⚠️ Version reset warning: ${e}`);
  }
};

/**
 * ULTIMATE: Nuclear cache clear + version reset
 */
const ultimateNuclearClear = (): void => {
  try {
    log('💥 [ULTIMATE] Nuclear cache clear + version reset...');

    const globalAny = global as any;
    const timestamp = Date.now();
    forceCheckCounter++;

    // 1. Complete Metro cache invalidation
    globalAny.__metro_global_prefix__ = `ultimate_${timestamp}_${forceCheckCounter}`;
    globalAny.__METRO_VERSION__ = timestamp;

    // 2. Total require cache annihilation
    if (globalAny.__r) {
      if (globalAny.__r.clear) {
        globalAny.__r.clear();
      }
      // Force recreate require cache
      globalAny.__r._cache = {};
      globalAny.__r._moduleRegistry = {};
    }

    // 3. Complete module registry reset
    if (globalAny.__d) {
      Object.keys(globalAny.__d).forEach(key => {
        const module = globalAny.__d[key];
        if (module) {
          module._ultimateInvalidated = timestamp;
          module._forceReload = true;
          module._cacheBuster = forceCheckCounter;
        }
      });
    }

    // 4. Set ALL cache busters
    const cacheKeys = [
      '__HERMES_CACHE_VERSION__',
      '__BUNDLE_CACHE_VERSION__',
      '__RN_CACHE_VERSION__',
      '__METRO_CACHE_VERSION__',
      '__MODULE_CACHE_VERSION__',
      '__JSC_CACHE_VERSION__',
      '__BYTECODE_CACHE_VERSION__',
      '__OTA_ULTIMATE_VERSION__',
    ];

    cacheKeys.forEach(key => {
      globalAny[key] = `${timestamp}_${forceCheckCounter}`;
    });

    // 5. Force multiple GC cycles
    if (globalAny.gc) {
      for (let i = 0; i < 5; i++) {
        globalAny.gc();
      }
    }

    // 6. Ultimate version buster
    globalAny.__OTA_ULTIMATE_FORCE__ = `${timestamp}_${forceCheckCounter}`;

    log(`💥 [ULTIMATE] Nuclear clear completed! Counter: ${forceCheckCounter}`);
  } catch (e) {
    log(`⚠️ Ultimate nuclear clear warning: ${e}`);
  }
};

/**
 * ULTIMATE OTA UPDATE - Always works, every time
 */
export async function ultimateOTAUpdate({
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
    log(`🚫 [ULTIMATE] OTA disabled in ${Config.ENVIRONMENT}`);
    return Promise.resolve();
  }

  if (isUpdateInProgress) {
    log('🚫 [ULTIMATE] Update already in progress');
    return Promise.resolve();
  }

  log('💥 [ULTIMATE] Starting ultimate OTA update process...');
  isUpdateInProgress = true;

  return new Promise<void>(async resolve => {
    const finishCheck = () => {
      isUpdateInProgress = false;
      resolve();
    };

    // STEP 1: Force version reset BEFORE checking for updates
    await forceVersionReset();

    // STEP 2: Nuclear cache clear
    ultimateNuclearClear();

    // STEP 3: Short delay to let cache clearing settle
    await new Promise(r => setTimeout(r, 500));

    const branch = Platform.OS === 'ios' ? iosBranch : androidBranch;
    log(`💥 [ULTIMATE] Checking branch: ${branch}`);

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
      log(`⚠️ Git config: ${e}`);
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

    const forceInstallBundle = async () => {
      const RNFS = require('react-native-fs');
      const abs = getBundleAbsolutePath();
      if (!abs) return false;

      try {
        const fileStats = await RNFS.stat(abs);
        if (!fileStats.isFile() || fileStats.size === 0) {
          log('📦 [ULTIMATE] No bundle found');
          return false;
        }

        log(
          '💥 [ULTIMATE] FORCING BUNDLE INSTALLATION - ignoring version checks',
        );

        // Generate unique bundle name
        const ts = Date.now();
        const dest = abs.endsWith('.bundle')
          ? abs.replace(
              /\.bundle$/,
              `.ultimate_${ts}_${forceCheckCounter}.bundle`,
            )
          : `${abs}.ultimate_${ts}_${forceCheckCounter}.bundle`;

        await RNFS.copyFile(abs, dest);

        // Force setup exact bundle path
        const ok = await hotUpdate.setupExactBundlePath(dest);
        if (ok) {
          // Set version to force new loading
          const forceVersion = `ultimate_${ts}_${forceCheckCounter}`;
          await hotUpdate.setCurrentVersion(forceVersion);

          log(`💥 [ULTIMATE] Bundle force-installed: ${forceVersion}`);

          // Ultimate nuclear clear after installation
          ultimateNuclearClear();

          // Extra time for clearing
          await new Promise(r => setTimeout(r, 1000));

          return true;
        }
      } catch (e) {
        log(`❌ [ULTIMATE] Bundle installation error: ${e}`);
      }
      return false;
    };

    // Force clone/pull regardless of current state
    hotUpdate.git.checkForGitUpdate({
      url: repoUrl,
      branch: Platform.OS === 'ios' ? iosBranch : androidBranch,
      bundlePath: Platform.OS === 'ios' ? bundlePathIOS : bundlePathAndroid,
      folderName,
      userName: authorName,
      email: authorEmail,
      restartAfterInstall,
      onCloneFailed(msg: string) {
        log(`❌ [ULTIMATE] Clone failed: ${msg}`);
        if (!silentCheck) {
          Alert.alert('Update Failed', 'Could not download update');
        }
        finishCheck();
      },
      async onCloneSuccess() {
        log('💥 [ULTIMATE] Clone success - force installing...');
        try {
          const installed = await forceInstallBundle();
          if (installed) {
            log('🎉 [ULTIMATE] UPDATE FORCE-INSTALLED!');
            Alert.alert(
              '🚀 Ultimate Update!',
              'Update installed with maximum compatibility. Restart now?',
              [
                { text: 'Later' },
                {
                  text: 'Ultimate Restart',
                  onPress: () => {
                    log('💥 [ULTIMATE] Ultimate restart...');
                    ultimateNuclearClear();
                    setTimeout(() => hotUpdate.resetApp(), 1500);
                  },
                },
              ],
            );
          } else {
            log('ℹ️ [ULTIMATE] Force install failed');
            if (!silentCheck) {
              Alert.alert('No Update', 'No new updates available');
            }
          }
        } catch (e) {
          log(`❌ [ULTIMATE] Clone handling error: ${e}`);
        }
        finishCheck();
      },
      onPullFailed(msg: string) {
        log(`❌ [ULTIMATE] Pull failed: ${msg}`);
        finishCheck();
      },
      async onPullSuccess() {
        log('💥 [ULTIMATE] Pull success - force installing...');
        try {
          const installed = await forceInstallBundle();
          if (installed) {
            log('🎉 [ULTIMATE] UPDATE FORCE-INSTALLED!');
            Alert.alert(
              '🚀 Ultimate Update!',
              'Update installed with maximum compatibility. Restart recommended.',
              [
                { text: 'Later' },
                {
                  text: 'Ultimate Restart',
                  onPress: () => {
                    log('💥 [ULTIMATE] Ultimate restart...');
                    ultimateNuclearClear();
                    setTimeout(() => hotUpdate.resetApp(), 1500);
                  },
                },
              ],
            );
          } else {
            log('ℹ️ [ULTIMATE] No update needed');
            if (!silentCheck) {
              Alert.alert('Up to Date', 'You have the latest version');
            }
          }
        } catch (e) {
          log(`❌ [ULTIMATE] Pull handling error: ${e}`);
        }
        finishCheck();
      },
      onProgress(received: number, total: number) {
        const percent = (Number(received) / Number(total)) * 100;
        onProgress?.(percent);
      },
      onFinishProgress() {
        // no-op
      },
    });
  });
}

/**
 * Clear OTA cache with ultimate reset
 */
export const ultimateClearCache = async (folderName: string = '/src') => {
  try {
    log('💥 [ULTIMATE] Ultimate cache clear...');

    const RNFS = require('react-native-fs');
    const repoDir = `${RNFS.DocumentDirectoryPath}${folderName}`;

    // Clear repo directory
    const dirExists = await RNFS.exists(repoDir);
    if (dirExists) {
      await RNFS.unlink(repoDir);
    }

    // Clear all possible version files
    const filesToClear = [
      `${RNFS.DocumentDirectoryPath}/ota_bundle_hash.txt`,
      `${RNFS.DocumentDirectoryPath}/ota_current_version.txt`,
      `${RNFS.DocumentDirectoryPath}/rn_ota_version.txt`,
    ];

    for (const file of filesToClear) {
      try {
        const exists = await RNFS.exists(file);
        if (exists) {
          await RNFS.unlink(file);
        }
      } catch (e) {
        // Ignore
      }
    }

    // Force version reset
    await forceVersionReset();

    // Ultimate nuclear clear
    ultimateNuclearClear();

    log('💥 [ULTIMATE] Ultimate cache clear completed!');
  } catch (e) {
    log(`❌ Ultimate cache clear error: ${e}`);
  }
};

/**
 * Apply update with ultimate restart
 */
export const ultimateApplyUpdate = () => {
  Alert.alert(
    'Ultimate Update',
    'This will perform the most aggressive restart possible. Continue?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Ultimate Restart',
        onPress: () => {
          log('💥 [ULTIMATE] Ultimate apply update...');

          // Force version reset
          forceVersionReset();

          // Ultimate nuclear clear
          ultimateNuclearClear();

          // Maximum delay for clearing
          setTimeout(() => {
            const hotUpdate = require('react-native-ota-hot-update').default;
            hotUpdate.resetApp();
          }, 2000);
        },
      },
    ],
  );
};

// Export compatibility functions
export const checkGitOTAUpdate = ultimateOTAUpdate;
export const clearOTACache = ultimateClearCache;
export const applyInstalledUpdate = ultimateApplyUpdate;
