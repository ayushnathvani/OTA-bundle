interface EnvironmentConfig {
  API_BASE_URL: string;
  OTA_BRANCH: string;
  OTA_ENABLED: boolean;
  OTA_REPO_URL: string;
  OTA_CHECK_INTERVAL: number;
  OTA_AUTO_RESTART: boolean;
  ENVIRONMENT: 'development' | 'production';
}

// Default development configuration
const developmentConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://dev-api.yourapp.com',
  OTA_BRANCH: 'development',
  OTA_ENABLED: true,
  OTA_REPO_URL: 'https://github.com/ayushnathvani/OTA-bundle.git',
  OTA_CHECK_INTERVAL: 300000, // 5 minutes
  OTA_AUTO_RESTART: false,
  ENVIRONMENT: 'development',
};

// Production configuration
const productionConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://api.yourapp.com',
  OTA_BRANCH: 'production',
  OTA_ENABLED: true,
  OTA_REPO_URL: 'https://github.com/ayushnathvani/OTA-bundle.git',
  OTA_CHECK_INTERVAL: 300000, // 5 minutes
  OTA_AUTO_RESTART: true,
  ENVIRONMENT: 'production',
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
