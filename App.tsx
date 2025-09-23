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
  const [otaStatus, setOtaStatus] = useState<string>('Initializing...');
  const { checkForUpdates, getStatus } = useOTAManager();

  useEffect(() => {
    // Update OTA status periodically
    const updateStatus = () => {
      const status = getStatus();
      const lastCheckStr = status.lastCheck
        ? `Last check: ${status.lastCheck.toLocaleTimeString()}`
        : 'No checks yet';

      if (!status.isEnabled) {
        setOtaStatus('OTA Disabled');
      } else {
        const intervalStr = `Every ${status.checkInterval / 1000}s`;
        setOtaStatus(`Auto-checking ${intervalStr} | ${lastCheckStr}`);
      }
    };

    // Update status immediately and then every 5 seconds
    updateStatus();
    const statusInterval = setInterval(updateStatus, 5000);

    // Example of environment-aware API call using a real working endpoint
    const fetchData = async () => {
      try {
        // Use a real API endpoint that works - JSONPlaceholder
        const data = await ApiService.get('/posts/1');
        setApiData(data);
      } catch (error) {
        console.error('API call failed:', error);
      }
    };

    fetchData();

    return () => clearInterval(statusInterval);
  }, [getStatus]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* OTA Update Test Banner - Very Visible! */}
      <View style={styles.otaTestBanner}>
        <Text style={styles.otaTestTitle}>✅ OTA UPDATE TEST v3.2 ✅</Text>
        <Text style={styles.otaTestSubtitle}>
          Updated: {new Date().toLocaleString()}
        </Text>
        <Text style={styles.otaTestSubtitle}>
          INCREMENTAL UPDATE FROM v3.0 to v3.2!
        </Text>
        <Text style={styles.otaTestSubtitle}>
          This confirms sequential updates work! 🚀
        </Text>
      </View>

      {/* Environment indicator */}
      <View style={styles.environmentBar}>
        <Text style={styles.environmentText}>
          Environment: {Config.ENVIRONMENT.toUpperCase()}
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
        <Text style={styles.environmentText}>Status: {otaStatus}</Text>
        {Config.ENVIRONMENT === 'staging' && (
          <Text style={styles.stagingWarning}>
            ⚠️ STAGING: OTA Updates Disabled for Testing
          </Text>
        )}
      </View>

      <DemoDynamicFormScreen />

      {/* Manual OTA trigger for testing */}
      <View style={styles.otaBar}>
        <Button
          title="Manual OTA Check"
          onPress={() => checkForUpdates(true)} // true = manual check (shows alerts)
        />

        {/* API test button */}
        <Button
          title="Test Real API (JSONPlaceholder)"
          onPress={async () => {
            try {
              // Test with a real working API endpoint
              const data = await ApiService.get('/posts/2');
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
  otaTestBanner: {
    backgroundColor: '#ff6b35',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#ff4500',
  },
  otaTestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  otaTestSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 2,
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
  stagingWarning: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: 'bold',
    marginTop: 4,
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
