import api from './api';
import type { Game } from '../types';

export const gameService = {
    getAllGames: async (): Promise<Game[]> => {
        const response = await api.get<Game[]>('/games');
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
    }
};
