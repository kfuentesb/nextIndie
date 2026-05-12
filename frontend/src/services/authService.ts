import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

const AUTH_KEY = 'user';
const TOKEN_KEY = 'token';

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        const { token, username, email, role } = response.data;

        const user: User = { username, email, role, token };
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));

        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        const { token, username, email, role } = response.data;

        const user: User = { username, email, role, token };
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));

        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(AUTH_KEY);
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem(AUTH_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem(TOKEN_KEY);
    }
};
