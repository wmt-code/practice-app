<template>
  <view class="container">
    <!-- Input Step -->
    <view v-if="step === 'input'" class="input-step">
      <!-- Input Area -->
      <view class="card input-card">
        <view class="card-header">
          <text class="card-title">输入区</text>
          <view class="header-actions">
            <text class="action-btn" @tap="smartParse">智能解析</text>
            <text class="action-btn" @tap="showExample">格式案例</text>
            <text class="action-btn warning" @tap="clearInput">清空</text>
          </view>
        </view>
        <textarea
          v-model="inputText"
          class="input-textarea"
          placeholder="请输入题目内容..."
          :maxlength="-1"
          auto-height
        ></textarea>
      </view>

      <!-- Settings Area -->
      <view class="card settings-card">
        <view class="setting-item" @tap="openChapterSelect">
          <text class="label">选择章节</text>
          <view class="value-row">
            <text class="value">{{ selectedChapterName || '请选择' }}</text>
            <uni-icons type="right" size="14" color="#999"></uni-icons>
          </view>
        </view>
        <view class="divider"></view>
        <view class="setting-item" @tap="manageChapters">
          <text class="label">编辑章节</text>
          <uni-icons type="right" size="14" color="#999"></uni-icons>
        </view>
        <view class="divider"></view>
        <view class="setting-item">
          <text class="label">难度</text>
          <picker
            :range="difficultyOptions"
            range-key="label"
            @change="onDifficultyChange"
            class="picker-box"
          >
            <view class="value-row">
              <text class="value">{{ selectedDifficultyLabel }}</text>
              <uni-icons type="right" size="14" color="#999"></uni-icons>
            </view>
          </picker>
        </view>
      </view>

      <!-- Instructions -->
      <view class="instructions">
        <view class="section-title">上传说明</view>
        <view class="text-content">
          <view>1.所有题型标号支持1.或1、两种格式。</view>
          <view>2.所有题型必须含有 “答案：” 字段，且不能为空。</view>
          <view>3.所有题型 “解析：” 字段非必需，没有可不填。</view>
          <view>4.选择题最少支持2个选项A,B，最多支持8个选项A-H。</view>
          <view>5.选择题选项号与内容之间要用、或 . 分开。</view>
          <view>6.选择题答案中请勿加分隔符或者空格。</view>
          <view>7.判断题答案支持 “错误”，“正确” 或者 “错”，“对”。</view>
          <view>8.填空题仅支持题目中出现括号。</view>
          <view>9.填空题里的多个填空答案要用 | 分割。</view>
        </view>

        <view class="section-title mt-4">格式案例</view>
        <view class="text-content example-text">
          <view>1.驾驶人有下列哪种违法行为一次记6分</view>
          <view>A、使用其他车辆行驶证</view>
          <view>B、饮酒后驾驶机动车</view>
          <view>C、车速超过规定时速50%以上</view>
          <view>D、违法占用应急车道行驶</view>
          <view>答案:D</view>
          <view>解析:请仔细阅读交规 (若无解析本行可不填)</view>
        </view>
      </view>

      <!-- Bottom Button -->
      <view class="footer-spacer"></view>
      <view class="footer-bar">
        <button type="primary" class="submit-btn" @tap="goPreview">预览</button>
      </view>
    </view>

    <!-- Preview Step -->
    <view v-else-if="step === 'preview'" class="preview-step">
      <!-- Filter Tabs -->
      <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
        <view class="filter-tabs">
          <view
            v-for="(tab, index) in filterTabs"
            :key="index"
            class="tab-item"
            :class="{ active: currentFilter === tab.key }"
            @tap="currentFilter = tab.key"
          >
            <text>{{ tab.label }} ({{ getCount(tab.key) }})</text>
            <view class="active-line" v-if="currentFilter === tab.key"></view>
          </view>
        </view>
      </scroll-view>

      <!-- Question List -->
      <view class="question-list">
        <view v-for="(item, index) in filteredList" :key="index" class="question-card">
          <view class="q-header">
            <view class="q-index">{{ index + 1 }}.</view>
            <uni-tag :text="getTypeName(item.type)" size="mini" type="primary" class="type-tag" />
            <view class="actions">
              <uni-icons type="compose" size="20" color="#2563eb" @tap="editQuestion(index)" class="icon-btn"></uni-icons>
              <uni-icons type="trash" size="20" color="#ef4444" @tap="deleteQuestion(index)" class="icon-btn"></uni-icons>
            </view>
          </view>
          
          <view class="q-content">{{ item.title }}</view>
          
          <view v-if="item.options && item.options.length" class="q-options">
            <view v-for="(opt, optIdx) in item.options" :key="optIdx" class="opt-row">
              {{ getOptionLabel(optIdx) }}. {{ opt }}
            </view>
          </view>

          <view class="q-meta-box">
            <view class="meta-row">
              <text class="meta-label">[答案]</text>
              <text class="meta-value">{{ item.answer }}</text>
            </view>
            <view class="meta-row" v-if="item.analysis">
              <text class="meta-label">[解析]</text>
              <text class="meta-value">{{ item.analysis }}</text>
            </view>
          </view>
        </view>
        
        <view v-if="filteredList.length === 0" class="empty-state">
          <text>暂无题目</text>
        </view>
      </view>

      <!-- Bottom Button -->
      <view class="footer-spacer"></view>
      <view class="footer-bar">
        <button type="primary" class="submit-btn" @tap="submitUpload">立即上传</button>
      </view>
    </view>
    
    <!-- Chapter Selection Popup (Reuse logic from import.vue if possible, or simple mock for now) -->
    <!-- For now, I'll assume we can navigate to a chapter selector or use a simple picker if data is available -->
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// State
const step = ref('input'); // 'input' | 'preview'
const inputText = ref(`1.驾驶人有下列哪种违法行为一次记6分
A、使用其他车辆行驶证
B、饮酒后驾驶机动车
C、车速超过规定时速50%以上
D、违法占用应急车道行驶
答案:D
解析:请仔细阅读交规 (若无解析本行可不填)
2.驾驶人有下列哪种违法行为一次记6分?
A、使用其他车辆行驶证
B、饮酒后驾驶机动车
C、车速超过规定时速50%以上
D、违法占用应急车道行驶
答案:ABCD
解析:请仔细阅读交规 (若无解析本行可不填)
3.国际象棋起源于英国吗?
答案:对
解析:无 (若无解析本行可不填)
4.我国古典四大名著是 () () () ()
答案:红楼梦|水浒传|三国演义|西游记
解析:无 (若无解析本行可不填)
5.如何保持身体健康?
答案:规律饮食、坚持锻炼，早睡早起，定期体检。
解析:无 (若无解析本行可不填)`);

const selectedChapterName = ref('');
const selectedChapterId = ref('');
const difficultyOptions = [
  { label: '容易', value: 'EASY' },
  { label: '中等', value: 'MEDIUM' },
  { label: '困难', value: 'HARD' }
];
const selectedDifficulty = ref('EASY');
const selectedDifficultyLabel = computed(() => {
  const opt = difficultyOptions.find(o => o.value === selectedDifficulty.value);
  return opt ? opt.label : '容易';
});

const parsedList = ref([]);
const currentFilter = ref('all');
const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'SINGLE', label: '单选题' },
  { key: 'MULTIPLE', label: '多选题' },
  { key: 'TRUE_FALSE', label: '判断题' },
  { key: 'FILL', label: '填空题' },
  { key: 'SHORT_ANSWER', label: '简答题' }
];

// Methods
const showTutorial = () => {
  uni.showToast({ title: '暂无教程', icon: 'none' });
};

const smartParse = () => {
  uni.showLoading({ title: '解析中...' });
  setTimeout(() => {
    parseText();
    uni.hideLoading();
    uni.showToast({ title: '解析完成', icon: 'success' });
  }, 500);
};

const showExample = () => {
  // Reset to default example
  inputText.value = `1.驾驶人有下列哪种违法行为一次记6分
A、使用其他车辆行驶证
B、饮酒后驾驶机动车
C、车速超过规定时速50%以上
D、违法占用应急车道行驶
答案:D
解析:请仔细阅读交规 (若无解析本行可不填)`;
};

const clearInput = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空输入区吗？',
    success: (res) => {
      if (res.confirm) {
        inputText.value = '';
      }
    }
  });
};

const openChapterSelect = () => {
  // Navigate to chapter selection or show picker
  // For simplicity, let's just mock it or use a simple action sheet if we had data
  uni.showToast({ title: '请先在单题录入中管理章节', icon: 'none' });
};

const manageChapters = () => {
  uni.navigateTo({ url: '/pages/questions/category' });
};

const onDifficultyChange = (e) => {
  const index = e.detail.value;
  selectedDifficulty.value = difficultyOptions[index].value;
};

// Parsing Logic
const parseText = () => {
  const text = inputText.value;
  if (!text) {
    parsedList.value = [];
    return;
  }

  const questions = [];
  // Split by question number pattern (e.g., "1." or "1、")
  // This regex looks for a number at the start of a line followed by . or 、
  const blocks = text.split(/\n(?=\d+[.、])/g);

  blocks.forEach(block => {
    if (!block.trim()) return;

    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return;

    const question = {
      title: '',
      options: [],
      answer: '',
      analysis: '',
      type: 'SINGLE' // Default
    };

    // Extract Title (first line)
    // Remove the number prefix
    question.title = lines[0].replace(/^\d+[.、]\s*/, '');

    // Process remaining lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for Options (A., B., etc.)
      if (/^[A-H][.、]/.test(line)) {
        question.options.push(line.replace(/^[A-H][.、]\s*/, ''));
      }
      // Check for Answer
      else if (line.startsWith('答案:') || line.startsWith('答案：')) {
        question.answer = line.replace(/^答案[:：]\s*/, '');
      }
      // Check for Analysis
      else if (line.startsWith('解析:') || line.startsWith('解析：')) {
        question.analysis = line.replace(/^解析[:：]\s*/, '');
      }
      // Append to title if it's not any of the above and we haven't found options/answer yet
      else if (question.options.length === 0 && !question.answer) {
        question.title += '\n' + line;
      }
    }

    // Determine Type
    if (question.options.length > 0) {
      if (question.answer.length > 1 && !['对', '错', '正确', '错误'].includes(question.answer)) {
        question.type = 'MULTIPLE';
      } else {
        question.type = 'SINGLE';
      }
    } else {
      if (['对', '错', '正确', '错误'].includes(question.answer)) {
        question.type = 'TRUE_FALSE';
      } else if (question.answer.includes('|')) {
        question.type = 'FILL';
      } else if (question.title.includes('()') || question.title.includes('（）')) {
        question.type = 'FILL';
      } else {
        question.type = 'SHORT_ANSWER';
      }
    }

    questions.push(question);
  });

  parsedList.value = questions;
};

const goPreview = () => {
  parseText();
  if (parsedList.value.length === 0) {
    uni.showToast({ title: '未能识别到题目，请检查格式', icon: 'none' });
    return;
  }
  step.value = 'preview';
  uni.setNavigationBarTitle({ title: '上传预览' });
};

const getCount = (key) => {
  if (key === 'all') return parsedList.value.length;
  return parsedList.value.filter(q => q.type === key).length;
};

const filteredList = computed(() => {
  if (currentFilter.value === 'all') return parsedList.value;
  return parsedList.value.filter(q => q.type === currentFilter.value);
});

const getTypeName = (type) => {
  const map = {
    'SINGLE': '单选题',
    'MULTIPLE': '多选题',
    'TRUE_FALSE': '判断题',
    'FILL': '填空题',
    'SHORT_ANSWER': '简答题'
  };
  return map[type] || '未知';
};

const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index);
};

const editQuestion = (index) => {
  uni.showToast({ title: '编辑功能开发中', icon: 'none' });
};

const deleteQuestion = (index) => {
  uni.showModal({
    title: '提示',
    content: '确定删除该题目吗？',
    success: (res) => {
      if (res.confirm) {
        parsedList.value.splice(index, 1);
      }
    }
  });
};

const submitUpload = () => {
  uni.showLoading({ title: '上传中...' });
  // Mock upload
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '上传成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 1000);
};

// Watch for back navigation to reset step if in preview
// Note: In uni-app, handling back button to change state instead of pop page requires custom navbar or onBackPress
// For simplicity, we'll let the back button go back to home, but we could add a "Back to Edit" button in preview.
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fb;
  padding-bottom: 120rpx;
}

.tutorial-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
  
  .tutorial-text {
    flex: 1;
    margin-left: 16rpx;
    font-size: 28rpx;
    color: #333;
  }
}

.card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  
  .card-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #111827;
  }
  
  .header-actions {
    display: flex;
    gap: 20rpx;
    
    .action-btn {
      font-size: 26rpx;
      color: #2563eb;
      
      &.warning {
        color: #ef4444;
      }
    }
  }
}

.input-textarea {
  width: 100%;
  min-height: 400rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
}

.settings-card {
  padding: 0 24rpx;
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100rpx;
    
    .label {
      font-size: 28rpx;
      color: #333;
    }
    
    .value-row {
      display: flex;
      align-items: center;
      gap: 10rpx;
      
      .value {
        font-size: 28rpx;
        color: #666;
      }
    }
  }
  
  .divider {
    height: 1rpx;
    background-color: #f0f0f0;
  }
}

.instructions {
  padding: 24rpx 32rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
    
    &.mt-4 {
      margin-top: 32rpx;
    }
  }
  
  .text-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
    
    &.example-text {
      background: #f9fafb;
      padding: 20rpx;
      border-radius: 8rpx;
      font-family: monospace;
    }
  }
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 32rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    background: #2563eb;
    
    &:active {
      opacity: 0.9;
    }
  }
}

/* Preview Styles */
.filter-scroll {
  background: #fff;
  white-space: nowrap;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-tabs {
  display: flex;
  padding: 0 20rpx;
  
  .tab-item {
    padding: 24rpx 20rpx;
    font-size: 28rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #2563eb;
      font-weight: 600;
    }
    
    .active-line {
      position: absolute;
      bottom: 0;
      left: 20rpx;
      right: 20rpx;
      height: 4rpx;
      background: #2563eb;
      border-radius: 2rpx;
    }
  }
}

.question-list {
  padding: 20rpx;
}

.question-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  
  .q-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    
    .q-index {
      font-size: 30rpx;
      font-weight: 600;
      margin-right: 12rpx;
    }
    
    .type-tag {
      margin-right: auto;
    }
    
    .actions {
      display: flex;
      gap: 24rpx;
      
      .icon-btn {
        padding: 8rpx;
      }
    }
  }
  
  .q-content {
    font-size: 30rpx;
    color: #111827;
    line-height: 1.5;
    margin-bottom: 16rpx;
  }
  
  .q-options {
    margin-bottom: 16rpx;
    
    .opt-row {
      font-size: 28rpx;
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 8rpx;
    }
  }
  
  .q-meta-box {
    background: #f9fafb;
    padding: 16rpx;
    border-radius: 8rpx;
    
    .meta-row {
      display: flex;
      margin-bottom: 8rpx;
      font-size: 26rpx;
      line-height: 1.5;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .meta-label {
        color: #9ca3af;
        width: 90rpx;
        flex-shrink: 0;
      }
      
      .meta-value {
        color: #4b5563;
      }
    }
  }
}

.empty-state {
  padding: 100rpx 0;
  text-align: center;
  color: #9ca3af;
  font-size: 28rpx;
}
</style>
