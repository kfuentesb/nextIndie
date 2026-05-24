import api from './api';
import type { Game, GameRequestCreate, GameRequestResponse, GameRequestStatus } from '../types';

export const gameRequestService = {
    createRequest: async (payload: GameRequestCreate): Promise<GameRequestResponse> => {
        const response = await api.post<GameRequestResponse>('/company/game-requests', payload);
        return response.data;
    },

    getMyGames: async (): Promise<Game[]> => {
        const response = await api.get<Game[]>('/company/games');
        return response.data;
    },

    getAdminRequests: async (status?: GameRequestStatus): Promise<GameRequestResponse[]> => {
        const response = await api.get<GameRequestResponse[]>('/admin/game-requests', {
            params: status ? { status } : undefined
        });
        return response.data;
    },

    approveRequest: async (requestId: number): Promise<GameRequestResponse> => {
        const response = await api.post<GameRequestResponse>(`/admin/game-requests/${requestId}/approve`);
        return response.data;
    },

    rejectRequest: async (requestId: number): Promise<GameRequestResponse> => {
        const response = await api.post<GameRequestResponse>(`/admin/game-requests/${requestId}/reject`);
        return response.data;
    }
};
