package com.nextindie.api.model.dto;

import java.time.LocalDate;

/**
 * DTO especializado para la vista de calendario de lanzamientos
 */
public class GameCalendarDTO {

    private Long id;
    private String title;
    private String thumbnailUrl;
    private String genre;
    private LocalDate releaseDate;
    private String releaseDateFormatted; // "15 de junio de 2025"
    private String dayOfMonth; // "15"
    private String monthShort; // "JUN"
    private String weekday; // "Lunes"
    private Boolean isReleased;
    private Integer daysUntilRelease;
    private Integer likesCount;
    private Integer priority; // 0 = guardado, 1 = popular, 2 = normal

    // Estados de usuario
    private Boolean isSaved;
    private Boolean isLiked;
    private Boolean notifyOnRelease;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }

    public String getReleaseDateFormatted() { return releaseDateFormatted; }
    public void setReleaseDateFormatted(String releaseDateFormatted) { this.releaseDateFormatted = releaseDateFormatted; }

    public String getDayOfMonth() { return dayOfMonth; }
    public void setDayOfMonth(String dayOfMonth) { this.dayOfMonth = dayOfMonth; }

    public String getMonthShort() { return monthShort; }
    public void setMonthShort(String monthShort) { this.monthShort = monthShort; }

    public String getWeekday() { return weekday; }
    public void setWeekday(String weekday) { this.weekday = weekday; }

    public Boolean getIsReleased() { return isReleased; }
    public void setIsReleased(Boolean isReleased) { this.isReleased = isReleased; }

    public Integer getDaysUntilRelease() { return daysUntilRelease; }
    public void setDaysUntilRelease(Integer daysUntilRelease) { this.daysUntilRelease = daysUntilRelease; }

    public Integer getLikesCount() { return likesCount; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Boolean getIsSaved() { return isSaved; }
    public void setIsSaved(Boolean isSaved) { this.isSaved = isSaved; }

    public Boolean getIsLiked() { return isLiked; }
    public void setIsLiked(Boolean isLiked) { this.isLiked = isLiked; }

    public Boolean getNotifyOnRelease() { return notifyOnRelease; }
    public void setNotifyOnRelease(Boolean notifyOnRelease) { this.notifyOnRelease = notifyOnRelease; }

    // Métodos de utilidad
    public boolean isPriority() {
        return priority != null && priority == 0;
    }

    public boolean isReleasingSoon() {
        return daysUntilRelease != null && daysUntilRelease <= 7 && daysUntilRelease > 0;
    }
}