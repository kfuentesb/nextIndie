import { useState, useEffect, useCallback } from 'react';
import { VideoFeed } from '../components/VideoFeed';
import { useGames } from '../hooks/useGames';

export function FeedPage() {
    const { games, isLoading, hasMore, error, loadMore, dropHead } = useGames();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const RENDER_RADIUS = 2;

    const navigateTo = useCallback((index: number) => {
        if (isScrolling || index < 0 || index >= games.length) return;

        setIsScrolling(true);
        setCurrentIndex(index);
        setTimeout(() => setIsScrolling(false), 800);
    }, [games.length, isScrolling]);

    useEffect(() => {
        const threshold = 3;
        if (hasMore && currentIndex >= games.length - threshold) {
            void loadMore();
        }
    }, [currentIndex, games.length, hasMore, loadMore]);

    useEffect(() => {
        if (currentIndex > 20 && games.length > 30) {
            const toDrop = 10;
            dropHead(toDrop);
            setCurrentIndex((prev) => Math.max(0, prev - toDrop));
        }
    }, [currentIndex, games.length, dropHead]);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                navigateTo(currentIndex + 1);
            } else {
                navigateTo(currentIndex - 1);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                navigateTo(currentIndex + 1);
            } else if (e.key === 'ArrowUp') {
                navigateTo(currentIndex - 1);
            }
        };

        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    navigateTo(currentIndex + 1);
                } else {
                    navigateTo(currentIndex - 1);
                }
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [currentIndex, navigateTo]);

    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando juegos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className="feed-container">
            <div
                className="video-slider"
                style={{ transform: `translateY(${-currentIndex * 100}vh)` }}
            >
                {games.map((game, index) => (
                    <div
                        key={game.id}
                        className={`video-slide ${index === currentIndex ? 'active' : ''}`}
                    >
                        {Math.abs(index - currentIndex) <= RENDER_RADIUS ? (
                            <VideoFeed game={game} isActive={index === currentIndex} />
                        ) : (
                            <div className="video-placeholder" />
                        )}
                    </div>
                ))}
            </div>

            {/** USADO para ver si cargan bien los videos adicionales en feedPage
             * <div className="slide-counter">
                {currentIndex + 1} / {games.length}
                {isLoadingMore && <span> · Cargando más...</span>}
                </div>
            */}
            
        </div>
    );
}
