import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '../types';
import { gameService } from '../services/gameService';

export function SavedGamesPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSavedGames = async () => {
            try {
                const data = await gameService.getSavedGames();
                setGames(data);
            } catch {
                setError('No se pudieron cargar tus juegos guardados');
            } finally {
                setIsLoading(false);
            }
        };

        void fetchSavedGames();
    }, []);

    const removeFromSaved = async (gameId: number) => {
        try {
            await gameService.unsaveGame(gameId);
            setGames((current) => current.filter((game) => game.id !== gameId));
        } catch {
            setError('No se pudo eliminar el juego de guardados');
        }
    };

    if (isLoading) {
        return <div className="loading-state"><p>Cargando guardados...</p></div>;
    }

    if (error) {
        return <div className="error-state"><p>{error}</p></div>;
    }

    if (games.length === 0) {
        return <div className="loading-state"><p>No tienes juegos guardados todavia.</p></div>;
    }

    return (
        <div className="saved-page">
            <div className="saved-games-grid">
                {games.map((game) => (
                    <article key={game.id} className="saved-game-card">
                        <Link
                            className="saved-game-link"
                            to={`/games/${game.id}`}
                            aria-label={`Ver detalle de ${game.title}`}
                        >
                            <img className="saved-game-cover" src={game.imageUrl} alt={game.title} loading="lazy" />
                            <div className="saved-game-info">
                                <h2>{game.title}</h2>
                                <p>{game.developer}</p>
                            </div>
                        </Link>
                        <button className="saved-remove-btn" onClick={() => removeFromSaved(game.id)}>
                            Quitar
                        </button>
                    </article>
                ))}
            </div>
        </div>
    );
}
