declare global {
  interface Window {
    __APP_CONFIG__?: Record<string, string>;
  }
}

export const getEnv = (name: string): string => {
  const value = window.__APP_CONFIG__?.[name]
    ?? import.meta.env[name];
  if (!value) {
    throw new Error(`❌ Environment variable not found: ${name}`);
  }
  return value;
}

export const env = {
  API_URL: getEnv("VITE_API_URL"),
};
