import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminUserService } from '../services/adminUserService';
import { gameService } from '../services/gameService';
import type { AdminUser, AdminUserRequest, Game, UserRole } from '../types';
import { getErrorMessage } from '../utils/error';

const roles: UserRole[] = ['ADMIN', 'MODERADOR', 'EMPRESA', 'NORMAL'];

const emptyForm: AdminUserRequest = {
    username: '',
    email: '',
    password: '',
    role: 'NORMAL'
};

export function AdminUsersPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [formData, setFormData] = useState<AdminUserRequest>(emptyForm);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'games'>('games');
    const [games, setGames] = useState<Game[]>([]);
    const [gamesPage, setGamesPage] = useState(0);
    const [gamesPageSize, setGamesPageSize] = useState(25);
    const [gamesSearch, setGamesSearch] = useState('');
    const [gamesLoading, setGamesLoading] = useState(false);
    const [gamesError, setGamesError] = useState<string | null>(null);

    const isAdmin = user?.role === 'ADMIN';
    const pageLabel = useMemo(() => totalPages === 0 ? '0 / 0' : `${page + 1} / ${totalPages}`, [page, totalPages]);
    const totalGames = games.length;

    const loadUsers = async (targetPage = page) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminUserService.getUsers(targetPage, 10);
            setUsers(response.content);
            setPage(response.number);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'No se pudieron cargar los usuarios'));
        } finally {
            setIsLoading(false);
        }
    };

    const loadGames = async () => {
        setGamesLoading(true);
        setGamesError(null);
        try {
            const data = await gameService.getAllGames();
            setGames(data);
        } catch (err: unknown) {
            setGamesError(getErrorMessage(err, 'No se pudieron cargar los juegos'));
        } finally {
            setGamesLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            void loadUsers(0);
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated, isAdmin]);

    useEffect(() => {
        if (isAuthenticated && isAdmin && activeTab === 'games' && games.length === 0 && !gamesLoading) {
            void loadGames();
        }
    }, [activeTab, games.length, gamesLoading, isAuthenticated, isAdmin]);

    const resetForm = () => {
        setEditingUser(null);
        setFormData(emptyForm);
        setError(null);
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData(emptyForm);
        setError(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (selectedUser: AdminUser) => {
        setEditingUser(selectedUser);
        setFormData({
            username: selectedUser.username,
            email: selectedUser.email,
            password: '',
            role: selectedUser.role
        });
        setError(null);
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        resetForm();
    };

    const openDeleteModal = (selectedUser: AdminUser) => {
        setPendingDelete(selectedUser);
        setError(null);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setPendingDelete(null);
        setError(null);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const isEditing = Boolean(editingUser);
        const targetPage = isEditing ? page : 0;
        setIsSaving(true);
        setError(null);

        const payload: AdminUserRequest = {
            username: formData.username.trim(),
            email: formData.email.trim(),
            role: formData.role,
            password: formData.password?.trim() || undefined
        };

        try {
            if (editingUser) {
                await adminUserService.updateUser(editingUser.id, payload);
            } else {
                await adminUserService.createUser(payload);
            }
            closeFormModal();
            await loadUsers(targetPage);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'No se pudo guardar el usuario'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (selectedUser: AdminUser) => {
        openDeleteModal(selectedUser);
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;

        setIsDeleting(true);
        setError(null);
        try {
            await adminUserService.deleteUser(pendingDelete.id);
            const nextPage = users.length === 1 && page > 0 ? page - 1 : page;
            await loadUsers(nextPage);
            if (editingUser?.id === pendingDelete.id) {
                closeFormModal();
            }
            closeDeleteModal();
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'No se pudo eliminar el usuario'));
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredGames = useMemo(() => {
        const query = gamesSearch.trim().toLowerCase();
        if (!query) return games;
        return games.filter((game) => {
            const haystack = [
                game.title,
                game.developer,
                game.mainFranchise ?? '',
                game.gameStatus ?? '',
                game.releaseDate ? new Date(game.releaseDate).toLocaleDateString('es-ES') : ''
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(query);
        });
    }, [games, gamesSearch]);

    const gamesTotalPages = useMemo(() => {
        if (filteredGames.length === 0) return 0;
        return Math.ceil(filteredGames.length / gamesPageSize);
    }, [filteredGames.length, gamesPageSize]);

    const gamesPageLabel = useMemo(() => {
        if (gamesTotalPages === 0) return '0 / 0';
        return `${gamesPage + 1} / ${gamesTotalPages}`;
    }, [gamesPage, gamesTotalPages]);

    const pagedGames = useMemo(() => {
        const start = gamesPage * gamesPageSize;
        return filteredGames.slice(start, start + gamesPageSize);
    }, [filteredGames, gamesPage, gamesPageSize]);

    useEffect(() => {
        setGamesPage(0);
    }, [gamesPageSize, gamesSearch]);

    useEffect(() => {
        if (gamesPage > 0 && gamesPage >= gamesTotalPages) {
            setGamesPage(Math.max(gamesTotalPages - 1, 0));
        }
    }, [gamesPage, gamesTotalPages]);

    const headerTitle = activeTab === 'users' ? 'Usuarios' : 'Juegos';
    const headerSubtitle = activeTab === 'users'
        ? `${totalElements} usuarios registrados`
        : `${totalGames} juegos en la base de datos`;

    const handleGameRowClick = (gameId: number) => {
        navigate(`/games/${gameId}`);
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-page admin-state">
                <p>Debes iniciar sesion para acceder al panel de administracion.</p>
                <Link className="btn btn-primary" to="/login">Iniciar sesion</Link>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="admin-page admin-state">
                <p>No tienes permisos para acceder al panel de administracion.</p>
                <Link className="btn btn-secondary" to="/">Volver al feed</Link>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="profile-header admin-users-header">
                <div>
                    <h1>{headerTitle}</h1>
                    <p>{headerSubtitle}</p>
                </div>
                <div className="profile-tabs">
                    <button
                        type="button"
                        className={`profile-tab ${activeTab === 'games' ? 'active' : ''}`}
                        onClick={() => setActiveTab('games')}
                    >
                        Ver juegos
                    </button>
                    <button
                        type="button"
                        className={`profile-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Ver usuarios
                    </button>
                </div>
            </header>

            {activeTab === 'users' && error && <div className="error-alert">{error}</div>}
            {activeTab === 'games' && gamesError && <div className="error-alert">{gamesError}</div>}

            {activeTab === 'users' && (
                <>
                    <div className="admin-toolbar admin-toolbar-users">
                        <div className="admin-toolbar-group">
                            <button className="btn btn-secondary" onClick={openCreateModal}>
                                Nuevo usuario
                            </button>
                        </div>
                    </div>

                    <section className="admin-layout admin-layout-single">
                        <div className="admin-table-panel admin-table-panel-centered">
                            {isLoading ? (
                                <div className="admin-table-feedback">
                                    <span className="spinner" />
                                </div>
                            ) : (
                                <>
                                    <div className="admin-table-wrap admin-users-table-wrap">
                                        <table className="admin-table admin-users-table">
                                            <thead>
                                                <tr>
                                                    <th className="admin-col-user">Usuario</th>
                                                    <th className="admin-col-email">Email</th>
                                                    <th className="admin-col-role">Rol</th>
                                                    <th className="admin-col-actions">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{item.username}</td>
                                                        <td>{item.email}</td>
                                                        <td><span className="role-pill">{item.role}</span></td>
                                                        <td>
                                                            <div className="admin-row-actions">
                                                                <button className="table-action" onClick={() => openEditModal(item)}>
                                                                    Editar
                                                                </button>
                                                                <button className="table-action danger" onClick={() => handleDelete(item)}>
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="empty-table">No hay usuarios</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="pagination-bar">
                                        <button
                                            className="btn btn-secondary"
                                            disabled={page <= 0}
                                            onClick={() => loadUsers(page - 1)}
                                        >
                                            Anterior
                                        </button>
                                        <span>Pagina {pageLabel}</span>
                                        <button
                                            className="btn btn-secondary"
                                            disabled={page + 1 >= totalPages}
                                            onClick={() => loadUsers(page + 1)}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {isFormModalOpen && (
                        <div className="admin-modal-overlay" onClick={closeFormModal} role="presentation">
                            <div
                                className="admin-modal admin-modal--user-form"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="admin-user-modal-title"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <div className="admin-modal-header">
                                    <h2 className="admin-modal-title" id="admin-user-modal-title">
                                        {editingUser ? 'Editar usuario' : 'Crear usuario'}
                                    </h2>
                                    <button
                                        type="button"
                                        className="admin-modal-close"
                                        onClick={closeFormModal}
                                        aria-label="Cerrar"
                                    >
                                        ×
                                    </button>
                                </div>
                                <form className="admin-modal-form" onSubmit={handleSubmit}>
                                    <div className="admin-modal-body">
                                        {error && <div className="error-alert">{error}</div>}

                                        <div className="form-group">
                                            <label className="form-label">Nombre de usuario</label>
                                            <input
                                                className="form-input"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Correo electronico</label>
                                            <input
                                                className="form-input"
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                {editingUser ? 'Nueva password' : 'Password'}
                                            </label>
                                            <input
                                                className="form-input"
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                minLength={6}
                                                required={!editingUser}
                                                placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Rol</label>
                                            <select className="form-input" name="role" value={formData.role} onChange={handleChange}>
                                                {roles.map((role) => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="admin-modal-actions">
                                        <button className="btn btn-secondary" type="button" onClick={closeFormModal}>
                                            Cancelar
                                        </button>
                                        <button className="btn btn-primary" type="submit" disabled={isSaving}>
                                            {isSaving ? <span className="spinner-small" /> : 'Guardar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isDeleteModalOpen && pendingDelete && (
                        <div className="admin-modal-overlay" onClick={closeDeleteModal} role="presentation">
                            <div
                                className="admin-modal admin-modal--confirm"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="admin-delete-modal-title"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <div className="admin-modal-header">
                                    <h2 className="admin-modal-title" id="admin-delete-modal-title">
                                        Confirmar eliminacion
                                    </h2>
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
                                            Seguro que quieres borrar a <strong>{pendingDelete.username}</strong>? Esta accion no se puede deshacer.
                                        </p>
                                        {error && <div className="error-alert">{error}</div>}
                                    </div>
                                    <div className="admin-modal-actions">
                                        <button className="btn btn-secondary" type="button" onClick={closeDeleteModal}>
                                            Cancelar
                                        </button>
                                        <button className="btn btn-danger" type="button" onClick={confirmDelete} disabled={isDeleting}>
                                            {isDeleting ? <span className="spinner-small" /> : 'Eliminar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'games' && (
                <section className="admin-layout admin-layout-single">
                    <div className="admin-table-panel">
                        <div className="admin-toolbar">
                            <div className="admin-toolbar-group admin-toolbar-search">
                                <input
                                    className="form-input"
                                    type="search"
                                    placeholder="Buscar por titulo, desarrollador, franquicia, estado o fecha de lanzamiento"
                                    value={gamesSearch}
                                    onChange={(event) => setGamesSearch(event.target.value)}
                                />
                            </div>
                            <div className="admin-toolbar-group">
                                <label className="admin-toolbar-label">
                                    Filas
                                    <select
                                        className="form-input admin-select"
                                        value={gamesPageSize}
                                        onChange={(event) => setGamesPageSize(Number(event.target.value))}
                                    >
                                        {[10, 25, 50].map((size) => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </label>
                                <span className="admin-toolbar-count">
                                    Mostrando {pagedGames.length} de {filteredGames.length}
                                </span>
                            </div>
                        </div>

                        {gamesLoading ? (
                            <div className="admin-table-feedback">
                                <span className="spinner" />
                            </div>
                        ) : (
                            <>
                                <div className="admin-table-wrap">
                                    <table className="admin-table admin-games-table">
                                        <thead>
                                            <tr>
                                                <th className="admin-col-title">Titulo</th>
                                                <th className="admin-col-developer">Desarrolladora</th>
                                                <th className="admin-col-franchise">Franquicia</th>
                                                <th className="admin-col-status">Estado</th>
                                                <th className="admin-col-date">Lanzamiento</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagedGames.map((game) => (
                                                <tr
                                                    key={game.id}
                                                    className="admin-game-row"
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => handleGameRowClick(game.id)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter' || event.key === ' ') {
                                                            event.preventDefault();
                                                            handleGameRowClick(game.id);
                                                        }
                                                    }}
                                                >
                                                    <td className="admin-col-title">{game.title}</td>
                                                    <td className="admin-col-developer">{game.developer}</td>
                                                    <td className="admin-col-franchise">{game.mainFranchise || 'Sin franquicia'}</td>
                                                    <td className="admin-col-status">{game.gameStatus || 'Sin estado'}</td>
                                                    <td className="admin-col-date">{new Date(game.releaseDate).toLocaleDateString('es-ES')}</td>
                                                </tr>
                                            ))}
                                            {pagedGames.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="empty-table">No hay juegos</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="pagination-bar">
                                    <button
                                        className="btn btn-secondary"
                                        disabled={gamesPage <= 0}
                                        onClick={() => setGamesPage((current) => Math.max(current - 1, 0))}
                                    >
                                        Anterior
                                    </button>
                                    <span>Pagina {gamesPageLabel}</span>
                                    <button
                                        className="btn btn-secondary"
                                        disabled={gamesPage + 1 >= gamesTotalPages}
                                        onClick={() => setGamesPage((current) => Math.min(current + 1, Math.max(gamesTotalPages - 1, 0)))}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
