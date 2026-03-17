import { useAuth } from '../context/AuthContext';

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
                        <span className="welcome-text">Hola, {user?.username}</span>
                        <button className="btn btn-secondary" onClick={logout}>
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <a href="/login" className="btn btn-primary">Iniciar Sesión</a>
                )}
            </div>
        </nav>
    );
}