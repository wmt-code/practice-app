<template>
  <view class="page">
    <view class="header">
      <view class="title-row">
        <view>
          <text class="breadcrumb">{{ session.parent?.name || '题库' }}</text>
          <view class="title">
            <text>{{ session.category?.name || '练习' }}</text>
            <uni-tag
              :text="session.mode === 'random' ? '随机练习' : '顺序练习'"
              :type="session.mode === 'random' ? 'warning' : 'primary'"
              size="mini"
            />
          </view>
        </view>
        <view class="progress">
          <text class="muted">进度</text>
          <text class="count">{{ currentIndex + 1 }}/{{ session.total }}</text>
        </view>
      </view>
    </view>

    <view v-if="loading" class="empty">
      <uni-load-more status="loading" />
    </view>

    <view v-else-if="!session.total" class="empty">
      <text class="muted">暂无题目，稍后再试</text>
    </view>

    <swiper
      v-else
      class="swiper"
      :current="currentIndex"
      :circular="false"
      @change="onSwipe"
    >
      <swiper-item v-for="(item, idx) in questions" :key="item.id">
        <view class="card">
          <view class="question-title">
            <view class="type-tag">{{ renderType(item.type) }}</view>
            <text class="text">{{ idx + 1 }}、{{ item.title }}</text>
          </view>

          <view v-if="isMultiple(item.type)" class="options">
            <checkbox-group @change="onMultipleChange">
              <label v-for="opt in item.options" :key="opt.value" class="option">
                <checkbox
                  :value="opt.value"
                  :checked="currentSelected.includes(opt.value)"
                  color="#2563eb"
                  style="transform: scale(0.9);"
                />
                <text class="opt-text">{{ opt.value }}. {{ opt.text }}</text>
              </label>
            </checkbox-group>
          </view>
          <view v-else-if="isShortAnswer(item.type)" class="options">
            <textarea
              class="short-input"
              :value="currentSelected[0] || ''"
              placeholder="请输入答案"
              auto-height
              @input="onTextChange"
            />
          </view>
          <view v-else class="options">
            <radio-group @change="onSingleChange">
              <label v-for="opt in item.options" :key="opt.value" class="option">
                <radio
                  :value="opt.value"
                  :checked="currentSelected.includes(opt.value)"
                  color="#2563eb"
                  style="transform: scale(0.9);"
                />
                <text class="opt-text">{{ opt.value }}. {{ opt.text }}</text>
              </label>
            </radio-group>
          </view>

          <view class="action-row">
            <button
              v-if="requiresManual(currentQuestionType)"
              type="primary"
              class="submit"
              :loading="submitting"
              :disabled="!currentSelected.length || hasAnswered"
              @tap="submitAnswer"
            >
              {{ hasAnswered ? '已提交' : '提交答案' }}
            </button>
            <view v-else class="auto-tip">
              <uni-icons type="gear" size="18" color="#6b7280" />
              <text class="muted">单选/判断选中即判题</text>
            </view>
            <text v-if="currentFeedback?.isCorrect" class="muted">回答正确，自动跳转下一题</text>
          </view>

          <view
            v-if="currentFeedback"
            class="analysis"
            :class="currentFeedback.isCorrect ? 'success' : 'danger'"
          >
            <view class="result">
              <uni-icons
                :type="currentFeedback.isCorrect ? 'checkmarkempty' : 'closeempty'"
                :color="currentFeedback.isCorrect ? '#10b981' : '#ef4444'"
                size="22"
              />
              <text class="result-text">
                {{ currentFeedback.isCorrect ? '回答正确' : '回答错误' }}
              </text>
            </view>
            <view class="answer">
              <text class="muted">正确答案：</text>
              <text class="answer-text">{{ (currentFeedback.correctAnswer || []).join(', ') || '--' }}</text>
            </view>
            <view class="explain">
              <text class="muted">解析：</text>
              <text>{{ currentExplanation }}</text>
            </view>
            <view v-if="!currentFeedback.isCorrect" class="swipe-tip">
              左滑切换下一题
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <view v-if="session.total" class="floating-actions">
      <uni-fav
        class="fav-btn"
        :checked="isFavorited"
        bgColor="#f9fafb"
        bgColorChecked="#1d4ed8"
        fgColor="#1f2937"
        fgColorChecked="#fff"
        :contentText="{contentDefault: '收藏', contentFav: '已收藏'}"
        @click="toggleFavorite"
      />
      <view class="stat-badges">
        <view class="stat correct">对 {{ stats.correct }}</view>
        <view class="stat wrong">错 {{ stats.wrong }}</view>
      </view>
      <button class="result-btn" size="mini" type="default" :disabled="answeredCount < session.total" @tap="openResultSummary">
        查看结果
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchPracticeRandom, fetchPracticeSequence, fetchQuestionDetail } from '@/api/questions.js';
import { submitAnswer as submitAnswerApi } from '@/api/answers.js';
import { fetchCategoryTree, flattenCategoryTree } from '@/api/categories.js';
import { addFavorite, removeFavorite, fetchFavorites } from '@/api/favorites.js';

const questions = ref([]);
const session = reactive({
  total: 0,
  mode: 'order',
  category: null,
  parent: null,
});
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
  loading: false,
});
const params = reactive({
  categoryId: '',
  mode: 'order',
  count: 0,
});
const currentIndex = ref(0);
const answers = reactive({});
const feedback = reactive({});
const submitting = ref(false);
const loading = ref(false);
const favoriteMap = reactive({});
const stats = reactive({
  correct: 0,
  wrong: 0,
});
const resultShown = ref(false);

const currentQuestionId = computed(() => questions.value[currentIndex.value]?.id);
const currentQuestion = computed(() => questions.value[currentIndex.value] || {});
const currentQuestionType = computed(() => currentQuestion.value?.type);
const currentFeedback = computed(() =>
  currentQuestionId.value ? feedback[currentQuestionId.value] || null : null,
);
const currentSelected = computed(() => (currentQuestionId.value ? answers[currentQuestionId.value] : []) || []);
const hasAnswered = computed(() => Boolean(currentFeedback.value));
const answeredCount = computed(() => Object.keys(feedback).length);
const isFavorited = computed(() => Boolean(favoriteMap[currentQuestionId.value]));
const currentExplanation = computed(() => {
  if (!currentFeedback.value) return '';
  return currentFeedback.value.explanation || '暂无解析';
});

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

const isMultiple = (type) => {
  const text = String(type || '');
  const lower = text.toLowerCase();
  return lower.includes('multiple') || text.includes('多选');
};
const isShortAnswer = (type) => {
  const text = String(type || '');
  const lower = text.toLowerCase();
  return lower.includes('fill') || lower.includes('short') || text.includes('填空') || text.includes('简答');
};
const requiresManual = (type) => isMultiple(type) || isShortAnswer(type);
const isAutoSubmit = (type) => !requiresManual(type);

const onSingleChange = (e) => {
  if (!currentQuestionId.value) return;
  answers[currentQuestionId.value] = [e.detail.value];
  if (isAutoSubmit(currentQuestion.value.type)) {
    maybeAutoSubmit();
  }
};

const onMultipleChange = (e) => {
  if (!currentQuestionId.value) return;
  answers[currentQuestionId.value] = e.detail.value || [];
};

const onTextChange = (e) => {
  if (!currentQuestionId.value) return;
  answers[currentQuestionId.value] = [e.detail.value || ''];
};

const loadCategoryInfo = async (categoryId) => {
  try {
    const tree = await fetchCategoryTree();
    const flat = flattenCategoryTree(tree);
    const current = flat.find((c) => `${c.id}` === `${categoryId}`);
    const parent = flat.find((c) => c.id === current?.parentId);
    session.category = current || null;
    session.parent = parent || null;
  } catch (err) {
    console.error(err);
  }
};

const initFavorites = async () => {
  try {
    const res = await fetchFavorites({ page: 1, size: 200 });
    (res.records || []).forEach((item) => {
      favoriteMap[item.questionId] = true;
    });
  } catch (err) {
    console.warn('fetch favorites failed, skip', err);
  }
};

const initAnswers = () => {
  questions.value.forEach((q) => {
    if (!answers[q.id]) {
      answers[q.id] = [];
    }
  });
};

const backfillOptions = async (list) => {
  const targets = (list || []).filter((q) => q && q.id && (!q.options || q.options.length === 0));
  for (const q of targets) {
    try {
      const detail = await fetchQuestionDetail(q.id);
      if (detail && Array.isArray(detail.options) && detail.options.length) {
        q.options = detail.options;
        q.explanation = q.explanation || detail.explanation;
        q.duration = q.duration || detail.duration;
        q.score = q.score || detail.score;
      }
    } catch (err) {
      console.warn('backfill options failed', q.id, err);
    }
  }
  initAnswers();
};

const loadRandom = async () => {
  const limit = params.count > 0 ? params.count : 5;
  const list = await fetchPracticeRandom({ categoryId: params.categoryId, limit });
  questions.value = list;
  session.total = list.length;
  pagination.total = list.length;
  pagination.page = 1;
  pagination.size = list.length || limit;
  session.mode = 'random';
  initAnswers();
  await backfillOptions(list);
};

const loadSequencePage = async (pageToLoad = 1, append = false) => {
  if (pagination.loading) return;
  pagination.loading = true;
  try {
    const size = params.count && params.count > 0 ? params.count : pagination.size || 10;
    const res = await fetchPracticeSequence({
      categoryId: params.categoryId,
      page: pageToLoad,
      size,
    });
    const list = res.records || [];
    const limitedTotal =
      params.count && params.count > 0
        ? Math.min(params.count, res.total || params.count)
        : res.total || list.length;
    pagination.total = limitedTotal;
    session.total = limitedTotal;
    pagination.size = res.size || size;
    pagination.page = pageToLoad;
    const merged = append ? [...questions.value, ...list] : list;
    questions.value = merged;
    initAnswers();
    await backfillOptions(list);
  } catch (err) {
    console.error(err);
    uni.showToast({ title: '加载题目失败', icon: 'none' });
  } finally {
    pagination.loading = false;
  }
};

const loadSession = async (options) => {
  loading.value = true;
  try {
    questions.value = [];
    Object.keys(answers).forEach((key) => delete answers[key]);
    Object.keys(feedback).forEach((key) => delete feedback[key]);
    stats.correct = 0;
    stats.wrong = 0;
    resultShown.value = false;
    pagination.page = 1;
    pagination.size = 10;
    pagination.total = 0;
    pagination.loading = false;
    params.categoryId = options?.categoryId ? Number(options.categoryId) || options.categoryId : '';
    if (!params.categoryId) {
      uni.showToast({ title: '缺少分类参数', icon: 'none' });
      return;
    }
    params.count = options?.count ? Number(options.count) : 0;
    params.mode = options?.mode === 'random' ? 'random' : 'order';
    const favoritesPromise = initFavorites();
    const categoryPromise = loadCategoryInfo(params.categoryId);
    const questionPromise =
      params.mode === 'random' ? loadRandom() : loadSequencePage(1, false);
    await Promise.all([categoryPromise, questionPromise]);
    favoritesPromise?.catch?.((err) => console.warn('favorites init failed', err));
    currentIndex.value = 0;
  } catch (err) {
    console.error(err);
    uni.showToast({ title: err.message || '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const maybeLoadMore = async () => {
  if (session.mode !== 'order') return;
  if (questions.value.length >= session.total) return;
  if (pagination.loading) return;
  await loadSequencePage(pagination.page + 1, true);
};

const updateStats = (isCorrect) => {
  if (isCorrect) {
    stats.correct += 1;
  } else {
    stats.wrong += 1;
  }
};

const maybeShowResult = () => {
  if (resultShown.value) return;
  if (answeredCount.value >= session.total && session.total > 0) {
    openResultSummary();
  }
};

const submitAnswer = async () => {
  const question = questions.value[currentIndex.value];
  if (!question) return;
  const chosen = (answers[question.id] || []).map((v) => (typeof v === 'string' ? v.trim() : v));
  if (!chosen.length || !chosen.some((v) => v)) {
    uni.showToast({ title: '请选择答案', icon: 'none' });
    return;
  }
  if (feedback[question.id]) return;
  submitting.value = true;
  try {
    const res = await submitAnswerApi({
      questionId: question.id,
      chosen,
      timeSpent: question.duration || 20,
    });
    feedback[question.id] = res;
    updateStats(res.isCorrect);
    if (res.isCorrect) {
      uni.showToast({ title: '正确，自动跳转', icon: 'success' });
      setTimeout(() => goNext(true), 500);
    } else {
      uni.showToast({ title: '查看解析，左滑下一题', icon: 'none' });
    }
    maybeShowResult();
  } catch (err) {
    console.error(err);
    uni.showToast({ title: '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};

const maybeAutoSubmit = () => {
  if (submitting.value || hasAnswered.value) return;
  submitAnswer();
};

const goNext = (auto = false) => {
  if (currentIndex.value >= session.total - 1) {
    uni.showToast({ title: '练习完成', icon: 'success' });
    maybeShowResult();
    return;
  }
  currentIndex.value += 1;
  if (currentIndex.value >= questions.value.length - 2) {
    maybeLoadMore();
  }
  const nextId = questions.value[currentIndex.value]?.id;
  if (auto && nextId && feedback[nextId]?.isCorrect) {
    goNext(true);
  }
};

const onSwipe = (e) => {
  currentIndex.value = e.detail.current;
  if (currentIndex.value >= questions.value.length - 2) {
    maybeLoadMore();
  }
};

const toggleFavorite = async () => {
  const qid = currentQuestionId.value;
  if (!qid) return;
  try {
    if (favoriteMap[qid]) {
      await removeFavorite(qid);
      favoriteMap[qid] = false;
      uni.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      await addFavorite(qid);
      favoriteMap[qid] = true;
      uni.showToast({ title: '已收藏', icon: 'success' });
    }
  } catch (err) {
    console.error(err);
    uni.showToast({ title: err.message || '操作失败', icon: 'none' });
  }
};

const openResultSummary = () => {
  resultShown.value = true;
  const unanswered = Math.max(session.total - answeredCount.value, 0);
  const correctRate =
    session.total > 0 ? Math.round((stats.correct / session.total) * 1000) / 10 : 0;
  uni.showModal({
    title: '练习结果',
    content: `共 ${session.total} 题\n已答：${answeredCount.value}\n正确：${stats.correct}\n错误：${stats.wrong}\n未答：${unanswered}\n正确率：${correctRate}%`,
    showCancel: false,
  });
};

watch(currentQuestionId, (id) => {
  if (id && !answers[id]) {
    answers[id] = [];
  }
});

onLoad((options) => {
  loadSession(options);
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 16rpx;
  background: #f7f8fb;
}

.header {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 14rpx;
  box-shadow: 0 12rpx 30rpx rgba(31, 56, 88, 0.06);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  color: #6b7280;
  font-size: 24rpx;
}

.title {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 32rpx;
  font-weight: 700;
  margin-top: 4rpx;
}

.progress {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.muted {
  color: #6b7280;
  font-size: 24rpx;
}

.count {
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
}

.swiper {
  margin-top: 12rpx;
  height: calc(100vh - 220rpx);
}

.card {
  background: #ffffff;
  border-radius: 18rpx;
  padding: 20rpx;
  box-shadow: 0 14rpx 34rpx rgba(31, 56, 88, 0.08);
  height: calc(100% - 20rpx);
  display: flex;
  flex-direction: column;
}

.question-title {
  display: flex;
  gap: 10rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.type-tag {
  padding: 6rpx 12rpx;
  background: #e0ecff;
  color: #1d4ed8;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.options {
  margin-top: 12rpx;
  flex: 1;
}

.short-input {
  width: 100%;
  min-height: 200rpx;
  padding: 14rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e5e7eb;
  background: #f9fafb;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #1f2937;
}

.option {
  display: flex;
  align-items: center;
  padding: 14rpx 10rpx;
  border-radius: 12rpx;
  background: #f9fafb;
  margin-bottom: 10rpx;
}

.opt-text {
  margin-left: 10rpx;
  font-size: 28rpx;
  color: #1f2937;
}

.action-row {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.submit {
  flex: 1;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border: none;
}

.analysis {
  margin-top: 12rpx;
  padding: 14rpx;
  border-radius: 12rpx;
  background: #f9fafb;
}

.analysis.success {
  border: 1rpx solid #a7f3d0;
}

.analysis.danger {
  border: 1rpx solid #fecdd3;
}

.result {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.result-text {
  font-weight: 600;
}

.answer {
  margin-top: 8rpx;
}

.answer-text {
  font-weight: 600;
  color: #111827;
}

.explain {
  margin-top: 6rpx;
  color: #1f2937;
  line-height: 1.5;
}

.swipe-tip {
  margin-top: 6rpx;
  color: #ef4444;
  font-size: 24rpx;
}

.empty {
  margin-top: 40rpx;
  text-align: center;
  color: #6b7280;
}

.auto-tip {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 0;
}

.floating-actions {
  position: fixed;
  right: 20rpx;
  bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10rpx;
  z-index: 10;
}

.fav-btn {
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  border-radius: 16rpx;
}

.stat-badges {
  display: flex;
  gap: 8rpx;
}

.stat {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.stat.correct {
  background: #10b981;
}

.stat.wrong {
  background: #ef4444;
}

.result-btn {
  background: #111827;
  color: #fff;
  border: none;
  padding: 10rpx 16rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.result-btn:disabled {
  background: #9ca3af;
  color: #f3f4f6;
}
</style>
