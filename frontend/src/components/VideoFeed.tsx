import { useState } from 'react';
import { CommentsSection} from "./CommentSection.tsx";
import type { Game } from '../types';

interface VideoFeedProps {
    game: Game;
}

export function VideoFeed({ game }: VideoFeedProps) {
    const [showComments, setShowComments] = useState(false);

    const getEmbedUrl = (url: string): string => {
        if (url.includes('embed')) {
            const videoId = url.split('/embed/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1`;
        }
        const videoId = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1] || url;
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1`;
    };

    return (
        <div className="video-container">
            <div className="video-wrapper">
                <iframe
                    src={getEmbedUrl(game.trailerUrl)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    title={game.title}
                />
            </div>

            <div className="video-info">
                <div className="game-details">
                    <h2 className="game-title">{game.title}</h2>
                    <p className="game-meta">
                        {game.developer} • {game.genre} • {new Date(game.releaseDate).getFullYear()}
                    </p>
                    <p className="game-description">{game.description}</p>
                </div>

                <div className="game-actions">
                    <button className="action-btn" onClick={() => setShowComments(!showComments)}>
                        <span className="icon">💬</span>
                        <span className="label">Comentarios</span>
                    </button>
                    <button className="action-btn">
                        <span className="icon">❤️</span>
                        <span className="label">Me gusta</span>
                    </button>
                    <button className="action-btn">
                        <span className="icon">📤</span>
                        <span className="label">Compartir</span>
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