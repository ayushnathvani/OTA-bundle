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
  Text,
} from 'react-native';
import { useState, useEffect } from 'react';
import DemoDynamicFormScreen from './src/screens/DemoDynamicFormScreen';
import { useOTAManager } from './src/hooks/useOTAManager';
import ApiService from './src/services/api';
import { Config } from './src/config/environment';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [_progress, _setProgress] = useState(0);
  const [apiData, setApiData] = useState<any>(null);
  const { checkForUpdates } = useOTAManager();

  useEffect(() => {
    // Example of environment-aware API call
    const fetchData = async () => {
      try {
        const data = await ApiService.get('/example');
        setApiData(data);
      } catch (error) {
        console.error('API call failed:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Environment indicator */}
      <View style={styles.environmentBar}>
        <Text style={styles.environmentText}>
          Environment: {__DEV__ ? 'Development' : 'Production'}
        </Text>
        <Text style={styles.environmentText}>
          API Base: {Config.API_BASE_URL}
        </Text>
        <Text style={styles.environmentText}>
          OTA Branch: {Config.OTA_BRANCH}
        </Text>
        <Text style={styles.environmentText}>
          OTA Enabled: {Config.OTA_ENABLED ? 'Yes' : 'No'}
        </Text>
      </View>

      <DemoDynamicFormScreen />

      {/* Manual OTA trigger for testing */}
      <View style={styles.otaBar}>
        <Button title="Manual OTA Check" onPress={() => checkForUpdates()} />

        {/* API test button */}
        <Button
          title="Test API Call"
          onPress={async () => {
            try {
              const data = await ApiService.get('/test');
              setApiData(data);
            } catch (error) {
              console.error('API test failed:', error);
            }
          }}
        />

        {apiData && (
          <Text style={styles.apiResult}>
            API Response: {JSON.stringify(apiData, null, 2)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  environmentBar: {
    backgroundColor: __DEV__ ? '#e8f5e8' : '#f5f5e8',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  environmentText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  otaBar: {
    padding: 12,
    gap: 8,
  },
  apiResult: {
    fontSize: 10,
    color: '#666',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
});

export default App;
