import { Alert, Platform } from 'react-native';
import { Config } from '../config/environment';
import { log } from './logger';

const RNFS = require('react-native-fs');
const hotUpdate = require('react-native-ota-hot-update').default;

let isUpdateInProgress = false;

/**
 * [FINAL SOLUTION] Resets the OTA state by deleting version-tracking files.
 * This is the key to solving the "only updates once" problem.
 */
const forceResetOTAState = async () => {
  log('💣 [FINAL] Forcing OTA state reset...');
  try {
    // These are the files the OTA library uses to track versions.
    // Deleting them makes the library think no update has ever been applied.
    const versionFile = `${RNFS.DocumentDirectoryPath}/rn_ota_version.txt`;
    const otaDir = `${RNFS.DocumentDirectoryPath}/src`;

    const versionFileExists = await RNFS.exists(versionFile);
    if (versionFileExists) {
      await RNFS.unlink(versionFile);
      log('💣 [FINAL] Deleted version file: rn_ota_version.txt');
    }

    const otaDirExists = await RNFS.exists(otaDir);
    if (otaDirExists) {
      await RNFS.unlink(otaDir);
      log('💣 [FINAL] Deleted OTA directory: /src');
    }

    // Also reset the library's internal state for good measure.
    await hotUpdate.setCurrentVersion('0.0.0');
    log('💣 [FINAL] OTA state reset complete.');
  } catch (error) {
    log(`❌ [FINAL] Error resetting OTA state: ${error}`);
  }
};

/**
 * [FINAL SOLUTION] The main update function.
 */
export const finalOTAUpdate = async ({
  onProgress,
}: {
  onProgress?: (percent: number) => void;
} = {}) => {
  if (!Config.OTA_ENABLED) {
    log(`🚫 [FINAL] OTA is disabled in ${Config.ENVIRONMENT}.`);
    return;
  }

  if (isUpdateInProgress) {
    log('⏳ [FINAL] Update check already in progress.');
    return;
  }

  isUpdateInProgress = true;
  log('🚀 [FINAL] Starting Final Solution OTA check...');

  try {
    // STEP 1: Nuke the previous state BEFORE checking for an update.
    await forceResetOTAState();

    // A small delay to ensure file operations are complete.
    await new Promise(resolve => setTimeout(resolve, 500));

    // STEP 2: Proceed with the update check.
    const branch = Platform.OS === 'ios' ? 'iOS' : Config.OTA_BRANCH;
    const bundlePath =
      Platform.OS === 'ios'
        ? 'ios/output/main.jsbundle'
        : 'android/output/index.android.bundle';

    await hotUpdate.git.checkForGitUpdate({
      url: Config.OTA_REPO_URL,
      branch,
      bundlePath,
      folderName: '/src',
      onProgress: (received: number, total: number) => {
        const percent = (received / total) * 100;
        onProgress?.(percent);
      },
      onPullSuccess: async () => {
        log('✅ [FINAL] Pull successful. New bundle downloaded.');

        // The library should handle the switch automatically now that we've reset the state.
        Alert.alert(
          'Update Ready',
          'A new update has been downloaded. Please restart the app to apply it.',
          [{ text: 'OK' }],
        );

        // We will apply it manually via a button press.
      },
      onCloneSuccess: () => {
        log('✅ [FINAL] Clone successful. Ready for future updates.');
      },
      onPullFailed: (msg: string) => {
        log(`ℹ️ [FINAL] Pull failed (likely no new updates): ${msg}`);
      },
      onCloneFailed: (msg: string) => {
        log(`❌ [FINAL] Clone failed: ${msg}`);
      },
    });
  } catch (error) {
    log(`❌ [FINAL] OTA update process failed: ${error}`);
    Alert.alert('Error', 'An error occurred during the OTA update.');
  } finally {
    isUpdateInProgress = false;
    log('🏁 [FINAL] Final Solution OTA check finished.');
  }
};

/**
 * [FINAL SOLUTION] Applies the downloaded update and restarts the app.
 */
export const finalApplyUpdate = () => {
  log('🔄 [FINAL] Applying update and restarting...');
  Alert.alert(
    'Restarting App',
    'The app will now restart to apply the update.',
    [
      {
        text: 'Restart',
        onPress: () => {
          // This is the command that tells the app to load the new bundle on next start.
          hotUpdate.switchVersion();
        },
      },
    ],
    { cancelable: false },
  );
};

/**
 * [FINAL SOLUTION] A simple function to clear cache for testing.
 */
export const finalClearCache = async () => {
  await forceResetOTAState();
  Alert.alert('Cache Cleared', 'The OTA state has been reset.');
};
