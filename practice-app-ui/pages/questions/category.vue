<template>
  <view class="page">
    <view class="hero" v-if="category">
      <view class="crumb">{{ parentName }}</view>
      <view class="hero-title">
        <text class="name">{{ category.name }}</text>
        <uni-tag text="题库" type="primary" size="mini" />
      </view>
      <view v-if="category.description" class="hero-desc">{{ category.description }}</view>
      <view class="hero-meta">
        <text class="muted">题量 {{ summary.total }}</text>
        <text class="muted">已做 {{ summary.answered }}</text>
        <text class="muted">最近更新 {{ category.updatedAt || '--' }}</text>
      </view>
    </view>

    <view v-if="loading" class="loading">
      <uni-load-more status="loading" iconType="circle" />
    </view>

    <view v-else class="section-card">
      <view class="section-header">
        <text class="section-title">练习模式</text>
        <text class="muted">顺序刷题或随机抽题</text>
      </view>
      <view class="practice-grid">
        <view class="practice-card order" @tap="startOrder">
          <view class="card-top">
            <text class="title">顺序练习</text>
            <uni-icons type="redo" size="22" color="#fff" />
          </view>
          <text class="desc">按题目顺序从头到尾刷题</text>
          <view class="meta">共 {{ summary.total }} 题 · 已做 {{ summary.answered }}</view>
          <button
            type="primary"
            size="mini"
            class="ghost"
            :disabled="!summary.total || loading || navigating"
            :loading="loading || navigating"
            @tap.stop="startOrder"
          >
            开始
          </button>
        </view>
        <view class="practice-card random">
          <view class="card-top">
            <text class="title">随机练习</text>
            <uni-icons type="hand-up" size="22" color="#111827" />
          </view>
          <text class="desc">打乱顺序，可自定义抽取题量</text>
          <view class="input-row">
            <text class="muted">抽题数量</text>
            <uni-easyinput
              v-model.number="customCount"
              type="number"
              placeholder="输入数量"
              :clearable="false"
              :inputBorder="true"
            />
          </view>
          <view class="meta">最多 {{ summary.total }} 题</view>
          <button
            type="default"
            size="mini"
            class="primary"
            :disabled="!summary.total || loading || navigating"
            :loading="loading || navigating"
            @tap.stop="startRandom"
          >
            开始随机
          </button>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-header">
        <text class="section-title">练习提示</text>
      </view>
      <view class="tips">
        <view class="tip-item">顺序练习：按题序自动推进，适合全面梳理。</view>
        <view class="tip-item">随机练习：打乱顺序，可抽取部分题目速刷。</view>
        <view class="tip-item">答对自动进入下一题；答错展示解析后需左滑切题。</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { fetchCategoryTree, flattenCategoryTree } from '@/api/categories.js';
import { fetchPracticeSequence } from '@/api/questions.js';
import { fetchProgressSummary } from '@/api/progress';

const navigateWithFallback = (url, { timeout = 1500 } = {}) =>
  new Promise((resolve, reject) => {
    let settled = false;
    const clear = () => {
      settled = true;
      if (timer) clearTimeout(timer);
    };
    const timer = setTimeout(() => {
      if (settled) return;
      uni.redirectTo({
        url,
        success: () => {
          clear();
          resolve();
        },
        fail: (err) => {
          clear();
          reject(err);
        },
      });
    }, timeout);
    uni.navigateTo({
      url,
      success: () => {
        clear();
        resolve();
      },
      fail: (err) => {
        if (settled) return;
        uni.redirectTo({
          url,
          success: () => {
            clear();
            resolve();
          },
          fail: (redirectErr) => {
            clear();
            reject(redirectErr || err);
          },
        });
      },
    });
  });

const category = ref(null);
const parentName = ref('');
const summary = ref({
  total: 0,
  answered: 0,
});
const customCount = ref(5);
const loading = ref(false);
const navigating = ref(false);

const minCount = computed(() => 1);

const loadData = async (categoryId) => {
  loading.value = true;
  try {
    const tree = await fetchCategoryTree();
    const flat = flattenCategoryTree(tree);
    const current = flat.find((c) => `${c.id}` === `${categoryId}`);
    const parent = flat.find((c) => c.id === current?.parentId);
    if (!current) {
      uni.showToast({ title: '分类不存在', icon: 'none' });
      return;
    }
    category.value = current;
    parentName.value = parent?.name || '题库';
    const baseTotal = current.questionCount || 0;
    summary.value = {
      total: baseTotal,
      answered: 0,
    };
    const fallbackCount = baseTotal || 5;
    customCount.value = Math.min(baseTotal || fallbackCount, customCount.value || fallbackCount);
    loading.value = false; // 先让页面可用，后续请求再补充

    // 异步补充真实题量
    fetchPracticeSequence({ categoryId, page: 1, size: 1 })
      .then((practicePage) => {
        const total = practicePage.total || baseTotal;
        summary.value = {
          ...summary.value,
          total,
        };
        customCount.value = Math.min(total || fallbackCount, customCount.value || fallbackCount);
      })
      .catch((err) => {
        console.warn('practice sequence fallback to cached count', err);
      });

    // 进度统计可能需要登录，失败不影响进入练习
    fetchProgressSummary()
      .then((progressData) => {
        const progressItem = Array.isArray(progressData?.categories)
          ? progressData.categories.find((c) => `${c.id}` === `${categoryId}`)
          : null;
        if (progressItem) {
          summary.value = {
            ...summary.value,
            answered: progressItem.answered || progressItem.completedQuestions || 0,
          };
        }
      })
      .catch((err) => {
        console.warn('progress summary skipped', err);
      });
  } catch (err) {
    console.error(err);
    uni.showToast({ title: '加载失败', icon: 'none' });
    loading.value = false;
  }
};

const normalizeRandomCount = () => {
  const total = summary.value.total || 0;
  if (!total) return 0;
  const raw = Number(customCount.value) || 0;
  const clamped = Math.min(Math.max(raw, minCount.value), total);
  return clamped;
};

const startPractice = async (mode) => {
  if (loading.value) {
    uni.showToast({ title: '数据加载中，请稍后', icon: 'none' });
    return;
  }
  if (!category.value) {
    uni.showToast({ title: '分类信息未加载', icon: 'none' });
    return;
  }
  if (!summary.value.total) {
    uni.showToast({ title: '该分类暂无题目', icon: 'none' });
    return;
  }
  const isRandom = mode === 'random';
  const count = isRandom ? normalizeRandomCount() : 0; // 顺序练习不限制条数，后端按默认分页
  if (navigating.value) return;
  navigating.value = true;
  const url = `/pages/questions/practice?categoryId=${category.value.id}&mode=${mode}&count=${count}`;
  try {
    await navigateWithFallback(url, { timeout: 1200 });
  } catch (err) {
    console.error('navigate to practice failed', err);
    uni.showToast({ title: '打开练习页失败，请重试', icon: 'none' });
  } finally {
    navigating.value = false;
  }
};

const startOrder = () => startPractice('order');
const startRandom = () => startPractice('random');

onLoad((options) => {
  if (options?.categoryId) {
    loadData(options.categoryId);
  } else {
    uni.showToast({ title: '缺少分类参数', icon: 'none' });
  }
});

onPullDownRefresh(async () => {
  if (category.value?.id) {
    await loadData(category.value.id);
  }
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.page {
  padding: 16rpx;
}

.hero {
  background: linear-gradient(135deg, #2563eb, #1e3a8a);
  color: #fff;
  border-radius: 18rpx;
  padding: 20rpx;
  box-shadow: 0 16rpx 40rpx rgba(24, 58, 110, 0.28);
}

.crumb {
  font-size: 24rpx;
  opacity: 0.9;
}

.hero-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 6rpx 0;
}

.name {
  font-size: 36rpx;
  font-weight: 700;
}

.hero-desc {
  margin: 4rpx 0 10rpx;
  font-size: 26rpx;
  opacity: 0.92;
}

.hero-meta {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.section-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 18rpx;
  box-shadow: 0 10rpx 28rpx rgba(31, 56, 88, 0.08);
  margin-top: 16rpx;
}

.loading {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 16rpx;
  box-shadow: 0 10rpx 28rpx rgba(31, 56, 88, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320rpx, 1fr));
  gap: 12rpx;
}

.practice-card {
  padding: 18rpx;
  border-radius: 14rpx;
  position: relative;
}

.practice-card.order {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
}

.practice-card.random {
  background: #f8fafc;
  border: 1rpx solid #e5e7eb;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 28rpx;
  font-weight: 700;
}

.desc {
  margin: 8rpx 0 10rpx;
  font-size: 24rpx;
  line-height: 1.5;
}

.meta {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.practice-card.random .meta {
  color: #4b5563;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 6rpx 0 10rpx;
}

.muted {
  color: #6b7280;
  font-size: 24rpx;
}

.ghost {
  margin-top: 10rpx;
  background: rgba(255, 255, 255, 0.16);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.primary {
  margin-top: 10rpx;
  background: linear-gradient(135deg, #111827, #111827);
  color: #fff;
  border: none;
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  font-size: 24rpx;
  color: #374151;
}

.tip-item {
  padding: 12rpx;
  border-radius: 10rpx;
  background: #f9fafb;
}
</style>
