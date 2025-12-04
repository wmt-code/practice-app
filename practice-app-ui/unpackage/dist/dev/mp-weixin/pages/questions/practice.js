"use strict";
const common_vendor = require("../../common/vendor.js");
const api_questions = require("../../api/questions.js");
const api_answers = require("../../api/answers.js");
const api_categories = require("../../api/categories.js");
const api_favorites = require("../../api/favorites.js");
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_fav2 = common_vendor.resolveComponent("uni-fav");
  (_easycom_uni_tag2 + _easycom_uni_load_more2 + _easycom_uni_icons2 + _easycom_uni_fav2)();
}
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_fav = () => "../../uni_modules/uni-fav/components/uni-fav/uni-fav.js";
if (!Math) {
  (_easycom_uni_tag + _easycom_uni_load_more + _easycom_uni_icons + _easycom_uni_fav)();
}
const _sfc_main = {
  __name: "practice",
  setup(__props) {
    const questions = common_vendor.ref([]);
    const session = common_vendor.reactive({
      total: 0,
      mode: "order",
      category: null,
      parent: null
    });
    const pagination = common_vendor.reactive({
      page: 1,
      size: 10,
      total: 0,
      loading: false
    });
    const params = common_vendor.reactive({
      categoryId: "",
      mode: "order",
      count: 0
    });
    const currentIndex = common_vendor.ref(0);
    const answers = common_vendor.reactive({});
    const feedback = common_vendor.reactive({});
    const submitting = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const favoriteMap = common_vendor.reactive({});
    const stats = common_vendor.reactive({
      correct: 0,
      wrong: 0
    });
    const resultShown = common_vendor.ref(false);
    const currentQuestionId = common_vendor.computed(() => {
      var _a;
      return (_a = questions.value[currentIndex.value]) == null ? void 0 : _a.id;
    });
    const currentQuestion = common_vendor.computed(() => questions.value[currentIndex.value] || {});
    const currentQuestionType = common_vendor.computed(() => {
      var _a;
      return (_a = currentQuestion.value) == null ? void 0 : _a.type;
    });
    const currentFeedback = common_vendor.computed(
      () => currentQuestionId.value ? feedback[currentQuestionId.value] || null : null
    );
    const currentSelected = common_vendor.computed(() => (currentQuestionId.value ? answers[currentQuestionId.value] : []) || []);
    const hasAnswered = common_vendor.computed(() => Boolean(currentFeedback.value));
    const answeredCount = common_vendor.computed(() => Object.keys(feedback).length);
    const isFavorited = common_vendor.computed(() => Boolean(favoriteMap[currentQuestionId.value]));
    const currentExplanation = common_vendor.computed(() => {
      if (!currentFeedback.value)
        return "";
      return currentFeedback.value.explanation || "暂无解析";
    });
    const renderType = (type) => {
      const text = String(type || "");
      const lower = text.toLowerCase();
      if (lower.includes("multiple") || text.includes("多选"))
        return "多选";
      if (lower.includes("true") || lower.includes("judge") || text.includes("判断") || text.includes("是非")) {
        return "判断";
      }
      if (lower.includes("fill") || lower.includes("short") || text.includes("填空") || text.includes("简答")) {
        return "简答";
      }
      return "单选";
    };
    const isMultiple = (type) => {
      const text = String(type || "");
      const lower = text.toLowerCase();
      return lower.includes("multiple") || text.includes("多选");
    };
    const isShortAnswer = (type) => {
      const text = String(type || "");
      const lower = text.toLowerCase();
      return lower.includes("fill") || lower.includes("short") || text.includes("填空") || text.includes("简答");
    };
    const requiresManual = (type) => isMultiple(type) || isShortAnswer(type);
    const isAutoSubmit = (type) => !requiresManual(type);
    const onSingleChange = (e) => {
      if (!currentQuestionId.value)
        return;
      answers[currentQuestionId.value] = [e.detail.value];
      if (isAutoSubmit(currentQuestion.value.type)) {
        maybeAutoSubmit();
      }
    };
    const onMultipleChange = (e) => {
      if (!currentQuestionId.value)
        return;
      answers[currentQuestionId.value] = e.detail.value || [];
    };
    const onTextChange = (e) => {
      if (!currentQuestionId.value)
        return;
      answers[currentQuestionId.value] = [e.detail.value || ""];
    };
    const loadCategoryInfo = async (categoryId) => {
      try {
        const tree = await api_categories.fetchCategoryTree();
        const flat = api_categories.flattenCategoryTree(tree);
        const current = flat.find((c) => `${c.id}` === `${categoryId}`);
        const parent = flat.find((c) => c.id === (current == null ? void 0 : current.parentId));
        session.category = current || null;
        session.parent = parent || null;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/practice.vue:258", err);
      }
    };
    const initFavorites = async () => {
      try {
        const res = await api_favorites.fetchFavorites({ page: 1, size: 200 });
        (res.records || []).forEach((item) => {
          favoriteMap[item.questionId] = true;
        });
      } catch (err) {
        common_vendor.index.__f__("warn", "at pages/questions/practice.vue:269", "fetch favorites failed, skip", err);
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
          const detail = await api_questions.fetchQuestionDetail(q.id);
          if (detail && Array.isArray(detail.options) && detail.options.length) {
            q.options = detail.options;
            q.explanation = q.explanation || detail.explanation;
            q.duration = q.duration || detail.duration;
            q.score = q.score || detail.score;
          }
        } catch (err) {
          common_vendor.index.__f__("warn", "at pages/questions/practice.vue:293", "backfill options failed", q.id, err);
        }
      }
      initAnswers();
    };
    const loadRandom = async () => {
      const limit = params.count > 0 ? params.count : 5;
      const list = await api_questions.fetchPracticeRandom({ categoryId: params.categoryId, limit });
      questions.value = list;
      session.total = list.length;
      pagination.total = list.length;
      pagination.page = 1;
      pagination.size = list.length || limit;
      session.mode = "random";
      initAnswers();
      await backfillOptions(list);
    };
    const loadSequencePage = async (pageToLoad = 1, append = false) => {
      if (pagination.loading)
        return;
      pagination.loading = true;
      try {
        const size = params.count && params.count > 0 ? params.count : pagination.size || 10;
        const res = await api_questions.fetchPracticeSequence({
          categoryId: params.categoryId,
          page: pageToLoad,
          size
        });
        const list = res.records || [];
        const limitedTotal = params.count && params.count > 0 ? Math.min(params.count, res.total || params.count) : res.total || list.length;
        pagination.total = limitedTotal;
        session.total = limitedTotal;
        pagination.size = res.size || size;
        pagination.page = pageToLoad;
        const merged = append ? [...questions.value, ...list] : list;
        questions.value = merged;
        initAnswers();
        await backfillOptions(list);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/practice.vue:336", err);
        common_vendor.index.showToast({ title: "加载题目失败", icon: "none" });
      } finally {
        pagination.loading = false;
      }
    };
    const loadSession = async (options) => {
      var _a;
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
        params.categoryId = (options == null ? void 0 : options.categoryId) ? Number(options.categoryId) || options.categoryId : "";
        if (!params.categoryId) {
          common_vendor.index.showToast({ title: "缺少分类参数", icon: "none" });
          return;
        }
        params.count = (options == null ? void 0 : options.count) ? Number(options.count) : 0;
        params.mode = (options == null ? void 0 : options.mode) === "random" ? "random" : "order";
        const favoritesPromise = initFavorites();
        const categoryPromise = loadCategoryInfo(params.categoryId);
        const questionPromise = params.mode === "random" ? loadRandom() : loadSequencePage(1, false);
        await Promise.all([categoryPromise, questionPromise]);
        (_a = favoritesPromise == null ? void 0 : favoritesPromise.catch) == null ? void 0 : _a.call(favoritesPromise, (err) => common_vendor.index.__f__("warn", "at pages/questions/practice.vue:368", "favorites init failed", err));
        currentIndex.value = 0;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/practice.vue:371", err);
        common_vendor.index.showToast({ title: err.message || "加载失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    const maybeLoadMore = async () => {
      if (session.mode !== "order")
        return;
      if (questions.value.length >= session.total)
        return;
      if (pagination.loading)
        return;
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
      if (resultShown.value)
        return;
      if (answeredCount.value >= session.total && session.total > 0) {
        openResultSummary();
      }
    };
    const submitAnswer = async () => {
      const question = questions.value[currentIndex.value];
      if (!question)
        return;
      const chosen = (answers[question.id] || []).map((v) => typeof v === "string" ? v.trim() : v);
      if (!chosen.length || !chosen.some((v) => v)) {
        common_vendor.index.showToast({ title: "请选择答案", icon: "none" });
        return;
      }
      if (feedback[question.id])
        return;
      submitting.value = true;
      try {
        const res = await api_answers.submitAnswer({
          questionId: question.id,
          chosen,
          timeSpent: question.duration || 20
        });
        feedback[question.id] = res;
        updateStats(res.isCorrect);
        if (res.isCorrect) {
          common_vendor.index.showToast({ title: "正确，自动跳转", icon: "success" });
          setTimeout(() => goNext(true), 500);
        } else {
          common_vendor.index.showToast({ title: "查看解析，左滑下一题", icon: "none" });
        }
        maybeShowResult();
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/practice.vue:426", err);
        common_vendor.index.showToast({ title: "提交失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    };
    const maybeAutoSubmit = () => {
      if (submitting.value || hasAnswered.value)
        return;
      submitAnswer();
    };
    const goNext = (auto = false) => {
      var _a, _b;
      if (currentIndex.value >= session.total - 1) {
        common_vendor.index.showToast({ title: "练习完成", icon: "success" });
        maybeShowResult();
        return;
      }
      currentIndex.value += 1;
      if (currentIndex.value >= questions.value.length - 2) {
        maybeLoadMore();
      }
      const nextId = (_a = questions.value[currentIndex.value]) == null ? void 0 : _a.id;
      if (auto && nextId && ((_b = feedback[nextId]) == null ? void 0 : _b.isCorrect)) {
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
      if (!qid)
        return;
      try {
        if (favoriteMap[qid]) {
          await api_favorites.removeFavorite(qid);
          favoriteMap[qid] = false;
          common_vendor.index.showToast({ title: "已取消收藏", icon: "none" });
        } else {
          await api_favorites.addFavorite(qid);
          favoriteMap[qid] = true;
          common_vendor.index.showToast({ title: "已收藏", icon: "success" });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/practice.vue:475", err);
        common_vendor.index.showToast({ title: err.message || "操作失败", icon: "none" });
      }
    };
    const openResultSummary = () => {
      resultShown.value = true;
      const unanswered = Math.max(session.total - answeredCount.value, 0);
      const correctRate = session.total > 0 ? Math.round(stats.correct / session.total * 1e3) / 10 : 0;
      common_vendor.index.showModal({
        title: "练习结果",
        content: `共 ${session.total} 题
已答：${answeredCount.value}
正确：${stats.correct}
错误：${stats.wrong}
未答：${unanswered}
正确率：${correctRate}%`,
        showCancel: false
      });
    };
    common_vendor.watch(currentQuestionId, (id) => {
      if (id && !answers[id]) {
        answers[id] = [];
      }
    });
    common_vendor.onLoad((options) => {
      loadSession(options);
    });
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: common_vendor.t(((_a = session.parent) == null ? void 0 : _a.name) || "题库"),
        b: common_vendor.t(((_b = session.category) == null ? void 0 : _b.name) || "练习"),
        c: common_vendor.p({
          text: session.mode === "random" ? "随机练习" : "顺序练习",
          type: session.mode === "random" ? "warning" : "primary",
          size: "mini"
        }),
        d: common_vendor.t(currentIndex.value + 1),
        e: common_vendor.t(session.total),
        f: loading.value
      }, loading.value ? {
        g: common_vendor.p({
          status: "loading"
        })
      } : !session.total ? {} : {
        i: common_vendor.f(questions.value, (item, idx, i0) => {
          var _a2;
          return common_vendor.e({
            a: common_vendor.t(renderType(item.type)),
            b: common_vendor.t(idx + 1),
            c: common_vendor.t(item.title),
            d: isMultiple(item.type)
          }, isMultiple(item.type) ? {
            e: common_vendor.f(item.options, (opt, k1, i1) => {
              return {
                a: opt.value,
                b: currentSelected.value.includes(opt.value),
                c: common_vendor.t(opt.value),
                d: common_vendor.t(opt.text),
                e: opt.value
              };
            }),
            f: common_vendor.o(onMultipleChange, item.id)
          } : isShortAnswer(item.type) ? {
            h: currentSelected.value[0] || "",
            i: common_vendor.o(onTextChange, item.id)
          } : {
            j: common_vendor.f(item.options, (opt, k1, i1) => {
              return {
                a: opt.value,
                b: currentSelected.value.includes(opt.value),
                c: common_vendor.t(opt.value),
                d: common_vendor.t(opt.text),
                e: opt.value
              };
            }),
            k: common_vendor.o(onSingleChange, item.id)
          }, {
            g: isShortAnswer(item.type)
          }, requiresManual(currentQuestionType.value) ? {
            l: common_vendor.t(hasAnswered.value ? "已提交" : "提交答案"),
            m: submitting.value,
            n: !currentSelected.value.length || hasAnswered.value,
            o: common_vendor.o(submitAnswer, item.id)
          } : {
            p: "1e7fffe1-2-" + i0,
            q: common_vendor.p({
              type: "gear",
              size: "18",
              color: "#6b7280"
            })
          }, ((_a2 = currentFeedback.value) == null ? void 0 : _a2.isCorrect) ? {} : {}, currentFeedback.value ? common_vendor.e({
            r: "1e7fffe1-3-" + i0,
            s: common_vendor.p({
              type: currentFeedback.value.isCorrect ? "checkmarkempty" : "closeempty",
              color: currentFeedback.value.isCorrect ? "#10b981" : "#ef4444",
              size: "22"
            }),
            t: common_vendor.t(currentFeedback.value.isCorrect ? "回答正确" : "回答错误"),
            v: common_vendor.t((currentFeedback.value.correctAnswer || []).join(", ") || "--"),
            w: common_vendor.t(currentExplanation.value),
            x: !currentFeedback.value.isCorrect
          }, !currentFeedback.value.isCorrect ? {} : {}, {
            y: common_vendor.n(currentFeedback.value.isCorrect ? "success" : "danger")
          }) : {}, {
            z: item.id
          });
        }),
        j: requiresManual(currentQuestionType.value),
        k: (_c = currentFeedback.value) == null ? void 0 : _c.isCorrect,
        l: currentFeedback.value,
        m: currentIndex.value,
        n: common_vendor.o(onSwipe)
      }, {
        h: !session.total,
        o: session.total
      }, session.total ? {
        p: common_vendor.o(toggleFavorite),
        q: common_vendor.p({
          checked: isFavorited.value,
          bgColor: "#f9fafb",
          bgColorChecked: "#1d4ed8",
          fgColor: "#1f2937",
          fgColorChecked: "#fff",
          contentText: {
            contentDefault: "收藏",
            contentFav: "已收藏"
          }
        }),
        r: common_vendor.t(stats.correct),
        s: common_vendor.t(stats.wrong),
        t: answeredCount.value < session.total,
        v: common_vendor.o(openResultSummary)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1e7fffe1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questions/practice.js.map
