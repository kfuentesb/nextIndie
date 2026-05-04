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
            setGames((current) => [...current, ...data.games]);
            setPage((current) => current + 1);
            setHasMore(data.hasMore);
        } catch (err) {
            setError('Error al cargar más juegos');
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, page]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    return { games, isLoading, isLoadingMore, hasMore, error, refetch: fetchGames, loadMore };
}
