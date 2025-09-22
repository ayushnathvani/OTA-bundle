#!/bin/bash

# Build script for different environments

echo "🚀 Building React Native app for different environments"

build_android() {
    local env=$1
    echo "📱 Building Android for $env environment..."
    
    case $env in
        "dev")
            echo "🔧 Development build with OTA enabled"
            cd android && ./gradlew assembleDebug
            ;;
        "staging")
            echo "🧪 Staging build with OTA disabled"
            cd android && NODE_ENV=staging BUILD_VARIANT=staging ./gradlew assembleRelease
            # Rename APK for clarity
            cp app/build/outputs/apk/release/app-release.apk app/build/outputs/apk/release/app-staging.apk
            echo "✅ Staging APK created: android/app/build/outputs/apk/release/app-staging.apk"
            ;;
        "prod")
            echo "🚀 Production build with OTA enabled"
            cd android && ./gradlew assembleRelease
            echo "✅ Production APK created: android/app/build/outputs/apk/release/app-release.apk"
            ;;
        *)
            echo "❌ Invalid environment. Use: dev, staging, or prod"
            exit 1
            ;;
    esac
}

build_ios() {
    local env=$1
    echo "🍎 Building iOS for $env environment..."
    
    case $env in
        "dev")
            echo "🔧 Development build with OTA enabled"
            cd ios && xcodebuild -workspace dynamicform.xcworkspace -scheme dynamicform -configuration Debug -sdk iphonesimulator
            ;;
        "staging")
            echo "🧪 Staging build with OTA disabled"
            cd ios && NODE_ENV=staging BUILD_VARIANT=staging xcodebuild -workspace dynamicform.xcworkspace -scheme dynamicform -configuration Release
            ;;
        "prod")
            echo "🚀 Production build with OTA enabled"
            cd ios && xcodebuild -workspace dynamicform.xcworkspace -scheme dynamicform -configuration Release
            ;;
        *)
            echo "❌ Invalid environment. Use: dev, staging, or prod"
            exit 1
            ;;
    esac
}

# Main script
if [ $# -eq 0 ]; then
    echo "Usage: $0 <platform> <environment>"
    echo "Platform: android | ios"
    echo "Environment: dev | staging | prod"
    echo ""
    echo "Examples:"
    echo "  $0 android staging  # Build staging Android APK"
    echo "  $0 ios prod         # Build production iOS app"
    exit 1
fi

platform=$1
environment=$2

case $platform in
    "android")
        build_android $environment
        ;;
    "ios")
        build_ios $environment
        ;;
    *)
        echo "❌ Invalid platform. Use: android or ios"
        exit 1
        ;;
esac

echo "✅ Build completed for $platform $environment"