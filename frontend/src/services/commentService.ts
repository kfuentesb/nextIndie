import api from './api';
import type { Comment, CreateCommentRequest } from '../types';

export const commentService = {
    getCommentsByGame: async (gameId: number): Promise<Comment[]> => {
        const response = await api.get<Comment[]>(`/comments/game/${gameId}`);
        return response.data;
    },

    createComment: async (gameId: number, data: CreateCommentRequest): Promise<Comment> => {
        const response = await api.post<Comment>(`/comments/game/${gameId}`, data);
        return response.data;
    }
};