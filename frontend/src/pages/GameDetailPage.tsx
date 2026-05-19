import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import type { Game } from '../types';
import { gameService } from '../services/gameService';
import { useAuth } from '../context/AuthContext';
import { CommentsSection } from '../components/CommentSection';

const getEmbedUrl = (videoId: string): string => {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams({
        autoplay: '0',
        mute: '0',
        controls: '1',
        rel: '0',
        modestbranding: '1',
        enablejsapi: '1',
        origin: window.location.origin
    });
    return `${baseUrl}?${params.toString()}`;
};

const extractVideoId = (url: string): string => {
    if (url.includes('embed')) {
        return url.split('/embed/')[1]?.split('?')[0] || '';
    }
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : url;
};

export function GameDetailPage() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const [game, setGame] = useState<Game | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        const loadGame = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await gameService.getGameById(Number(id));
                setGame(data);
                setLikesCount(data.totalLikes ?? 0);
            } catch {
                setError('No se pudo cargar el juego');
            } finally {
                setIsLoading(false);
            }
        };
        void loadGame();
    }, [id]);

    const trailerUrl = game?.trailerUrl || '';
    const isYoutubeTrailer = trailerUrl.includes('youtube.com') || trailerUrl.includes('youtu.be') || trailerUrl.includes('/embed/');
    const videoId = useMemo(() => (isYoutubeTrailer ? extractVideoId(trailerUrl) : ''), [isYoutubeTrailer, trailerUrl]);
    const embedUrl = useMemo(() => (isYoutubeTrailer ? getEmbedUrl(videoId) : ''), [isYoutubeTrailer, videoId]);

    const toggleLike = async () => {
        if (!game || !isAuthenticated) return;
        if (isLiked) {
            await gameService.unlikeGame(game.id);
            setIsLiked(false);
            setLikesCount((current) => Math.max(0, current - 1));
            return;
        }
        await gameService.likeGame(game.id);
        setIsLiked(true);
        setLikesCount((current) => current + 1);
    };

    const toggleSave = async () => {
        if (!game || !isAuthenticated) return;
        if (isSaved) {
            await gameService.unsaveGame(game.id);
            setIsSaved(false);
            return;
        }
        await gameService.saveGame(game.id);
        setIsSaved(true);
    };

    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="spinner" />
                <p>Cargando juego...</p>
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="error-state">
                <p>{error ?? 'Juego no encontrado'}</p>
                <Link to="/" className="btn btn-secondary">Volver al feed</Link>
            </div>
        );
    }

    return (
        <div className="game-detail-page">
            <header className="game-detail-hero">
                <div className="game-detail-media">
                    {trailerUrl ? (
                        isYoutubeTrailer ? (
                            <iframe
                                src={embedUrl}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                                title={game.title}
                            />
                        ) : (
                            <video
                                src={trailerUrl}
                                autoPlay={false}
                                controls
                                playsInline
                            />
                        )
                    ) : (
                        <img src={game.imageUrl} alt={game.title} />
                    )}
                </div>

                <div className="game-detail-info">
                    <a onClick={() => navigate(-1)} className="detail-back" style={{ cursor: 'pointer' }}>
                        ← Volver atrás
                    </a>
                    <h1>{game.title}</h1>
                    <p className="detail-meta">
                        {game.developer} · {new Date(game.releaseDate).toLocaleDateString('es-ES')}
                    </p>
                    <p className="detail-description">{game.description}</p>

                    <div className="detail-actions">
                        <button className="btn btn-secondary" onClick={toggleLike}>
                            {isLiked ? '❤️' : '🤍'} {likesCount}
                        </button>
                        <button className="btn btn-secondary" onClick={toggleSave}>
                            {isSaved ? 'Guardado' : 'Guardar'}
                        </button>
                        {game.websiteUrl && (
                            <a className="btn btn-primary" href={game.websiteUrl} target="_blank" rel="noreferrer">
                                Sitio oficial
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <section className="game-detail-grid">
                <div className="detail-card">
                    <h3>Ficha</h3>
                    <div className="detail-list">
                        <div>
                            <span>Estado</span>
                            <strong>{game.gameStatus ?? 'Sin dato'}</strong>
                        </div>
                        <div>
                            <span>Franquicia</span>
                            <strong>{game.mainFranchise ?? 'Sin dato'}</strong>
                        </div>
                        <div>
                            <span>Generos</span>
                            <strong>{game.genres.join(', ') || 'Sin dato'}</strong>
                        </div>
                        <div>
                            <span>Plataformas</span>
                            <strong>{game.platforms.join(', ') || 'Sin dato'}</strong>
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <h3>Similares</h3>
                    <div className="detail-tags">
                        {game.similarGames && game.similarGames.length > 0 ? (
                            game.similarGames.map((title) => <span key={title}>{title}</span>)
                        ) : (
                            <p>Sin similares</p>
                        )}
                    </div>
                </div>

                <div className="detail-card">
                    <h3>DLCs</h3>
                    <div className="detail-tags">
                        {game.dlcs && game.dlcs.length > 0 ? (
                            game.dlcs.map((title) => <span key={title}>{title}</span>)
                        ) : (
                            <p>Sin DLCs</p>
                        )}
                    </div>
                </div>
            </section>

            <section className="game-detail-comments">
                <CommentsSection gameId={game.id} />
            </section>
        </div>
    );
}
