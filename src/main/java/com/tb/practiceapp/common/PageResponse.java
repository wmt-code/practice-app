package com.tb.practiceapp.common;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PageResponse<T> {
    private long page;
    private long size;
    private long total;
    private List<T> records;
}
