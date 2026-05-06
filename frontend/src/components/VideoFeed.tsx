import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CommentsSection} from "./CommentSection.tsx";
import type { Game } from '../types';
import { gameService } from '../services/gameService';
import { useAuth } from '../context/AuthContext';

interface VideoFeedProps {
    game: Game;
    isActive: boolean;  // Nuevo: indica si es el slide actual
}

export function VideoFeed({ game, isActive }: VideoFeedProps) {
    const { isAuthenticated } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [isMuted, setIsMuted] = useState(true);  // Empezar muteado
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(game.totalLikes ?? 0);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const getEmbedUrl = (videoId: string, muted: boolean): string => {
        const baseUrl = `https://www.youtube.com/embed/${videoId}`;
        const params = new URLSearchParams({
            autoplay: isActive ? '1' : '0',  // Autoplay solo si es activo
            mute: muted ? '1' : '0',        // Mute según estado
            controls: '1',
            rel: '0',
            modestbranding: '1',
            enablejsapi: '1',               // Habilitar API de YouTube
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

    const trailerUrl = game.trailerUrl || '';
    const hasTrailer = Boolean(trailerUrl);
    const isYoutubeTrailer = trailerUrl.includes('youtube.com') || trailerUrl.includes('youtu.be') || trailerUrl.includes('/embed/');
    const videoId = isYoutubeTrailer ? extractVideoId(trailerUrl) : '';
    const genreText = game.genres?.join(", ") || "Sin género";

    // Cambiar URL cuando cambia el estado de mute/active
    const [embedUrl, setEmbedUrl] = useState(() => (isYoutubeTrailer ? getEmbedUrl(videoId, true) : ''));

    useEffect(() => {
        if (isYoutubeTrailer) {
            setEmbedUrl(getEmbedUrl(videoId, isMuted));
            return;
        }
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
            if (isActive) {
                void videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    }, [isActive, isMuted, videoId, isYoutubeTrailer]);

    const toggleMute = () => {
        setHasInteracted(true);
        setIsMuted(!isMuted);
    };

    const toggleLike = async () => {
        if (!isAuthenticated) return;
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
        if (!isAuthenticated) return;
        if (isSaved) {
            await gameService.unsaveGame(game.id);
            setIsSaved(false);
            return;
        }
        await gameService.saveGame(game.id);
        setIsSaved(true);
    };

    const handleVideoClick = () => {
        if (!hasInteracted) {
            setHasInteracted(true);
            setIsMuted(false);
        }
    };

    return (
        <div className="video-container" onClick={handleVideoClick}>
            <div className="video-wrapper">
                {hasTrailer ? (
                    isYoutubeTrailer ? (
                        <iframe
                            ref={iframeRef}
                            src={embedUrl}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            title={game.title}
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            src={trailerUrl}
                            autoPlay={isActive}
                            muted={isMuted}
                            controls
                            loop
                            playsInline
                        />
                    )
                ) : (
                    <img src={game.imageUrl} alt={game.title} className="video-fallback" />
                )}

                {hasTrailer && (
                    <div className="audio-overlay" onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                    }}>
                        <div className={`audio-indicator ${isMuted ? 'muted' : ''}`}>
                            {isMuted ? '🔇' : '🔊'}
                            <span>{isMuted ? 'Click para activar sonido' : 'Sonido activado'}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="video-info">
                <div className="game-details">
                    <h2 className="game-title">{game.title}</h2>
                    <p className="game-meta">
                        {game.developer} • {genreText}
                    </p>
                    <p className="game-description">{game.description}</p>
                </div>

                <div className="game-actions">
                    {hasTrailer && (
                        <button className="action-btn audio-btn" onClick={toggleMute}>
                            <span className="icon">{isMuted ? '🔇' : '🔊'}</span>
                            <span className="label">{isMuted ? 'Activar' : 'Silenciar'}</span>
                        </button>
                    )}

                    <Link className="action-btn" to={`/games/${game.id}`}>
                        <span className="icon">ℹ️</span>
                        <span className="label">Detalle</span>
                    </Link>

                    <button className="action-btn" onClick={() => setShowComments(!showComments)}>
                        <span className="icon">💬</span>
                        <span className="label">Comentarios</span>
                    </button>

                    <button className="action-btn" onClick={toggleLike}>
                        <span className="icon">{isLiked ? "❤️" : "🤍"}</span>
                        <span className="label">{likesCount}</span>
                    </button>

                    <button className="action-btn" onClick={toggleSave}>
                        <span className="icon">{isSaved ? "🔖" : "📑"}</span>
                        <span className="label">{isSaved ? "Guardado" : "Guardar"}</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="comments-overlay" onClick={(e) => e.stopPropagation()}>
                    <CommentsSection gameId={game.id} />
                    <button className="close-comments" onClick={() => setShowComments(false)}>
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
