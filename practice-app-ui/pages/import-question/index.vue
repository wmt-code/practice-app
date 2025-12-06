<template>
  <view class="page">
    <view class="content">
      <view class="cell-group">
        <view class="cell-item arrow" @tap="openTypeSelect">
          <text class="label required">题型</text>
          <view class="value-text">{{ typeLabel }}</view>
          <uni-icons type="right" size="14" color="#c0c4cc" />
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="label required">题干</text>
        </view>
        <view class="toolbar" v-if="currentFocus === 'stem'">
          <view class="tool-btn" :class="{ active: formats.bold }" @tap="handleToolbar('bold')"><text style="font-weight: bold;">B</text></view>
          <view class="tool-btn" :class="{ active: formats.italic }" @tap="handleToolbar('italic')"><text style="font-style: italic;">I</text></view>
          <view class="tool-btn" :class="{ active: formats.underline }" @tap="handleToolbar('underline')"><text style="text-decoration: underline;">U</text></view>
          <view class="tool-btn" :class="{ active: formats.script === 'sub' }" @tap="handleToolbar('script', 'sub')">x₂</view>
          <view class="tool-btn" :class="{ active: formats.script === 'sup' }" @tap="handleToolbar('script', 'sup')">x²</view>
          <uni-icons class="tool-btn" type="image" size="20" @tap="insertImage"></uni-icons>
        </view>
        <view class="editor-box">
          <editor
            id="stemEditor"
            class="ql-editor"
            placeholder="请输入试题题目"
            show-img-size
            show-img-toolbar
            show-img-resize
            @ready="onStemReady"
            @statuschange="onStatusChange"
            @focus="onEditorFocus('stem')"
            @blur="onEditorBlur"
            @input="handleStemInput"
          ></editor>
        </view>
      </view>

      <view class="section" v-if="isChoice">
        <view class="section-header space-between">
          <view class="row-center">
            <text class="label required">选项</text>
          </view>
          <text class="sub-label required-mark">请勾选答案</text>
        </view>

        <view class="option-list">
          <view 
            class="option-item" 
            v-for="(item, index) in form.options" 
            :key="item.label"
          >
            <view class="icon-wrap" @tap="removeOption(index)" v-if="canRemoveOption">
              <uni-icons type="minus-filled" color="#dd524d" size="24" />
            </view>
            <view class="icon-wrap" v-else style="opacity: 0;">
               <uni-icons type="minus-filled" size="24" />
            </view>

            <view class="option-label">{{ item.label }}.</view>
            <view class="input-wrap-editor">
              <view class="toolbar" v-if="currentFocus === 'option-' + index">
                <view class="tool-btn" :class="{ active: formats.bold }" @tap="handleToolbar('bold')"><text style="font-weight: bold;">B</text></view>
                <view class="tool-btn" :class="{ active: formats.italic }" @tap="handleToolbar('italic')"><text style="font-style: italic;">I</text></view>
                <view class="tool-btn" :class="{ active: formats.underline }" @tap="handleToolbar('underline')"><text style="text-decoration: underline;">U</text></view>
                <view class="tool-btn" :class="{ active: formats.script === 'sub' }" @tap="handleToolbar('script', 'sub')">x₂</view>
                <view class="tool-btn" :class="{ active: formats.script === 'sup' }" @tap="handleToolbar('script', 'sup')">x²</view>
                <uni-icons class="tool-btn" type="image" size="20" @tap="insertImage"></uni-icons>
              </view>
              <editor
                :id="'optionEditor' + index"
                class="ql-editor-option"
                placeholder="请输入试题选项"
                show-img-size
                show-img-toolbar
                show-img-resize
                @ready="onOptionReady(index)"
                @statuschange="onStatusChange"
                @focus="onEditorFocus('option-' + index)"
                @blur="onEditorBlur"
                @input="(e) => handleOptionInput(e, index)"
              ></editor>
            </view>

            <view class="check-wrap" @tap="toggleAnswer(item.label)">
              <view class="radio-circle" :class="{ active: form.answers.includes(item.label) }">
                <view class="inner-dot" v-if="form.answers.includes(item.label)"></view>
              </view>
            </view>
          </view>
        </view>

        <view class="add-row">
          <view class="add-btn" @tap="addOption" :class="{ disabled: optionsDisabled }">
            <uni-icons type="plus-filled" color="#007aff" size="22" />
            <text class="add-text">添加选项</text>
          </view>
          <view class="bulk-btn" @tap="openBulkPopup">批量添加</view>
        </view>
      </view>

      <view class="section" v-else-if="form.type === 'FILL'">
        <view class="section-header space-between">
          <text class="label required">填空答案</text>
          <view class="add-btn" @tap="addBlank">
            <uni-icons type="plus-filled" color="#007aff" size="20" />
            <text class="add-text">添加空</text>
          </view>
        </view>
        <view class="option-list">
          <view class="option-item" v-for="(blank, index) in form.blanks" :key="blank.id">
            <view class="icon-wrap" @tap="removeBlank(index)" v-if="form.blanks.length > 1">
              <uni-icons type="minus-filled" color="#dd524d" size="24" />
            </view>
            <text class="option-label">空{{ index + 1 }}</text>
            <view class="input-wrap">
              <input class="gray-input" v-model="blank.text" placeholder="请输入参考答案" />
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="label">解析</text>
        </view>
        <view class="toolbar" v-if="currentFocus === 'analysis'">
          <view class="tool-btn" :class="{ active: formats.bold }" @tap="handleToolbar('bold')"><text style="font-weight: bold;">B</text></view>
          <view class="tool-btn" :class="{ active: formats.italic }" @tap="handleToolbar('italic')"><text style="font-style: italic;">I</text></view>
          <view class="tool-btn" :class="{ active: formats.underline }" @tap="handleToolbar('underline')"><text style="text-decoration: underline;">U</text></view>
          <view class="tool-btn" :class="{ active: formats.script === 'sub' }" @tap="handleToolbar('script', 'sub')">x₂</view>
          <view class="tool-btn" :class="{ active: formats.script === 'sup' }" @tap="handleToolbar('script', 'sup')">x²</view>
          <uni-icons class="tool-btn" type="image" size="20" @tap="insertImage"></uni-icons>
        </view>
        <view class="textarea-box">
          <editor
            id="analysisEditor"
            class="ql-editor"
            placeholder="请输入试题解析"
            show-img-size
            show-img-toolbar
            show-img-resize
            @ready="onAnalysisReady"
            @statuschange="onStatusChange"
            @focus="onEditorFocus('analysis')"
            @blur="onEditorBlur"
            @input="handleAnalysisInput"
          ></editor>
        </view>
      </view>

      <view class="cell-group mt-20">
        <view class="cell-item arrow" @tap="chooseCategory">
          <text class="label-text">选择章节</text>
          <view class="right-content">
             <uni-icons type="right" size="14" color="#c0c4cc" />
          </view>
        </view>
        <view class="cell-item arrow">
          <text class="label-text">编辑章节</text>
          <uni-icons type="right" size="14" color="#c0c4cc" />
        </view>
        <view class="cell-item arrow" @tap="openDifficulty">
          <text class="label-text">难度</text>
          <view class="right-content" v-if="form.difficulty">
             <text class="value-text">{{ renderDifficulty(form.difficulty) }}</text>
             <uni-icons type="right" size="14" color="#c0c4cc" />
          </view>
           <uni-icons v-else type="right" size="14" color="#c0c4cc" />
        </view>
      </view>

      <view style="height: 120rpx;"></view> </view>

    <view class="footer-bar">
      <button class="submit-btn" hover-class="btn-hover" @tap="submit">添加试题</button>
    </view>

    <uni-popup ref="bulkPopup" type="dialog">
      <uni-popup-dialog 
        mode="input" 
        title="批量添加选项" 
        placeholder="一行一个选项，自动填充"
        :before-close="true" 
        @confirm="applyBulkOptions" 
        @close="bulkPopup.close()"
      >
        <view class="dialog-content">
            <textarea 
                v-model="bulkText" 
                class="bulk-textarea" 
                placeholder="请输入选项内容，每行代表一个选项（例如：\n正确答案\n错误答案）"
            />
        </view>
      </uni-popup-dialog>
    </uni-popup>

  </view>
</template>

<script setup>
import { computed, nextTick, ref, getCurrentInstance } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 基础数据
const questionTypes = [
  { value: 'SINGLE', text: '单选题' },
  { value: 'MULTIPLE', text: '多选题' },
  { value: 'JUDGE', text: '判断题' },
  { value: 'FILL', text: '填空题' },
];

const difficultyOptions = [
  { value: 'EASY', text: '简单' },
  { value: 'MEDIUM', text: '中等' },
  { value: 'HARD', text: '困难' },
];

const instance = getCurrentInstance();

const mode = ref('single');
const showStemToolbar = ref(false);
const stemEditorCtx = ref(null);
const analysisEditorCtx = ref(null);
const optionEditorCtxs = ref({}); // Map id to context
const currentFocus = ref(''); // 'stem', 'analysis', 'option-0', ...
const bulkPopup = ref(null);
const bulkText = ref('');
const formats = ref({});
let blurTimer = null;

// 表单数据
const form = ref({
  type: 'SINGLE', // SINGLE, MULTIPLE, JUDGE, FILL
  stemHtml: '',
  options: createDefaultOptions(4),
  answers: [],
  blanks: [{ id: Date.now(), text: '' }],
  analysis: '',
  categoryName: '',
  difficulty: '', // 截图里默认可能为空
});

// 计算属性
const typeLabel = computed(() => {
    const t = questionTypes.find(i => i.value === form.value.type);
    return t ? t.text : '请选择';
});
const isChoice = computed(() => ['SINGLE', 'MULTIPLE', 'JUDGE'].includes(form.value.type));
const isSingle = computed(() => ['SINGLE', 'JUDGE'].includes(form.value.type));
const canRemoveOption = computed(() => form.value.options.length > 2 && form.value.type !== 'JUDGE');
const optionsDisabled = computed(() => form.value.options.length >= 8 || form.value.type === 'JUDGE');

onLoad((query) => {
  mode.value = query.mode || 'single';
});

// 逻辑方法
function createDefaultOptions(count = 4) {
  return Array.from({ length: count }).map((_, idx) => ({
    label: String.fromCharCode(65 + idx),
    text: '',
  }));
}

// 切换题型
function openTypeSelect() {
    uni.showActionSheet({
        itemList: questionTypes.map(t => t.text),
        success: (res) => {
            handleTypeChange(questionTypes[res.tapIndex].value);
        }
    });
}

function handleTypeChange(val) {
  form.value.type = val;
  form.value.answers = []; // 切换题型时清空答案

  if (val === 'JUDGE') {
    // 切换到判断题：强制设置为 正确/错误
    form.value.options = [
      { label: 'A', text: '正确' },
      { label: 'B', text: '错误' },
    ];
  } else if (val === 'FILL') {
    // 切换到填空题
    if (!form.value.blanks || form.value.blanks.length === 0) {
      form.value.blanks = [{ id: Date.now(), text: '' }];
    }
  } else {
    // 切换到 单选 (SINGLE) 或 多选 (MULTIPLE)
    
    // 核心修复逻辑：
    // 检测当前是否是判断题的残留数据（只有2项 且 内容是正确/错误）
    const isJudgeData = form.value.options.length === 2 && 
                        form.value.options[0].text === '正确' && 
                        form.value.options[1].text === '错误';
    
    // 如果是判断题数据，或者选项为空，则重置为标准的 4 个空选项
    if (isJudgeData || form.value.options.length === 0) {
      form.value.options = createDefaultOptions(4);
    }
  }
}

// 题干编辑器
function onStemReady(e) {
  // 尝试使用 createSelectorQuery 获取 context，以兼容更多平台
  uni.createSelectorQuery().in(instance).select('#stemEditor').context((res) => {
    stemEditorCtx.value = res.context;
  }).exec();
}
function handleStemInput(e) {
  form.value.stemHtml = e.detail.html;
}
function onStatusChange(e) {
  formats.value = e.detail;
}

// 通用工具栏处理
function handleToolbar(name, value) {
    let ctx = null;
    if (currentFocus.value === 'stem') ctx = stemEditorCtx.value;
    else if (currentFocus.value === 'analysis') ctx = analysisEditorCtx.value;
    else if (currentFocus.value.startsWith('option-')) {
        const idx = currentFocus.value.split('-')[1];
        ctx = optionEditorCtxs.value[idx];
    }
    
    if (ctx) ctx.format(name, value);
}

// 通用插入图片
function insertImage() {
    let ctx = null;
    if (currentFocus.value === 'stem') ctx = stemEditorCtx.value;
    else if (currentFocus.value === 'analysis') ctx = analysisEditorCtx.value;
    else if (currentFocus.value.startsWith('option-')) {
        const idx = currentFocus.value.split('-')[1];
        ctx = optionEditorCtxs.value[idx];
    }

    if (!ctx) return;
    uni.chooseImage({
        count: 1,
        success: (res) => {
            ctx.insertImage({ src: res.tempFilePaths[0], width: '80%' });
        }
    });
}

// 选项编辑器
function onOptionReady(index) {
    uni.createSelectorQuery().in(instance).select('#optionEditor' + index).context((res) => {
        optionEditorCtxs.value[index] = res.context;
        // 如果有初始值，需要 setContents
        if (form.value.options[index].text) {
            res.context.setContents({ html: form.value.options[index].text });
        }
    }).exec();
}
function handleOptionInput(e, index) {
    form.value.options[index].text = e.detail.html;
}

// 解析编辑器
function onAnalysisReady() {
     uni.createSelectorQuery().in(instance).select('#analysisEditor').context((res) => {
        analysisEditorCtx.value = res.context;
         if (form.value.analysis) {
            res.context.setContents({ html: form.value.analysis });
        }
    }).exec();
}
function handleAnalysisInput(e) {
    form.value.analysis = e.detail.html;
}

// 焦点管理
function onEditorFocus(key) {
    if (blurTimer) {
        clearTimeout(blurTimer);
        blurTimer = null;
    }
    currentFocus.value = key;
}
function onEditorBlur() {
    // 延迟清除焦点，防止点击工具栏时焦点丢失导致工具栏隐藏
    blurTimer = setTimeout(() => {
        currentFocus.value = '';
        blurTimer = null;
    }, 200);
}

// 选项操作
function addOption() {
  if (optionsDisabled.value) return;
  const nextLabel = String.fromCharCode(65 + form.value.options.length);
  form.value.options.push({ label: nextLabel, text: '' });
}

function removeOption(index) {
  if (!canRemoveOption.value) return;
  const removed = form.value.options.splice(index, 1)[0];
  // 清理已选答案
  form.value.answers = form.value.answers.filter(a => a !== removed.label);
  // 重置Label顺序
  form.value.options.forEach((item, idx) => {
    item.label = String.fromCharCode(65 + idx);
  });
}

// 答案选择 (模拟Checkbox/Radio行为)
function toggleAnswer(label) {
    if (isSingle.value) {
        // 单选：如果点了已选的，不取消（通常逻辑），或者切换
        form.value.answers = [label];
    } else {
        // 多选
        const idx = form.value.answers.indexOf(label);
        if (idx > -1) {
            form.value.answers.splice(idx, 1);
        } else {
            form.value.answers.push(label);
        }
    }
}

// 批量添加
function openBulkPopup() {
    bulkText.value = '';
    bulkPopup.value.open();
}
function applyBulkOptions() {
    const lines = bulkText.value.split('\n').filter(s => s.trim());
    // 简单填充逻辑：有空位填空位，没空位加选项
    let currentIdx = 0;
    // 先填现有的
    while(currentIdx < form.value.options.length && lines.length > 0) {
        if(!form.value.options[currentIdx].text) {
            form.value.options[currentIdx].text = lines.shift();
        }
        currentIdx++;
    }
    // 剩下的新增
    while(lines.length > 0 && !optionsDisabled.value) {
         const nextLabel = String.fromCharCode(65 + form.value.options.length);
         form.value.options.push({ label: nextLabel, text: lines.shift() });
    }
    bulkPopup.value.close();
}

// 填空操作
function addBlank() {
  form.value.blanks.push({ id: Date.now(), text: '' });
}
function removeBlank(index) {
  form.value.blanks.splice(index, 1);
}

// 底部选择器
function chooseCategory() {
  uni.showToast({ title: '打开章节选择器', icon: 'none' });
}
function openDifficulty() {
  uni.showActionSheet({
    itemList: difficultyOptions.map(d => d.text),
    success: (res) => {
      form.value.difficulty = difficultyOptions[res.tapIndex].value;
    }
  });
}
function renderDifficulty(val) {
  const t = difficultyOptions.find(d => d.value === val);
  return t ? t.text : '';
}

function submit() {
  console.log('Submit:', form.value);
  if (!form.value.stemHtml && !form.value.stemText) {
      return uni.showToast({ title: '请输入题干', icon:'none' });
  }
  if (isChoice.value && form.value.answers.length === 0) {
      return uni.showToast({ title: '请勾选正确答案', icon:'none' });
  }
  uni.showToast({ title: '添加成功', icon: 'success' });
}
</script>

<style lang="scss" scoped>
/* 全局样式重置 */
.page {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 40rpx;
}

/* 模拟导航栏 */
.nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 44px 16px 12px; /* 适配刘海屏大致高度 */
    background: #fff;
    border-bottom: 1px solid #eee;
}
.nav-title {
    font-size: 17px;
    font-weight: 600;
}
.nav-actions {
    display: flex;
    gap: 8px;
}

.content {
  padding: 0 32rpx;
}

/* 必填红星 */
.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4rpx;
}
.required-mark::before {
    content: '*';
    color: #ff4d4f;
    margin-right: 4rpx;
}

/* 通用标签 */
.label {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
}
.sub-label {
    font-size: 26rpx;
    color: #666;
}

/* 单元格样式 (题型、底部选项) */
.cell-group {
    margin-top: 20rpx;
}
.cell-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    font-size: 30rpx;
    color: #333;
}
.value-text {
    flex: 1;
    text-align: right;
    margin-right: 12rpx;
    color: #333;
}
.label-text {
    color: #333;
    font-size: 30rpx;
}
.right-content {
    display: flex;
    align-items: center;
    color: #666;
}
.mt-20 {
    margin-top: 40rpx;
}

/* 编辑区域 */
.section {
    margin-top: 30rpx;
}
.section-header {
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
}
.section-header.space-between {
    justify-content: space-between;
}
.row-center {
    display: flex;
    align-items: center;
}

/* 题干工具栏 */
.toolbar {
    display: flex;
    gap: 20rpx;
    background: #f8f8f8;
    padding: 12rpx;
    border-radius: 8rpx 8rpx 0 0;
    border-bottom: 1rpx solid #eee;
}
.tool-btn {
    padding: 4rpx 12rpx;
    font-size: 28rpx;
    color: #333;
    border-radius: 4rpx;
}
.tool-btn.active {
    background-color: #e6f1fc;
    color: #007aff;
}

/* 编辑器容器 */
.editor-box {
    background: #f5f7fa; /* 截图中的浅灰色背景 */
    border-radius: 12rpx;
    padding: 16rpx 24rpx;
    min-height: 80rpx;
}
.ql-editor {
    min-height: 48rpx;
    font-size: 30rpx;
    line-height: 1.6;
}

/* 选项列表 */
.option-list {
    margin-top: 10rpx;
}
.option-item {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
}
.icon-wrap {
    width: 60rpx;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.option-label {
    width: 40rpx;
    font-size: 32rpx;
    color: #333;
    margin-right: 8rpx;
}
.input-wrap-editor {
    flex: 1;
    width: 0; /* 防止被内容撑开 */
    background: #f5f7fa;
    border-radius: 12rpx;
    padding: 16rpx 24rpx;
    margin-right: 20rpx;
    min-height: 80rpx;
    /* 让 editor 自然流布局 */
}
.input-wrap {
    flex: 1;
    width: 0; /* 防止被内容撑开 */
    background: #f5f7fa;
    border-radius: 12rpx;
    padding: 16rpx 24rpx;
    margin-right: 20rpx;
    min-height: 80rpx;
    display: flex;
    align-items: center;
}
.gray-input {
    font-size: 28rpx;
    color: #333;
    width: 100%;
}
.ql-editor-option {
    min-height: 48rpx;
    font-size: 28rpx;
    line-height: 1.6;
    width: 100%;
    word-break: break-all;
    white-space: pre-wrap;
}
/* 右侧勾选圈 */
.check-wrap {
    width: 50rpx;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
.radio-circle {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 2rpx solid #dcdfe6;
    display: flex;
    justify-content: center;
    align-items: center;
}
.radio-circle.active {
    border-color: #007aff; /* 蓝色 */
}
.inner-dot {
    width: 24rpx;
    height: 24rpx;
    background: #007aff;
    border-radius: 50%;
}

/* 添加选项按钮 */
.add-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20rpx;
}
.add-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
}
.add-btn.disabled {
    opacity: 0.5;
}
.add-text {
    font-size: 30rpx;
    color: #007aff;
}
.bulk-btn {
    border: 1rpx solid #007aff;
    color: #007aff;
    font-size: 24rpx;
    padding: 6rpx 20rpx;
    border-radius: 30rpx;
}

/* 解析 */
.textarea-box {
    background: #f5f7fa;
    border-radius: 12rpx;
    padding: 16rpx 24rpx;
    min-height: 80rpx;
}
.gray-textarea {
    width: 100%;
    font-size: 28rpx;
    color: #333;
    min-height: 100rpx;
}

/* 底部按钮 */
.footer-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx 32rpx 40rpx; /* 适配底部安全区 */
    background: #fff;
    z-index: 99;
    border-top: 1rpx solid #f0f0f0;
}
.submit-btn {
    background: #007aff;
    color: #fff;
    border-radius: 44rpx;
    font-size: 32rpx;
    height: 88rpx;
    line-height: 88rpx;
    border: none;
}
.submit-btn::after {
    border: none;
}
.btn-hover {
    opacity: 0.9;
}

/* 弹窗样式 */
.dialog-content {
    width: 100%;
    padding: 20rpx 0;
}
.bulk-textarea {
    width: 100%;
    height: 300rpx;
    background: #f5f7fa;
    padding: 10rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
}
</style>