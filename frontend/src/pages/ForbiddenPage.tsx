import { useNavigate } from 'react-router-dom';

export function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <div className="forbidden-page">
            <div className="forbidden-card">
                <h1 className="forbidden-code">403</h1>
                <h3 className="forbidden-title">No tienes permiso para acceder a esta pagina</h3>
                <p className="forbidden-subtitle">
                    Tu rol actual no tiene acceso a este contenido.
                </p>
                <button className="btn btn-primary forbidden-btn" onClick={() => navigate('/')}
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}