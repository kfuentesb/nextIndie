import { useState, useEffect, useCallback } from 'react';
import { gameService } from '../services/gameService';
import type { Game } from '../types';

export function useGames() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGames = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await gameService.getAllGames();
            setGames(data);
        } catch (err) {
            setError('Error al cargar los juegos');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    return { games, isLoading, error, refetch: fetchGames };
}