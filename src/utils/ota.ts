import { Alert, LayoutAnimation, Platform } from 'react-native';

export async function checkGitOTAUpdate({
  repoUrl,
  iosBranch = 'iOS',
  androidBranch = 'android',
  bundlePathIOS = 'output/main.jsbundle',
  bundlePathAndroid = 'output/index.android.bundle',
  onProgress,
  restartAfterInstall = false,
}: {
  repoUrl: string;
  iosBranch?: string;
  androidBranch?: string;
  bundlePathIOS?: string;
  bundlePathAndroid?: string;
  onProgress?: (percent: number) => void;
  restartAfterInstall?: boolean;
}) {
  const hotUpdate = require('react-native-ota-hot-update').default;
  return new Promise<void>(resolve => {
    hotUpdate.git.checkForGitUpdate({
      url: repoUrl,
      branch: Platform.OS === 'ios' ? iosBranch : androidBranch,
      bundlePath: Platform.OS === 'ios' ? bundlePathIOS : bundlePathAndroid,
      restartAfterInstall,
      onCloneFailed(msg: string) {
        Alert.alert('Clone failed', msg);
        resolve();
      },
      onCloneSuccess() {
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
