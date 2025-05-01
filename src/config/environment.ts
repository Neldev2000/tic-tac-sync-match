/**
 * Environment configuration for the application.
 * This allows switching between local Socket.io and Supabase for real-time features.
 */

// Safely get environment variables with defaults for Vite
const getEnv = (key: string, defaultValue: string): string => {
  // In Vite, environment variables are accessed via import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  
  // Fallback to process.env for non-Vite environments
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  return defaultValue;
};

// Check if we should use local Socket.io instead of Supabase
// Vite uses VITE_ prefix for environment variables
export const useLocalSocket = getEnv('VITE_USE_LOCAL_SOCKET', 'false') === 'true';

// Socket.io server URL for local development
export const socketIoUrl = getEnv('VITE_SOCKET_IO_URL', 'http://localhost:3001');

// Export other environment variables as needed
export const isProduction = getEnv('NODE_ENV', 'development') === 'production'; 