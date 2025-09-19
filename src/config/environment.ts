interface EnvironmentConfig {
  API_BASE_URL: string;
  OTA_BRANCH: string;
  OTA_ENABLED: boolean;
  OTA_REPO_URL: string;
  OTA_CHECK_INTERVAL: number;
  OTA_AUTO_RESTART: boolean;
  ENVIRONMENT: 'development' | 'production';
  API_ENABLED: boolean; // Add flag to disable API calls for testing
}

// Default development configuration
const developmentConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://jsonplaceholder.typicode.com', // Real API for testing
  OTA_BRANCH: 'development',
  OTA_ENABLED: true,
  OTA_REPO_URL: 'https://github.com/ayushnathvani/OTA-bundle.git',
  OTA_CHECK_INTERVAL: 30000, // 30 seconds for development
  OTA_AUTO_RESTART: false,
  ENVIRONMENT: 'development',
  API_ENABLED: true,
};

// Production configuration
const productionConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://jsonplaceholder.typicode.com', // Real working API for testing
  OTA_BRANCH: 'development', // Use development branch for now since we're testing
  OTA_ENABLED: true,
  OTA_REPO_URL: 'https://github.com/ayushnathvani/OTA-bundle.git',
  OTA_CHECK_INTERVAL: 300000, // 5 minutes
  OTA_AUTO_RESTART: true,
  ENVIRONMENT: 'production',
  API_ENABLED: true, // Enable API calls with working endpoints
};

// Determine environment based on __DEV__ flag
const isDevelopment = __DEV__;

// Export the appropriate config
export const Config: EnvironmentConfig = isDevelopment
  ? developmentConfig
  : productionConfig;

// Helper functions
export const isProduction = () => Config.ENVIRONMENT === 'production';
export const isDev = () => Config.ENVIRONMENT === 'development';

// API helper
export const getApiUrl = (endpoint: string) =>
  `${Config.API_BASE_URL}${endpoint}`;

export default Config;
