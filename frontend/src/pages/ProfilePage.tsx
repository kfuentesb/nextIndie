import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameRequestService } from '../services/gameRequestService';
import { lookupService } from '../services/lookupService';
import type { Game, GameRequestCreate, LookupItem } from '../types';
import { getErrorMessage } from '../utils/error';
import ImageUploadField from '../components/ImageUpload';
import questionPlaceholder from '../assets/question_mark.jpg';
import { ForbiddenPage } from './ForbiddenPage';

type RequestFormState = {
    title: string;
    igdbId: string;
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

type RequestFormErrors = Partial<Record<keyof RequestFormState, string>>;

const emptyForm: RequestFormState = {
    title: '',
    igdbId: '',
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

const isValidUrl = (value: string) => {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

const validateRequestForm = (formData: RequestFormState): RequestFormErrors => {
    const errors: RequestFormErrors = {};

    if (!formData.title.trim()) errors.title = 'El título es obligatorio.';
    if (!formData.description.trim()) errors.description = 'La descripción es obligatoria.';
    if (!formData.trailerUrl.trim()) {
        errors.trailerUrl = 'El tráiler es obligatorio.';
    } else if (!isValidUrl(formData.trailerUrl.trim())) {
        errors.trailerUrl = 'Introduce una URL válida que empiece por http:// o https://.';
    }
    if (!formData.developer.trim()) errors.developer = 'La desarrolladora es obligatoria.';
    if (!formData.gameStatus.trim()) errors.gameStatus = 'El estado del juego es obligatorio.';
    if (!formData.websiteUrl.trim()) {
        errors.websiteUrl = 'El sitio web es obligatorio.';
    } else if (!isValidUrl(formData.websiteUrl.trim())) {
        errors.websiteUrl = 'Introduce una URL válida que empiece por http:// o https://.';
    }
    if (!formData.mainFranchise.trim()) errors.mainFranchise = 'La franquicia es obligatoria.';
    if (!formData.releaseDate) errors.releaseDate = 'La fecha de lanzamiento es obligatoria.';
    if (formData.genreIds.length === 0) errors.genreIds = 'Selecciona al menos un género.';
    if (formData.platformIds.length === 0) errors.platformIds = 'Selecciona al menos una plataforma.';

    return errors;
};

export function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const canViewGames = user?.role === 'EMPRESA' || user?.role === 'ADMIN';
    const [activeTab, setActiveTab] = useState<'request' | 'games'>('games');
    const [formData, setFormData] = useState<RequestFormState>(emptyForm);
    const [genres, setGenres] = useState<LookupItem[]>([]);
    const [platforms, setPlatforms] = useState<LookupItem[]>([]);
    const [games, setGames] = useState<LookupItem[]>([]);
    const [myGames, setMyGames] = useState<Game[]>([]);
    const [isLoadingLookups, setIsLoadingLookups] = useState(true);
    const [isLoadingGames, setIsLoadingGames] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageReading, setIsImageReading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [hasSubmittedRequestForm, setHasSubmittedRequestForm] = useState(false);
    const [selectedGenreId, setSelectedGenreId] = useState('');
    const [selectedPlatformId, setSelectedPlatformId] = useState('');
    const [selectedSimilarId, setSelectedSimilarId] = useState('');

    useEffect(() => {
        if (!canViewGames) {
            setIsLoadingLookups(false);
            return;
        }

        const loadLookups = async () => {
            setIsLoadingLookups(true);
            setError(null);
            try {
                const [genreItems, platformItems, gameItems] = await Promise.all([
                    lookupService.getGenres(),
                    lookupService.getPlatforms(),
                    lookupService.getGames()
                ]);
                setGenres(genreItems);
                setPlatforms(platformItems);
                setGames(gameItems);
            } catch (err: unknown) {
                setError(getErrorMessage(err, 'No se pudieron cargar los datos del formulario'));
            } finally {
                setIsLoadingLookups(false);
            }
        };

        void loadLookups();
    }, [canViewGames]);

    useEffect(() => {
        if (!canViewGames || activeTab !== 'games') {
            return;
        }

        const loadMyGames = async () => {
            setIsLoadingGames(true);
            setError(null);
            try {
                const data = await gameRequestService.getMyGames();
                setMyGames(data);
            } catch (err: unknown) {
                setError(getErrorMessage(err, 'No se pudieron cargar tus juegos'));
            } finally {
                setIsLoadingGames(false);
            }
        };

        void loadMyGames();
    }, [activeTab, canViewGames]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
        reader.readAsDataURL(file);
    });

    const handleImageChange = async (file: File | null) => {
        if (!file) {
            setFormData((current) => ({
                ...current,
                imageUrl: ''
            }));
            return;
        }
        setIsImageReading(true);
        try {
            const dataUrl = await fileToDataUrl(file);
            setFormData((current) => ({
                ...current,
                imageUrl: dataUrl
            }));
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'No se pudo leer la imagen'));
        } finally {
            setIsImageReading(false);
        }
    };

    const addSelectedItem = (
        field: 'genreIds' | 'platformIds' | 'similarGameIds',
        value: string,
        reset: (next: string) => void
    ) => {
        if (!value) return;
        const id = Number(value);
        if (Number.isNaN(id)) return;
        setFormData((current) => {
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
        setFormData((current) => ({
            ...current,
            [field]: current[field].filter((item) => item !== id)
        }));
    };

    const resetRequestForm = () => {
        setFormData(emptyForm);
        setSelectedGenreId('');
        setSelectedPlatformId('');
        setSelectedSimilarId('');
        setHasSubmittedRequestForm(false);
        setError(null);
    };

    const genreMap = useMemo(() => new Map(genres.map((item) => [item.id, item.name])), [genres]);
    const platformMap = useMemo(() => new Map(platforms.map((item) => [item.id, item.name])), [platforms]);
    const gameMap = useMemo(() => new Map(games.map((item) => [item.id, item.name])), [games]);
    const formErrors = useMemo(() => validateRequestForm(formData), [formData]);
    const showFieldError = (field: keyof RequestFormState) => hasSubmittedRequestForm ? formErrors[field] : undefined;
    const renderFieldError = (field: keyof RequestFormState) => {
        const fieldError = showFieldError(field);
        return fieldError ? <p className="form-field-error">{fieldError}</p> : null;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setHasSubmittedRequestForm(true);
        if (Object.keys(formErrors).length > 0) {
            setError(null);
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        const payload: GameRequestCreate = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            trailerUrl: formData.trailerUrl.trim(),
            developer: formData.developer.trim(),
            gameStatus: formData.gameStatus.trim(),
            websiteUrl: formData.websiteUrl.trim(),
            mainFranchise: formData.mainFranchise.trim(),
            releaseDate: formData.releaseDate,
            imageUrl: formData.imageUrl.trim() || undefined,
            genreIds: formData.genreIds,
            platformIds: formData.platformIds,
            similarGameIds: formData.similarGameIds.length ? formData.similarGameIds : undefined
        };

        try {
            await gameRequestService.createRequest(payload);
            setSuccess('Solicitud enviada. Un administrador revisará tu juego.');
            resetRequestForm();
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'No se pudo enviar la solicitud'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const companyGames = useMemo(() => myGames, [myGames]);

    if (!isAuthenticated) {
        return (
            <div className="profile-page profile-state">
                <p>Debes iniciar sesion para acceder a tu perfil.</p>
                <Link className="btn btn-primary" to="/login">Iniciar sesion</Link>
            </div>
        );
    }

    if (!canViewGames) {
        return <ForbiddenPage />;
    }

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div>
                    <h1>Perfil empresa</h1>
                    <p>Publica tus juegos en nuestra plataforma y administra tu catálogo de juegos.</p>
                </div>
                <div className="profile-tabs">
                    <button
                        type="button"
                        className={`profile-tab ${activeTab === 'games' ? 'active' : ''}`}
                        onClick={() => setActiveTab('games')}
                    >
                        Mis juegos
                    </button>
                    <button
                        type="button"
                        className={`profile-tab ${activeTab === 'request' ? 'active' : ''}`}
                        onClick={() => setActiveTab('request')}
                    >
                        Solicitar juego
                    </button>
                </div>
            </header>

            {error && <div className="error-alert">{error}</div>}
            {success && <div className="success-alert">{success}</div>}

            {activeTab === 'request' && (
                <section className="profile-panel">
                    {isLoadingLookups ? (
                        <div className="profile-loading">
                            <span className="spinner" />
                        </div>
                    ) : (
                        <form className="profile-form" onSubmit={handleSubmit} noValidate>
                            <div className="profile-form-grid">
                                <div className="form-group">
                                    <label className="form-label">Título</label>
                                    <input
                                        className={`form-input ${showFieldError('title') ? 'form-input-error' : ''}`}
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        aria-invalid={Boolean(showFieldError('title'))}
                                    />
                                    {renderFieldError('title')}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tráiler (URL)</label>
                                    <input
                                        className={`form-input ${showFieldError('trailerUrl') ? 'form-input-error' : ''}`}
                                        name="trailerUrl"
                                        value={formData.trailerUrl}
                                        onChange={handleInputChange}
                                        aria-invalid={Boolean(showFieldError('trailerUrl'))}
                                    />
                                    {renderFieldError('trailerUrl')}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Sitio web (URL)</label>
                                    <input
                                        className={`form-input ${showFieldError('websiteUrl') ? 'form-input-error' : ''}`}
                                        name="websiteUrl"
                                        value={formData.websiteUrl}
                                        onChange={handleInputChange}
                                        aria-invalid={Boolean(showFieldError('websiteUrl'))}
                                    />
                                    {renderFieldError('websiteUrl')}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Desarrolladora</label>
                                    <input
                                        className={`form-input ${showFieldError('developer') ? 'form-input-error' : ''}`}
                                        name="developer"
                                        value={formData.developer}
                                        onChange={handleInputChange}
                                        aria-invalid={Boolean(showFieldError('developer'))}
                                    />
                                    {renderFieldError('developer')}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Estado</label>
                                    <input
                                        className={`form-input ${showFieldError('gameStatus') ? 'form-input-error' : ''}`}
                                        name="gameStatus"
                                        value={formData.gameStatus}
                                        onChange={handleInputChange}
                                        aria-invalid={Boolean(showFieldError('gameStatus'))}
                                    />
                                    {renderFieldError('gameStatus')}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Franquicia</label>
                                    <input
                                        className={`form-input ${showFieldError('mainFranchise') ? 'form-input-error' : ''}`}
                                        name="mainFranchise"
                                        value={formData.mainFranchise}
                                        onChange={handleInputChange}
                                        aria-invalid={Boolean(showFieldError('mainFranchise'))}
                                    />
                                    {renderFieldError('mainFranchise')}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Fecha de lanzamiento</label>
                                    <input
                                        className={`form-input ${showFieldError('releaseDate') ? 'form-input-error' : ''}`}
                                        type="date"
                                        name="releaseDate"
                                        value={formData.releaseDate}
                                        onChange={handleInputChange}
                                        aria-invalid={Boolean(showFieldError('releaseDate'))}
                                    />
                                    {renderFieldError('releaseDate')}
                                </div>

                                <div className="form-group">
                                    <ImageUploadField
                                        label="Imagen"
                                        fieldName="imageUrl"
                                        maxSizeMB={5}
                                        valueUrl={formData.imageUrl || null}
                                        onChange={(file) => void handleImageChange(file)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Descripción</label>
                                <textarea
                                    className={`form-input form-textarea ${showFieldError('description') ? 'form-input-error' : ''}`}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                    aria-invalid={Boolean(showFieldError('description'))}
                                />
                                {renderFieldError('description')}
                            </div>

                            <div className="profile-form-grid">
                                <div className="form-group">
                                    <label className="form-label">Géneros</label>
                                    <div className="multi-select-row">
                                        <select
                                            className={`form-input form-select-single ${showFieldError('genreIds') ? 'form-input-error' : ''}`}
                                            value={selectedGenreId}
                                            onChange={(event) => setSelectedGenreId(event.target.value)}
                                            aria-invalid={Boolean(showFieldError('genreIds'))}
                                        >
                                            <option value="">Selecciona un género</option>
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
                                            disabled={!selectedGenreId || formData.genreIds.includes(Number(selectedGenreId))}
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                    {formData.genreIds.length > 0 && (
                                        <div className="selected-tags">
                                        {formData.genreIds.map((id) => (
                                            <span key={id} className="selected-tag">
                                                {genreMap.get(id) ?? `#${id}`}
                                                <button type="button" onClick={() => removeSelectedItem('genreIds', id)}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        </div>
                                    )}
                                    {renderFieldError('genreIds')}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Plataformas</label>
                                    <div className="multi-select-row">
                                        <select
                                            className={`form-input form-select-single ${showFieldError('platformIds') ? 'form-input-error' : ''}`}
                                            value={selectedPlatformId}
                                            onChange={(event) => setSelectedPlatformId(event.target.value)}
                                            aria-invalid={Boolean(showFieldError('platformIds'))}
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
                                            disabled={!selectedPlatformId || formData.platformIds.includes(Number(selectedPlatformId))}
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                    {formData.platformIds.length > 0 && (
                                        <div className="selected-tags">
                                        {formData.platformIds.map((id) => (
                                            <span key={id} className="selected-tag">
                                                {platformMap.get(id) ?? `#${id}`}
                                                <button type="button" onClick={() => removeSelectedItem('platformIds', id)}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        </div>
                                    )}
                                    {renderFieldError('platformIds')}
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
                                            {games.map((game) => (
                                                <option key={game.id} value={game.id}>
                                                    {game.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => addSelectedItem('similarGameIds', selectedSimilarId, setSelectedSimilarId)}
                                            disabled={!selectedSimilarId || formData.similarGameIds.includes(Number(selectedSimilarId))}
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                    {formData.similarGameIds.length > 0 && (
                                        <div className="selected-tags">
                                        {formData.similarGameIds.map((id) => (
                                            <span key={id} className="selected-tag">
                                                {gameMap.get(id) ?? `#${id}`}
                                                <button type="button" onClick={() => removeSelectedItem('similarGameIds', id)}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="profile-actions">
                                <button className="btn btn-primary" type="submit" disabled={isSubmitting || isImageReading}>
                                    {isSubmitting || isImageReading ? 'Enviando...' : 'Enviar solicitud'}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    type="button"
                                    onClick={resetRequestForm}
                                    disabled={isSubmitting || isImageReading}
                                >
                                    Limpiar
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            )}

            {activeTab === 'games' && (
                <section className="profile-panel">
                    {isLoadingGames ? (
                        <div className="profile-loading">
                            <span className="spinner" />
                        </div>
                    ) : companyGames.length === 0 ? (
                        <div className="profile-empty">
                            <p>No tienes juegos aprobados todavía.</p>
                        </div>
                    ) : (
                        <div className="profile-games-grid">
                            {companyGames.map((game) => (
                                <article key={game.id} className="profile-game-card">
                                    <Link
                                        className="profile-game-link"
                                        to={`/games/${game.id}`}
                                        aria-label={`Ver detalle de ${game.title}`}
                                    >
                                        <img
                                            className="profile-game-cover"
                                            src={game.imageUrls?.coverSmall || game.imageUrls?.thumb || game.imageUrl || questionPlaceholder}
                                            alt={game.title}
                                            loading="lazy"
                                        />
                                        <div className="profile-game-info">
                                            <h3>{game.title}</h3>
                                            <p>{game.developer}</p>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
