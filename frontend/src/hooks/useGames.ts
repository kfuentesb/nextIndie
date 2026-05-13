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
    const PAGE_SIZE = 8;
    const MAX_BUFFER = 40;

    const shuffleGames = (items: Game[]) => {
        const copy = [...items];
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
            const data = await gameService.getFeedPage(1, PAGE_SIZE);
            setGames(shuffleGames(data.games));
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
            const data = await gameService.getFeedPage(page, PAGE_SIZE);
            const randomized = shuffleGames(data.games);
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
