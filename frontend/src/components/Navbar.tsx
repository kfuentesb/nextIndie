import { useAuth } from '../context/AuthContext';
import { Link, NavLink } from 'react-router-dom';

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="logo">
                    <span className="logo-icon">🎮</span>
                    <span className="logo-text">NextIndie</span>
                </Link>
            </div>

            <div className="navbar-menu">
                <div className="navbar-tabs">
                    <NavLink to="/" end className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab-active' : ''}`}>
                        Feed
                    </NavLink>
                    <NavLink to="/releases" className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab-active' : ''}`}>
                        Lanzamientos
                    </NavLink>
                </div>
                {isAuthenticated ? (
                    <div className="user-section">
                        <Link to="/saved" className="btn btn-secondary">
                            Guardados
                        </Link>
                        <span className="welcome-text">Hola, {user?.username}</span>
                        <button className="btn btn-secondary" onClick={logout}>
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
                )}
            </div>
        </nav>
    );
}
