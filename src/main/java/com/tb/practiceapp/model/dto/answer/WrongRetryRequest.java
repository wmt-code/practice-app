package com.tb.practiceapp.model.dto.answer;

import lombok.Data;

import java.util.List;

@Data
public class WrongRetryRequest {
    /**
     * 错题记录ID列表，空则表示全部
     */
    private List<Long> ids;
}
