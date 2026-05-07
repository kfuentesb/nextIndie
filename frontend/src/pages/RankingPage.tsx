import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '../types';
import { gameService } from '../services/gameService';

export function RankingPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRanking = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const ranking = await gameService.getCurrentMonthRanking();
                setGames(ranking.slice(0, 10));
            } catch {
                setError('No se pudo cargar el ranking del mes');
            } finally {
                setIsLoading(false);
            }
        };
        void loadRanking();
    }, []);

    const monthLabel = useMemo(() => {
        return new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }, []);

    const topThree = games.slice(0, 3);
    const rest = games.slice(3, 10);
    const formatReleaseDate = (value: string) => new Date(value).toLocaleDateString('es-ES');

    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="spinner" />
                <p>Cargando ranking...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="ranking-page">
            <header className="ranking-header">
                <h1>Top 10 más esperados</h1>
                <p>{monthLabel}</p>
            </header>

            <section className="ranking-podium">
                {topThree.map((game, index) => (
                    <Link
                        key={game.id}
                        to={`/games/${game.id}`}
                        className={`podium-card podium-rank-${index + 1}`}
                    >
                        <img src={game.imageUrl} alt={game.title} className="podium-cover" />
                        <div className="podium-meta">
                            <h2>{game.title}</h2>
                            <p>{game.developer}</p>
                            <small>{formatReleaseDate(game.releaseDate)}</small>
                        </div>
                    </Link>
                ))}
            </section>

            <section className="ranking-list">
                {rest.map((game) => (
                    <Link key={game.id} to={`/games/${game.id}`} className="ranking-row">
                        <img src={game.imageUrl} alt={game.title} className="ranking-row-cover" />
                        <div className="ranking-row-meta">
                            <h3>{game.title}</h3>
                            <p>{game.developer}</p>
                            <small>{formatReleaseDate(game.releaseDate)}</small>
                        </div>
                    </Link>
                ))}
            </section>
        </div>
    );
}
