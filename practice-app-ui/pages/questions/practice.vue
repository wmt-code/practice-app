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

    <view v-if="!session.total" class="empty">
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

          <view v-if="item.type === 'multiple'" class="options">
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
              type="primary"
              class="submit"
              :loading="submitting"
              :disabled="!currentSelected.length || hasAnswered"
              @tap="submitAnswer"
            >
              {{ hasAnswered ? '已提交' : '提交答案' }}
            </button>
            <text v-if="feedback[currentQuestionId]?.isCorrect" class="muted">回答正确，自动跳转下一题</text>
          </view>

          <view
            v-if="feedback[currentQuestionId]"
            class="analysis"
            :class="feedback[currentQuestionId].isCorrect ? 'success' : 'danger'"
          >
            <view class="result">
              <uni-icons
                :type="feedback[currentQuestionId].isCorrect ? 'checkmarkempty' : 'closeempty'"
                :color="feedback[currentQuestionId].isCorrect ? '#10b981' : '#ef4444'"
                size="22"
              />
              <text class="result-text">
                {{ feedback[currentQuestionId].isCorrect ? '回答正确' : '回答错误' }}
              </text>
            </view>
            <view class="answer">
              <text class="muted">正确答案：</text>
              <text class="answer-text">{{ feedback[currentQuestionId].correctAnswer.join(', ') }}</text>
            </view>
            <view class="explain">
              <text class="muted">解析：</text>
              <text>{{ feedback[currentQuestionId].explanation }}</text>
            </view>
            <view v-if="!feedback[currentQuestionId].isCorrect" class="swipe-tip">
              左滑切换下一题
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { startPracticeSession, submitAnswer as submitAnswerApi } from '@/api/mock.js';

const questions = ref([]);
const session = reactive({
  total: 0,
  mode: 'order',
  category: null,
  parent: null,
});
const currentIndex = ref(0);
const answers = reactive({});
const feedback = reactive({});
const submitting = ref(false);

const currentQuestionId = computed(() => questions.value[currentIndex.value]?.id);
const currentSelected = computed(() => answers[currentQuestionId.value] || []);
const hasAnswered = computed(() => Boolean(feedback[currentQuestionId.value]));

const renderType = (type) => {
  if (type === 'multiple') return '多选';
  if (type === 'truefalse') return '判断';
  return '单选';
};

const onSingleChange = (e) => {
  if (!currentQuestionId.value) return;
  answers[currentQuestionId.value] = [e.detail.value];
};

const onMultipleChange = (e) => {
  if (!currentQuestionId.value) return;
  answers[currentQuestionId.value] = e.detail.value || [];
};

const submitAnswer = async () => {
  const question = questions.value[currentIndex.value];
  if (!question) return;
  const chosen = answers[question.id] || [];
  if (!chosen.length) {
    uni.showToast({ title: '请选择答案', icon: 'none' });
    return;
  }
  if (feedback[question.id]) return;
  submitting.value = true;
  try {
    const res = await submitAnswerApi({
      questionId: question.id,
      chosen,
      spentSeconds: question.duration || 20,
    });
    feedback[question.id] = res;
    if (res.isCorrect) {
      uni.showToast({ title: '正确，自动跳转', icon: 'success' });
      setTimeout(() => goNext(true), 500);
    } else {
      uni.showToast({ title: '查看解析，左滑下一题', icon: 'none' });
    }
  } catch (err) {
    console.error(err);
    uni.showToast({ title: '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};

const goNext = (auto = false) => {
  if (currentIndex.value >= session.total - 1) {
    uni.showToast({ title: '练习完成', icon: 'success' });
    return;
  }
  currentIndex.value += 1;
  const nextId = questions.value[currentIndex.value]?.id;
  if (auto && nextId && feedback[nextId]?.isCorrect) {
    goNext(true);
  }
};

const onSwipe = (e) => {
  currentIndex.value = e.detail.current;
};

const loadSession = async (options) => {
  const categoryId = options?.categoryId;
  if (!categoryId) {
    uni.showToast({ title: '缺少分类参数', icon: 'none' });
    return;
  }
  const count = Number(options?.count);
  const mode = options?.mode === 'random' ? 'random' : 'order';
  const sessionData = await startPracticeSession({
    categoryId,
    mode,
    count: Number.isFinite(count) ? count : undefined,
  });
  questions.value = sessionData.questions || [];
  session.total = sessionData.total || 0;
  session.mode = sessionData.mode;
  session.category = sessionData.category;
  session.parent = sessionData.parent;
  currentIndex.value = 0;
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
</style>
