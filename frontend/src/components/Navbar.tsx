import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <a href="/" className="logo">
                    <span className="logo-icon">🎮</span>
                    <span className="logo-text">NextIndie</span>
                </a>
            </div>

            <div className="navbar-menu">
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
