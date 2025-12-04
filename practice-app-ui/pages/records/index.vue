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
        :key="item.questionId + '-' + item.answeredAt"
        :is-shadow="false"
        class="record-card"
        :title="item.questionTitle || '未知题目'"
      >
        <view class="row">
          <uni-tag
            :text="item.isCorrect ? '正确' : '错误'"
            :type="item.isCorrect ? 'success' : 'warning'"
          />
          <uni-tag
            v-if="item.difficulty"
            :text="renderDifficulty(item.difficulty)"
            size="small"
            type="primary"
          />
          <text class="muted">得分 {{ item.score }}</text>
          <text class="muted">用时 {{ item.timeSpent }}s</text>
        </view>
        <view class="row">
          <text class="muted">提交：{{ formatTime(item.answeredAt) }}</text>
          <text class="muted">分类：{{ item.categoryName || getCategoryName(item.categoryId) }}</text>
        </view>
      </uni-card>
      <uni-load-more :status="pager.finished ? 'noMore' : pager.loading ? 'loading' : 'more'" />
    </view>

    <view v-else class="empty">
      <text class="muted">还没有答题记录，先去题库练习吧</text>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app';
import { fetchCategories } from '@/api/categories.js';
import { fetchAnswerHistory } from '@/api/answers.js';
import { fetchQuestionDetail } from '@/api/questions.js';

const categories = ref([{ id: '', name: '全部' }]);
const records = ref([]);
const selectedCategory = ref('');
const pager = reactive({
  page: 1,
  size: 10,
  total: 0,
  finished: false,
  loading: false,
});
const questionCache = reactive({});
const loading = ref(false);

const categoryNames = computed(() => categories.value.map((c) => c.name));
const currentCategoryLabel = computed(() => {
  const target = String(selectedCategory.value || '');
  return categories.value.find((c) => String(c.id) === target)?.name || '全部';
});

const filteredRecords = computed(() => {
  if (!selectedCategory.value) return records.value;
  const target = String(selectedCategory.value);
  return records.value.filter((item) => String(item.categoryId) === target);
});

const getCategoryName = (id) =>
  categories.value.find((c) => String(c.id) === String(id))?.name || '未分类';

const renderDifficulty = (difficulty) => {
  const t = String(difficulty || '').toLowerCase();
  if (t.includes('hard')) return '困难';
  if (t.includes('medium')) return '中等';
  if (t.includes('easy')) return '容易';
  return difficulty || '未设置';
};

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

const loadCategories = async () => {
  try {
    const list = await fetchCategories();
    categories.value = [{ id: '', name: '全部' }, ...list];
  } catch (err) {
    console.error(err);
  }
};

const enrichWithQuestionDetail = async (list = []) => {
  const ids = [...new Set(list.map((item) => item.questionId).filter(Boolean))].filter(
    (id) => !questionCache[id],
  );
  if (ids.length) {
    const detailList = await Promise.all(
      ids.map((id) =>
        fetchQuestionDetail(id)
          .then((detail) => ({ id, detail }))
          .catch(() => ({ id, detail: null })),
      ),
    );
    detailList.forEach(({ id, detail }) => {
      questionCache[id] = detail;
    });
  }
  return list.map((item) => {
    const detail = questionCache[item.questionId];
    return {
      ...item,
      categoryId: detail?.categoryId,
      categoryName: detail ? getCategoryName(detail.categoryId) : '',
    };
  });
};

const loadRecords = async (reset = false) => {
  if (pager.loading || (pager.finished && !reset)) return;
  pager.loading = true;
  loading.value = reset;
  try {
    const pageToLoad = reset ? 1 : pager.page;
    const res = await fetchAnswerHistory({ page: pageToLoad, size: pager.size });
    pager.total = res.total || 0;
    const enriched = await enrichWithQuestionDetail(res.records || []);
    if (reset) {
      records.value = enriched;
      pager.page = 2;
      pager.finished = records.value.length >= pager.total || !enriched.length;
    } else {
      records.value = [...records.value, ...enriched];
      pager.page += 1;
      if (!enriched.length || records.value.length >= pager.total) {
        pager.finished = true;
      }
    }
  } catch (err) {
    console.error(err);
    uni.showToast({ title: '加载记录失败', icon: 'none' });
  } finally {
    pager.loading = false;
    loading.value = false;
  }
};

onShow(() => {
  loadCategories();
  loadRecords(true);
});

onPullDownRefresh(async () => {
  await loadCategories();
  await loadRecords(true);
  uni.stopPullDownRefresh();
});

onReachBottom(() => {
  loadRecords(false);
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
