import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import type { Game } from "../types";
import { gameService } from "../services/gameService";
import questionPlaceholder from "../assets/question_mark.jpg";

function buildCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month - 1, 1 - startOffset);
  return Array.from(
    { length: 42 },
    (_, i) =>
      new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + i,
      ),
  );
}

export function ReleasesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendario responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarWrapperRef = useRef<HTMLDivElement>(null);

  // Detectar tamaño pantalla móvil
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Cerrar popover si pulsas fuera
  useEffect(() => {
    if (!calendarOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!calendarWrapperRef.current?.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [calendarOpen]);

  useEffect(() => {
    const loadReleases = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await gameService.getReleasesByMonth(year, month);
        setGames(data);
      } catch {
        setError("No se pudieron cargar los lanzamientos");
      } finally {
        setIsLoading(false);
      }
    };
    loadReleases();
  }, [year, month]);

  const releasesByDay = useMemo(() => {
    return games.reduce<Record<string, Game[]>>((acc, game) => {
      const day = game.releaseDate;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(game);
      return acc;
    }, {});
  }, [games]);

  const calendarDays = useMemo(
    () => buildCalendarDays(year, month),
    [year, month],
  );
  const selectedDayGames = selectedDate
    ? releasesByDay[selectedDate] || []
    : [];

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const moveMonth = (step: number) => {
    const next = new Date(year, month - 1 + step, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
    setSelectedDate(null);
  };

  const getReleaseImage = (game: Game): string => {
    return (
      game.imageUrls?.thumb ||
      game.imageUrls?.coverSmall ||
      game.imageUrls?.coverBig ||
      game.imageUrl ||
      questionPlaceholder
    );
  };

  return (
    <div className="releases-page">
      <section className="calendar-panel">
        {isMobile ? (
          <div className="calendar-mobile-wrapper" ref={calendarWrapperRef}>
            <button
              className="calendar-toggle-btn"
              onClick={() => setCalendarOpen((open) => !open)}
            >
              {selectedDate
                ? `Calendario: ${new Date(selectedDate).toLocaleDateString("es-ES")}`
                : "Abrir calendario"}
              <span style={{ marginLeft: 8 }} aria-hidden>
                📅
              </span>
            </button>
            {calendarOpen && (
              <div className="calendar-mobile-popover">
                <header className="calendar-header">
                  <button
                    className="month-nav-btn"
                    onClick={() => moveMonth(-1)}
                  >
                    ◀
                  </button>
                  <h1>{monthLabel}</h1>
                  <button
                    className="month-nav-btn"
                    onClick={() => moveMonth(1)}
                  >
                    ▶
                  </button>
                </header>
                <div className="calendar-weekdays">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                    (day) => (
                      <span key={day}>{day}</span>
                    ),
                  )}
                </div>
                <div className="calendar-grid">
                  {calendarDays.map((date) => {
                    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                    const inCurrentMonth = date.getMonth() + 1 === month;
                    const dayReleases = releasesByDay[iso] || [];
                    const isSelected = selectedDate === iso;
                    return (
                      <button
                        key={iso}
                        className={`calendar-day ${inCurrentMonth ? "" : "calendar-day-out"} ${isSelected ? "calendar-day-selected" : ""}`}
                        onClick={() => {
                          setSelectedDate(iso);
                          setCalendarOpen(false);
                        }}
                      >
                        <span>{date.getDate()}</span>
                        {dayReleases.length > 0 && (
                          <small>{dayReleases.length} juegos</small>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {isLoading && (
              <p className="calendar-feedback">Cargando lanzamientos...</p>
            )}
            {error && <p className="calendar-feedback">{error}</p>}
          </div>
        ) : (
          <section className="calendar-panel">
            {/* Calendario Escritorio */}
            <header className="calendar-header">
              <button className="month-nav-btn" onClick={() => moveMonth(-1)}>
                ◀
              </button>
              <h1>{monthLabel}</h1>
              <button className="month-nav-btn" onClick={() => moveMonth(1)}>
                ▶
              </button>
            </header>
            <div className="calendar-weekdays">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {calendarDays.map((date) => {
                const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                const inCurrentMonth = date.getMonth() + 1 === month;
                const dayReleases = releasesByDay[iso] || [];
                const isSelected = selectedDate === iso;
                return (
                  <button
                    key={iso}
                    className={`calendar-day ${inCurrentMonth ? "" : "calendar-day-out"} ${isSelected ? "calendar-day-selected" : ""}`}
                    onClick={() => setSelectedDate(iso)}
                  >
                    <span>{date.getDate()}</span>
                    {dayReleases.length > 0 && (
                      <small>{dayReleases.length} juegos</small>
                    )}
                  </button>
                );
              })}
            </div>
            {isLoading && (
              <p className="calendar-feedback">Cargando lanzamientos...</p>
            )}
            {error && <p className="calendar-feedback">{error}</p>}
          </section>
        )}
      </section>

      <section className="releases-day-panel">
        <h2>
          {selectedDate
            ? `Lanzamientos del ${new Date(selectedDate).toLocaleDateString("es-ES")}`
            : "Selecciona un día"}
        </h2>
        {selectedDate && selectedDayGames.length === 0 && (
          <p className="calendar-feedback">No hay juegos ese día.</p>
        )}
        {selectedDayGames.length > 0 && (
          <div className="release-games-grid">
            {selectedDayGames.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="release-card"
              >
                <img src={getReleaseImage(game)} alt={game.title} />
                <div>
                  <h3>{game.title}</h3>
                  <p>{game.developer}</p>
                  <p>
                    {new Date(game.releaseDate).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
