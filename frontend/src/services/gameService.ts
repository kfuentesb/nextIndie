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
    }
};