export const env = {
  API_URL: 'http://localhost:3000',
};

export const getEnv = (name: string): string => {
  const envVars: Record<string, string> = {
    VITE_API_URL: 'http://localhost:3000',
  };
  if (!envVars[name]) {
    throw new Error(`Environment variable not found: ${name}`);
  }
  return envVars[name];
};
