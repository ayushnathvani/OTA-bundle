# Staging Environment Workflow Guide

## 🎯 **Three-Environment Setup**

### **1. Development Environment**
- **Purpose**: Active development and testing
- **OTA**: ✅ Enabled (30 second checks)
- **Branch**: `development`
- **API**: Development/testing APIs
- **Build**: `npm run build:android:dev`

### **2. Staging Environment** 
- **Purpose**: Final testing before production (QA/UAT)
- **OTA**: 🚫 **DISABLED** - No automatic updates
- **Branch**: `staging`
- **API**: Staging/testing APIs
- **Build**: `npm run build:android:staging`

### **3. Production Environment**
- **Purpose**: Live production app
- **OTA**: ✅ Enabled (5 minute checks)
- **Branch**: `production`
- **API**: Production APIs
- **Build**: `npm run build:android:prod`

## 🔄 **Workflow Process**

### **Step 1: Development** 
```bash
# Work in development branch
git checkout development

# Make your changes
# Build and test
npm run build:android:dev

# Deploy to development for OTA testing
npm run ota:deploy:dev
```

### **Step 2: Staging Testing**
```bash
# Create staging branch (if not exists)
git checkout -b staging

# Merge development into staging
git merge development

# Build staging version (OTA DISABLED)
npm run build:android:staging

# Deploy to staging branch (no OTA updates)
npm run ota:deploy:staging

# Install staging APK on test devices
# Test thoroughly - no OTA updates will interfere
```

### **Step 3: Production Promotion**
```bash
# Only when staging is fully tested and approved
# Promote staging to production
npm run promote:staging-to-prod

# This will:
# 1. Switch to production branch
# 2. Merge staging changes
# 3. Build production bundle
# 4. Deploy OTA update to production apps
```

## 🏗️ **Build Commands**

### Development
```bash
npm run build:android:dev        # Debug build with OTA enabled
npm run ota:deploy:dev          # Deploy OTA to development branch
```

### Staging  
```bash
npm run build:android:staging    # Release build with OTA DISABLED
npm run ota:deploy:staging      # Deploy to staging (no OTA)
```

### Production
```bash
npm run build:android:prod       # Release build with OTA enabled
npm run ota:deploy:prod         # Deploy OTA to production branch
npm run promote:staging-to-prod # Full staging → production promotion
```

## 🎯 **Key Benefits**

### **Staging Environment Advantages:**
1. **No OTA Interference**: Test the exact build that will go to production
2. **Controlled Testing**: Manual app installs only
3. **Production-like**: Same build process as production but without OTA
4. **Quality Gate**: Final approval step before production

### **Production Safety:**
1. **Tested Code**: Only staging-approved code reaches production
2. **Automatic Updates**: Production apps get OTA updates automatically
3. **Quick Rollback**: Can revert to previous production branch if needed

## 🚨 **Environment Identification**

The app UI shows clear environment indicators:

### Development
```
Environment: DEVELOPMENT
OTA Enabled: Yes
```

### Staging  
```
Environment: STAGING
OTA Enabled: No
⚠️ STAGING: OTA Updates Disabled for Testing
```

### Production
```
Environment: PRODUCTION  
OTA Enabled: Yes
```

## 📱 **Testing Workflow**

### 1. **Development Testing**
- Install development build
- Make code changes
- Deploy OTA updates
- Verify updates are received automatically

### 2. **Staging Testing** 
- Install staging build with `npm run build:android:staging`
- Test all features thoroughly
- **No OTA updates** - test the exact production build
- Get QA/UAT approval

### 3. **Production Deployment**
- Run `npm run promote:staging-to-prod`
- Production apps automatically receive updates
- Monitor for issues

## 🔧 **Manual Environment Override**

You can force staging mode by setting environment variables:

```bash
NODE_ENV=staging BUILD_VARIANT=staging npm run build:android:staging
```

This ensures the app uses staging configuration even in release builds.

## 🏗️ **Branch Strategy**

```
development (OTA enabled) → staging (OTA disabled) → production (OTA enabled)
     ↓                          ↓                        ↓
   Dev APK                  Staging APK              Prod APK
   (Auto OTA)              (Manual only)            (Auto OTA)
```

This workflow ensures:
- ✅ Safe development with immediate OTA feedback
- ✅ Stable staging testing without OTA interference  
- ✅ Reliable production deployment with automatic updates