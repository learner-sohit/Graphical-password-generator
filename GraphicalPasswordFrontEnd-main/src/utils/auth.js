export const normalizeEmail = (email) => email.trim().toLowerCase();

export const normalizeTheme = (theme) => theme.trim();

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));

export const extractErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data ||
  fallbackMessage;
