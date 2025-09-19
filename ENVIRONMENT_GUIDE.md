# Environment-Based OTA Configuration

This project now supports environment-based configuration for development and production builds.

## Environment Configuration

### Development Environment
- **API Base URL**: `https://api-dev.example.com` (dummy development API)
- **OTA Branch**: `development`
- **OTA Enabled**: `true`
- **Auto Restart**: `false` (manual restart for development)
- **Check Interval**: `30 seconds`

### Production Environment
- **API Base URL**: `https://api.example.com` (production API)
- **OTA Branch**: `production`
- **OTA Enabled**: `true`
- **Auto Restart**: `true` (automatic restart in production)
- **Check Interval**: `5 minutes`

## How It Works

### Automatic Environment Detection
The app automatically detects the environment using React Native's `__DEV__` flag:
- `__DEV__ === true` → Development configuration
- `__DEV__ === false` → Production configuration

### OTA Update Behavior

#### Development
- Uses `development` branch for OTA updates
- Checks for updates every 30 seconds
- Requires manual restart after update
- Shows environment indicator in UI

#### Production
- Uses `production` branch for OTA updates
- Checks for updates every 5 minutes
- Automatically restarts after update
- Optimized for user experience

### Automatic OTA Checking
The app automatically checks for OTA updates:
- On app startup
- When app comes to foreground
- Periodically based on environment settings
- When manually triggered

## File Structure

```
src/
├── config/
│   └── environment.ts       # Environment configuration
├── services/
│   └── api.ts              # Environment-aware API service
├── hooks/
│   └── useOTAManager.ts    # OTA management hook
└── utils/
    └── ota.ts              # Core OTA functionality
```

## Environment Files

- `.env` - Development environment variables
- `.env.production` - Production environment variables

## Scripts

### Development
```bash
npm run build:android:dev     # Build development APK
npm run bundle:android:dev    # Bundle for development
npm run ota:export:dev        # Export OTA bundle for development
npm run ota:deploy:dev        # Deploy to development branch
```

### Production
```bash
npm run build:android:prod    # Build production APK
npm run bundle:android:prod   # Bundle for production
npm run ota:export:prod       # Export OTA bundle for production
npm run ota:deploy:prod       # Deploy to production branch
```

## Branch Strategy

### Development Workflow
1. Make changes in feature branches
2. Merge to `development` branch
3. Run `npm run ota:deploy:dev` to deploy OTA update
4. Development builds automatically pick up updates

### Production Workflow
1. Merge stable code from `development` to `production` branch
2. Run `npm run ota:deploy:prod` to deploy OTA update
3. Production builds automatically pick up updates

## API Integration

The app includes an environment-aware API service:

```typescript
// Automatically uses correct API based on environment
const data = await ApiService.get('/users');
const user = await ApiService.post('/auth/login', credentials);
```

## Configuration Override

You can override configuration per environment by modifying:
- `src/config/environment.ts` - Main configuration
- `.env` and `.env.production` - Environment variables

## Testing

The app includes UI indicators showing:
- Current environment (Development/Production)
- API base URL being used
- OTA branch being monitored
- OTA enabled status

Manual OTA check button is available for testing updates in both environments.