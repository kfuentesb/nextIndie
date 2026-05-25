import { useState, useCallback } from 'react';
import { commentService } from '../services/commentService';
import type { Comment, CreateCommentRequest } from '../types';

export function useComments(gameId: number) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchComments = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await commentService.getCommentsByGame(gameId);
            setComments(data);
        } catch (err) {
            console.error('Error al cargar comentarios:', err);
        } finally {
            setIsLoading(false);
        }
    }, [gameId]);

    const addComment = useCallback(async (data: CreateCommentRequest) => {
        try {
            const newComment = await commentService.createComment(gameId, data);
            setComments(prev => [newComment, ...prev]);
            return true;
        } catch (err) {
            console.error('Error al crear comentario:', err);
            return false;
        }
    }, [gameId]);

    const deleteComment = useCallback(async (commentId: number) => {
        try {
            await commentService.deleteComment(commentId);
            setComments(prev => prev.filter((comment) => comment.id !== commentId));
            return true;
        } catch (err) {
            console.error('Error al borrar comentario:', err);
            return false;
        }
    }, []);

    return { comments, isLoading, fetchComments, addComment, deleteComment };
}