<template>
  <view class="page">
    <uni-card :is-shadow="false" class="hero-card">
      <view class="hero">
        <image :src="user.avatar || '/static/uni.png'" class="avatar" mode="aspectFill" />
        <view class="hero-info">
          <view class="title-row">
            <text class="nickname">{{ user.nickname || '鏈櫥褰� }}</text>
            <uni-badge v-if="user.loggedIn" text="宸茬櫥褰� type="success" />
          </view>
          <view class="meta">
            <uni-badge text="绉垎" type="primary" class="mr-8" />
            <text class="meta-text">{{ user.points || 0 }}</text>
            <text class="meta-text">路 宸插畬鎴�{{ progress.answeredQuestions }}/{{ progress.totalQuestions }}</text>
          </view>
        </view>
        <button v-if="!user.loggedIn" class="login-btn" size="mini" type="primary" @tap="goProfile">
          鍘荤櫥褰�        </button>
      </view>
      <view class="progress-block">
        <view class="progress-header">
          <text class="muted">瀛︿範杩涘害</text>
          <text class="muted">姝ｇ‘鐜�{{ progress.correctRate || 0 }}%</text>
        </view>
        <progress :percent="progress.percent || 0" active stroke-width="8" />
        <view class="progress-footer">
          <text class="muted">宸插仛 {{ progress.answeredQuestions }} / {{ progress.totalQuestions }}</text>
          <text class="muted">褰撳墠绉垎 {{ user.points || 0 }}</text>
        </view>
      </view>
    </uni-card>

    <uni-section title="鍒嗙被杩涘害" type="line" padding />
    <view class="category-grid">
      <view v-for="cat in progress.categories" :key="cat.id" class="section-card">
        <view class="row">
          <text class="cat-name">{{ cat.name }}</text>
          <uni-badge :text="cat.correct + '/' + cat.total" type="primary" />
        </view>
        <text class="muted">姝ｇ‘鐜�{{ cat.correctRate }}%</text>
        <progress
          :percent="cat.total ? Math.round((cat.answered / cat.total) * 100) : 0"
          active
          stroke-width="6"
        />
      </view>
    </view>

    <uni-section title="鎺ㄨ崘棰樼洰" sub-title="浠庢湭鍋氳繃鐨勯閲屾寫閫� type="line" padding />
    <view v-if="recommended.length">
      <uni-card
        v-for="item in recommended"
        :key="item.id"
        :is-shadow="false"
        class="section-card"
        :title="item.title"
        @click="goQuestion(item.id)"
      >
        <view class="tag-row">
          <uni-tag :text="renderType(item.type)" size="mini" type="primary" />
          <uni-tag :text="getCategoryName(item.categoryId)" size="mini" type="success" />
          <text class="muted ml-auto">鍒嗗��{{ item.score }}</text>
        </view>
      </uni-card>
    </view>
    <view v-else class="empty">
      <text class="muted">鏆傛棤鎺ㄨ崘棰樼洰锛屽厛鍘婚搴撶湅鐪嬪惂锝�/text>
    </view>

    <view class="cta">
      <button type="primary" class="primary-btn" @tap="goQuestionBank">杩涘叆棰樺簱</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import {
  fetchCategories,
  fetchCurrentUser,
  fetchProgress,
  fetchRecommendedQuestions,
} from '@/api/mock.js';

const user = ref({});
const progress = ref({
  totalQuestions: 0,
  answeredQuestions: 0,
  correctRate: 0,
  categories: [],
  percent: 0,
});
const recommended = ref([]);
const categories = ref([]);

const loadData = async () => {
  const [userInfo, progressInfo, catList, recommendList] = await Promise.all([
    fetchCurrentUser(),
    fetchProgress(),
    fetchCategories(),
    fetchRecommendedQuestions(),
  ]);
  user.value = userInfo;
  progress.value = progressInfo;
  categories.value = catList;
  recommended.value = recommendList;
};

const renderType = (type) => {
  if (type === 'multiple') return '澶氶��;
  if (type === 'truefalse') return '鍒ゆ柇';
  return '鍗曢��;
};

const getCategoryName = (id) => categories.value.find((c) => c.id === id)?.name || '鏈垎绫�;

const goQuestionBank = () => {
  uni.switchTab({ url: '/pages/questions/index' });
};

const goQuestion = (id) => {
  uni.navigateTo({ url: `/pages/questions/detail?id=${id}` });
};

const goProfile = () => {
  uni.switchTab({ url: '/pages/profile/index' });
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
  padding: 24rpx;
}

.hero-card {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
  border: none;
}

.hero {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.4);
}

.hero-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nickname {
  font-size: 34rpx;
  font-weight: 700;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
}

.meta-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.login-btn {
  margin-left: 12rpx;
}

.progress-block {
  margin-top: 20rpx;
}

.progress-header,
.progress-footer {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  margin: 6rpx 0;
}

.muted {
  color: #9ca3af;
}

.section-card {
  border-radius: 16rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300rpx, 1fr));
  gap: 16rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.cat-name {
  font-weight: 600;
  font-size: 28rpx;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 12rpx;
}

.ml-auto {
  margin-left: auto;
}

.cta {
  margin: 32rpx 0;
}

.primary-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border: none;
}

.empty {
  padding: 20rpx;
  text-align: center;
}

.mr-8 {
  margin-right: 8rpx;
}
</style>
