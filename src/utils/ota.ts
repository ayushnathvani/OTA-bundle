import { Alert, LayoutAnimation, Platform } from 'react-native';

export async function checkGitOTAUpdate({
  repoUrl,
  iosBranch = 'iOS',
  androidBranch = 'android',
  bundlePathIOS = 'output/main.jsbundle',
  bundlePathAndroid = 'output/index.android.bundle',
  folderName = '/git_hot_update',
  authorName = 'OTA Bot',
  authorEmail = 'ota@example.com',
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
      onCloneSuccess() {
        try {
          hotUpdate.git.setConfig(folderName, {
            userName: 'user.name',
            email: authorName,
          });
          hotUpdate.git.setConfig(folderName, {
            userName: 'user.email',
            email: authorEmail,
          });
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
      onPullSuccess() {
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
