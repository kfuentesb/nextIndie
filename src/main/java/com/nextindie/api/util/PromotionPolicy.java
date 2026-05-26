package com.nextindie.api.util;

import java.time.LocalDateTime;

public final class PromotionPolicy {
    public static final int PROMOTION_ACTIVE_DAYS = 30;

    private PromotionPolicy() {
    }

    public static boolean isPromotionActive(LocalDateTime reviewedAt) {
        if (reviewedAt == null) {
            return false;
        }
        return reviewedAt.isAfter(LocalDateTime.now().minusDays(PROMOTION_ACTIVE_DAYS));
    }
}
