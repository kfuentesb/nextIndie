import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '../types';
import { gameService } from '../services/gameService';

function buildCalendarDays(year: number, month: number): Date[] {
    const firstDay = new Date(year, month - 1, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const startDate = new Date(year, month - 1, 1 - startOffset);
    return Array.from({ length: 42 }, (_, i) => new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
}

const PRELOAD_RADIUS = 3;
const CACHE_KEEP_RADIUS = 8;

type MonthPointer = {
    year: number;
    month: number;
};

type MonthStatus = 'loading' | 'ready' | 'error';

type MonthCacheEntry = {
    status: MonthStatus;
    games: Game[];
    releasesByDay: Record<string, Game[]>;
    selectedDate: string | null;
    error: string | null;
};

function buildMonthKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
}

function movePointer(pointer: MonthPointer, offset: number): MonthPointer {
    const next = new Date(pointer.year, pointer.month - 1 + offset, 1);
    return { year: next.getFullYear(), month: next.getMonth() + 1 };
}

function monthDistanceFromCenter(center: MonthPointer, key: string): number {
    const [yearText, monthText] = key.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    return Math.abs((year - center.year) * 12 + (month - center.month));
}

function groupReleasesByDay(games: Game[]): Record<string, Game[]> {
    return games.reduce<Record<string, Game[]>>((acc, game) => {
        const day = game.releaseDate;
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(game);
        return acc;
    }, {});
}

export function ReleasesPage() {
    const now = new Date();
    const [activeMonth, setActiveMonth] = useState<MonthPointer>({
        year: now.getFullYear(),
        month: now.getMonth() + 1
    });
    const [monthCache, setMonthCache] = useState<Record<string, MonthCacheEntry>>({});
    const inFlight = useRef<Set<string>>(new Set());

    const loadMonth = useCallback(async (target: MonthPointer, force = false) => {
        const key = buildMonthKey(target.year, target.month);

        let shouldFetch = false;
        setMonthCache((current) => {
            const existing = current[key];
            if (!force && existing) {
                return current;
            }
            if (existing?.status === 'loading') {
                return current;
            }
            shouldFetch = true;
            return {
                ...current,
                [key]: {
                    status: 'loading',
                    games: existing?.games ?? [],
                    releasesByDay: existing?.releasesByDay ?? {},
                    selectedDate: existing?.selectedDate ?? null,
                    error: null
                }
            };
        });

        if (!shouldFetch || inFlight.current.has(key)) {
            return;
        }

        inFlight.current.add(key);
        try {
            const data = await gameService.getReleasesByMonth(target.year, target.month);
            setMonthCache((current) => {
                const existing = current[key];
                return {
                    ...current,
                    [key]: {
                        status: 'ready',
                        games: data,
                        releasesByDay: groupReleasesByDay(data),
                        selectedDate: existing?.selectedDate ?? null,
                        error: null
                    }
                };
            });
        } catch {
            setMonthCache((current) => {
                const existing = current[key];
                return {
                    ...current,
                    [key]: {
                        status: 'error',
                        games: existing?.games ?? [],
                        releasesByDay: existing?.releasesByDay ?? {},
                        selectedDate: existing?.selectedDate ?? null,
                        error: 'No se pudieron cargar los lanzamientos'
                    }
                };
            });
        } finally {
            inFlight.current.delete(key);
        }
    }, []);

    useEffect(() => {
        void loadMonth(activeMonth);

        for (let offset = -PRELOAD_RADIUS; offset <= PRELOAD_RADIUS; offset += 1) {
            if (offset === 0) continue;
            void loadMonth(movePointer(activeMonth, offset));
        }

        setMonthCache((current) => {
            const filteredEntries = Object.entries(current).filter(
                ([key]) => monthDistanceFromCenter(activeMonth, key) <= CACHE_KEEP_RADIUS
            );
            if (filteredEntries.length === Object.keys(current).length) {
                return current;
            }
            return Object.fromEntries(filteredEntries);
        });
    }, [activeMonth, loadMonth]);

    const activeKey = useMemo(() => buildMonthKey(activeMonth.year, activeMonth.month), [activeMonth]);
    const activeEntry = monthCache[activeKey];
    const releasesByDay = activeEntry?.releasesByDay ?? {};
    const selectedDate = activeEntry?.selectedDate ?? null;
    const isLoading = !activeEntry || activeEntry.status === 'loading';
    const error = activeEntry?.error ?? null;

    const calendarDays = useMemo(() => buildCalendarDays(activeMonth.year, activeMonth.month), [activeMonth]);
    const selectedDayGames = selectedDate ? (releasesByDay[selectedDate] || []) : [];

    const monthLabel = new Date(activeMonth.year, activeMonth.month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const moveMonth = (step: number) => {
        setActiveMonth((current) => movePointer(current, step));
    };

    const handleSelectDate = (iso: string) => {
        setMonthCache((current) => {
            const entry = current[activeKey];
            if (!entry || entry.selectedDate === iso) {
                return current;
            }
            return {
                ...current,
                [activeKey]: {
                    ...entry,
                    selectedDate: iso
                }
            };
        });
    };

    return (
        <div className="releases-page">
            <section className="calendar-panel">
                <header className="calendar-header">
                    <button className="month-nav-btn" onClick={() => moveMonth(-1)}>◀</button>
                    <h1>{monthLabel}</h1>
                    <button className="month-nav-btn" onClick={() => moveMonth(1)}>▶</button>
                </header>

                <div className="calendar-weekdays">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => <span key={day}>{day}</span>)}
                </div>

                <div className="calendar-grid">
                    {calendarDays.map((date) => {
                        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const inCurrentMonth = date.getMonth() + 1 === activeMonth.month;
                        const dayReleases = releasesByDay[iso] || [];
                        const isSelected = selectedDate === iso;
                        return (
                            <button
                                key={iso}
                                className={`calendar-day ${inCurrentMonth ? '' : 'calendar-day-out'} ${isSelected ? 'calendar-day-selected' : ''}`}
                                onClick={() => handleSelectDate(iso)}
                            >
                                <span>{date.getDate()}</span>
                                {dayReleases.length > 0 && <small>{dayReleases.length} juegos</small>}
                            </button>
                        );
                    })}
                </div>
                {isLoading && <p className="calendar-feedback">Cargando lanzamientos...</p>}
                {error && <p className="calendar-feedback">{error}</p>}
            </section>

            <section className="releases-day-panel">
                <h2>{selectedDate ? `Lanzamientos del ${selectedDate}` : 'Selecciona un día'}</h2>
                {selectedDate && selectedDayGames.length === 0 && <p className="calendar-feedback">No hay juegos ese día.</p>}
                {selectedDayGames.length > 0 && (
                    <div className="release-games-grid">
                        {selectedDayGames.map((game) => (
                            <Link key={game.id} to={`/games/${game.id}`} className="release-card">
                                <img src={game.imageUrl} alt={game.title} />
                                <div>
                                    <h3>{game.title}</h3>
                                    <p>{game.developer}</p>
                                    <p>{new Date(game.releaseDate).toLocaleDateString('es-ES')}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
