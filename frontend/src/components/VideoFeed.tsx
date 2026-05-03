import { useState, useRef, useEffect } from 'react';
import { CommentsSection} from "./CommentSection.tsx";
import type { Game } from '../types';

interface VideoFeedProps {
    game: Game;
    isActive: boolean;  // Nuevo: indica si es el slide actual
}

export function VideoFeed({ game, isActive }: VideoFeedProps) {
    const [showComments, setShowComments] = useState(false);
    const [isMuted, setIsMuted] = useState(true);  // Empezar muteado
    const [hasInteracted, setHasInteracted] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

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

    const videoId = extractVideoId(game.trailerUrl);
    const genreText = game.genres?.join(", ") || "Sin género";

    // Cambiar URL cuando cambia el estado de mute/active
    const [embedUrl, setEmbedUrl] = useState(() =>
        getEmbedUrl(videoId, true)
    );

    useEffect(() => {
        setEmbedUrl(getEmbedUrl(videoId, isMuted));
    }, [isActive, isMuted, videoId]);

    const toggleMute = () => {
        setHasInteracted(true);
        setIsMuted(!isMuted);
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
                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    title={game.title}
                />

                {/* Overlay para capturar clicks y mostrar estado de audio */}
                <div className="audio-overlay" onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                }}>
                    <div className={`audio-indicator ${isMuted ? 'muted' : ''}`}>
                        {isMuted ? '🔇' : '🔊'}
                        <span>{isMuted ? 'Click para activar sonido' : 'Sonido activado'}</span>
                    </div>
                </div>
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
                    <button className="action-btn audio-btn" onClick={toggleMute}>
                        <span className="icon">{isMuted ? '🔇' : '🔊'}</span>
                        <span className="label">{isMuted ? 'Activar' : 'Silenciar'}</span>
                    </button>

                    <button className="action-btn" onClick={() => setShowComments(!showComments)}>
                        <span className="icon">💬</span>
                        <span className="label">Comentarios</span>
                    </button>

                    <button className="action-btn">
                        <span className="icon">❤️</span>
                        <span className="label">Me gusta</span>
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
