<template>
  <view class="page">
    <view class="meta-row">
      <view class="meta-left">
        <view class="meta-dot"></view>
        <view class="meta-info">
          <text class="meta-title">{{ session.parent?.name || '题库' }}</text>
          <text class="meta-sub">{{ session.category?.name || '练习' }}</text>
        </view>
      </view>
      <view class="meta-progress">
        <text class="progress-text">{{ currentIndex + 1 }} / {{ session.total || 0 }}</text>
        <view class="progress-line">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
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
          <view class="question-header">
            <view class="type-tag">{{ renderType(item.type) }}</view>
            <view class="mode-chip">{{ session.mode === 'random' ? '随机练习' : '顺序练习' }}</view>
            <view class="question-index">第 {{ idx + 1 }} 题</view>
          </view>

          <view class="question-title">{{ item.title }}</view>

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
            <!--  <text class="result-text">
                {{ currentFeedback.isCorrect ? '回答正确' : '回答错误' }}
              </text> -->
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

    <view v-if="session.total" class="bottom-dock">
      <button class="dock-btn share" size="mini" type="default" plain open-type="share">
        分享
      </button>
      <view class="dock-center">
        <uni-fav
          class="fav-btn"
          :checked="isFavorited"
          bgColor="#f1f5f9"
          bgColorChecked="#111827"
          fgColor="#111827"
          fgColorChecked="#ffffff"
          :contentText="{contentDefault: '收藏', contentFav: '已收藏'}"
          @click="toggleFavorite"
        />
        <view class="stat-pill correct">对 {{ stats.correct }}</view>
        <view class="stat-pill wrong">错 {{ stats.wrong }}</view>
      </view>
      <button
        class="dock-btn result"
        size="mini"
        type="primary"
        @tap="openAnswerCard"
      >
        答题卡
      </button>
    </view>

    <uni-popup ref="cardPopup" type="bottom" border-radius="12">
      <view class="answer-card">
        <view class="answer-card-header">
          <text class="title">答题卡</text>
          <view class="legend">
            <view class="legend-item">
              <view class="legend-dot unanswered"></view>
              <text>未作答</text>
            </view>
            <view class="legend-item">
              <view class="legend-dot correct"></view>
              <text>答对</text>
            </view>
            <view class="legend-item">
              <view class="legend-dot wrong"></view>
              <text>答错</text>
            </view>
          </view>
        </view>

        <view class="card-grid">
          <view
            v-for="item in questionStatuses"
            :key="item.idx"
            class="card-item"
            :class="item.status"
            @tap="jumpTo(item.idx)"
          >
            <text class="card-number">{{ item.idx + 1 }}</text>
            <text class="card-type">{{ renderType(questions[item.idx]?.type) }}</text>
          </view>
        </view>

        <view class="answer-card-footer">
          <button class="footer-btn ghost" @tap="resetPractice">重新练习</button>
          <button class="footer-btn primary" @tap="openResultSummary">查看练习结果</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchPracticeRandom, fetchPracticeSequence, fetchQuestionDetail } from '@/api/questions.js';
import { submitAnswer as submitAnswerApi, fetchAnswerHistory, clearAnswerHistory } from '@/api/answers.js';
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
const cardPopup = ref(null);

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
const progressPercent = computed(() => {
  if (!session.total) return 0;
  return Math.min(100, Math.round(((currentIndex.value + 1) / session.total) * 100));
});

const normalizeAnswerList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((v) => `${v}`);
  if (typeof val === 'string') return val.split(/[,;\s]+/).filter(Boolean);
  return [];
};

const hydrateFromRemote = async () => {
  const ids = questions.value.map((q) => q.id);
  if (!ids.length) return;
  try {
    const res = await fetchAnswerHistory({ page: 1, size: 500, categoryId: params.categoryId });
    const list = Array.isArray(res?.records) ? res.records : [];
    if (!list.length) return;
    const idSet = new Set(ids.map((id) => `${id}`));
    stats.correct = 0;
    stats.wrong = 0;
    for (const item of list.filter((i) => idSet.has(`${i.questionId}`))) {
      const key = item.questionId;
      const isCorrect = item.isCorrect === true || item.correct === true;
      const userAns = normalizeAnswerList(item.userAnswer || item.userAnswerValues);
      answers[key] = userAns;
      let correctAnswer = normalizeAnswerList(item.correctAnswer || item.answer);
      let explanation = item.explanation || '暂无解析';
      if (!correctAnswer.length || !explanation || explanation === '暂无解析') {
        try {
          const detail = await fetchQuestionDetail(key);
          if (detail) {
            if (!correctAnswer.length) correctAnswer = normalizeAnswerList(detail.answer);
            if (!explanation || explanation === '暂无解析') explanation = detail.explanation || '暂无解析';
          }
        } catch (err) {
          console.warn('detail fetch fail', key, err);
        }
      }
      feedback[key] = {
        isCorrect,
        correct: isCorrect,
        correctAnswer,
        explanation,
      };
      if (isCorrect) {
        stats.correct += 1;
      } else {
        stats.wrong += 1;
      }
    }
    saveProgress();
  } catch (err) {
    console.warn('hydrate from remote failed', err);
  }
};
const questionStatuses = computed(() =>
  questions.value.map((q, idx) => {
    const fb = feedback[q.id];
    let status = 'unanswered';
    if (fb) {
      status = fb.isCorrect ? 'correct' : 'wrong';
    }
    return { idx, status };
  }),
);

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
    currentIndex.value = 0;
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
    await hydrateFromRemote();
    restoreProgress();
    favoritesPromise?.catch?.((err) => console.warn('favorites init failed', err));
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

const getProgressKey = () => {
  if (!params.categoryId) return '';
  return `practice-progress-${params.mode}-${params.categoryId}`;
};

const saveProgress = () => {
  const key = getProgressKey();
  if (!key || !session.total) return;
  const payload = {
    answers: JSON.parse(JSON.stringify(answers)),
    feedback: JSON.parse(JSON.stringify(feedback)),
    stats: { correct: stats.correct, wrong: stats.wrong },
    currentIndex: currentIndex.value,
    questionIds: questions.value.map((q) => q.id),
    total: session.total,
  };
  try {
    uni.setStorageSync(key, payload);
  } catch (err) {
    console.warn('save progress failed', err);
  }
};

const restoreProgress = () => {
  const key = getProgressKey();
  if (!key) return;
  try {
    const saved = uni.getStorageSync(key);
    if (!saved || !Array.isArray(saved.questionIds)) return;
    const ids = questions.value.map((q) => q.id);
    const sameList =
      ids.length === saved.questionIds.length &&
      ids.every((id, idx) => `${id}` === `${saved.questionIds[idx]}`);
    if (!sameList) return;
    Object.keys(saved.answers || {}).forEach((k) => {
      answers[k] = saved.answers[k];
    });
    Object.keys(saved.feedback || {}).forEach((k) => {
      feedback[k] = saved.feedback[k];
    });
    stats.correct = saved.stats?.correct || 0;
    stats.wrong = saved.stats?.wrong || 0;
    currentIndex.value = saved.currentIndex || 0;
  } catch (err) {
    console.warn('restore progress failed', err);
  }
};

const clearProgressStorage = () => {
  const key = getProgressKey();
  if (!key) return;
  try {
    uni.removeStorageSync(key);
  } catch (err) {
    console.warn('clear progress failed', err);
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
    saveProgress();
    if (res.isCorrect) {
      uni.showToast({ title: '正确，自动跳转', icon: 'success' });
      setTimeout(() => goNext(true), 500);
    } else {
      uni.showToast({ title: '查看解析，左滑下一题', icon: 'none' });
    }
    maybeShowResult();
  } catch (err) {
    console.error(err);
    uni.showToast({ title: '提交失败：'+err.message, icon: 'none' });
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

const openAnswerCard = () => {
  cardPopup.value?.open?.();
};

const closeAnswerCard = () => {
  cardPopup.value?.close?.();
};

const jumpTo = (idx) => {
  if (idx < 0 || idx >= questions.value.length) return;
  currentIndex.value = idx;
  closeAnswerCard();
};

const resetPractice = () => {
  uni.showModal({
    title: '重新练习',
    content: '确定清空当前答题记录并重新开始吗？',
    success: (res) => {
      if (res.confirm) {
        clearPracticeData();
      }
    },
  });
};

const clearPracticeData = async () => {
  try {
    if (params.categoryId) {
      await clearAnswerHistory({ categoryId: params.categoryId });
    }
  } catch (err) {
    console.warn('clear remote history failed', err);
  }
  clearProgressStorage();
  closeAnswerCard();
  loadSession({
    categoryId: params.categoryId,
    mode: params.mode,
    count: params.count,
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
  padding: 20rpx 20rpx 180rpx;
  background: #f4f6fb;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.meta-row {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 14rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 10rpx 26rpx rgba(31, 56, 88, 0.06);
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meta-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #10b981;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.meta-title {
  font-size: 26rpx;
  color: #6b7280;
}

.meta-sub {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.meta-progress {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 180rpx;
}

.progress-text {
  font-size: 26rpx;
  color: #111827;
}

.progress-line {
  flex: 1;
  height: 10rpx;
  background: #e5e7eb;
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #22c55e);
}

.swiper {
  margin-top: 16rpx;
  flex: 1;
  min-height: 60vh;
}

.card {
  background: #ffffff;
  border-radius: 18rpx;
  padding: 22rpx;
  box-shadow: 0 14rpx 34rpx rgba(31, 56, 88, 0.08);
  height: calc(100% - 20rpx);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-bottom: 60rpx;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 24rpx;
}

.type-tag {
  padding: 8rpx 14rpx;
  background: #e0ecff;
  color: #1d4ed8;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.mode-chip {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
  color: #374151;
}

.question-index {
  margin-left: auto;
  color: #6b7280;
}

.question-title {
  margin-top: 12rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
  line-height: 1.5;
}

.options {
  margin-top: 14rpx;
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
  padding: 16rpx 14rpx;
  border-radius: 14rpx;
  background: #f9fafb;
  margin-bottom: 12rpx;
  border: 2rpx solid #e5e7eb;
}

.opt-text {
  margin-left: 12rpx;
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
  margin-top: 14rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f8fafc;
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

.muted {
  color: #6b7280;
  font-size: 24rpx;
}

.auto-tip {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 0;
}

.bottom-dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 20rpx 26rpx;
  background: #ffffff;
  box-shadow: 0 -10rpx 30rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  box-sizing: border-box;
}

.dock-btn {
  border-radius: 14rpx;
  padding: 12rpx 20rpx;
  font-size: 28rpx;
}

.dock-btn.share {
  color: #10b981;
  border: 2rpx solid #10b981;
}

.dock-btn.result {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border: none;
}

.dock-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
}

.dock-center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  justify-content: center;
}

.fav-btn {
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  border-radius: 14rpx;
}

.stat-pill {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.stat-pill.correct {
  background: #10b981;
}

.stat-pill.wrong {
  background: #ef4444;
}

.answer-card {
  background: #ffffff;
  padding: 20rpx;
  border-top-left-radius: 18rpx;
  border-top-right-radius: 18rpx;
}

.answer-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.answer-card-header .title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.legend {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 24rpx;
  color: #4b5563;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.legend-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  border: 2rpx solid #d1d5db;
}

.legend-dot.unanswered {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.legend-dot.correct {
  background: #10b981;
  border-color: #10b981;
}

.legend-dot.wrong {
  background: #ef4444;
  border-color: #ef4444;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120rpx, 1fr));
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.card-item {
  background: #f3f4f6;
  border-radius: 16rpx;
  padding: 16rpx 12rpx;
  text-align: center;
  color: #4b5563;
  border: 2rpx solid transparent;
}

.card-item .card-number {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.card-item .card-type {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #6b7280;
}

.card-item.correct {
  background: #ecfdf3;
  color: #047857;
  border-color: #34d399;
}

.card-item.wrong {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fca5a5;
}

.card-item.unanswered {
  background: #f3f4f6;
  color: #4b5563;
  border-color: #e5e7eb;
}

.answer-card-footer {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.footer-btn {
  flex: 1;
  padding: 16rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.footer-btn.ghost {
  background: #ffffff;
  color: #111827;
  border: 2rpx solid #e5e7eb;
}

.footer-btn.primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border: none;
}
</style>
