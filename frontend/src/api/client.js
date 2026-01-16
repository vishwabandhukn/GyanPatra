import axios from 'axios';

// Create an Axios instance
const client = axios.create({
    // Use VITE_API_BASE_URL environment variable if available
    // Fallback to /api for local development (which uses Vite proxy)
    // Remove trailing slashes to avoid double-slash issues
    baseURL: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, ''),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add response interceptor for global error handling
client.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default client;
