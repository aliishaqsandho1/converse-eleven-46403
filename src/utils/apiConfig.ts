const API_BASE_URL_KEY = 'ims_api_base_url';
const DEFAULT_BASE_URL = 'https://usmanhardware.site/wp-json/ims/v1';

export const apiConfig = {
  getBaseUrl: (): string => {
    return localStorage.getItem(API_BASE_URL_KEY) || DEFAULT_BASE_URL;
  },

  setBaseUrl: (url: string): void => {
    localStorage.setItem(API_BASE_URL_KEY, url);
  },

  removeBaseUrl: (): void => {
    localStorage.removeItem(API_BASE_URL_KEY);
  },

  resetToDefault: (): void => {
    localStorage.setItem(API_BASE_URL_KEY, DEFAULT_BASE_URL);
  }
};