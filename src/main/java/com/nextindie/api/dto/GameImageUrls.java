package com.nextindie.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameImageUrls {
    // Tamaños pequeños
    private String micro;        // 35 x 35   (Thumb, Center gravity)
    private String thumb;        // 90 x 90   (Thumb, Center gravity)
    private String coverSmall;   // 90 x 128  (Fit)
    
    // Tamaños medianos
    private String logoMed;      // 284 x 160 (Fit)
    private String screenshotMed;// 569 x 320 (Lfill, Center gravity)
    private String coverBig;     // 264 x 374 (Fit)
    
    // Tamaños grandes
    private String screenshotBig;   // 889 x 500  (Lfill, Center gravity)
    private String screenshotHuge;  // 1280 x 720 (Lfill, Center gravity)
    private String size720p;        // 1280 x 720 (Fit, Center gravity)
    
    // Tamaños extra grandes
    private String size1080p;       // 1920 x 1080 (Fit, Center gravity)
    
    // Variantes retina (_2x) - doble resolución
    private String micro2x;
    private String thumb2x;
    private String coverSmall2x;
    private String logoMed2x;
    private String screenshotMed2x;
    private String coverBig2x;
    private String screenshotBig2x;
    private String screenshotHuge2x;
    private String size720p2x;
    private String size1080p2x;
}
