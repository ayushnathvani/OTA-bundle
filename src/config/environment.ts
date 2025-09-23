import './globals';

interface EnvironmentConfig {
  API_BASE_URL: string;
  OTA_BRANCH: string;
  OTA_ENABLED: boolean;
  OTA_REPO_URL: string;
  OTA_CHECK_INTERVAL: number;
  OTA_AUTO_RESTART: boolean;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  API_ENABLED: boolean;
}

// Default development configuration
const developmentConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://jsonplaceholder.typicode.com',
  OTA_BRANCH: 'development',
  OTA_ENABLED: true,
  OTA_REPO_URL: 'https://github.com/ayushnathvani/OTA-bundle.git',
  OTA_CHECK_INTERVAL: 0, // Disabled periodic checks to prevent alert loops
  OTA_AUTO_RESTART: false, // Disabled auto-restart to prevent alert loops
  ENVIRONMENT: 'development',
  API_ENABLED: true,
};

// Staging configuration - OTA DISABLED for testing
const stagingConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://jsonplaceholder.typicode.com',
  OTA_BRANCH: 'staging',
  OTA_ENABLED: false, // 🚫 OTA DISABLED in staging
  OTA_REPO_URL: 'https://github.com/ayushnathvani/OTA-bundle.git',
  OTA_CHECK_INTERVAL: 0, // No automatic checks
  OTA_AUTO_RESTART: false,
  ENVIRONMENT: 'staging',
  API_ENABLED: true,
};

// Production configuration - OTA ENABLED
const productionConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://jsonplaceholder.typicode.com',
  OTA_BRANCH: 'production',
  OTA_ENABLED: true, // ✅ OTA ENABLED in production
  OTA_REPO_URL: 'https://github.com/ayushnathvani/OTA-bundle.git',
  OTA_CHECK_INTERVAL: 0, // Disabled periodic checks to prevent alert loops
  OTA_AUTO_RESTART: false, // Disabled auto-restart to prevent alert loops
  ENVIRONMENT: 'production',

  API_ENABLED: true,
};

// Determine environment - can be controlled via build flag or manual override
const getEnvironment = (): EnvironmentConfig => {
  // Check for staging environment using multiple methods
  const isStaging =
    (global as any).__STAGING__ ||
    process.env.NODE_ENV === 'staging' ||
    process.env.BUILD_VARIANT === 'staging';

  const isProduction =
    (global as any).__PRODUCTION__ || (!__DEV__ && !isStaging);

  console.log('Environment Detection:', {
    NODE_ENV: process.env.NODE_ENV,
    BUILD_VARIANT: process.env.BUILD_VARIANT,
    __DEV__: __DEV__,
    __STAGING__: (global as any).__STAGING__,
    __PRODUCTION__: (global as any).__PRODUCTION__,
    isStaging,
    isProduction,
  });

  if (isStaging) {
    console.log('✅ Using STAGING configuration - OTA DISABLED');
    return stagingConfig;
  }

  if (isProduction) {
    console.log('✅ Using PRODUCTION configuration - OTA ENABLED');
    return productionConfig;
  }

  console.log('✅ Using DEVELOPMENT configuration - OTA ENABLED');
  return developmentConfig;
};

// Export the appropriate config
export const Config: EnvironmentConfig = getEnvironment();

// Helper functions
export const isProduction = () => Config.ENVIRONMENT === 'production';
export const isStaging = () => Config.ENVIRONMENT === 'staging';
export const isDev = () => Config.ENVIRONMENT === 'development';

// API helper
export const getApiUrl = (endpoint: string) =>
  `${Config.API_BASE_URL}${endpoint}`;

export default Config;
