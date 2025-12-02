<template>
  <view class="page">
    <view class="filter">
      <picker mode="selector" :range="categoryNames" @change="onCategoryChange">
        <view class="picker">
          <text class="muted">分类筛选：</text>
          <text>{{ currentCategoryLabel }}</text>
        </view>
      </picker>
    </view>

    <view v-if="filteredRecords.length">
      <uni-card
        v-for="item in filteredRecords"
        :key="item.id"
        :is-shadow="false"
        class="record-card"
        :title="item.question?.title || '未知题目'"
      >
        <view class="row">
          <uni-tag :text="item.isCorrect ? '正确' : '错误'" :type="item.isCorrect ? 'success' : 'warning'" />
          <text class="muted">得分 {{ item.score }}</text>
          <text class="muted">用时 {{ item.spentSeconds }}s</text>
        </view>
        <view class="row">
          <text class="muted">提交：{{ formatTime(item.answeredAt) }}</text>
          <text class="muted">分类：{{ getCategoryName(item.question?.categoryId) }}</text>
        </view>
        <view class="answer-row">
          <text class="muted">我的答案：</text>
          <text>{{ item.chosen.join(', ') || '-' }}</text>
        </view>
        <view class="answer-row">
          <text class="muted">正确答案：</text>
          <text>{{ (item.question?.answer || []).join(', ') }}</text>
        </view>
      </uni-card>
    </view>

    <view v-else class="empty">
      <text class="muted">还没有答题记录，先去题库练习吧</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { fetchCategories, fetchRecords } from '@/api/mock.js';

const categories = ref([{ id: '', name: '全部' }]);
const records = ref([]);
const selectedCategory = ref('');

const categoryNames = computed(() => categories.value.map((c) => c.name));
const currentCategoryLabel = computed(
  () => categories.value.find((c) => c.id === selectedCategory.value)?.name || '全部',
);

const filteredRecords = computed(() => {
  if (!selectedCategory.value) return records.value;
  return records.value.filter((item) => item.question?.categoryId === selectedCategory.value);
});

const getCategoryName = (id) => categories.value.find((c) => c.id === id)?.name || '未分类';

const onCategoryChange = (e) => {
  const index = Number(e.detail.value);
  selectedCategory.value = categories.value[index]?.id || '';
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
};

const loadData = async () => {
  const [catList, recordList] = await Promise.all([fetchCategories(), fetchRecords()]);
  categories.value = [{ id: '', name: '全部' }, ...catList];
  records.value = recordList;
};

onShow(() => {
  loadData();
});

onPullDownRefresh(async () => {
  await loadData();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.page {
  padding: 20rpx;
}

.filter {
  margin-bottom: 16rpx;
}

.picker {
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.record-card {
  margin-bottom: 14rpx;
}

.row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 6rpx 0;
  flex-wrap: wrap;
}

.muted {
  color: #6b7280;
  font-size: 24rpx;
}

.answer-row {
  display: flex;
  gap: 10rpx;
  margin-top: 4rpx;
  color: #1f2937;
}

.empty {
  padding: 40rpx;
  text-align: center;
}
</style>
