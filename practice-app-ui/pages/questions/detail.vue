<template>
  <view class="page">
    <uni-card :is-shadow="false" class="question-card">
      <view class="title">
        <text class="type-tag">{{ renderType(question.type) }}</text>
        {{ question.title }}
      </view>
      <view class="meta-row">
        <uni-tag :text="getCategoryName(question.categoryId)" size="small" type="success" />
        <uni-tag :text="'分值 ' + question.score" size="small" type="primary" />
        <text class="muted">预计 {{ question.duration }}s</text>
      </view>

      <view class="option-area" v-if="isMultiple(question.type)">
        <checkbox-group @change="onMultipleChange">
          <label v-for="opt in question.options" :key="opt.value" class="option">
            <checkbox
              :value="opt.value"
              :checked="selected.includes(opt.value)"
              color="#2563eb"
              style="transform: scale(0.9);"
            />
            <text class="option-text">{{ opt.value }}. {{ opt.text }}</text>
          </label>
        </checkbox-group>
      </view>

      <view class="option-area" v-else-if="isShortAnswer(question.type)">
        <textarea
          class="short-input"
          :value="selected[0] || ''"
          placeholder="请输入答案"
          auto-height
          @input="onTextChange"
        />
      </view>

      <view class="option-area" v-else>
        <radio-group @change="onSingleChange">
          <label v-for="opt in question.options" :key="opt.value" class="option">
            <radio
              :value="opt.value"
              :checked="selected.includes(opt.value)"
              color="#2563eb"
              style="transform: scale(0.9);"
            />
            <text class="option-text">{{ opt.value }}. {{ opt.text }}</text>
          </label>
        </radio-group>
      </view>

      <view class="actions">
        <button
          type="primary"
          class="primary-btn"
          :loading="submitting"
          :disabled="!selected.length"
          @tap="handleSubmit"
        >
          提交答案
        </button>
        <button class="ghost-btn" @tap="backToList">返回题库</button>
      </view>
    </uni-card>

    <uni-card v-if="feedback" title="判题结果" :is-shadow="false">
      <view class="result" :class="{ correct: feedback.isCorrect, wrong: !feedback.isCorrect }">
        <uni-icons
          :type="feedback.isCorrect ? 'checkmarkempty' : 'closeempty'"
          :color="feedback.isCorrect ? '#10b981' : '#ef4444'"
          size="24"
        />
        <text class="result-text">{{ feedback.isCorrect ? '回答正确' : '回答错误' }}</text>
      </view>
      <view class="answer">
        <text class="muted">正确答案：</text>
        <text class="answer-text">{{ feedback.correctAnswer.join(', ') }}</text>
      </view>
      <view class="explain">
        <text class="muted">解析：</text>
        <text>{{ feedback.explanation }}</text>
      </view>
      <view class="progress-info" v-if="feedback.progress">
        <text class="muted">总进度：{{ feedback.progress.percent }}%</text>
      </view>
    </uni-card>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchCategoryTree, flattenCategoryTree } from '@/api/categories.js';
import { fetchQuestionDetail } from '@/api/questions.js';
import { submitAnswer as submitAnswerApi } from '@/api/answers.js';

const question = ref({
  options: [],
});
const categories = ref([]);
const selected = ref([]);
const feedback = ref(null);
const submitting = ref(false);

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

const onSingleChange = (e) => {
  selected.value = [e.detail.value];
};

const onMultipleChange = (e) => {
  selected.value = e.detail.value || [];
};

const onTextChange = (e) => {
  selected.value = [e.detail.value || ''];
};

const getCategoryName = (id) =>
  categories.value.find((c) => String(c.id) === String(id))?.name || '未分类';

const backToList = () => {
  uni.switchTab({ url: '/pages/questions/index' });
};

const loadData = async (id) => {
  try {
    const [catTree, detail] = await Promise.all([fetchCategoryTree(), fetchQuestionDetail(id)]);
    categories.value = flattenCategoryTree(catTree);
    if (!detail?.id) {
      uni.showToast({ title: '题目不存在', icon: 'none' });
      question.value = { options: [] };
      return;
    }
    question.value = detail;
    selected.value = [];
    feedback.value = null;
  } catch (err) {
    console.error(err);
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
};

const handleSubmit = async () => {
  if (!question.value.id) return;
  const chosen = (selected.value || []).map((v) => (typeof v === 'string' ? v.trim() : v));
  if (!chosen.length || !chosen.some((v) => v)) {
    uni.showToast({ title: '请选择答案', icon: 'none' });
    return;
  }
  submitting.value = true;
  try {
    const res = await submitAnswerApi({
      questionId: question.value.id,
      chosen,
      timeSpent: question.value.duration || 20,
    });
    feedback.value = res;
    uni.showToast({
      title: res.isCorrect ? '回答正确' : '再接再厉',
      icon: res.isCorrect ? 'success' : 'none',
    });
  } catch (err) {
    console.error(err);
    uni.showToast({ title: '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};

onLoad((options) => {
  if (options?.id) {
    loadData(options.id);
  }
});
</script>

<style lang="scss" scoped>
.page {
  padding: 20rpx;
}

.question-card {
  border-radius: 18rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.type-tag {
  display: inline-flex;
  padding: 4rpx 12rpx;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 10rpx;
  font-size: 22rpx;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 12rpx 0 8rpx;
}

.muted {
  color: #6b7280;
  font-size: 24rpx;
}

.option-area {
  margin-top: 12rpx;
}

.short-input {
  width: 100%;
  min-height: 160rpx;
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
  padding: 18rpx 16rpx;
  border-radius: 14rpx;
  background: #f9fafb;
  margin-bottom: 12rpx;
}

.option-text {
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #1f2937;
}

.actions {
  display: flex;
  gap: 12rpx;
  margin-top: 20rpx;
}

.primary-btn {
  flex: 1;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border: none;
}

.ghost-btn {
  flex: 1;
  background: #fff;
  color: #2563eb;
  border: 2rpx solid #2563eb;
}

.result {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 12rpx;
}

.result.correct {
  color: #10b981;
}

.result.wrong {
  color: #ef4444;
}

.answer-text {
  font-weight: 600;
  color: #111827;
}

.explain {
  margin-top: 8rpx;
  color: #1f2937;
  line-height: 1.5;
}

.progress-info {
  margin-top: 12rpx;
  display: flex;
  gap: 16rpx;
}
</style>
