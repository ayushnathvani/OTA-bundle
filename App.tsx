/**
 * Sample React Native App
 * https://github.com/facebook/react-nativ        <Text style={styles.otaTestTitle}>🚀 OTA FIXED v2.0 🚀</Text>
        <Text style={styles.otaTestSubtitle}>
          Updated: {new Date().toLocaleString()}
        </Text>
        <Text style={styles.otaTestSubtitle}>
          ✅ OTA now works WITHOUT clearing user data!
        </Text>
        <Text style={styles.otaTestSubtitle}>
          ✅ Smart periodic checking enabled!
        </Text>
        <Text style={styles.otaTestSubtitle}>
          Uses bundle hash comparison + automatic background checks.
        </Text>ormat
 */

import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Button,
  Text,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import DemoDynamicFormScreen from './src/screens/DemoDynamicFormScreen';
import { useOTAManager } from './src/hooks/useOTAManager';
import ApiService from './src/services/api';
import { Config } from './src/config/environment';
import { useLogs, log } from './src/utils/logger';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [_progress, _setProgress] = useState(0);
  const [apiData, setApiData] = useState<any>(null);
  const [otaStatus, setOtaStatus] = useState<string>('Initializing...');
  const { checkForUpdates, getStatus, clearOTACache } = useOTAManager();
  const logs = useLogs();

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
        <Text style={styles.otaTestTitle}>� OTA IMPROVED v1.5 �</Text>
        <Text style={styles.otaTestSubtitle}>
          Updated: {new Date().toLocaleString()}
        </Text>
        <Text style={styles.otaTestSubtitle}>
          ✅ OTA now works WITHOUT clearing user data!
        </Text>
        <Text style={styles.otaTestSubtitle}>
          Uses smart bundle hash comparison instead of cache clearing.
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

      {/* Log Viewer */}
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>OTA Logs</Text>
        <ScrollView style={styles.logScrollView}>
          {logs.map((logMessage, index) => (
            <Text key={index} style={styles.logText}>
              {logMessage}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* Manual OTA trigger for testing */}
      <View style={styles.otaBar}>
        <Button
          title="Manual OTA Check"
          onPress={() => checkForUpdates()} // Manual check
        />
        <Button
          title="Clear OTA Cache"
          onPress={async () => {
            log('🗑️ Manually clearing OTA cache...');
            await clearOTACache();
            log('✅ OTA cache cleared.');
          }}
          color="#ff6347" // A nice red color for a destructive action
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
  logContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logScrollView: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 8,
  },
  logText: {
    fontSize: 10,
    fontFamily: 'monospace',
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
