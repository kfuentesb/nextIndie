import { useState } from "react";
import { useNavigate } from "react-router-dom";
import notFound from "../assets/notFound404.png";

export function NotFoundPage() {
    const navigate = useNavigate();
    const [imgLoading, setImgLoading] = useState(true);

    return (
        <div className="not-found-page">
            <div className="not-found-glow" />

            <div className="not-found-content">
                <div className="not-found-image-wrap">
                    {imgLoading && (
                        <div className="spinner not-found-spinner" />
                    )}
                    <img
                        src={notFound}
                        alt="Página no encontrada"
                        onLoad={() => setImgLoading(false)}
                        className={`not-found-image ${imgLoading ? "" : "is-ready"}`}
                    />
                </div>

                <div className="not-found-text">
                    <h1 className="not-found-title">
                        ¡Ups! Página no encontrada
                    </h1>
                    <p className="not-found-subtitle">
                        Parece que te has aventurado demasiado lejos.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="btn btn-primary not-found-btn"
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}
