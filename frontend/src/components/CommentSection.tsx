import { useState, useEffect } from 'react';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../context/AuthContext';

interface CommentsSectionProps {
    gameId: number;
    onCountChange?: (count: number) => void;
}

export function CommentsSection({ gameId, onCountChange }: CommentsSectionProps) {
    const { comments, fetchComments, addComment } = useComments(gameId);
    const { isAuthenticated } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    useEffect(() => {
        onCountChange?.(comments.length);
    }, [comments.length, onCountChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const success = await addComment({ content: newComment.trim() });
        if (success) {
            setNewComment('');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="comments-container">
            <div className="comments-header">
                <h3>Comentarios</h3>
                <span className="count">{comments.length}</span>
            </div>

            <div className="comments-list">
                {comments.length === 0 ? (
                    <div className="no-comments">
                        <span className="icon"><i className="bi bi-chat-dots-fill"></i></span>
                        <p>No hay comentarios aún</p>
                        <span className="subtext">¡Sé el primero en comentar!</span>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment">
                            <div className="comment-header">
                                <span className="username">@{comment.username}</span>
                                <span className="date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                            </div>
                            <p className="comment-text">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="comment-input-section">
                {isAuthenticated ? (
                    <form onSubmit={handleSubmit} className="input-wrapper">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escribe un comentario..."
                            className="comment-input"
                            maxLength={500}
                            rows={1}
                        />
                        <button
                            type="submit"
                            className="send-btn"
                            disabled={!newComment.trim() || isSubmitting}
                        >
                            {isSubmitting ? <span className="spinner-small" /> : <span>➤</span>}
                        </button>
                    </form>
                ) : (
                    <div className="login-prompt">
                        <a href="/login">Inicia sesión</a> para comentar
                    </div>
                )}
            </div>
        </div>
    );
}