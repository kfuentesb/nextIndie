package com.nextindie.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class GameUpdateRequest {
    private String title;
    private String description;
    private String trailerUrl;
    private String developer;
    private String gameStatus;
    private String websiteUrl;
    private String mainFranchise;
    private LocalDate releaseDate;
    private String imageUrl;
    private List<Long> genreIds;
    private List<Long> platformIds;
    private List<Long> similarGameIds;
}
