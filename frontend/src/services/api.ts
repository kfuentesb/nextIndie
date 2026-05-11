import axios from 'axios';

const viteApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const legacyApiUrl = import.meta.env.VITE_APP_API_URL as string | undefined;

const baseURL = viteApiBaseUrl
    ?? (legacyApiUrl ? `${legacyApiUrl.replace(/\/+$/, '')}/api` : '/api');

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
