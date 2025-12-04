<template>
  <view class="page">
    <uni-card :is-shadow="false" class="hero-card">
      <view class="hero">
        <image :src="user.avatar || '/static/uni.png'" class="avatar" mode="aspectFill" />
        <view class="hero-info">
          <view class="title-row">
            <text class="nickname">{{ user.nickname || '未登录' }}</text>
            <uni-badge v-if="user.loggedIn" text="已登录" type="success" />
          </view>
          <view class="meta">
            <uni-badge text="积分" type="primary" class="mr-8" />
            <text class="meta-text">{{ user.points || 0 }}</text>
            <text class="meta-text">已完成 {{ progress.answeredQuestions }}/{{ progress.totalQuestions }}</text>
          </view>
        </view>
        <button v-if="!user.loggedIn" class="login-btn" size="mini" type="primary" @tap="goProfile">
          去登录
        </button>
      </view>
      <view class="progress-block">
        <view class="progress-header">
          <text class="muted">学习进度</text>
          <text class="muted">正确率 {{ progress.correctRate || 0 }}%</text>
        </view>
        <progress :percent="progress.percent || 0" active stroke-width="8" />
        <view class="progress-footer">
          <text class="muted">已做 {{ progress.answeredQuestions }} / {{ progress.totalQuestions }}</text>
          <text class="muted">当前积分 {{ user.points || 0 }}</text>
        </view>
      </view>
    </uni-card>

    <uni-section title="分类进度" type="line" padding />
    <view class="category-grid">
      <view v-for="cat in progress.categories" :key="cat.id" class="section-card">
        <view class="row">
          <text class="cat-name">{{ cat.name }}</text>
          <uni-badge :text="cat.correct + '/' + cat.total" type="primary" />
        </view>
        <text class="muted">正确率 {{ cat.correctRate }}%</text>
        <progress
          :percent="cat.total ? Math.round((cat.answered / cat.total) * 100) : 0"
          active
          stroke-width="6"
        />
      </view>
    </view>

    <uni-section title="推荐题目" sub-title="从未做过的题目里精选" type="line" padding />
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
          <uni-tag
            v-if="item.difficulty"
            :text="renderDifficulty(item.difficulty)"
            size="mini"
            type="warning"
          />
          <uni-tag :text="getCategoryName(item.categoryId)" size="mini" type="success" />
          <text class="muted ml-auto">分值 {{ item.score }}</text>
        </view>
      </uni-card>
    </view>
    <view v-else class="empty">
      <text class="muted">暂无推荐题目，先去题库看看吧</text>
    </view>

    <view class="cta">
      <button type="primary" class="primary-btn" @tap="goQuestionBank">进入题库</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { fetchCategoryTree, flattenCategoryTree, categoryNameById } from '@/api/categories.js';
import { fetchPracticeRandom } from '@/api/questions.js';
import { fetchProfile, getCachedProfile } from '@/api/user';
import { emptyProgress, fetchProgressSummary } from '@/api/progress';

const fallbackUser = () =>
  getCachedProfile() || {
    nickname: '未登录',
    avatar: '/static/uni.png',
    loggedIn: false,
    points: 0,
  };

const user = ref(fallbackUser());
const progress = ref(emptyProgress());
const recommended = ref([]);
const categories = ref([]);
const categoryTree = ref([]);

const loadData = async () => {
  const [userResult, progressResult, catTreeRes, recommendList] = await Promise.allSettled([
    fetchProfile(),
    fetchProgressSummary(),
    fetchCategoryTree(),
    fetchPracticeRandom({ limit: 3 }),
  ]);
  user.value =
    userResult.status === 'fulfilled' && userResult.value ? userResult.value : fallbackUser();
  progress.value =
    progressResult.status === 'fulfilled' && progressResult.value
      ? progressResult.value
      : emptyProgress();
  categoryTree.value = catTreeRes.status === 'fulfilled' ? catTreeRes.value : [];
  categories.value =
    catTreeRes.status === 'fulfilled' && Array.isArray(catTreeRes.value)
      ? flattenCategoryTree(catTreeRes.value)
      : [];
  recommended.value = recommendList.status === 'fulfilled' ? recommendList.value : [];
};

const renderType = (type) => {
  const text = String(type || '');
  const lower = text.toLowerCase();
  if (lower.includes('multiple') || text.includes('多选')) return '多选';
  if (lower.includes('true') || lower.includes('judge') || text.includes('判断') || text.includes('是非')) {
    return '判断';
  }
  if (lower.includes('fill') || lower.includes('short') || text.includes('填空') || text.includes('简答')) {
    return '简答';
  }
  return '单选';
};

const getCategoryName = (id) => categoryNameById(categories.value, id) || '未分类';

const renderDifficulty = (difficulty) => {
  if (!difficulty) return '不限难度';
  if (difficulty === 'HARD') return '困难';
  if (difficulty === 'MEDIUM') return '中等';
  if (difficulty === 'EASY') return '容易';
  return difficulty;
};

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
