import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameRequestService } from '../services/gameRequestService';
import { lookupService } from '../services/lookupService';
import type { Game, GameRequestCreate, LookupItem } from '../types';
import { getErrorMessage } from '../utils/error';
import ImageUploadField from '../components/ImageUpload';
import questionPlaceholder from '../assets/question_mark.jpg';

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

export function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const isCompany = user?.role === 'EMPRESA';
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
    const [selectedGenreId, setSelectedGenreId] = useState('');
    const [selectedPlatformId, setSelectedPlatformId] = useState('');
    const [selectedSimilarId, setSelectedSimilarId] = useState('');

    useEffect(() => {
        if (!isCompany) {
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
    }, [isCompany]);

    useEffect(() => {
        if (!isCompany || activeTab !== 'games') {
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
    }, [activeTab, isCompany]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) return 'El titulo es obligatorio';
        if (!formData.description.trim()) return 'La descripcion es obligatoria';
        if (!formData.trailerUrl.trim()) return 'El trailer es obligatorio';
        if (!formData.developer.trim()) return 'La desarrolladora es obligatoria';
        if (!formData.gameStatus.trim()) return 'El estado es obligatorio';
        if (!formData.websiteUrl.trim()) return 'El sitio web es obligatorio';
        if (!formData.mainFranchise.trim()) return 'La franquicia es obligatoria';
        if (!formData.releaseDate) return 'La fecha de lanzamiento es obligatoria';
        if (formData.genreIds.length === 0) return 'Debes seleccionar al menos un genero';
        if (formData.platformIds.length === 0) return 'Debes seleccionar al menos una plataforma';
        return null;
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

    const genreMap = useMemo(() => new Map(genres.map((item) => [item.id, item.name])), [genres]);
    const platformMap = useMemo(() => new Map(platforms.map((item) => [item.id, item.name])), [platforms]);
    const gameMap = useMemo(() => new Map(games.map((item) => [item.id, item.name])), [games]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
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
            setSuccess('Solicitud enviada. Un administrador revisara tu juego.');
            setFormData(emptyForm);
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

    if (!isCompany) {
        return (
            <div className="profile-page profile-state">
                <p>Esta seccion es exclusiva para empresas.</p>
                <Link className="btn btn-secondary" to="/">Volver al feed</Link>
            </div>
        );
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
                        <form className="profile-form" onSubmit={handleSubmit}>
                            <div className="profile-form-grid">
                                <div className="form-group">
                                    <label className="form-label">Titulo</label>
                                    <input
                                        className="form-input"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Trailer (URL)</label>
                                    <input
                                        className="form-input"
                                        name="trailerUrl"
                                        value={formData.trailerUrl}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Sitio web (URL)</label>
                                    <input
                                        className="form-input"
                                        name="websiteUrl"
                                        value={formData.websiteUrl}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Desarrolladora</label>
                                    <input
                                        className="form-input"
                                        name="developer"
                                        value={formData.developer}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Estado</label>
                                    <input
                                        className="form-input"
                                        name="gameStatus"
                                        value={formData.gameStatus}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Franquicia</label>
                                    <input
                                        className="form-input"
                                        name="mainFranchise"
                                        value={formData.mainFranchise}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Fecha de lanzamiento</label>
                                    <input
                                        className="form-input"
                                        type="date"
                                        name="releaseDate"
                                        value={formData.releaseDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <ImageUploadField
                                        label="Imagen"
                                        fieldName="imageUrl"
                                        helpText="PNG o JPG, max 5MB."
                                        maxSizeMB={5}
                                        valueUrl={formData.imageUrl || null}
                                        onChange={(file) => void handleImageChange(file)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Descripcion</label>
                                <textarea
                                    className="form-input form-textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                    required
                                />
                            </div>

                            <div className="profile-form-grid">
                                <div className="form-group">
                                    <label className="form-label">Géneros</label>
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
                                            disabled={!selectedGenreId || formData.genreIds.includes(Number(selectedGenreId))}
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                    <div className="selected-tags">
                                        {formData.genreIds.length === 0 && (
                                            <span className="selected-empty">Sin generos</span>
                                        )}
                                        {formData.genreIds.map((id) => (
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
                                            disabled={!selectedPlatformId || formData.platformIds.includes(Number(selectedPlatformId))}
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                    <div className="selected-tags">
                                        {formData.platformIds.length === 0 && (
                                            <span className="selected-empty">Sin plataformas</span>
                                        )}
                                        {formData.platformIds.map((id) => (
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
                                    <div className="selected-tags">
                                        {formData.similarGameIds.length === 0 && (
                                            <span className="selected-empty">Sin similares</span>
                                        )}
                                        {formData.similarGameIds.map((id) => (
                                            <span key={id} className="selected-tag">
                                                {gameMap.get(id) ?? `#${id}`}
                                                <button type="button" onClick={() => removeSelectedItem('similarGameIds', id)}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <button className="btn btn-primary" type="submit" disabled={isSubmitting || isImageReading}>
                                    {isSubmitting || isImageReading ? 'Enviando...' : 'Enviar solicitud'}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    type="button"
                                    onClick={() => setFormData(emptyForm)}
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
