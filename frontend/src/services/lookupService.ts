import api from './api';
import type { LookupItem } from '../types';

export const lookupService = {
    getGenres: async (): Promise<LookupItem[]> => {
        const response = await api.get<LookupItem[]>('/lookups/genres');
        return response.data;
    },

    getPlatforms: async (): Promise<LookupItem[]> => {
        const response = await api.get<LookupItem[]>('/lookups/platforms');
        return response.data;
    },

    getGames: async (): Promise<LookupItem[]> => {
        const response = await api.get<LookupItem[]>('/lookups/games');
        return response.data;
    }
};
