/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Button,
} from 'react-native';
import { useState } from 'react';
import { checkGitOTAUpdate } from './src/utils/ota';
import DemoDynamicFormScreen from './src/screens/DemoDynamicFormScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [progress, setProgress] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <DemoDynamicFormScreen />
      {/* Simple trigger to test OTA via Git in dev builds */}
      <View style={styles.otaBar}>
        <Button
          title={`Check OTA Update ${
            progress ? `(${progress.toFixed(0)}%)` : ''
          }`}
          onPress={() =>
            checkGitOTAUpdate({
              repoUrl: 'https://github.com/ayushnathvani/OTA-bundle.git',
              onProgress: setProgress,
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  otaBar: {
    padding: 12,
  },
});

export default App;
