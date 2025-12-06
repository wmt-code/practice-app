"use strict";
const common_vendor = require("../../common/vendor.js");
const api_categories = require("../../api/categories.js");
const api_questions = require("../../api/questions.js");
const api_http = require("../../api/http.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const questionTypes = [
      { value: "SINGLE", text: "单选题" },
      { value: "MULTIPLE", text: "多选题" },
      { value: "JUDGE", text: "判断题" },
      { value: "FILL", text: "填空题" }
    ];
    const difficultyOptions = [
      { value: "EASY", text: "简单" },
      { value: "MEDIUM", text: "中等" },
      { value: "HARD", text: "困难" }
    ];
    const instance = common_vendor.getCurrentInstance();
    const mode = common_vendor.ref("single");
    const questionId = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const saving = common_vendor.ref(false);
    common_vendor.ref(false);
    const stemEditorCtx = common_vendor.ref(null);
    const analysisEditorCtx = common_vendor.ref(null);
    const optionEditorCtxs = common_vendor.ref({});
    const currentFocus = common_vendor.ref("");
    const bulkPopup = common_vendor.ref(null);
    const bulkText = common_vendor.ref("");
    const formats = common_vendor.ref({});
    let blurTimer = null;
    const categoryPopup = common_vendor.ref(null);
    const editCategoryPopup = common_vendor.ref(null);
    const categories = common_vendor.ref([]);
    const form = common_vendor.ref({
      type: "SINGLE",
      // SINGLE, MULTIPLE, JUDGE, FILL
      stemHtml: "",
      options: createDefaultOptions(4),
      answers: [],
      blanks: [{ id: Date.now(), text: "" }],
      analysis: "",
      categoryId: "",
      categoryName: "",
      difficulty: ""
      // 截图里默认可能为空
    });
    const typeLabel = common_vendor.computed(() => {
      const t = questionTypes.find((i) => i.value === form.value.type);
      return t ? t.text : "请选择";
    });
    const isChoice = common_vendor.computed(() => ["SINGLE", "MULTIPLE", "JUDGE"].includes(form.value.type));
    const isSingle = common_vendor.computed(() => ["SINGLE", "JUDGE"].includes(form.value.type));
    const canRemoveOption = common_vendor.computed(() => form.value.options.length > 2 && form.value.type !== "JUDGE");
    const optionsDisabled = common_vendor.computed(() => form.value.options.length >= 8 || form.value.type === "JUDGE");
    const submitText = common_vendor.computed(() => questionId.value ? "保存修改" : "添加试题");
    common_vendor.onLoad((query) => {
      mode.value = query.mode || "single";
      if (query.id) {
        const parsed = Number(query.id);
        questionId.value = Number.isNaN(parsed) ? query.id : parsed;
      }
      initPage();
    });
    async function initPage() {
      loading.value = true;
      try {
        await loadCategories();
        if (questionId.value) {
          await loadQuestionDetail(questionId.value);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/import-question/index.vue:375", err);
        common_vendor.index.showToast({ title: err.message || "初始化失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    async function loadCategories() {
      try {
        const tree = await api_categories.fetchCategoryTree();
        const normalizeTree = (nodes = []) => (nodes || []).map((node) => ({
          ...node,
          expanded: node.expanded || false,
          children: normalizeTree(node.children || [])
        }));
        categories.value = Array.isArray(tree) ? normalizeTree(tree) : [];
        if (form.value.categoryId) {
          form.value.categoryName = findCategoryName(categories.value, form.value.categoryId);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/import-question/index.vue:396", "load categories failed", err);
        common_vendor.index.showToast({ title: "加载章节失败", icon: "none" });
      }
    }
    function createDefaultOptions(count = 4) {
      return Array.from({ length: count }).map((_, idx) => ({
        label: String.fromCharCode(65 + idx),
        text: "",
        images: []
      }));
    }
    function openTypeSelect() {
      common_vendor.index.showActionSheet({
        itemList: questionTypes.map((t) => t.text),
        success: (res) => {
          handleTypeChange(questionTypes[res.tapIndex].value);
        }
      });
    }
    function handleTypeChange(val) {
      form.value.type = val;
      form.value.answers = [];
      if (val === "JUDGE") {
        form.value.options = [
          { label: "A", text: "正确", images: [] },
          { label: "B", text: "错误", images: [] }
        ];
      } else if (val === "FILL") {
        if (!form.value.blanks || form.value.blanks.length === 0) {
          form.value.blanks = [{ id: Date.now(), text: "" }];
        }
      } else {
        const isJudgeData = form.value.options.length === 2 && form.value.options[0].text === "正确" && form.value.options[1].text === "错误";
        if (isJudgeData || form.value.options.length === 0) {
          form.value.options = createDefaultOptions(4);
        }
      }
    }
    async function loadQuestionDetail(id) {
      try {
        const detail = await api_questions.fetchQuestionRaw(id);
        if (!detail) {
          common_vendor.index.showToast({ title: "题目不存在", icon: "none" });
          return;
        }
        const type = normalizeBackendType(detail.type);
        const answers = splitAnswerList(detail.answer);
        form.value.type = type;
        form.value.stemHtml = detail.title || "";
        form.value.analysis = detail.explanation || "";
        form.value.difficulty = detail.difficulty || "";
        form.value.categoryId = detail.categoryId || "";
        form.value.categoryName = findCategoryName(categories.value, detail.categoryId);
        if (type === "FILL") {
          form.value.blanks = answers.length ? answers.map((text, idx) => ({ id: Date.now() + idx, text })) : [{ id: Date.now(), text: "" }];
          form.value.answers = [];
        } else {
          const parsedOptions = parseOptionList(detail.optionsJson || detail.options, answers);
          if (parsedOptions.length) {
            form.value.options = parsedOptions;
          } else if (type === "JUDGE") {
            form.value.options = [
              { label: "A", text: "正确" },
              { label: "B", text: "错误" }
            ];
          } else {
            form.value.options = createDefaultOptions(4);
          }
          form.value.answers = answers;
        }
        restoreEditorContents();
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/import-question/index.vue:487", "load question failed", err);
        common_vendor.index.showToast({ title: err.message || "加载题目失败", icon: "none" });
      }
    }
    function onStemReady(e) {
      common_vendor.index.createSelectorQuery().in(instance).select("#stemEditor").context((res) => {
        stemEditorCtx.value = res.context;
        if (form.value.stemHtml) {
          res.context.setContents({ html: form.value.stemHtml });
        }
      }).exec();
    }
    function handleStemInput(e) {
      form.value.stemHtml = e.detail.html;
    }
    function onStatusChange(e) {
      formats.value = e.detail;
    }
    function handleToolbar(name, value) {
      let ctx = null;
      if (currentFocus.value === "stem")
        ctx = stemEditorCtx.value;
      else if (currentFocus.value === "analysis")
        ctx = analysisEditorCtx.value;
      else if (currentFocus.value.startsWith("option-")) {
        const idx = currentFocus.value.split("-")[1];
        ctx = optionEditorCtxs.value[idx];
      }
      if (ctx)
        ctx.format(name, value);
    }
    function insertImage() {
      let ctx = null;
      if (currentFocus.value === "stem")
        ctx = stemEditorCtx.value;
      else if (currentFocus.value === "analysis")
        ctx = analysisEditorCtx.value;
      else if (currentFocus.value.startsWith("option-")) {
        const idx = currentFocus.value.split("-")[1];
        ctx = optionEditorCtxs.value[idx];
      }
      if (!ctx)
        return;
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          const localPath = res.tempFilePaths[0];
          try {
            common_vendor.index.showLoading({ title: "上传中..." });
            const url = await api_questions.uploadQuestionImage(localPath);
            common_vendor.index.hideLoading();
            const fullUrl = url.startsWith("http") ? url : `${api_http.API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
            ctx.insertImage({ src: fullUrl, width: "80%", alt: "image" });
            if (currentFocus.value.startsWith("option-")) {
              const idx = currentFocus.value.split("-")[1];
              if (form.value.options[idx]) {
                form.value.options[idx].images = Array.from(/* @__PURE__ */ new Set([...form.value.options[idx].images || [], fullUrl]));
              }
            }
          } catch (e) {
            common_vendor.index.hideLoading();
            common_vendor.index.__f__("error", "at pages/import-question/index.vue:559", "上传失败，尝试使用Base64/本地路径", e);
            if (common_vendor.index.getFileSystemManager) {
              common_vendor.index.getFileSystemManager().readFile({
                filePath: localPath,
                encoding: "base64",
                success: (fileRes) => {
                  let format = "jpeg";
                  const lower = localPath.toLowerCase();
                  if (lower.endsWith(".png"))
                    format = "png";
                  else if (lower.endsWith(".gif"))
                    format = "gif";
                  const base64 = `data:image/${format};base64,${fileRes.data}`;
                  ctx.insertImage({ src: base64, width: "80%", alt: "image" });
                },
                fail: () => {
                  ctx.insertImage({ src: localPath, width: "80%", alt: "image" });
                }
              });
            } else {
              if (res.tempFiles && res.tempFiles[0] && typeof FileReader !== "undefined") {
                const reader = new FileReader();
                reader.onload = (evt) => {
                  ctx.insertImage({ src: evt.target.result, width: "80%", alt: "image" });
                };
                reader.readAsDataURL(res.tempFiles[0]);
              } else {
                ctx.insertImage({ src: localPath, width: "80%", alt: "image" });
              }
            }
          }
        }
      });
    }
    function onOptionReady(index) {
      common_vendor.index.createSelectorQuery().in(instance).select("#optionEditor" + index).context((res) => {
        optionEditorCtxs.value[index] = res.context;
        const opt = form.value.options[index];
        if (opt.text || opt.images && opt.images.length) {
          const opt2 = form.value.options[index];
          const html = buildOptionHtml(opt2);
          res.context.setContents({ html });
        }
      }).exec();
    }
    function handleOptionInput(e, index) {
      form.value.options[index].text = e.detail.html;
      form.value.options[index].images = extractImageUrls(e.detail.html || "");
    }
    function onAnalysisReady() {
      common_vendor.index.createSelectorQuery().in(instance).select("#analysisEditor").context((res) => {
        analysisEditorCtx.value = res.context;
        if (form.value.analysis) {
          res.context.setContents({ html: form.value.analysis });
        }
      }).exec();
    }
    function handleAnalysisInput(e) {
      form.value.analysis = e.detail.html;
    }
    function onEditorFocus(key) {
      if (blurTimer) {
        clearTimeout(blurTimer);
        blurTimer = null;
      }
      currentFocus.value = key;
    }
    function onEditorBlur() {
      blurTimer = setTimeout(() => {
        currentFocus.value = "";
        blurTimer = null;
      }, 200);
    }
    function addOption() {
      if (optionsDisabled.value)
        return;
      const nextLabel = String.fromCharCode(65 + form.value.options.length);
      form.value.options.push({ label: nextLabel, text: "", images: [] });
    }
    function removeOption(index) {
      if (!canRemoveOption.value)
        return;
      const removed = form.value.options.splice(index, 1)[0];
      form.value.answers = form.value.answers.filter((a) => a !== removed.label);
      form.value.options.forEach((item, idx) => {
        item.label = String.fromCharCode(65 + idx);
      });
    }
    function toggleAnswer(label) {
      if (isSingle.value) {
        form.value.answers = [label];
      } else {
        const idx = form.value.answers.indexOf(label);
        if (idx > -1) {
          form.value.answers.splice(idx, 1);
        } else {
          form.value.answers.push(label);
        }
      }
    }
    function openBulkPopup() {
      bulkText.value = "";
      bulkPopup.value.open();
    }
    function applyBulkOptions() {
      const lines = bulkText.value.split("\n").filter((s) => s.trim());
      let currentIdx = 0;
      while (currentIdx < form.value.options.length && lines.length > 0) {
        if (!form.value.options[currentIdx].text) {
          form.value.options[currentIdx].text = lines.shift();
          form.value.options[currentIdx].images = [];
        }
        currentIdx++;
      }
      while (lines.length > 0 && !optionsDisabled.value) {
        const nextLabel = String.fromCharCode(65 + form.value.options.length);
        form.value.options.push({ label: nextLabel, text: lines.shift(), images: [] });
      }
      bulkPopup.value.close();
    }
    function addBlank() {
      form.value.blanks.push({ id: Date.now(), text: "" });
    }
    function removeBlank(index) {
      form.value.blanks.splice(index, 1);
    }
    function chooseCategory() {
      if (!categories.value.length) {
        loadCategories();
      }
      categoryPopup.value.open();
    }
    function openEditCategory() {
      editCategoryPopup.value.open();
    }
    function selectCategory(item) {
      form.value.categoryId = item.id;
      form.value.categoryName = item.name;
      categoryPopup.value.close();
    }
    function addCategory() {
      common_vendor.index.showModal({
        title: "添加章节",
        editable: true,
        placeholderText: "请输入章节名称",
        success: async (res) => {
          if (res.confirm && res.content) {
            try {
              await api_categories.createCategory({ name: res.content, status: 1 });
              await loadCategories();
              common_vendor.index.showToast({ title: "创建成功", icon: "success" });
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/import-question/index.vue:739", err);
              common_vendor.index.showToast({ title: err.message || "创建失败", icon: "none" });
            }
          }
        }
      });
    }
    function addSubCategory(parentIndex) {
      common_vendor.index.showModal({
        title: "添加子章节",
        editable: true,
        placeholderText: "请输入子章节名称",
        success: async (res) => {
          if (res.confirm && res.content) {
            const parent = categories.value[parentIndex];
            try {
              await api_categories.createCategory({ name: res.content, status: 1, parentId: parent.id });
              await loadCategories();
              categories.value[parentIndex].expanded = true;
              common_vendor.index.showToast({ title: "创建成功", icon: "success" });
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/import-question/index.vue:760", err);
              common_vendor.index.showToast({ title: err.message || "创建失败", icon: "none" });
            }
          }
        }
      });
    }
    function editCategory(item) {
      common_vendor.index.showModal({
        title: "修改名称",
        editable: true,
        content: item.name,
        placeholderText: "请输入名称",
        success: async (res) => {
          if (res.confirm && res.content) {
            try {
              await api_categories.updateCategory(item.id, { name: res.content, status: 1, parentId: item.parentId });
              await loadCategories();
              common_vendor.index.showToast({ title: "更新成功", icon: "success" });
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/import-question/index.vue:780", err);
              common_vendor.index.showToast({ title: err.message || "更新失败", icon: "none" });
            }
          }
        }
      });
    }
    function removeCategory(index) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该章节吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_categories.deleteCategory(categories.value[index].id);
              await loadCategories();
              common_vendor.index.showToast({ title: "删除成功", icon: "success" });
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/import-question/index.vue:798", err);
              common_vendor.index.showToast({ title: err.message || "删除失败", icon: "none" });
            }
          }
        }
      });
    }
    function removeSubCategory(parentIndex, subIndex) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该子章节吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_categories.deleteCategory(categories.value[parentIndex].children[subIndex].id);
              await loadCategories();
              common_vendor.index.showToast({ title: "删除成功", icon: "success" });
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/import-question/index.vue:816", err);
              common_vendor.index.showToast({ title: err.message || "删除失败", icon: "none" });
            }
          }
        }
      });
    }
    function moveCategory(index, direction) {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < categories.value.length) {
        const temp = categories.value[index];
        categories.value[index] = categories.value[newIndex];
        categories.value[newIndex] = temp;
      }
    }
    function moveSubCategory(parentIndex, subIndex, direction) {
      const children = categories.value[parentIndex].children;
      const newIndex = subIndex + direction;
      if (newIndex >= 0 && newIndex < children.length) {
        const temp = children[subIndex];
        children[subIndex] = children[newIndex];
        children[newIndex] = temp;
      }
    }
    function toggleExpand(cat) {
      cat.expanded = !cat.expanded;
    }
    function openDifficulty() {
      common_vendor.index.showActionSheet({
        itemList: difficultyOptions.map((d) => d.text),
        success: (res) => {
          form.value.difficulty = difficultyOptions[res.tapIndex].value;
        }
      });
    }
    function renderDifficulty(val) {
      const t = difficultyOptions.find((d) => d.value === val);
      return t ? t.text : "";
    }
    function normalizeBackendType(val) {
      const upper = String(val || "").toUpperCase();
      if (upper.includes("MULT"))
        return "MULTIPLE";
      if (upper.includes("TRUE") || upper.includes("JUDGE"))
        return "JUDGE";
      if (upper.includes("FILL") || upper.includes("SHORT"))
        return "FILL";
      return "SINGLE";
    }
    function splitAnswerList(val) {
      if (!val)
        return [];
      if (Array.isArray(val))
        return val.map((i) => String(i).toUpperCase());
      return String(val).split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean).map((s) => s.toUpperCase());
    }
    function extractImageUrls(html = "") {
      const urls = [];
      const regex = /<img[^>]+src=["']?([^"'>\s]+)["']?[^>]*>/gi;
      let match = regex.exec(html);
      while (match) {
        if (match[1])
          urls.push(match[1]);
        match = regex.exec(html);
      }
      return Array.from(new Set(urls));
    }
    function buildOptionHtml(opt) {
      const text = (opt == null ? void 0 : opt.text) || "";
      const imgs = Array.isArray(opt == null ? void 0 : opt.images) ? opt.images : [];
      const imgHtml = imgs.map((src) => `<p><img src="${src}" style="max-width:100%;"/></p>`).join("");
      return text + imgHtml;
    }
    function parseOptionList(rawOptions, answers = []) {
      let list = [];
      if (typeof rawOptions === "string") {
        try {
          list = JSON.parse(rawOptions);
        } catch (err) {
          list = [];
        }
      } else if (Array.isArray(rawOptions)) {
        list = rawOptions;
      }
      if (!Array.isArray(list))
        return [];
      return list.map((opt, idx) => {
        const value = (opt.value || opt.label || String.fromCharCode(65 + idx)).toString().toUpperCase();
        return {
          label: value,
          text: opt.label || opt.text || "",
          images: Array.isArray(opt.images) ? opt.images : [],
          correct: answers.includes(value)
        };
      });
    }
    function restoreEditorContents() {
      common_vendor.nextTick$1(() => {
        if (stemEditorCtx.value && stemEditorCtx.value.setContents) {
          stemEditorCtx.value.setContents({ html: form.value.stemHtml || "<p></p>" });
        }
        if (analysisEditorCtx.value && analysisEditorCtx.value.setContents) {
          analysisEditorCtx.value.setContents({ html: form.value.analysis || "<p></p>" });
        }
        form.value.options.forEach((opt, idx) => {
          const ctx = optionEditorCtxs.value[idx];
          if (ctx && ctx.setContents) {
            ctx.setContents({ html: opt.text || "<p></p>" });
          }
        });
      });
    }
    function findCategoryName(list = [], id) {
      if (id === void 0 || id === null || id === "")
        return "";
      for (const item of list || []) {
        if (`${item.id}` === `${id}`)
          return item.name;
        const childName = findCategoryName(item.children, id);
        if (childName)
          return childName;
      }
      return "";
    }
    function stripHtml(html = "") {
      return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
    }
    function buildPayload() {
      const stemRaw = form.value.stemHtml || "";
      const stemText = stripHtml(stemRaw);
      if (!stemText && !stemRaw.trim()) {
        common_vendor.index.showToast({ title: "请输入题干", icon: "none" });
        return null;
      }
      const categoryId = Number(form.value.categoryId);
      if (!categoryId) {
        common_vendor.index.showToast({ title: "请选择章节", icon: "none" });
        return null;
      }
      if (!form.value.difficulty) {
        common_vendor.index.showToast({ title: "请选择难度", icon: "none" });
        return null;
      }
      let answerList = [];
      let optionPayload = [];
      if (form.value.type === "FILL") {
        answerList = form.value.blanks.map((b) => stripHtml(b.text || "")).filter(Boolean);
        if (!answerList.length) {
          common_vendor.index.showToast({ title: "请填写填空答案", icon: "none" });
          return null;
        }
      } else if (isChoice.value) {
        if (!form.value.options.length) {
          common_vendor.index.showToast({ title: "请添加选项", icon: "none" });
          return null;
        }
        let hasEmptyOption = false;
        const cleanedOptions = form.value.options.map((opt, idx) => {
          const value = opt.label || String.fromCharCode(65 + idx);
          const rawText = opt.text || "";
          const cleanText = stripHtml(rawText);
          const labelText = cleanText || (Array.isArray(opt.images) && opt.images.length ? "[图片选项]" : rawText) || value;
          if (!cleanText && !rawText.trim() && (!opt.images || opt.images.length === 0)) {
            hasEmptyOption = true;
          }
          return {
            value,
            label: labelText,
            correct: form.value.answers.includes(value),
            images: Array.isArray(opt.images) ? opt.images : []
          };
        });
        if (hasEmptyOption) {
          common_vendor.index.showToast({ title: "请完善所有选项内容", icon: "none" });
          return null;
        }
        if (cleanedOptions.some((opt) => !opt.label)) {
          common_vendor.index.showToast({ title: "请输入完整选项内容", icon: "none" });
          return null;
        }
        if (form.value.answers.length === 0) {
          common_vendor.index.showToast({ title: "请勾选正确答案", icon: "none" });
          return null;
        }
        optionPayload = cleanedOptions;
        answerList = [...form.value.answers];
      }
      const normalizedAnswersRaw = answerList.map((item) => (item || "").toString().trim()).filter(Boolean).map((val) => form.value.type === "FILL" ? val : val.toUpperCase());
      const normalizedAnswers = form.value.type === "FILL" ? normalizedAnswersRaw : normalizedAnswersRaw.sort();
      const payload = {
        title: form.value.stemHtml,
        type: form.value.type,
        answer: normalizedAnswers.join(","),
        explanation: form.value.analysis || "",
        categoryId,
        difficulty: form.value.difficulty
      };
      if (optionPayload.length) {
        payload.options = JSON.stringify(optionPayload);
      }
      return payload;
    }
    function resetForm() {
      questionId.value = null;
      form.value.stemHtml = "";
      form.value.analysis = "";
      form.value.answers = [];
      form.value.blanks = [{ id: Date.now(), text: "" }];
      if (form.value.type === "JUDGE") {
        form.value.options = [
          { label: "A", text: "正确", images: [] },
          { label: "B", text: "错误", images: [] }
        ];
      } else {
        form.value.options = createDefaultOptions(4);
      }
      restoreEditorContents();
    }
    async function submit() {
      const payload = buildPayload();
      if (!payload || saving.value)
        return;
      saving.value = true;
      try {
        if (questionId.value) {
          await api_questions.updateQuestion(questionId.value, payload);
          common_vendor.index.showToast({ title: "更新成功", icon: "success" });
        } else {
          await api_questions.createQuestion(payload);
          common_vendor.index.showToast({ title: "添加成功", icon: "success" });
          resetForm();
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/import-question/index.vue:1063", err);
        common_vendor.index.showToast({ title: err.message || "提交失败", icon: "none" });
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(typeLabel.value),
        b: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        c: common_vendor.o(openTypeSelect),
        d: currentFocus.value === "stem"
      }, currentFocus.value === "stem" ? {
        e: formats.value.bold ? 1 : "",
        f: common_vendor.o(($event) => handleToolbar("bold")),
        g: formats.value.italic ? 1 : "",
        h: common_vendor.o(($event) => handleToolbar("italic")),
        i: formats.value.underline ? 1 : "",
        j: common_vendor.o(($event) => handleToolbar("underline")),
        k: formats.value.script === "sub" ? 1 : "",
        l: common_vendor.o(($event) => handleToolbar("script", "sub")),
        m: formats.value.script === "sup" ? 1 : "",
        n: common_vendor.o(($event) => handleToolbar("script", "sup")),
        o: common_vendor.o(insertImage),
        p: common_vendor.p({
          type: "image",
          size: "20"
        })
      } : {}, {
        q: common_vendor.o(onStemReady),
        r: common_vendor.o(onStatusChange),
        s: common_vendor.o(($event) => onEditorFocus("stem")),
        t: common_vendor.o(onEditorBlur),
        v: common_vendor.o(handleStemInput),
        w: isChoice.value
      }, isChoice.value ? common_vendor.e({
        x: common_vendor.f(form.value.options, (item, index, i0) => {
          return common_vendor.e(canRemoveOption.value && form.value.type !== "JUDGE" ? {
            a: "3e7c1569-2-" + i0,
            b: common_vendor.p({
              type: "minus-filled",
              color: "#dd524d",
              size: "24"
            }),
            c: common_vendor.o(($event) => removeOption(index), item.label)
          } : form.value.type !== "JUDGE" ? {
            d: "3e7c1569-3-" + i0,
            e: common_vendor.p({
              type: "minus-filled",
              size: "24"
            })
          } : {}, form.value.type !== "JUDGE" ? {
            f: common_vendor.t(item.label)
          } : {}, form.value.type !== "JUDGE" ? common_vendor.e({
            g: currentFocus.value === "option-" + index
          }, currentFocus.value === "option-" + index ? {
            h: formats.value.bold ? 1 : "",
            i: common_vendor.o(($event) => handleToolbar("bold"), item.label),
            j: formats.value.italic ? 1 : "",
            k: common_vendor.o(($event) => handleToolbar("italic"), item.label),
            l: formats.value.underline ? 1 : "",
            m: common_vendor.o(($event) => handleToolbar("underline"), item.label),
            n: formats.value.script === "sub" ? 1 : "",
            o: common_vendor.o(($event) => handleToolbar("script", "sub"), item.label),
            p: formats.value.script === "sup" ? 1 : "",
            q: common_vendor.o(($event) => handleToolbar("script", "sup"), item.label),
            r: common_vendor.o(insertImage, item.label),
            s: "3e7c1569-4-" + i0,
            t: common_vendor.p({
              type: "image",
              size: "20"
            })
          } : {}, {
            v: "optionEditor" + index,
            w: common_vendor.o(($event) => onOptionReady(index), item.label),
            x: common_vendor.o(onStatusChange, item.label),
            y: common_vendor.o(($event) => onEditorFocus("option-" + index), item.label),
            z: common_vendor.o(onEditorBlur, item.label),
            A: common_vendor.o((e) => handleOptionInput(e, index), item.label)
          }) : {
            B: common_vendor.t(item.text)
          }, {
            C: form.value.answers.includes(item.label)
          }, form.value.answers.includes(item.label) ? {} : {}, {
            D: form.value.answers.includes(item.label) ? 1 : "",
            E: common_vendor.o(($event) => toggleAnswer(item.label), item.label),
            F: item.label
          });
        }),
        y: canRemoveOption.value && form.value.type !== "JUDGE",
        z: form.value.type !== "JUDGE",
        A: form.value.type !== "JUDGE",
        B: form.value.type !== "JUDGE",
        C: form.value.type !== "JUDGE"
      }, form.value.type !== "JUDGE" ? {
        D: common_vendor.p({
          type: "plus-filled",
          color: "#007aff",
          size: "22"
        }),
        E: common_vendor.o(addOption),
        F: optionsDisabled.value ? 1 : "",
        G: common_vendor.o(openBulkPopup)
      } : {}) : form.value.type === "FILL" ? {
        I: common_vendor.p({
          type: "plus-filled",
          color: "#007aff",
          size: "20"
        }),
        J: common_vendor.o(addBlank),
        K: common_vendor.f(form.value.blanks, (blank, index, i0) => {
          return common_vendor.e(form.value.blanks.length > 1 ? {
            a: "3e7c1569-7-" + i0,
            b: common_vendor.p({
              type: "minus-filled",
              color: "#dd524d",
              size: "24"
            }),
            c: common_vendor.o(($event) => removeBlank(index), blank.id)
          } : {}, {
            d: common_vendor.t(index + 1),
            e: blank.text,
            f: common_vendor.o(($event) => blank.text = $event.detail.value, blank.id),
            g: blank.id
          });
        }),
        L: form.value.blanks.length > 1
      } : {}, {
        H: form.value.type === "FILL",
        M: currentFocus.value === "analysis"
      }, currentFocus.value === "analysis" ? {
        N: formats.value.bold ? 1 : "",
        O: common_vendor.o(($event) => handleToolbar("bold")),
        P: formats.value.italic ? 1 : "",
        Q: common_vendor.o(($event) => handleToolbar("italic")),
        R: formats.value.underline ? 1 : "",
        S: common_vendor.o(($event) => handleToolbar("underline")),
        T: formats.value.script === "sub" ? 1 : "",
        U: common_vendor.o(($event) => handleToolbar("script", "sub")),
        V: formats.value.script === "sup" ? 1 : "",
        W: common_vendor.o(($event) => handleToolbar("script", "sup")),
        X: common_vendor.o(insertImage),
        Y: common_vendor.p({
          type: "image",
          size: "20"
        })
      } : {}, {
        Z: common_vendor.o(onAnalysisReady),
        aa: common_vendor.o(onStatusChange),
        ab: common_vendor.o(($event) => onEditorFocus("analysis")),
        ac: common_vendor.o(onEditorBlur),
        ad: common_vendor.o(handleAnalysisInput),
        ae: form.value.categoryName
      }, form.value.categoryName ? {
        af: common_vendor.t(form.value.categoryName)
      } : {}, {
        ag: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        ah: common_vendor.o(chooseCategory),
        ai: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        aj: common_vendor.o(openEditCategory),
        ak: form.value.difficulty
      }, form.value.difficulty ? {
        al: common_vendor.t(renderDifficulty(form.value.difficulty)),
        am: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        })
      } : {
        an: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        })
      }, {
        ao: common_vendor.o(openDifficulty),
        ap: common_vendor.t(submitText.value),
        aq: saving.value,
        ar: saving.value || loading.value,
        as: common_vendor.o(submit),
        at: bulkText.value,
        av: common_vendor.o(($event) => bulkText.value = $event.detail.value),
        aw: common_vendor.o(applyBulkOptions),
        ax: common_vendor.o(($event) => bulkPopup.value.close()),
        ay: common_vendor.p({
          mode: "input",
          title: "批量添加选项",
          placeholder: "一行一个选项，自动填充",
          ["before-close"]: true
        }),
        az: common_vendor.sr(bulkPopup, "3e7c1569-13", {
          "k": "bulkPopup"
        }),
        aA: common_vendor.p({
          type: "dialog"
        }),
        aB: common_vendor.o(($event) => categoryPopup.value.close()),
        aC: common_vendor.o(($event) => categoryPopup.value.close()),
        aD: common_vendor.f(categories.value, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat.name),
            b: common_vendor.o(($event) => selectCategory(cat), cat.id),
            c: common_vendor.f(cat.children || [], (sub, k1, i1) => {
              return {
                a: common_vendor.t(sub.name),
                b: sub.id,
                c: common_vendor.o(($event) => selectCategory(sub), sub.id)
              };
            }),
            d: cat.id
          };
        }),
        aE: common_vendor.sr(categoryPopup, "3e7c1569-15", {
          "k": "categoryPopup"
        }),
        aF: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        aG: common_vendor.o(($event) => editCategoryPopup.value.close()),
        aH: common_vendor.o(($event) => editCategoryPopup.value.close()),
        aI: common_vendor.f(categories.value, (cat, index, i0) => {
          return common_vendor.e({
            a: common_vendor.o(($event) => removeCategory(index), cat.id),
            b: "3e7c1569-17-" + i0 + ",3e7c1569-16",
            c: common_vendor.o(($event) => toggleExpand(cat), cat.id),
            d: "3e7c1569-18-" + i0 + ",3e7c1569-16",
            e: common_vendor.p({
              type: cat.expanded ? "bottom" : "right",
              size: "16",
              color: "#007aff"
            }),
            f: common_vendor.t(cat.name),
            g: "3e7c1569-19-" + i0 + ",3e7c1569-16",
            h: common_vendor.o(($event) => addSubCategory(index), cat.id),
            i: "3e7c1569-20-" + i0 + ",3e7c1569-16",
            j: common_vendor.o(($event) => editCategory(cat), cat.id),
            k: index > 0
          }, index > 0 ? {
            l: common_vendor.o(($event) => moveCategory(index, -1), cat.id),
            m: "3e7c1569-21-" + i0 + ",3e7c1569-16",
            n: common_vendor.p({
              type: "arrowup",
              size: "20",
              color: "#007aff"
            })
          } : {}, {
            o: index < categories.value.length - 1
          }, index < categories.value.length - 1 ? {
            p: common_vendor.o(($event) => moveCategory(index, 1), cat.id),
            q: "3e7c1569-22-" + i0 + ",3e7c1569-16",
            r: common_vendor.p({
              type: "arrowdown",
              size: "20",
              color: "#007aff"
            })
          } : {}, {
            s: cat.expanded
          }, cat.expanded ? {
            t: common_vendor.f(cat.children || [], (sub, subIndex, i1) => {
              return common_vendor.e({
                a: common_vendor.o(($event) => removeSubCategory(index, subIndex), sub.id),
                b: "3e7c1569-23-" + i0 + "-" + i1 + ",3e7c1569-16",
                c: common_vendor.t(sub.name),
                d: "3e7c1569-24-" + i0 + "-" + i1 + ",3e7c1569-16",
                e: common_vendor.o(($event) => editCategory(sub), sub.id),
                f: subIndex > 0
              }, subIndex > 0 ? {
                g: common_vendor.o(($event) => moveSubCategory(index, subIndex, -1), sub.id),
                h: "3e7c1569-25-" + i0 + "-" + i1 + ",3e7c1569-16",
                i: common_vendor.p({
                  type: "arrowup",
                  size: "20",
                  color: "#007aff"
                })
              } : {}, {
                j: subIndex < cat.children.length - 1
              }, subIndex < cat.children.length - 1 ? {
                k: common_vendor.o(($event) => moveSubCategory(index, subIndex, 1), sub.id),
                l: "3e7c1569-26-" + i0 + "-" + i1 + ",3e7c1569-16",
                m: common_vendor.p({
                  type: "arrowdown",
                  size: "20",
                  color: "#007aff"
                })
              } : {}, {
                n: sub.id
              });
            }),
            v: common_vendor.p({
              type: "minus-filled",
              color: "#dd524d",
              size: "24"
            }),
            w: common_vendor.p({
              type: "compose",
              size: "20",
              color: "#007aff"
            })
          } : {}, {
            x: cat.id
          });
        }),
        aJ: common_vendor.p({
          type: "minus-filled",
          color: "#dd524d",
          size: "24"
        }),
        aK: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#007aff"
        }),
        aL: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#007aff"
        }),
        aM: common_vendor.o(addCategory),
        aN: common_vendor.sr(editCategoryPopup, "3e7c1569-16", {
          "k": "editCategoryPopup"
        }),
        aO: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3e7c1569"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/import-question/index.js.map
