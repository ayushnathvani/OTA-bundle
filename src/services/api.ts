import { Config } from '../config/environment';

// API service with environment-based URLs
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = Config.API_BASE_URL;
  }

  // Generic API call method
  async makeRequest(endpoint: string, options: RequestInit = {}) {
    // Check if API is enabled
    if (!Config.API_ENABLED) {
      console.log('API calls disabled in this environment');
      return {
        message: 'API calls disabled',
        environment: Config.ENVIRONMENT,
        endpoint,
      };
    }

    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      // Add any auth headers here
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        console.warn(
          `API request failed: ${response.status} - ${response.statusText}`,
        );
        // Return a mock response instead of throwing for demo purposes
        return {
          error: true,
          status: response.status,
          message: `API Error: ${response.statusText}`,
          environment: Config.ENVIRONMENT,
          url,
        };
      }

      const data = await response.json();
      console.log('API request successful:', data);
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      // Return a mock response instead of throwing for demo purposes
      return {
        error: true,
        message: `Network Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        environment: Config.ENVIRONMENT,
        url,
      };
    }
  }

  // Convenience methods for common HTTP verbs
  async get(endpoint: string) {
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }

  // Example API methods
  async getUser(userId: string) {
    return this.makeRequest(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: any) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Get current environment info
  getEnvironmentInfo() {
    return {
      environment: Config.ENVIRONMENT,
      apiBaseUrl: Config.API_BASE_URL,
      otaBranch: Config.OTA_BRANCH,
    };
  }
}

export default new ApiService();
