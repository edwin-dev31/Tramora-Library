declare global {
  interface Window {
    __APP_CONFIG__?: Record<string, string>;
  }
}

export const getEnv = (name: string): string => {
  const value = window.__APP_CONFIG__?.[name]
    ?? (import.meta.env.DEV ? import.meta.env[name] : undefined);
  if (!value) {
    throw new Error(`❌ Environment variable not found: ${name}`);
  }
  return value;
}

export const env = {
  GOOGLE_API_URL: getEnv("VITE_GOOGLE_API_URL"),
  GOOGLE_BOOKS_KEY: getEnv("VITE_GOOGLE_BOOKS_KEY"),
};
