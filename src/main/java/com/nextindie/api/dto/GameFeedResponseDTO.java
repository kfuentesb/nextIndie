package com.nextindie.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class GameFeedResponseDTO {
    private List<GameDTO> games;
    private int page;
    private boolean hasMore;
}
