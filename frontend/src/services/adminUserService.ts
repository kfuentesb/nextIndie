import api from './api';
import type { AdminUser, AdminUserRequest, PageResponse } from '../types';

export const adminUserService = {
    getUsers: async (page: number, size = 10): Promise<PageResponse<AdminUser>> => {
        const response = await api.get<PageResponse<AdminUser>>('/admin/users', {
            params: { page, size }
        });
        return response.data;
    },

    createUser: async (data: AdminUserRequest): Promise<AdminUser> => {
        const response = await api.post<AdminUser>('/admin/users', data);
        return response.data;
    },

    updateUser: async (id: number, data: AdminUserRequest): Promise<AdminUser> => {
        const response = await api.put<AdminUser>(`/admin/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    }
};
