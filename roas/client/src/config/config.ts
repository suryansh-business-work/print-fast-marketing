interface IConfig {
  apiBaseUrl: string;
  googleMapsApiKey: string;
}

const config: IConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9003/api/v1',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
};

export default config;
