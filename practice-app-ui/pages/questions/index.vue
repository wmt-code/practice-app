<template>
  <view class="page">
    <view class="header">
      <view class="title-wrap">
        <text class="title">题库</text>
        <text class="subtitle">按分类浏览，快速进入练习</text>
      </view>
      <uni-easyinput
        v-model="keyword"
        placeholder="搜索想练习的考试或子分类"
        prefixIcon="search"
        clearable
        @confirm="handleSearch"
        @clear="clearSearch"
      />
    </view>

    <view class="layout">
      <scroll-view scroll-y class="side" show-scrollbar="false">
        <view
          v-for="parent in categoryTree"
          :key="parent.id"
          class="side-item"
          :class="{ active: String(parent.id) === String(selectedParent) }"
          @tap="switchParent(parent.id)"
        >
          <text class="side-text">{{ parent.name }}</text>
        </view>
      </scroll-view>

      <scroll-view scroll-y class="content" show-scrollbar="false">
        <view v-if="filteredChildren.length" class="card-list">
          <view
            v-for="item in filteredChildren"
            :key="item.id"
            class="sub-card"
            @tap="goCategory(item)"
          >
            <view class="card-header">
              <view class="name">
                <text class="sub-name">{{ item.name }}</text>
                <uni-tag
                  v-if="item.badgeText"
                  :text="item.badgeText"
                  type="warning"
                  size="mini"
                />
              </view>
              <uni-icons type="arrowright" color="#9ca3af" size="20" />
            </view>
            <view class="desc">{{ renderDesc(item) }}</view>
            <view class="meta-row">
              <text class="muted">题量 {{ item.questionCount || 0 }}</text>
              <text class="muted">已做 {{ item.finishedCount || 0 }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty">
          <text class="muted">没有匹配的分类，换个关键词试试</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { fetchCategoryTree } from '@/api/categories.js';

const categoryTree = ref([]);
const selectedParent = ref('');
const keyword = ref('');

const childrenOfParent = computed(() => {
  const parent = categoryTree.value.find((p) => String(p.id) === String(selectedParent.value));
  return parent ? parent.children : [];
});

const filteredChildren = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return childrenOfParent.value;
  return childrenOfParent.value.filter(
    (item) => {
      const name = (item.name || '').toLowerCase();
      const desc = (item.description || item.badgeText || '').toLowerCase();
      return name.includes(kw) || desc.includes(kw);
    },
  );
});

const loadCategories = async () => {
  const list = await fetchCategoryTree();
  categoryTree.value = list;
  if (!selectedParent.value && list.length) {
    selectedParent.value = String(list[0].id);
  }
};

const switchParent = (id) => {
  selectedParent.value = id;
};

const handleSearch = () => {
  // computed handles filtering
};

const clearSearch = () => {
  keyword.value = '';
};

const goCategory = (item) => {
  uni.navigateTo({
    url: `/pages/questions/category?categoryId=${item.id}`,
  });
};

const renderDesc = (item) => {
  if (item.description) return item.description;
  if (item.badgeText) return item.badgeText;
  return `共 ${item.questionCount || 0} 题`;
};

onShow(() => {
  loadCategories();
});

onPullDownRefresh(async () => {
  await loadCategories();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.page {
  padding: 16rpx 16rpx 0;
  min-height: 100vh;
}

.header {
  padding: 16rpx;
  background: #ffffff;
  border-radius: 18rpx;
  box-shadow: 0 10rpx 30rpx rgba(31, 56, 88, 0.06);
}

.title-wrap {
  margin-bottom: 12rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  display: block;
  margin-top: 6rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.layout {
  display: flex;
  margin-top: 16rpx;
  height: calc(100vh - 200rpx);
}

.side {
  width: 210rpx;
  background: #f5f7fb;
  border-radius: 16rpx;
  margin-right: 12rpx;
  padding: 8rpx 0;
}

.side-item {
  padding: 18rpx 20rpx;
  color: #374151;
  border-left: 8rpx solid transparent;
}

.side-item.active {
  background: #e0ecff;
  color: #1d4ed8;
  border-color: #2563eb;
  font-weight: 700;
}

.side-text {
  font-size: 26rpx;
}

.content {
  flex: 1;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 12rpx;
  box-shadow: 0 12rpx 30rpx rgba(31, 56, 88, 0.05);
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300rpx, 1fr));
  gap: 12rpx;
}

.sub-card {
  padding: 18rpx;
  border-radius: 14rpx;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1rpx solid #e5e7eb;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.name {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.sub-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.desc {
  margin: 8rpx 0 12rpx;
  color: #4b5563;
  font-size: 24rpx;
  line-height: 1.5;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #6b7280;
  font-size: 24rpx;
}

.muted {
  color: #6b7280;
}

.empty {
  padding: 40rpx;
  text-align: center;
  color: #6b7280;
}
</style>
