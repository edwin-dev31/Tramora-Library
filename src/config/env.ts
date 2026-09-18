const required = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`❌ Environment variable not found: ${name}`);
  }
  return value;
}

export const env = {
  GOOGLE_API_URL: required("VITE_GOOGLE_API_URL", import.meta.env.VITE_GOOGLE_API_URL),
  GOOGLE_BOOKS_KEY: required("VITE_GOOGLE_BOOKS_KEY", import.meta.env.VITE_GOOGLE_BOOKS_KEY),
};