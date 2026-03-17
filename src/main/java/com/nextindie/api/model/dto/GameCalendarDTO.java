package com.nextindie.api.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class GameCalendarDTO {

    private Long id;
    private String title;
    private String thumbnailUrl;
    private String genre;
    private LocalDate releaseDate;
    private Integer likesCount;
    private Integer priority;

    // Campos formateados
    private String dayOfMonth;
    private String monthShort;
    private String weekday;
    private String releaseDateFormatted;

    // Estados
    private Boolean isReleased;
    private Integer daysUntilRelease;
    private Boolean isSaved;
    private Boolean isLiked;
    private Boolean notifyOnRelease;

}