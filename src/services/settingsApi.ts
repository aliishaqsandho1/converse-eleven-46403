import { apiConfig } from '@/utils/apiConfig';

export interface SettingsData {
  profile: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  store: {
    name: string;
    address: string;
    currency: string;
    taxRate: number;
    lowStockThreshold: number;
    openTime: string;
    closeTime: string;
  };
  notifications: {
    newOrder: boolean;
    lowStock: boolean;
    paymentDue: boolean;
    dailyTarget: boolean;
  };
  system: {
    autoBackup: boolean;
    dataRetention: number;
    cacheEnabled: boolean;
    darkMode: boolean;
  };
}

export interface SettingsResponse {
  success: boolean;
  data: SettingsData;
}

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${apiConfig.getBaseUrl()}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Settings API request failed:', error);
    throw error;
  }
};

export const settingsApi = {
  getSettings: async () => {
    const response = await apiRequest<{ success: boolean; data: any }>('/settings');
    // Transform the API response to match our interface
    return {
      success: response.success,
      data: {
        ...response.data,
        store: response.data.groups || response.data.store
      }
    };
  },
  
  updateSettings: (settings: Partial<SettingsData>) =>
    apiRequest<{ success: boolean; message: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};
