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

        fetchSavedGames();
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
        return <div className="loading-state"><p>No tienes juegos guardados todavía.</p></div>;
    }

    return (
        <div className="feed-container">
            <div className="saved-games-list">
                {games.map((game) => (
                    <article key={game.id} className="video-info">
                        <div className="game-details">
                            <h2 className="game-title">{game.title}</h2>
                            <p className="game-meta">{game.developer} • {game.genres.join(', ')}</p>
                            <p className="game-description">{game.description}</p>
                        </div>
                        <div className="game-actions">
                            <Link className="action-btn" to={`/games/${game.id}`}>
                                <span className="icon">ℹ️</span>
                                <span className="label">Detalle</span>
                            </Link>
                            <button className="action-btn" onClick={() => removeFromSaved(game.id)}>
                                <span className="icon">🗑️</span>
                                <span className="label">Quitar</span>
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
