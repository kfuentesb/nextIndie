import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminUserService } from '../services/adminUserService';
import type { AdminUser, AdminUserRequest, UserRole } from '../types';

const roles: UserRole[] = ['ADMIN', 'MODERADOR', 'EMPRESA', 'NORMAL'];

const emptyForm: AdminUserRequest = {
    username: '',
    email: '',
    password: '',
    role: 'NORMAL'
};

export function AdminUsersPage() {
    const { user, isAuthenticated } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [formData, setFormData] = useState<AdminUserRequest>(emptyForm);

    const isAdmin = user?.role === 'ADMIN';
    const pageLabel = useMemo(() => totalPages === 0 ? '0 / 0' : `${page + 1} / ${totalPages}`, [page, totalPages]);

    const loadUsers = async (targetPage = page) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminUserService.getUsers(targetPage, 10);
            setUsers(response.content);
            setPage(response.number);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'No se pudieron cargar los usuarios');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            void loadUsers(0);
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated, isAdmin]);

    const resetForm = () => {
        setEditingUser(null);
        setFormData(emptyForm);
        setError(null);
    };

    const startEdit = (selectedUser: AdminUser) => {
        setEditingUser(selectedUser);
        setFormData({
            username: selectedUser.username,
            email: selectedUser.email,
            password: '',
            role: selectedUser.role
        });
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
            resetForm();
            await loadUsers(editingUser ? page : 0);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'No se pudo guardar el usuario');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (selectedUser: AdminUser) => {
        const confirmed = window.confirm(`Eliminar a ${selectedUser.username}?`);
        if (!confirmed) return;

        setError(null);
        try {
            await adminUserService.deleteUser(selectedUser.id);
            const nextPage = users.length === 1 && page > 0 ? page - 1 : page;
            await loadUsers(nextPage);
            if (editingUser?.id === selectedUser.id) {
                resetForm();
            }
        } catch (err: unknown) {
            setError(err?.response?.data?.message || 'No se pudo eliminar el usuario');
        }
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
            <header className="admin-header">
                <div>
                    <h1>Usuarios</h1>
                    <p>{totalElements} usuarios registrados</p>
                </div>
                <button className="btn btn-secondary" onClick={resetForm}>
                    Nuevo usuario
                </button>
            </header>

            {error && <div className="error-alert">{error}</div>}

            <section className="admin-layout">
                <div className="admin-table-panel">
                    {isLoading ? (
                        <div className="admin-table-feedback">
                            <span className="spinner" />
                        </div>
                    ) : (
                        <>
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Acciones</th>
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
                                                        <button className="table-action" onClick={() => startEdit(item)}>
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

                <form className="admin-form-panel" onSubmit={handleSubmit}>
                    <h2>{editingUser ? 'Editar usuario' : 'Crear usuario'}</h2>

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

                    <div className="admin-form-actions">
                        <button className="btn btn-primary" type="submit" disabled={isSaving}>
                            {isSaving ? <span className="spinner-small" /> : 'Guardar'}
                        </button>
                        {editingUser && (
                            <button className="btn btn-secondary" type="button" onClick={resetForm}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </section>
        </div>
    );
}
