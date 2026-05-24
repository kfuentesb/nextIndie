import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/error';

export function LoginPage() {
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isRegisterMode) {
                await register(formData);
            } else {
                await login({ username: formData.username, password: formData.password });
            }
            navigate('/');
        } catch (err: unknown) {
            const backendMessage = getErrorMessage(err, '').toLowerCase();
            if (backendMessage.includes('nombre de usuario ya existe')) {
                setError('Ese nombre de usuario ya existe. Usa otro para registrarte.');
            } else if (backendMessage.includes('email ya está registrado') || backendMessage.includes('email ya esta registrado')) {
                setError('Ese correo ya está registrado. Usa otro correo para registrarte.');
            } else {
                setError(getErrorMessage(err, 'Error en la autenticación'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h1 className="logo">NextIndie</h1>
                    <p className="subtitle">Descubre nuevos juegos indies</p>
                </div>

                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <div className="auth-tabs">
                    <button
                        className={`tab-btn ${!isRegisterMode ? 'active' : ''}`}
                        onClick={() => setIsRegisterMode(false)}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        className={`tab-btn ${isRegisterMode ? 'active' : ''}`}
                        onClick={() => setIsRegisterMode(true)}
                    >
                        Registrarse
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Usuario</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Tu nombre de usuario"
                            required
                        />
                    </div>

                    {isRegisterMode && (
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="spinner" />
                        ) : (
                            isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'
                        )}
                    </button>
                </form>

                <div className="demo-credentials">
                    <p>Demo: admin / admin123</p>
                </div>
            </div>
        </div>
    );
}
