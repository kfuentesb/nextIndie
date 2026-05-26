import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Game } from '../types';
import { gameService } from '../services/gameService';
import questionPlaceholder from '../assets/question_mark.jpg';

interface RankingPageProps {
    refreshIntervalMinutes?: number;
}

const DEFAULT_REFRESH_MINUTES = 2; // Refresca cada minuto

function getRankClass(index: number): string {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return '';
}

export function RankingPage({ refreshIntervalMinutes = DEFAULT_REFRESH_MINUTES }: RankingPageProps) {
    const location = useLocation();
    const [games, setGames] = useState<Game[]>([]);
    const [promotedGames, setPromotedGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [promotedError, setPromotedError] = useState<string | null>(null);

    const loadRanking = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setPromotedError(null);
        try {
            const [rankingResult, promotedResult] = await Promise.allSettled([
                gameService.getCurrentMonthRanking(),
                gameService.getPromotedGames()
            ]);

            if (rankingResult.status === 'fulfilled') {
                const topFifty = rankingResult.value.slice(0, 50);
                setGames(topFifty);
            } else {
                setError('No se pudo cargar el ranking del mes');
            }

            if (promotedResult.status === 'fulfilled') {
                setPromotedGames(promotedResult.value);
            } else {
                setPromotedGames([]);
                setPromotedError('No se pudieron cargar los juegos promocionados');
            }
        } catch {
            setError('No se pudo cargar el ranking del mes');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
    // Carga inicial
    void loadRanking();

    // Configura el intervalo de refresco
    const intervalMs = refreshIntervalMinutes * 60 * 1000;
    const intervalId = setInterval(() => {
        void loadRanking();
    }, intervalMs);

    // Limpieza: borra el intervalo al desmontar
    return () => clearInterval(intervalId);
}, [location.key, loadRanking, refreshIntervalMinutes]);

    const monthLabel = useMemo(() => {
        return new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }, []);

    const formatReleaseDate = (value: string) => new Date(value).toLocaleDateString('es-ES');

    const getRankingImage = (game: Game): string => {
        return (
            game.imageUrls?.coverSmall ||
            game.imageUrls?.thumb ||
            game.imageUrls?.coverBig ||
            game.imageUrl ||
            questionPlaceholder
        );
    };
    //const topThree = games.slice(0, 3);
    //const rest = games.slice(3, 50);
    
    // const podiumSlots = [
    //     topThree[1] ? { game: topThree[1], position: 2 } : null,
    //     topThree[0] ? { game: topThree[0], position: 1 } : null,
    //     topThree[2] ? { game: topThree[2], position: 3 } : null
    // ].filter((slot): slot is { game: Game; position: 1 | 2 | 3 } => slot !== null);

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
                <h1>Top 50 más esperados</h1>
                <p>{monthLabel}</p>
            </header>
        {/* TOP 3 Podium */}
        {/* 
            <section className="ranking-podium">
                {podiumSlots.map(({ game, position }) => (
                    <Link
                        key={game.id}
                        to={`/games/${game.id}`}
                        className={`podium-card podium-rank-${position}`}
                    >
                        <img src={game.imageUrl} alt={game.title} className="podium-cover" />
                        <div className="podium-meta">
                            <span className="podium-position">#{position}</span>
                            <h2>{game.title}</h2>
                            <p>{game.developer}</p>
                            <small>{formatReleaseDate(game.releaseDate)}</small>
                        </div>
                    </Link>
                ))}
            </section>
        */}
            <div className="ranking-layout">
                <section className="ranking-column">
                    <header className="ranking-subheader">
                        <h2>Ranking</h2>
                    </header>
                    <div className="ranking-list">
                        {games.map((game, index) => {
                            const rankClass = getRankClass(index);
                            return (
                                <Link
                                    key={game.id}
                                    to={`/games/${game.id}`}
                                    className={`ranking-row ${rankClass ? `ranking-row--${rankClass}` : ''}`}
                                >
                                    <span
                                        className={`ranking-row-position ${rankClass ? `ranking-row-position--${rankClass}` : ''}`}
                                    >
                                        #{index + 1}
                                    </span>
                                    <img
                                        src={getRankingImage(game)}
                                        alt={game.title}
                                        className="ranking-row-cover"
                                    />
                                    <div className="ranking-row-meta">
                                        <h3>{game.title}</h3>
                                        <p>{game.developer}</p>
                                        <small>{formatReleaseDate(game.releaseDate)}</small>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="ranking-column ranking-promoted">
                    <header className="ranking-subheader">
                        <h2>Promocionados</h2>
                    </header>
                    {promotedError && <div className="error-alert">{promotedError}</div>}
                    {promotedGames.length === 0 && !promotedError ? (
                        <div className="ranking-empty">
                            <p>No hay juegos promocionados en este momento.</p>
                        </div>
                    ) : (
                        <div className="promoted-games-grid">
                            {promotedGames.map((game) => (
                                <article key={game.id} className="saved-game-card promoted-game-card">
                                    <Link
                                        className="saved-game-link"
                                        to={`/games/${game.id}`}
                                        aria-label={`Ver detalle de ${game.title}`}
                                    >
                                        <img
                                            className="saved-game-cover"
                                            src={getRankingImage(game)}
                                            alt={game.title}
                                            loading="lazy"
                                        />
                                        <div className="saved-game-info">
                                            <h2>{game.title}</h2>
                                            <p>{game.developer}</p>
                                            <p>{formatReleaseDate(game.releaseDate)}</p>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
