import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameRequestService } from '../services/gameRequestService';
import type { GameRequestResponse, GameRequestStatus } from '../types';
import { getErrorMessage } from '../utils/error';
import { ForbiddenPage } from './ForbiddenPage';

const statusOptions: GameRequestStatus[] = ['PENDING', 'APPROVED', 'PROMOTED', 'REJECTED'];

const statusLabels: Record<GameRequestStatus, string> = {
    PENDING: 'Pendientes',
    APPROVED: 'Aprobadas',
    PROMOTED: 'Promocionados',
    REJECTED: 'Rechazadas'
};

export function AdminGameRequestsPage() {
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const [requests, setRequests] = useState<GameRequestResponse[]>([]);
    const [statusFilter, setStatusFilter] = useState<GameRequestStatus>('PENDING');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadRequests = async (status = statusFilter) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await gameRequestService.getAdminRequests(status);
            setRequests(data);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'No se pudieron cargar las solicitudes'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            void loadRequests('PENDING');
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated, isAdmin]);

    const handleApprove = async (requestId: number) => {
        setError(null);
        try {
            await gameRequestService.approveRequest(requestId);
            await loadRequests();
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'No se pudo aprobar la solicitud'));
        }
    };

    const handleReject = async (requestId: number) => {
        const confirmed = window.confirm('Rechazar esta solicitud?');
        if (!confirmed) return;
        setError(null);
        try {
            await gameRequestService.rejectRequest(requestId);
            await loadRequests();
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'No se pudo rechazar la solicitud'));
        }
    };

    const emptyLabel = useMemo(() => {
        if (statusFilter === 'PENDING') return 'No hay solicitudes pendientes.';
        if (statusFilter === 'APPROVED') return 'No hay solicitudes aprobadas.';
        if (statusFilter === 'PROMOTED') return 'No hay solicitudes promocionadas.';
        return 'No hay solicitudes rechazadas.';
    }, [statusFilter]);

    const headerSubtitle = `${requests.length} solicitudes ${statusLabels[statusFilter].toLowerCase()}`;

    if (!isAuthenticated) {
        return (
            <div className="admin-page admin-state">
                <p>Debes iniciar sesion para acceder a las solicitudes.</p>
                <Link className="btn btn-primary" to="/login">Iniciar sesion</Link>
            </div>
        );
    }

    if (!isAdmin) {
        return <ForbiddenPage />;
    }

    return (
        <div className="admin-page">
            <header className="profile-header admin-users-header">
                <div>
                    <h1>Solicitudes de juegos</h1>
                    <p>{headerSubtitle}</p>
                </div>
                <div className="profile-tabs">
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            type="button"
                            className={`profile-tab ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => {
                                setStatusFilter(status);
                                void loadRequests(status);
                            }}
                        >
                            {statusLabels[status]}
                        </button>
                    ))}
                </div>
            </header>

            {error && <div className="error-alert">{error}</div>}

            {isLoading ? (
                <div className="admin-table-feedback">
                    <span className="spinner" />
                </div>
            ) : requests.length === 0 ? (
                <div className="admin-table-feedback">
                    <p>{emptyLabel}</p>
                </div>
            ) : (
                <div className="admin-requests-grid">
                    {requests.map((request) => {
                        const isPromotion = request.requestType === 'PROMOTION';
                        return (
                            <article key={request.id} className="request-card">
                                <header>
                                    <div>
                                        <h3>{request.title}</h3>
                                        <div className="request-subhead">
                                            <p>Empresa: {request.requestedBy}</p>
                                            {isPromotion && (
                                                <span className="request-badge request-badge-promo">Promocion</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`request-status request-status-${request.status.toLowerCase()}`}>
                                        {request.status}
                                    </span>
                                </header>

                            <div className="request-meta">
                                <p><strong>Fecha:</strong> {new Date(request.releaseDate).toLocaleDateString('es-ES')}</p>
                                <p><strong>Estado:</strong> {request.gameStatus}</p>
                                <p><strong>Trailer:</strong> {request.trailerUrl}</p>
                                <p><strong>Web:</strong> {request.websiteUrl}</p>
                            </div>

                            <div className="request-tags">
                                <div>
                                    <span>Generos</span>
                                    <p>{request.genres.join(', ') || 'Sin genero'}</p>
                                </div>
                                <div>
                                    <span>Plataformas</span>
                                    <p>{request.platforms.join(', ') || 'Sin plataformas'}</p>
                                </div>
                                <div>
                                    <span>Similares</span>
                                    <p>{request.similarGames.join(', ') || 'Sin similares'}</p>
                                </div>
                            </div>

                                {request.status === 'PENDING' && (
                                    <div className="request-actions">
                                        <button className="btn btn-primary" onClick={() => handleApprove(request.id)}>
                                            Aprobar
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => handleReject(request.id)}>
                                            Rechazar
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
