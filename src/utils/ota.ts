import { Alert, LayoutAnimation, Platform } from 'react-native';

export async function checkGitOTAUpdate({
  repoUrl,
  iosBranch = 'iOS',
  androidBranch = 'android',
  bundlePathIOS = 'ios/output/main.jsbundle',
  bundlePathAndroid = 'android/output/index.android.bundle',
  folderName = '/src',
  authorName = 'ayushnathvani',
  authorEmail = 'ayushn.itpathsolutions@gmail.com',
  onProgress,
  restartAfterInstall = false,
}: {
  repoUrl: string;
  iosBranch?: string;
  androidBranch?: string;
  bundlePathIOS?: string;
  bundlePathAndroid?: string;
  folderName?: string;
  authorName?: string;
  authorEmail?: string;
  onProgress?: (percent: number) => void;
  restartAfterInstall?: boolean;
}) {
  const hotUpdate = require('react-native-ota-hot-update').default;
  return new Promise<void>(async resolve => {
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
      const ts = Date.now();
      const dest = abs.endsWith('.bundle')
        ? abs.replace(/\.bundle$/, `.${ts}.bundle`)
        : `${abs}.${ts}.bundle`;
      try {
        await RNFS.copyFile(abs, dest);
        // Point to the unique file name so Hermes doesn't reuse bytecode cache
        const ok = await hotUpdate.setupExactBundlePath(dest);
        if (ok) {
          await hotUpdate.setCurrentVersion(ts);
          return true;
        }
      } catch (e) {}
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
        Alert.alert('Clone failed', msg);
        resolve();
      },
      async onCloneSuccess() {
        try {
          hotUpdate.git.setConfig(folderName, {
            userName: 'user.name',
            email: authorName,
          });
          hotUpdate.git.setConfig(folderName, {
            userName: 'user.email',
            email: authorEmail,
          });
          await installVersionedBundle();
        } catch (e) {}
        Alert.alert('Update ready', 'Restart to apply changes', [
          { text: 'Later' },
          {
            text: 'Restart',
            onPress: () => hotUpdate.resetApp(),
          },
        ]);
        resolve();
      },
      onPullFailed(msg: string) {
        Alert.alert('Pull failed', msg);
        resolve();
      },
      async onPullSuccess() {
        try {
          await installVersionedBundle();
        } catch (e) {}
        Alert.alert('Update pulled', 'Restart to apply changes', [
          { text: 'Later' },
          {
            text: 'Restart',
            onPress: () => hotUpdate.resetApp(),
          },
        ]);
        resolve();
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
