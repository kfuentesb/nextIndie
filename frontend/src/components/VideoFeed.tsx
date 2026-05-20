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
    const [savedCount, setSavedCount] = useState(game.totalSaves ?? 0);
    const [commentsCount, setCommentsCount] = useState(game.totalComments ?? 0);
    const [isLikeAnimation, setIsLikeAnimation] = useState(false);
    const [isSaveAnimation, setIsSaveAnimation] = useState(false);
    const [isMediaReady, setIsMediaReady] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    

    const getEmbedUrl = (videoId: string): string => {
        const baseUrl = `https://www.youtube.com/embed/${videoId}`;
        const params = new URLSearchParams({
            autoplay: isActive ? '1' : '0',  // Autoplay solo si es activo
            mute: '1',        // Requerido para autoplay
            controls: '1',
            rel: '0',
            modestbranding: '1',
            enablejsapi: '1',               // Habilitar API de YouTube
            loop: '1',
            playlist: videoId,                // Necesario para loop en iframes de YouTube
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

    // Cambiar URL de embed dinámicamente solo para trailers de YouTube
    const [embedUrl, setEmbedUrl] = useState(() => (isYoutubeTrailer ? getEmbedUrl(videoId) : ''));

    useEffect(() => {
        if (isYoutubeTrailer) {
            setEmbedUrl(getEmbedUrl(videoId));
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
    }, [isActive, videoId, isYoutubeTrailer]);

    useEffect(() => {
        if (!isYoutubeTrailer || !iframeRef.current?.contentWindow) return;
        const timer = setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage(
                JSON.stringify({
                    event: 'command',
                    func: isMuted ? 'mute' : 'unMute',
                    args: []
                }),
                '*'
            );
        }, 150);
        return () => clearTimeout(timer);
        
    }, [isMuted, isYoutubeTrailer]);

    useEffect(() => {
        setLikesCount(game.totalLikes ?? 0);
        setSavedCount(game.totalSaves ?? 0);
        setCommentsCount(game.totalComments ?? 0);
        setIsLiked(Boolean(game.likedByMe));
        setIsSaved(Boolean(game.savedByMe));
        setIsMediaReady(!hasTrailer);
    }, [game.id, game.totalLikes, game.totalSaves, game.totalComments, game.likedByMe, game.savedByMe, hasTrailer]);

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
        // La activación de la animación
        setIsLikeAnimation(true);
        setTimeout(() => setIsLikeAnimation(false), 400); // Duración de la animación

        await gameService.likeGame(game.id);
        setIsLiked(true);
        setLikesCount((current) => current + 1);
    };

    const toggleSave = async () => {
        if (!isAuthenticated) return;
        if (isSaved) {
            await gameService.unsaveGame(game.id);
            setIsSaved(false);
            setSavedCount((current) => Math.max(0, current - 1));
            return;
        }
        setIsSaveAnimation(true);
        setTimeout(() => setIsSaveAnimation(false), 400);

        await gameService.saveGame(game.id);
        setIsSaved(true);
        setSavedCount((current) => current + 1);
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
                    <>
                        {isYoutubeTrailer ? (
                            <iframe
                                ref={iframeRef}
                                src={embedUrl}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                                title={game.title}
                                className={`video-media ${isMediaReady ? 'is-ready' : ''}`}
                                onLoad={() => setIsMediaReady(true)}
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
                                className={`video-media ${isMediaReady ? 'is-ready' : ''}`}
                                onLoadedData={() => setIsMediaReady(true)}
                            />
                        )}
                        {!isMediaReady && (
                            <img src={game.imageUrl} alt={game.title} className="video-fallback video-loading-poster" />
                        )}
                    </>
                ) : (
                    <img src={game.imageUrl} alt={game.title} className="video-fallback" />
                )}

                {hasTrailer && (
                    <div className="audio-overlay" onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                    }}>
                        <div className={`audio-indicator ${isMuted ? 'muted' : ''}`}>
                            <i className={isMuted ? "bi bi-volume-mute" : "bi bi-volume-up"}></i>
                            <span>{isMuted ? 'Click para activar sonido' : 'Sonido activado'}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="video-info">
                <div className="game-details">
                    <h2 className="game-title">
                        <Link className="game-title-link" to={`/games/${game.id}`}>
                            {game.title}
                        </Link>
                    </h2>
                    <p className="game-meta">
                        {game.developer} • {genreText}
                    </p>
                    <p className="game-description">{game.description}</p>
                </div>

                <div className="game-actions">
                    {hasTrailer && (
                        <button className="action-btn audio-btn" onClick={toggleMute}>
                            <span className="icon">
                                <i className={isMuted ? "bi bi-volume-off-fill" : "bi bi-volume-up-fill"}></i>
                            </span>
                            <span className="label">{isMuted ? 'Activar' : 'Silenciar'}</span>
                        </button>
                    )}

                    <button className="action-btn" onClick={toggleLike}>
                        <span className={`icon heart-wrapper ${isLikeAnimation ? 'heart-pop' : ''}`}>
                            <i className={isLiked ? "bi bi-heart-fill" : "bi bi-heart"}></i>
                        </span>
                        <span className="label">{likesCount}</span>
                    </button>

                    <button className="action-btn" onClick={() => setShowComments(!showComments)}>
                        <span className="icon"><i className="bi bi-chat-dots-fill"></i></span>
                        <span className="label">{commentsCount}</span>
                    </button>

                    <button className="action-btn" onClick={toggleSave}>
                        <span className={`icon bookmark-wrapper ${isSaveAnimation ? 'bookmark-pop':''}`}>
                            <i className={isSaved ? "bi bi-bookmark-fill" : "bi bi-bookmark"}></i></span>
                        <span className="label">{savedCount}</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="comments-overlay" onClick={(e) => e.stopPropagation()}>
                    <CommentsSection gameId={game.id} onCountChange={setCommentsCount} />
                    <button className="close-comments" onClick={() => setShowComments(false)}>
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
