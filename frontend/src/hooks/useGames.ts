import { useState, useEffect, useCallback } from 'react';
import { gameService } from '../services/gameService';
import type { Game } from '../types';

export function useGames() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const MAX_BUFFER = 40;

    const fetchGames = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await gameService.getFeedPage(1, 10);
            setGames(data.games);
            setPage(2);
            setHasMore(data.hasMore);
        } catch (err) {
            setError('Error al cargar los juegos');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMore = useCallback(async () => {
        if (!hasMore || isLoadingMore) return;
        try {
            setIsLoadingMore(true);
            const data = await gameService.getFeedPage(page, 10);
            setGames((current) => {
                const merged = [...current, ...data.games];
                if (merged.length <= MAX_BUFFER) {
                    return merged;
                }
                return merged.slice(merged.length - MAX_BUFFER);
            });
            setPage((current) => current + 1);
            setHasMore(data.hasMore);
        } catch (err) {
            setError('Error al cargar más juegos');
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, page]);

    const dropHead = useCallback((count: number) => {
        if (count <= 0) return;
        setGames((current) => current.slice(Math.min(count, current.length)));
    }, []);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    return { games, isLoading, isLoadingMore, hasMore, error, refetch: fetchGames, loadMore, dropHead };
}
