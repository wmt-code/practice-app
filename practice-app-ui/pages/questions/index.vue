<template>
  <view class="page">
    <uni-search-bar
      v-model="keyword"
      placeholder="搜索题目关键词"
      cancel-button="always"
      clear-button="always"
      @confirm="loadQuestions"
      @cancel="clearSearch"
      @clear="clearSearch"
    />

    <scroll-view scroll-x class="category-scroll" show-scrollbar="false">
      <view
        v-for="cat in categories"
        :key="cat.id || 'all'"
        class="chip"
        :class="{ active: cat.id === selectedCategory }"
        @tap="switchCategory(cat.id)"
      >
        <text>{{ cat.name }}</text>
      </view>
    </scroll-view>

    <view class="list-wrapper">
      <uni-list>
        <uni-list-item
          v-for="item in questions"
          :key="item.id"
          :title="item.title"
          clickable
          :note="getCategoryName(item.categoryId)"
          @click="goDetail(item.id)"
        >
          <template #footer>
            <view class="footer">
              <uni-tag :text="renderType(item.type)" size="mini" type="primary" />
              <text class="muted">分值 {{ item.score }}</text>
              <text class="muted">预计 {{ item.duration }}s</text>
            </view>
          </template>
        </uni-list-item>
      </uni-list>
      <view v-if="!questions.length" class="empty">
        <text class="muted">暂无题目，换个分类或关键词试试</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { fetchCategories, fetchQuestions } from '@/api/mock.js';

const categories = ref([{ id: '', name: '全部' }]);
const selectedCategory = ref('');
const questions = ref([]);
const keyword = ref('');

const loadCategories = async () => {
  const list = await fetchCategories();
  categories.value = [{ id: '', name: '全部' }, ...list];
};

const loadQuestions = async () => {
  const list = await fetchQuestions({
    categoryId: selectedCategory.value,
    keyword: keyword.value,
  });
  questions.value = list;
};

const switchCategory = (id) => {
  selectedCategory.value = id;
  loadQuestions();
};

const clearSearch = () => {
  keyword.value = '';
  loadQuestions();
};

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/questions/detail?id=${id}` });
};

const renderType = (type) => {
  if (type === 'multiple') return '多选';
  if (type === 'truefalse') return '判断';
  return '单选';
};

const getCategoryName = (id) => {
  const found = categories.value.find((c) => c.id === id);
  return found ? found.name : '未分类';
};

onShow(() => {
  loadCategories();
  loadQuestions();
});

onPullDownRefresh(async () => {
  await loadCategories();
  await loadQuestions();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.page {
  padding: 20rpx;
}

.category-scroll {
  white-space: nowrap;
  margin: 16rpx 0;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 28rpx;
  margin-right: 12rpx;
  border-radius: 40rpx;
  background: #f3f4f6;
  color: #374151;
  font-size: 26rpx;
  border: 1rpx solid transparent;
}

.chip.active {
  background: #e0ecff;
  color: #1d4ed8;
  border-color: #2563eb;
}

.list-wrapper {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 30rpx rgba(31, 56, 88, 0.06);
}

.footer {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.muted {
  color: #6b7280;
  font-size: 24rpx;
}

.empty {
  padding: 36rpx;
  text-align: center;
}
</style>
