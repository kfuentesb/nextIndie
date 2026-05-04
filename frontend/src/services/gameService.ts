import api from './api';
import type { Game, GameFeedResponse } from '../types';

export const gameService = {
    getAllGames: async (): Promise<Game[]> => {
        const response = await api.get<Game[]>('/games');
        return response.data;
    },

    getFeedPage: async (page: number, size = 10): Promise<GameFeedResponse> => {
        const response = await api.get<GameFeedResponse>('/games/feed', {
            params: { page, size }
        });
        return response.data;
    },

    getGameById: async (id: number): Promise<Game> => {
        const response = await api.get<Game>(`/games/${id}`);
        return response.data;
    },

    likeGame: async (id: number): Promise<void> => {
        await api.post(`/games/${id}/likes`);
    },

    unlikeGame: async (id: number): Promise<void> => {
        await api.delete(`/games/${id}/likes`);
    },

    saveGame: async (id: number): Promise<void> => {
        await api.post(`/games/${id}/saved`);
    },

    unsaveGame: async (id: number): Promise<void> => {
        await api.delete(`/games/${id}/saved`);
    },

    getSavedGames: async (): Promise<Game[]> => {
        const response = await api.get<Game[]>('/games/me/saved');
        return response.data;
    },

    getReleasesByMonth: async (year: number, month: number): Promise<Game[]> => {
        const response = await api.get<Game[]>('/games/releases', {
            params: { year, month }
        });
        return response.data;
    }
};
