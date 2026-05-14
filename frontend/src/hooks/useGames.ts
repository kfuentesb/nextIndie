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
    const INITIAL_SIZE = 60;
    const PAGE_SIZE = 10;
    const MAX_BUFFER = 150;

    const shuffleGames = (items: Game[], size?: number) => {
        const limit = typeof size === 'number' ? Math.min(size, items.length) : items.length;
        console.log("Cantidad de juegos recibidos:", items.length);
        const copy = [...items.slice(0, limit)];
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const fetchGames = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await gameService.getFeedPage(1, INITIAL_SIZE);
            setGames(shuffleGames(data.games, INITIAL_SIZE));
            setPage(Math.floor(INITIAL_SIZE / PAGE_SIZE) + 1);
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
            const data = await gameService.getFeedPage(page, PAGE_SIZE);
            const randomized = shuffleGames(data.games, PAGE_SIZE);
            setGames((current) => {
                const existingIds = new Set(current.map((game) => game.id));
                const unique = randomized.filter((game) => !existingIds.has(game.id));
                const merged = [...current, ...unique];
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
