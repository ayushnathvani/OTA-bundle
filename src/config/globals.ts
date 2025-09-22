// Global environment flags for build-time environment detection
declare global {
  var __STAGING__: boolean | undefined;
  var __PRODUCTION__: boolean | undefined;
}

// Set global flags based on build environment
if (
  process.env.NODE_ENV === 'staging' ||
  process.env.BUILD_VARIANT === 'staging'
) {
  (global as any).__STAGING__ = true;
} else if (!__DEV__) {
  (global as any).__PRODUCTION__ = true;
}

export {};
