<template>
  <view class="page">
    <view class="card">
      <view class="card-header">
        <text class="title">单题编辑录入</text>
        <view class="chip">{{ modeLabel }}</view>
      </view>

      <uni-forms :modelValue="form" labelWidth="120rpx">
        <uni-forms-item label="题型" required>
          <uni-data-select
            v-model="form.type"
            :localdata="questionTypes"
            placeholder="请选择题型"
            @change="handleTypeChange"
          />
        </uni-forms-item>

        <uni-forms-item label="题干" required>
          <view v-if="showStemToolbar" class="toolbar">
            <view class="tool" v-for="btn in toolbarBtns" :key="btn.key" @tap="handleStemToolbar(btn.key)">
              {{ btn.label }}
            </view>
          </view>
          <view class="editor-wrap">
            <editor
              class="editor"
              placeholder="请输入试题题目"
              show-img-size
              show-img-toolbar
              show-img-resize
              @ready="onStemReady"
              @focus="() => (showStemToolbar = true)"
              @input="handleStemInput"
            />
          </view>
        </uni-forms-item>

        <view v-if="isChoice" class="block">
          <view class="block-header">
            <view class="left">
              <text class="req">*</text>
              <text class="block-title">选项</text>
            </view>
            <view class="right">
              <text class="muted">请勾选答案</text>
            </view>
          </view>

          <view class="option-actions">
            <button size="mini" class="ghost-btn" @tap="addOption" :disabled="optionsDisabled">添加选项</button>
            <button size="mini" type="primary" plain @tap="openBulkPopup">批量添加</button>
          </view>

          <radio-group v-if="isSingle" @change="handleSingleAnswerChange">
            <view v-for="(item, index) in form.options" :key="item.label" class="option-row">
              <view class="option-label">
                <button
                  v-if="canRemoveOption"
                  size="mini"
                  class="circle-btn"
                  type="warn"
                  @tap.stop="removeOption(index)"
                >
                  -
                </button>
                <text class="label-text">{{ item.label }}.</text>
              </view>
              <view class="option-body">
                <uni-easyinput v-model="item.text" placeholder="请输入试题选项" />
                <view class="option-tools">
                  <button size="mini" class="ghost-btn" @tap="openOptionEditor(index)">富文本编辑</button>
                </view>
              </view>
              <radio :value="item.label" :checked="form.answers.includes(item.label)" />
            </view>
          </radio-group>

          <checkbox-group v-else @change="handleMultipleAnswerChange">
            <view v-for="(item, index) in form.options" :key="item.label" class="option-row">
              <view class="option-label">
                <button
                  v-if="canRemoveOption"
                  size="mini"
                  class="circle-btn"
                  type="warn"
                  @tap.stop="removeOption(index)"
                >
                  -
                </button>
                <text class="label-text">{{ item.label }}.</text>
              </view>
              <view class="option-body">
                <uni-easyinput v-model="item.text" placeholder="请输入试题选项" />
                <view class="option-tools">
                  <button size="mini" class="ghost-btn" @tap="openOptionEditor(index)">富文本编辑</button>
                </view>
              </view>
              <checkbox :value="item.label" :checked="form.answers.includes(item.label)" />
            </view>
          </checkbox-group>
        </view>

        <view v-else-if="form.type === 'FILL'" class="block">
          <view class="block-header">
            <view class="left">
              <text class="req">*</text>
              <text class="block-title">填空</text>
            </view>
            <view class="right">
              <button size="mini" class="ghost-btn" @tap="addBlank">添加空</button>
            </view>
          </view>
          <view v-for="(blank, index) in form.blanks" :key="blank.id" class="blank-row">
            <view class="blank-meta">
              <text class="label-text">空 {{ index + 1 }}</text>
              <button
                v-if="form.blanks.length > 1"
                size="mini"
                class="circle-btn"
                type="warn"
                @tap="removeBlank(index)"
              >
                -
              </button>
            </view>
            <uni-easyinput v-model="blank.text" placeholder="请输入该空的参考答案" />
          </view>
          <view class="blank-settings">
            <label class="switch-item">
              <switch :checked="form.blankOrderRequired" @change="(e) => (form.blankOrderRequired = e.detail.value)" />
              <text>答案有顺序要求</text>
            </label>
            <label class="switch-item">
              <switch
                :checked="form.blankCaseSensitive"
                @change="(e) => (form.blankCaseSensitive = e.detail.value)"
              />
              <text>区分大小写</text>
            </label>
          </view>
        </view>

        <uni-forms-item label="解析">
          <uni-easyinput
            type="textarea"
            v-model="form.analysis"
            placeholder="请输入试题解析"
            autoHeight
            :maxlength="-1"
          />
        </uni-forms-item>

        <uni-forms-item label="选择章节">
          <view class="cell" @tap="chooseCategory">
            <text class="cell-text">{{ form.categoryName || '请选择章节' }}</text>
            <uni-icons type="right" size="18" color="#8f9bb3" />
          </view>
        </uni-forms-item>

        <uni-forms-item label="难度">
          <view class="cell" @tap="openDifficulty">
            <text class="cell-text">{{ renderDifficulty(form.difficulty) }}</text>
            <uni-icons type="right" size="18" color="#8f9bb3" />
          </view>
        </uni-forms-item>
      </uni-forms>
    </view>

    <view class="submit-bar">
      <button type="primary" class="submit-btn" @tap="submit">添加试题</button>
    </view>

    <!-- 批量填充 -->
    <uni-popup ref="bulkPopup" type="dialog">
      <view class="dialog">
        <view class="dialog-title">批量填充选项</view>
        <textarea
          v-model="bulkText"
          class="dialog-textarea"
          placeholder="每行一个选项，自动按顺序填充，最多 8 个"
        />
        <view class="dialog-actions">
          <button class="ghost-btn" size="mini" @tap="bulkPopup.close()">取消</button>
          <button type="primary" size="mini" @tap="applyBulkOptions">填充</button>
        </view>
      </view>
    </uni-popup>

    <!-- 选项富文本 -->
    <uni-popup ref="optionPopup" type="bottom" background-color="#f8fafc">
      <view class="popup-editor">
        <view class="sheet-header">
          <text>编辑选项 {{ editingLabel }}</text>
          <button size="mini" class="ghost-btn" @tap="optionPopup.close()">收起</button>
        </view>
        <view class="toolbar" v-if="showOptionToolbar">
          <view class="tool" v-for="btn in toolbarBtns" :key="btn.key" @tap="handleOptionToolbar(btn.key)">
            {{ btn.label }}
          </view>
        </view>
        <editor
          class="editor tall"
          placeholder="请输入选项内容"
          show-img-size
          show-img-toolbar
          show-img-resize
          @ready="onOptionReady"
          @focus="() => (showOptionToolbar = true)"
          @input="handleOptionInput"
        />
        <view class="dialog-actions">
          <button type="primary" size="mini" @tap="saveOptionRich">保存选项</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

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

const toolbarBtns = [
  { key: 'bold', label: 'B' },
  { key: 'italic', label: 'I' },
  { key: 'underline', label: 'U' },
  { key: 'strike', label: 'S' },
  { key: 'sub', label: 'x₂' },
  { key: 'sup', label: 'x²' },
  { key: 'color', label: 'T' },
  { key: 'left', label: 'L' },
  { key: 'center', label: 'C' },
  { key: 'right', label: 'R' },
  { key: 'undo', label: '↶' },
  { key: 'redo', label: '↷' },
];

const mode = ref('single');
const showStemToolbar = ref(false);
const showOptionToolbar = ref(false);

const stemEditorCtx = ref(null);
const optionEditorCtx = ref(null);

const form = ref({
  type: 'SINGLE',
  stemHtml: '',
  options: createDefaultOptions(),
  answers: [],
  blanks: [{ id: Date.now(), text: '' }],
  blankOrderRequired: false,
  blankCaseSensitive: false,
  analysis: '',
  categoryId: '',
  categoryName: '',
  difficulty: 'MEDIUM',
});

const bulkText = ref('');
const editingIndex = ref(-1);
const optionEditorHtml = ref('');

const flatCategories = ref([
  { id: 'c1', name: '章节1' },
  { id: 'c1-1', name: '子章节1', parent: 'c1', level: 1 },
  { id: 'c2', name: '章节2' },
]);

const bulkPopup = ref(null);
const optionPopup = ref(null);

const isChoice = computed(() => ['SINGLE', 'MULTIPLE', 'JUDGE'].includes(form.value.type));
const isSingle = computed(() => ['SINGLE', 'JUDGE'].includes(form.value.type));
const canRemoveOption = computed(() => form.value.options.length > 2 && form.value.type !== 'JUDGE');
const optionsDisabled = computed(() => form.value.options.length >= 8 || form.value.type === 'JUDGE');
const modeLabel = computed(() => {
  if (mode.value === 'batch') return '批量录入';
  if (mode.value === 'file') return '文件录入';
  return '单题录入';
});
const editingLabel = computed(() => {
  const option = form.value.options[editingIndex.value];
  return option ? option.label : '';
});

onLoad((query) => {
  mode.value = query.mode || 'single';
});

function createDefaultOptions(count = 4) {
  return Array.from({ length: count }).map((_, idx) => ({
    label: String.fromCharCode(65 + idx),
    text: '',
    html: '',
  }));
}

function handleTypeChange(val) {
  form.value.type = val;
  form.value.answers = [];
  if (val === 'JUDGE') {
    form.value.options = [
      { label: 'A', text: '正确', html: '' },
      { label: 'B', text: '错误', html: '' },
    ];
  } else if (val === 'FILL') {
    form.value.blanks = [{ id: Date.now(), text: '' }];
  } else {
    form.value.options = createDefaultOptions();
  }
}

function onStemReady(e) {
  stemEditorCtx.value = e.detail.context;
  if (form.value.stemHtml) {
    stemEditorCtx.value.setContents({ html: form.value.stemHtml });
  }
}

function handleStemInput(e) {
  form.value.stemHtml = e.detail.html || '';
}

function handleStemToolbar(key) {
  if (!stemEditorCtx.value) return;
  const ctx = stemEditorCtx.value;
  if (key === 'bold' || key === 'italic' || key === 'underline' || key === 'strike') {
    ctx.format(key, true);
  }
  if (key === 'sub') ctx.format('script', 'sub');
  if (key === 'sup') ctx.format('script', 'super');
  if (key === 'color') ctx.format('color', '#111');
  if (key === 'left') ctx.format('align', 'left');
  if (key === 'center') ctx.format('align', 'center');
  if (key === 'right') ctx.format('align', 'right');
  if (key === 'undo' && ctx.undo) ctx.undo();
  if (key === 'redo' && ctx.redo) ctx.redo();
}

function addOption() {
  if (optionsDisabled.value) return;
  const nextLabel = String.fromCharCode(65 + form.value.options.length);
  form.value.options.push({ label: nextLabel, text: '', html: '' });
}

function removeOption(index) {
  if (!canRemoveOption.value) return;
  const removed = form.value.options.splice(index, 1)[0];
  form.value.answers = form.value.answers.filter((a) => a !== removed.label);
  form.value.options.forEach((item, idx) => {
    item.label = String.fromCharCode(65 + idx);
  });
}

function handleSingleAnswerChange(e) {
  form.value.answers = [e.detail.value];
}

function handleMultipleAnswerChange(e) {
  form.value.answers = e.detail.value || [];
}

function openBulkPopup() {
  bulkText.value = form.value.options.map((o) => o.text).join('\n');
  bulkPopup.value?.open();
}

function applyBulkOptions() {
  const list = bulkText.value
    .split(/\n+/)
    .map((i) => i.trim())
    .filter(Boolean)
    .slice(0, 8);
  list.forEach((txt, idx) => {
    if (form.value.options[idx]) {
      form.value.options[idx].text = txt;
    } else if (!optionsDisabled.value) {
      const nextLabel = String.fromCharCode(65 + form.value.options.length);
      form.value.options.push({ label: nextLabel, text: txt, html: '' });
    }
  });
  bulkPopup.value?.close();
}

function addBlank() {
  form.value.blanks.push({ id: Date.now() + form.value.blanks.length, text: '' });
}

function removeBlank(index) {
  if (form.value.blanks.length <= 1) return;
  form.value.blanks.splice(index, 1);
}

function openOptionEditor(index) {
  editingIndex.value = index;
  optionEditorHtml.value = form.value.options[index].html || form.value.options[index].text || '';
  optionPopup.value?.open('bottom');
  nextTick(() => {
    if (optionEditorCtx.value && optionEditorCtx.value.setContents) {
      optionEditorCtx.value.setContents({ html: optionEditorHtml.value || '<p></p>' });
    }
  });
}

function onOptionReady(e) {
  optionEditorCtx.value = e.detail.context;
  if (optionEditorHtml.value) {
    optionEditorCtx.value.setContents({ html: optionEditorHtml.value });
  }
}

function handleOptionInput(e) {
  optionEditorHtml.value = e.detail.html || '';
}

function handleOptionToolbar(key) {
  if (!optionEditorCtx.value) return;
  const ctx = optionEditorCtx.value;
  if (key === 'bold' || key === 'italic' || key === 'underline' || key === 'strike') {
    ctx.format(key, true);
  }
  if (key === 'sub') ctx.format('script', 'sub');
  if (key === 'sup') ctx.format('script', 'super');
  if (key === 'color') ctx.format('color', '#111');
  if (key === 'left') ctx.format('align', 'left');
  if (key === 'center') ctx.format('align', 'center');
  if (key === 'right') ctx.format('align', 'right');
  if (key === 'undo' && ctx.undo) ctx.undo();
  if (key === 'redo' && ctx.redo) ctx.redo();
}

function saveOptionRich() {
  if (editingIndex.value < 0) return;
  const target = form.value.options[editingIndex.value];
  target.html = optionEditorHtml.value;
  if (!target.text && optionEditorHtml.value) {
    target.text = stripHtml(optionEditorHtml.value);
  }
  optionPopup.value?.close();
}

function chooseCategory() {
  const names = flatCategories.value.map((c) => c.name);
  uni.showActionSheet({
    itemList: names,
    success: (res) => {
      const cat = flatCategories.value[res.tapIndex];
      form.value.categoryId = cat.id;
      form.value.categoryName = cat.name;
    },
  });
}

function openDifficulty() {
  uni.showActionSheet({
    itemList: difficultyOptions.map((d) => d.text),
    success: (res) => {
      const diff = difficultyOptions[res.tapIndex];
      form.value.difficulty = diff.value;
    },
  });
}

function renderDifficulty(val) {
  const target = difficultyOptions.find((d) => d.value === val);
  return target ? target.text : '请选择';
}

function submit() {
  const payload = { ...form.value };
  console.log('submit question', payload);
  uni.showToast({ title: '已保存到本地状态', icon: 'none' });
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').trim();
}
</script>

<style lang="scss" scoped>
.page {
  padding: 16rpx;
  background: #f5f7fb;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 700;
}

.chip {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #eef2ff;
  color: #2563eb;
  font-size: 24rpx;
}

.toolbar {
  flex-direction: row;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 10rpx 6rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  background: #f8fafc;
}

.tool {
  padding: 8rpx 14rpx;
  background: #fff;
  border-radius: 10rpx;
  border: 1rpx solid #e5e7eb;
  font-weight: 600;
  color: #111827;
}

.editor-wrap {
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  background: #f8fafc;
  padding: 10rpx;
}

.editor {
  min-height: 220rpx;
}

.editor.tall {
  min-height: 320rpx;
}

.block {
  padding: 12rpx 0 0;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.block-title {
  font-size: 28rpx;
  font-weight: 600;
}

.req {
  color: #ef4444;
  margin-right: 8rpx;
}

.muted {
  color: #9ca3af;
}

.option-actions {
  display: flex;
  gap: 10rpx;
  margin: 8rpx 0 12rpx;
}

.option-row {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f0f2f5;
  gap: 12rpx;
}

.option-label {
  width: 120rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.label-text {
  font-size: 28rpx;
  color: #374151;
}

.option-body {
  flex: 1;
}

.option-tools {
  display: flex;
  justify-content: flex-start;
  margin-top: 8rpx;
}

.circle-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  padding: 0;
  line-height: 48rpx;
}

.blank-row {
  padding: 12rpx 0;
}

.blank-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.blank-settings {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
  color: #4b5563;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.cell {
  padding: 16rpx 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #f0f2f5;
}

.cell-text {
  color: #374151;
}

.ghost-btn {
  background: #eef2ff;
  color: #1f2937;
  border: 1rpx solid #e0e7ff;
}

.submit-bar {
  position: sticky;
  bottom: 0;
  padding: 16rpx 0 24rpx;
  background: #f5f7fb;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.dialog {
  padding: 20rpx;
  width: 620rpx;
}

.dialog-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.dialog-textarea {
  width: 100%;
  min-height: 260rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 12rpx;
  background: #fff;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12rpx;
  margin-top: 12rpx;
}

.popup-editor {
  padding: 20rpx;
  border-radius: 20rpx 20rpx 0 0;
}
</style>
