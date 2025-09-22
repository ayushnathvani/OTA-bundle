# Complete Environment & OTA Testing Guide

## 🎯 **Three-Environment Setup**

### **1. Development** 🔧
- **Environment**: `development`
- **OTA**: ✅ **Enabled** (30 second checks)
- **Branch**: `development` 
- **API**: JSONPlaceholder (working test API)
- **Build**: `npm run build:android:dev` or `npm run build:ios:dev`

### **2. Staging** 🧪
- **Environment**: `staging`
- **OTA**: 🚫 **DISABLED** (no automatic updates)
- **Branch**: `staging`
- **API**: JSONPlaceholder (same as prod for testing)
- **Build**: `npm run build:android:staging` or `npm run build:ios:staging`

### **3. Production** 🚀
- **Environment**: `production`
- **OTA**: ✅ **Enabled** (5 minute checks)
- **Branch**: `production`
- **API**: JSONPlaceholder (production APIs)
- **Build**: `npm run build:android:prod` or `npm run build:ios:prod`

## 📱 **Android & iOS Build Commands**

### **Android Builds**
```bash
# Development APK (debug)
npm run build:android:dev

# Staging APK (release, OTA disabled)
npm run build:android:staging
# Creates: android/app/build/outputs/apk/release/app-staging.apk

# Production APK (release, OTA enabled)  
npm run build:android:prod
# Creates: android/app/build/outputs/apk/release/app-release.apk
```

### **iOS Builds**
```bash
# Development build
npm run build:ios:dev

# Staging build (OTA disabled)
npm run build:ios:staging

# Production build (OTA enabled)
npm run build:ios:prod
```

### **Alternative: Direct Build Script**
```bash
# Android
./scripts/build.sh android staging
./scripts/build.sh android prod

# iOS  
./scripts/build.sh ios staging
./scripts/build.sh ios prod
```

## 🔄 **OTA Bundle Deployment**

### **Android OTA**
```bash
npm run ota:export:dev          # Export to development branch
npm run ota:export:staging      # Export to staging (no OTA)
npm run ota:export:prod         # Export to production branch

npm run ota:deploy:dev          # Deploy OTA to development
npm run ota:deploy:staging      # Deploy to staging (manual installs only)
npm run ota:deploy:prod         # Deploy OTA to production
```

### **iOS OTA**
```bash
npm run ota:export:ios:dev      # Export iOS bundle for development
npm run ota:export:ios:staging  # Export iOS bundle for staging
npm run ota:export:ios:prod     # Export iOS bundle for production
```

## 🧪 **Testing Workflow**

### **Step 1: Build Staging App**
```bash
# Android
npm run build:android:staging

# iOS
npm run build:ios:staging
```

**Expected Result**: 
- App shows `Environment: STAGING`
- Shows `⚠️ STAGING: OTA Updates Disabled for Testing`
- API calls work with JSONPlaceholder
- **No OTA updates** will occur

### **Step 2: Test API Functionality**
- Tap "Test Real API (JSONPlaceholder)" button
- Should see API response with real data
- No "NotFound" errors since we're using working APIs

### **Step 3: Deploy OTA Update**
```bash
# Create OTA bundle for production
npm run ota:deploy:prod
```

### **Step 4: Test Production App**
```bash
# Build production app
npm run build:android:prod

# Install production APK
# Should show: Environment: PRODUCTION
# Should show: OTA Enabled: Yes
# Will automatically receive OTA updates from production branch
```

## 🎨 **Environment Visual Indicators**

### **Development**
```
🚀 OTA UPDATE TEST v2.3 🚀
Environment: DEVELOPMENT
API Base: https://jsonplaceholder.typicode.com
OTA Branch: development
OTA Enabled: Yes
```

### **Staging**
```
🚀 OTA UPDATE TEST v2.3 🚀
Environment: STAGING
API Base: https://jsonplaceholder.typicode.com
OTA Branch: staging
OTA Enabled: No
⚠️ STAGING: OTA Updates Disabled for Testing
```

### **Production**
```
🚀 OTA UPDATE TEST v2.3 🚀
Environment: PRODUCTION
API Base: https://jsonplaceholder.typicode.com
OTA Branch: production
OTA Enabled: Yes
```

## 🔧 **Troubleshooting**

### **"NotFound" API Errors**
✅ **Fixed**: Now using JSONPlaceholder (`https://jsonplaceholder.typicode.com`) - a real working API

### **Environment Not Detected**
✅ **Fixed**: Added multiple detection methods:
- `process.env.NODE_ENV`
- `process.env.BUILD_VARIANT`
- Global variables `__STAGING__` and `__PRODUCTION__`

### **OTA Not Working**
- Check environment indicators in app UI
- Verify correct branch in OTA settings
- Check console logs for environment detection

## 🚀 **Production Deployment Workflow**

```bash
# 1. Development work
git checkout development
# Make changes, test with npm run build:android:dev

# 2. Create staging build for testing
npm run build:android:staging
# Install and test thoroughly - no OTA interference

# 3. Deploy to production
git checkout production
git merge staging
npm run ota:deploy:prod
# Production apps automatically receive update

# 4. iOS deployment
npm run ota:export:ios:prod
# Deploy iOS bundle to production branch
```

## ✅ **Success Checklist**

- [ ] Staging build shows "STAGING" environment
- [ ] Staging build shows "OTA Updates Disabled"
- [ ] API calls work without "NotFound" errors
- [ ] Production build shows "PRODUCTION" environment
- [ ] Production build shows "OTA Enabled: Yes"
- [ ] OTA updates work in production builds
- [ ] iOS builds work with same environment detection

Your complete three-environment OTA system is now ready for Android and iOS! 🎉