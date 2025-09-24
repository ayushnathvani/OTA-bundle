# Testing Workflow Guide

## 🧪 **Complete Testing Strategy**

### **Step 1: Initial Setup**
```bash
# Build APKs from each branch for initial testing
git checkout staging
npm run build:android:staging      # Creates app-staging.apk

git checkout production  
npm run build:android:prod         # Creates app-release.apk

git checkout development
npm run build:android:dev          # Creates app-debug.apk
```

### **Step 2: Install and Verify**
```bash
# Install each APK on different devices/emulators
📱 Device 1: app-debug.apk (Development)
📱 Device 2: app-staging.apk (Staging) 
📱 Device 3: app-release.apk (Production)
```

**Expected Results:**
- Development: Shows "DEVELOPMENT" + OTA enabled
- Staging: Shows "STAGING" + OTA disabled + warning message
- Production: Shows "PRODUCTION" + OTA enabled

### **Step 3: Test OTA Updates**

#### **3A: Development OTA (Quick Testing)**
```bash
git checkout development
# Make UI changes (change version number, add text, etc.)
npm run ota:deploy:dev
# Development app will auto-update in ~30 seconds
```

#### **3B: Production OTA (Full Workflow)**
```bash
# 1. Make changes in development
git checkout development
# Edit App.tsx - change version to v2.4, add new features

# 2. Test in development first
npm run ota:deploy:dev
# Verify changes work in development app

# 3. Promote to staging for testing
git checkout staging
git merge development
npm run ota:deploy:staging
# Build new staging APK if needed for thorough testing

# 4. Promote to production
git checkout production
git merge staging
npm run ota:deploy:prod
# Production app will auto-update in ~5 minutes!
```

## 📋 **Quick Testing Commands**

### **Option A: APK Testing (Recommended for initial setup)**
```bash
# Build APKs from specific branches
./scripts/build.sh android staging    # Staging APK
./scripts/build.sh android prod       # Production APK

# Or use npm scripts:
npm run build:android:staging         # From staging branch
npm run build:android:prod           # From production branch
```

### **Option B: OTA Update Testing**
```bash
# Push code updates to trigger OTA
npm run ota:deploy:staging    # Updates staging branch
npm run ota:deploy:prod       # Updates production branch (triggers OTA)
```

## 🎯 **Best Practice Workflow**

### **For Initial Testing:**
1. **Build APKs** from each branch
2. **Install on devices** to verify environment detection
3. **Test basic functionality** without OTA

### **For OTA Testing:**
1. **Use development** for rapid OTA testing (30 seconds)
2. **Push to staging** for integration testing (no auto-OTA)
3. **Deploy to production** for final OTA validation (5 minutes)

### **For Production Deployment:**
1. **Test thoroughly in staging** (manual APK installs)
2. **Merge to production** when ready
3. **Deploy OTA** to update all production apps automatically

## 🔧 **Environment Detection Verification**

Each APK will show different environment info:

### **Development APK:**
```
Environment: DEVELOPMENT
OTA Branch: development
OTA Enabled: Yes
```

### **Staging APK:**
```
Environment: STAGING  
OTA Branch: staging
OTA Enabled: No
⚠️ STAGING: OTA Updates Disabled for Testing
```

### **Production APK:**
```
Environment: PRODUCTION
OTA Branch: production
OTA Enabled: Yes
```

## 💡 **Pro Tips**

1. **For Quick Testing**: Use development branch with frequent OTA updates
2. **For Thorough Testing**: Build staging APK and test manually
3. **For Production**: Only deploy to production branch when staging is fully tested
4. **For iOS**: Same workflow works with `npm run build:ios:staging` etc.

Choose the approach that fits your testing needs! 🚀