import { useAuth } from '../context/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect((): (() => void) => {
        if (!menuOpen) return (): void => {};
        const handleClick = (e: globalThis.MouseEvent): void => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return (): void => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen]);

    const goTo = (path: string): void => {
        setMenuOpen(false);
        navigate(path);
    };

    const handleLogout = (): void => {
        setMenuOpen(false);
        logout();
        navigate('/', { replace: true });
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="logo">
                    <span className="logo-icon">🎮</span>
                    <span className="logo-text">NextIndie</span>
                </Link>
            </div>

            <div className="navbar-tabs">
                <NavLink to="/" end className={({ isActive }: { isActive: boolean }): string => `nav-tab ${isActive ? 'nav-tab-active' : ''}`}>
                    Descubre
                </NavLink>
                <NavLink to="/releases" className={({ isActive }: { isActive: boolean }): string => `nav-tab ${isActive ? 'nav-tab-active' : ''}`}>
                    Lanzamientos
                </NavLink>
                <NavLink to="/ranking" className={({ isActive }: { isActive: boolean }): string => `nav-tab ${isActive ? 'nav-tab-active' : ''}`}>
                    Top Juegos
                </NavLink>
            </div>

            <div className="navbar-menu navbar-menu-right">
                {isAuthenticated ? (
                    <div className="user-section" ref={menuRef}>
                        <button
                            type="button"
                            className="btn btn-secondary profile-btn"
                            onClick={(): void => setMenuOpen((prev: boolean): boolean => !prev)}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                        >
                            <span className="profile-icon">
                                <i className="bi bi-person-circle"></i>
                            </span>
                            <span>Perfil</span>
                        </button>

                        {menuOpen && (
                            <div role="menu" className="profile-dropdown">
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="dropdown-item"
                                    onClick={(): void => goTo('/profile')}
                                >
                                    <i className="bi bi-joystick"></i>
                                    Mis juegos
                                </button>

                                <button
                                    type="button"
                                    role="menuitem"
                                    className="dropdown-item"
                                    onClick={(): void => goTo('/saved')}
                                >
                                    <i className="bi bi-bookmark-fill dropdown-icon"></i>
                                    Guardados
                                </button>

                                {user?.role === 'ADMIN' && (
                                    <>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            className="dropdown-item"
                                            onClick={(): void => goTo('/admin/users')}
                                        >
                                            <i className="bi bi-shield-lock dropdown-icon"></i>
                                            Administración
                                        </button>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            className="dropdown-item"
                                            onClick={(): void => goTo('/admin/game-requests')}
                                        >
                                            <i className="bi bi-inbox dropdown-icon"></i>
                                            Solicitudes de juegos
                                        </button>
                                    </>
                                )}

                                <div className="dropdown-divider" />

                                <button
                                    type="button"
                                    role="menuitem"
                                    className="dropdown-item dropdown-item-danger"
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right dropdown-icon"></i>
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
                )}
            </div>
        </nav>
    );
}