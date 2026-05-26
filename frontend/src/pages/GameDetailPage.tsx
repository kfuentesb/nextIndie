import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import type { Game, GameUpdateRequest, LookupItem } from '../types';
import { gameService } from '../services/gameService';
import { lookupService } from '../services/lookupService';
import { gameRequestService } from '../services/gameRequestService';
import { useAuth } from '../context/AuthContext';
import { CommentsSection } from '../components/CommentSection';
import { getErrorMessage } from '../utils/error';
import questionPlaceholder from '../assets/question_mark.jpg';

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

type EditGameFormState = {
    title: string;
    description: string;
    trailerUrl: string;
    developer: string;
    gameStatus: string;
    websiteUrl: string;
    mainFranchise: string;
    releaseDate: string;
    imageUrl: string;
    genreIds: number[];
    platformIds: number[];
    similarGameIds: number[];
};

const emptyEditForm: EditGameFormState = {
    title: '',
    description: '',
    trailerUrl: '',
    developer: '',
    gameStatus: '',
    websiteUrl: '',
    mainFranchise: '',
    releaseDate: '',
    imageUrl: '',
    genreIds: [],
    platformIds: [],
    similarGameIds: []
};

export function GameDetailPage() {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const [game, setGame] = useState<Game | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [savedCount, setSavedCount] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);
    const [isLikeAnimation, setIsLikeAnimation] = useState(false);
    const [isSaveAnimation, setIsSaveAnimation] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<EditGameFormState>(emptyEditForm);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
    const [isPromoting, setIsPromoting] = useState(false);
    const [promotionError, setPromotionError] = useState<string | null>(null);
    const [promotionSuccess, setPromotionSuccess] = useState<string | null>(null);
    const [isPromotionActive, setIsPromotionActive] = useState(false);
    const [genres, setGenres] = useState<LookupItem[]>([]);
    const [platforms, setPlatforms] = useState<LookupItem[]>([]);
    const [similarGames, setSimilarGames] = useState<LookupItem[]>([]);
    const [isLoadingLookups, setIsLoadingLookups] = useState(false);
    const [selectedGenreId, setSelectedGenreId] = useState('');
    const [selectedPlatformId, setSelectedPlatformId] = useState('');
    const [selectedSimilarId, setSelectedSimilarId] = useState('');
    const [hasSyncedLookups, setHasSyncedLookups] = useState(false);

    useEffect(() => {
        if (!id) return;
        const loadGame = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await gameService.getGameById(Number(id));
                setGame(data);
                setLikesCount(data.totalLikes ?? 0);
                setSavedCount(data.totalSaves ?? 0);
                setCommentsCount(data.totalComments ?? 0);
                setIsLiked(Boolean(data.likedByMe));
                setIsSaved(Boolean(data.savedByMe));
            } catch {
                setError('No se pudo cargar el juego');
            } finally {
                setIsLoading(false);
            }
        };
        void loadGame();
    }, [id]);

    const isAdmin = user?.role === 'ADMIN';
    const isCompany = user?.role === 'EMPRESA';
    const canManageGame = Boolean(game) && (isAdmin || (isCompany && game?.requestedBy === user?.username));
    const canPromoteGame = Boolean(game) && isCompany && game?.requestedBy === user?.username;
    const showPromotionButton = canPromoteGame && !isPromotionActive;

    useEffect(() => {
        if (!game || !canPromoteGame) {
            setIsPromotionActive(false);
            return;
        }
        let isMounted = true;
        const loadPromotionStatus = async () => {
            try {
                const promotedGames = await gameService.getPromotedGames();
                if (isMounted) {
                    setIsPromotionActive(promotedGames.some((item) => item.id === game.id));
                }
            } catch {
                if (isMounted) {
                    setIsPromotionActive(false);
                }
            }
        };
        void loadPromotionStatus();
        return () => {
            isMounted = false;
        };
    }, [game?.id, canPromoteGame]);

    const genreMap = useMemo(() => new Map(genres.map((item) => [item.id, item.name])), [genres]);
    const platformMap = useMemo(() => new Map(platforms.map((item) => [item.id, item.name])), [platforms]);
    const similarGameMap = useMemo(() => new Map(similarGames.map((item) => [item.id, item.name])), [similarGames]);

    const mapNamesToIds = (names: string[], items: LookupItem[]) => {
        if (!names.length) return [];
        return items.filter((item) => names.includes(item.name)).map((item) => item.id);
    };

    useEffect(() => {
        if (!isEditModalOpen) return;
        if (genres.length && platforms.length && similarGames.length) return;

        const loadLookups = async () => {
            setIsLoadingLookups(true);
            setEditError(null);
            try {
                const [genreItems, platformItems, gameItems] = await Promise.all([
                    lookupService.getGenres(),
                    lookupService.getPlatforms(),
                    lookupService.getGames()
                ]);
                setGenres(genreItems);
                setPlatforms(platformItems);
                setSimilarGames(gameItems);
            } catch (err: unknown) {
                setEditError(getErrorMessage(err, 'No se pudieron cargar los datos del formulario'));
            } finally {
                setIsLoadingLookups(false);
            }
        };

        void loadLookups();
    }, [isEditModalOpen, genres.length, platforms.length, similarGames.length]);

    useEffect(() => {
        if (!isEditModalOpen || !game || hasSyncedLookups) return;
        if (!genres.length || !platforms.length || !similarGames.length) return;

        setEditForm((current) => ({
            ...current,
            genreIds: mapNamesToIds(game.genres, genres),
            platformIds: mapNamesToIds(game.platforms, platforms),
            similarGameIds: mapNamesToIds(game.similarGames ?? [], similarGames)
        }));
        setHasSyncedLookups(true);
    }, [isEditModalOpen, game, genres, platforms, similarGames, hasSyncedLookups]);

    // Texto truncado
    useEffect(() => {
        if (!descriptionRef.current || !game) return;
        
        const element = descriptionRef.current;
        // Compara scrollHeight vs clientHeight para saber si hay overflow
        setIsDescriptionTruncated(element.scrollHeight > element.clientHeight);
    }, [game]);

    const openEditModal = () => {
        if (!game) return;
        setEditError(null);
        setHasSyncedLookups(false);
        setSelectedGenreId('');
        setSelectedPlatformId('');
        setSelectedSimilarId('');
        setEditForm({
            title: game.title ?? '',
            description: game.description ?? '',
            trailerUrl: game.trailerUrl ?? '',
            developer: game.developer ?? '',
            gameStatus: game.gameStatus ?? '',
            websiteUrl: game.websiteUrl ?? '',
            mainFranchise: game.mainFranchise ?? '',
            releaseDate: game.releaseDate ?? '',
            imageUrl: game.imageUrl ?? '',
            genreIds: mapNamesToIds(game.genres, genres),
            platformIds: mapNamesToIds(game.platforms, platforms),
            similarGameIds: mapNamesToIds(game.similarGames ?? [], similarGames)
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditForm(emptyEditForm);
        setEditError(null);
        setHasSyncedLookups(false);
    };

    const openDeleteModal = () => {
        setDeleteError(null);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteError(null);
    };

    const openPromotionModal = () => {
        setPromotionError(null);
        setPromotionSuccess(null);
        setIsPromotionModalOpen(true);
    };

    const closePromotionModal = () => {
        setIsPromotionModalOpen(false);
        setPromotionError(null);
    };

    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setEditForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const addSelectedItem = (
        field: 'genreIds' | 'platformIds' | 'similarGameIds',
        value: string,
        reset: (next: string) => void
    ) => {
        if (!value) return;
        const id = Number(value);
        if (Number.isNaN(id)) return;
        setEditForm((current) => {
            if (current[field].includes(id)) {
                return current;
            }
            return {
                ...current,
                [field]: [...current[field], id]
            };
        });
        reset('');
    };

    const removeSelectedItem = (field: 'genreIds' | 'platformIds' | 'similarGameIds', id: number) => {
        setEditForm((current) => ({
            ...current,
            [field]: current[field].filter((item) => item !== id)
        }));
    };

    const handleEditSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!game) return;

        setIsUpdating(true);
        setEditError(null);

        const payload: GameUpdateRequest = {
            title: editForm.title.trim(),
            description: editForm.description.trim(),
            trailerUrl: editForm.trailerUrl.trim(),
            developer: editForm.developer.trim(),
            gameStatus: editForm.gameStatus.trim(),
            websiteUrl: editForm.websiteUrl.trim(),
            mainFranchise: editForm.mainFranchise.trim(),
            releaseDate: editForm.releaseDate,
            imageUrl: editForm.imageUrl.trim() || undefined,
            genreIds: editForm.genreIds,
            platformIds: editForm.platformIds,
            similarGameIds: editForm.similarGameIds.length ? editForm.similarGameIds : undefined
        };

        try {
            const updated = await gameService.updateGame(game.id, payload);
            setGame(updated);
            setLikesCount(updated.totalLikes ?? likesCount);
            setSavedCount(updated.totalSaves ?? savedCount);
            setCommentsCount(updated.totalComments ?? commentsCount);
            setIsLiked(Boolean(updated.likedByMe));
            setIsSaved(Boolean(updated.savedByMe));
            closeEditModal();
        } catch (err: unknown) {
            setEditError(getErrorMessage(err, 'No se pudo actualizar el juego'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteGame = async () => {
        if (!game) return;

        setIsDeleting(true);
        setDeleteError(null);
        try {
            await gameService.deleteGame(game.id);
            closeDeleteModal();
            navigate('/');
        } catch (err: unknown) {
            setDeleteError(getErrorMessage(err, 'No se pudo eliminar el juego'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePromotionRequest = async () => {
        if (!game) return;

        setIsPromoting(true);
        setPromotionError(null);
        try {
            await gameRequestService.createPromotionRequest(game.id);
            setPromotionSuccess('Solicitud de promocion enviada. Un administrador revisara el pago.');
            closePromotionModal();
        } catch (err: unknown) {
            setPromotionError(getErrorMessage(err, 'No se pudo enviar la solicitud de promocion'));
        } finally {
            setIsPromoting(false);
        }
    };

    const trailerUrl = game?.trailerUrl || '';
    const isYoutubeTrailer = trailerUrl.includes('youtube.com') || trailerUrl.includes('youtu.be') || trailerUrl.includes('/embed/');
    const videoId = useMemo(() => (isYoutubeTrailer ? extractVideoId(trailerUrl) : ''), [isYoutubeTrailer, trailerUrl]);
    const embedUrl = useMemo(() => (isYoutubeTrailer ? getEmbedUrl(videoId) : ''), [isYoutubeTrailer, videoId]);
    const mediaImageUrl = useMemo(() => {
        if (!game) {
            return questionPlaceholder;
        }
        const imageUrls = game.imageUrls;
        return (
            imageUrls?.screenshotBig ||
            imageUrls?.screenshotHuge ||
            imageUrls?.size1080p ||
            imageUrls?.size720p ||
            imageUrls?.coverBig ||
            imageUrls?.coverSmall ||
            imageUrls?.thumb ||
            game.imageUrl ||
            questionPlaceholder
        );
    }, [game]);

    const toggleLike = async () => {
        if (!game || !isAuthenticated) return;
        if (isLiked) {
            await gameService.unlikeGame(game.id);
            setIsLiked(false);
            setLikesCount((current) => Math.max(0, current - 1));
            return;
        }
        setIsLikeAnimation(true);
        setTimeout(() => setIsLikeAnimation(false), 400);
        await gameService.likeGame(game.id);
        setIsLiked(true);
        setLikesCount((current) => current + 1);
    };

    const toggleSave = async () => {
        if (!game || !isAuthenticated) return;
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
                        <img src={mediaImageUrl} alt={game.title} />
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
                    {/* Leer Más */}
                    <p
                        ref={descriptionRef}
                        className={`detail-description ${isDescriptionExpanded ? 'expanded' : ''}`}
                    >
                        {game.description}
                    </p>
                    {isDescriptionTruncated && (
                        <button
                            className="read-more-btn"
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        >
                            {isDescriptionExpanded ? 'Leer menos' : 'Leer más'}
                        </button>
                    )}

                    <div className="detail-actions">
                        <button className="btn btn-secondary" onClick={toggleLike}>
                            <span className="btn-icon-text">
                                <span className={`icon heart-wrapper ${isLikeAnimation ? 'heart-pop' : ''}`}>
                                    <i className={isLiked ? "bi bi-heart-fill" : "bi bi-heart"}></i>
                                </span>
                                <span>{likesCount}</span>
                            </span>
                        </button>
                        <button className="btn btn-secondary" onClick={toggleSave}>
                            <span className="btn-icon-text">
                                <span className={`icon bookmark-wrapper ${isSaveAnimation ? 'bookmark-pop' : ''}`}>
                                    <i className={isSaved ? "bi bi-bookmark-fill" : "bi bi-bookmark"}></i>
                                </span>
                                <span>{savedCount}</span>
                            </span>
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => document.getElementById('game-comments')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <span className="btn-icon-text">
                                <span className="icon"><i className="bi bi-chat-dots-fill"></i></span>
                                <span>{commentsCount}</span>
                            </span>
                        </button>
                        {game.websiteUrl && (
                            <a className="btn btn-primary" href={game.websiteUrl} target="_blank" rel="noreferrer">
                                Sitio oficial
                            </a>
                        )}
                    </div>
                    {canManageGame && (
                        <div className="detail-admin-actions">
                            {showPromotionButton && (
                                <button className="btn btn-primary" type="button" onClick={openPromotionModal}>
                                    Promocionar juego
                                </button>
                            )}
                            <button className="btn btn-secondary" type="button" onClick={openEditModal}>
                                Editar juego
                            </button>
                            <button className="btn btn-danger" type="button" onClick={openDeleteModal}>
                                Eliminar juego
                            </button>
                        </div>
                    )}
                    {promotionSuccess && <div className="success-alert">{promotionSuccess}</div>}
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
                            <span>Géneros</span>
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
            </section>

            <section id="game-comments" className="game-detail-comments">
                <CommentsSection gameId={game.id} onCountChange={setCommentsCount} canDelete={canManageGame} />
            </section>

            {isEditModalOpen && (
                <div className="admin-modal-overlay" onClick={closeEditModal} role="presentation">
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="game-edit-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-modal-header">
                            <h2 className="admin-modal-title" id="game-edit-modal-title">Editar juego</h2>
                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeEditModal}
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </div>
                        <form className="admin-modal-form" onSubmit={handleEditSubmit}>
                            <div className="admin-modal-body">
                                {editError && <div className="error-alert">{editError}</div>}
                                {isLoadingLookups && (
                                    <div className="admin-table-feedback">
                                        <span className="spinner" />
                                    </div>
                                )}

                                <div className="profile-form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Titulo</label>
                                        <input
                                            className="form-input"
                                            name="title"
                                            value={editForm.title}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Trailer (URL)</label>
                                        <input
                                            className="form-input"
                                            name="trailerUrl"
                                            value={editForm.trailerUrl}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Sitio web (URL)</label>
                                        <input
                                            className="form-input"
                                            name="websiteUrl"
                                            value={editForm.websiteUrl}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Desarrolladora</label>
                                        <input
                                            className="form-input"
                                            name="developer"
                                            value={editForm.developer}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Estado</label>
                                        <input
                                            className="form-input"
                                            name="gameStatus"
                                            value={editForm.gameStatus}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Franquicia</label>
                                        <input
                                            className="form-input"
                                            name="mainFranchise"
                                            value={editForm.mainFranchise}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Fecha de lanzamiento</label>
                                        <input
                                            className="form-input"
                                            type="date"
                                            name="releaseDate"
                                            value={editForm.releaseDate}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Imagen (URL)</label>
                                        <input
                                            className="form-input"
                                            name="imageUrl"
                                            value={editForm.imageUrl}
                                            onChange={handleEditChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Descripcion</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleEditChange}
                                        rows={5}
                                        required
                                    />
                                </div>

                                <div className="profile-form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Generos</label>
                                        <div className="multi-select-row">
                                            <select
                                                className="form-input form-select-single"
                                                value={selectedGenreId}
                                                onChange={(event) => setSelectedGenreId(event.target.value)}
                                            >
                                                <option value="">Selecciona un genero</option>
                                                {genres.map((genre) => (
                                                    <option key={genre.id} value={genre.id}>
                                                        {genre.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => addSelectedItem('genreIds', selectedGenreId, setSelectedGenreId)}
                                                disabled={!selectedGenreId || editForm.genreIds.includes(Number(selectedGenreId))}
                                            >
                                                Añadir
                                            </button>
                                        </div>
                                        <div className="selected-tags">
                                            {editForm.genreIds.length === 0 && (
                                                <span className="selected-empty">Sin generos</span>
                                            )}
                                            {editForm.genreIds.map((id) => (
                                                <span key={id} className="selected-tag">
                                                    {genreMap.get(id) ?? `#${id}`}
                                                    <button type="button" onClick={() => removeSelectedItem('genreIds', id)}>
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Plataformas</label>
                                        <div className="multi-select-row">
                                            <select
                                                className="form-input form-select-single"
                                                value={selectedPlatformId}
                                                onChange={(event) => setSelectedPlatformId(event.target.value)}
                                            >
                                                <option value="">Selecciona una plataforma</option>
                                                {platforms.map((platform) => (
                                                    <option key={platform.id} value={platform.id}>
                                                        {platform.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => addSelectedItem('platformIds', selectedPlatformId, setSelectedPlatformId)}
                                                disabled={!selectedPlatformId || editForm.platformIds.includes(Number(selectedPlatformId))}
                                            >
                                                Añadir
                                            </button>
                                        </div>
                                        <div className="selected-tags">
                                            {editForm.platformIds.length === 0 && (
                                                <span className="selected-empty">Sin plataformas</span>
                                            )}
                                            {editForm.platformIds.map((id) => (
                                                <span key={id} className="selected-tag">
                                                    {platformMap.get(id) ?? `#${id}`}
                                                    <button type="button" onClick={() => removeSelectedItem('platformIds', id)}>
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Juegos similares (opcional)</label>
                                        <div className="multi-select-row">
                                            <select
                                                className="form-input form-select-single"
                                                value={selectedSimilarId}
                                                onChange={(event) => setSelectedSimilarId(event.target.value)}
                                            >
                                                <option value="">Selecciona un juego</option>
                                                {similarGames.map((gameItem) => (
                                                    <option key={gameItem.id} value={gameItem.id}>
                                                        {gameItem.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => addSelectedItem('similarGameIds', selectedSimilarId, setSelectedSimilarId)}
                                                disabled={!selectedSimilarId || editForm.similarGameIds.includes(Number(selectedSimilarId))}
                                            >
                                                Añadir
                                            </button>
                                        </div>
                                        <div className="selected-tags">
                                            {editForm.similarGameIds.length === 0 && (
                                                <span className="selected-empty">Sin similares</span>
                                            )}
                                            {editForm.similarGameIds.map((id) => (
                                                <span key={id} className="selected-tag">
                                                    {similarGameMap.get(id) ?? `#${id}`}
                                                    <button type="button" onClick={() => removeSelectedItem('similarGameIds', id)}>
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-modal-actions">
                                <button className="btn btn-secondary" type="button" onClick={closeEditModal}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" type="submit" disabled={isUpdating || isLoadingLookups}>
                                    {isUpdating ? <span className="spinner-small" /> : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isPromotionModalOpen && (
                <div className="admin-modal-overlay" onClick={closePromotionModal} role="presentation">
                    <div
                        className="admin-modal admin-modal-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="game-promotion-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-modal-header">
                            <h2 className="admin-modal-title" id="game-promotion-modal-title">Promocionar juego</h2>
                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closePromotionModal}
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </div>
                        <div className="admin-modal-form">
                            <div className="admin-modal-body">
                                <p>
                                    Estas seguro de solicitar la promoción de <strong>{game.title}</strong>? Se realizara el cobro una vez aceptado.
                                </p>
                                {promotionError && <div className="error-alert">{promotionError}</div>}
                            </div>
                            <div className="admin-modal-actions">
                                <button className="btn btn-secondary" type="button" onClick={closePromotionModal}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" type="button" onClick={handlePromotionRequest} disabled={isPromoting}>
                                    {isPromoting ? <span className="spinner-small" /> : 'Solicitar promocion'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="admin-modal-overlay" onClick={closeDeleteModal} role="presentation">
                    <div
                        className="admin-modal admin-modal-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="game-delete-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-modal-header">
                            <h2 className="admin-modal-title" id="game-delete-modal-title">Confirmar eliminacion</h2>
                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeDeleteModal}
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </div>
                        <div className="admin-modal-form">
                            <div className="admin-modal-body">
                                <p>
                                    Seguro que quieres borrar <strong>{game.title}</strong>? Esta accion no se puede deshacer.
                                </p>
                                {deleteError && <div className="error-alert">{deleteError}</div>}
                            </div>
                            <div className="admin-modal-actions">
                                <button className="btn btn-secondary" type="button" onClick={closeDeleteModal}>
                                    Cancelar
                                </button>
                                <button className="btn btn-danger" type="button" onClick={handleDeleteGame} disabled={isDeleting}>
                                    {isDeleting ? <span className="spinner-small" /> : 'Eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
