import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '../types';
import { gameService } from '../services/gameService';

type RankingMonthCache = {
    monthKey: string;
    games: Game[];
};

let rankingMonthCache: RankingMonthCache | null = null;
let rankingMonthInFlight: Promise<Game[]> | null = null;

function currentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function RankingPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRanking = async () => {
            const monthKey = currentMonthKey();
            if (rankingMonthCache?.monthKey === monthKey) {
                setGames(rankingMonthCache.games);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const request = rankingMonthInFlight ?? gameService.getCurrentMonthRanking();
                if (!rankingMonthInFlight) {
                    rankingMonthInFlight = request;
                }

                const ranking = await request;
                const topTen = ranking.slice(0, 10);
                rankingMonthCache = { monthKey, games: topTen };
                setGames(topTen);
            } catch {
                setError('No se pudo cargar el ranking del mes');
            } finally {
                rankingMonthInFlight = null;
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
