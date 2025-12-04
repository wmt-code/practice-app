"use strict";
const common_vendor = require("../../common/vendor.js");
const api_questions = require("../../api/questions.js");
const api_answers = require("../../api/answers.js");
const api_categories = require("../../api/categories.js");
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_tag2 + _easycom_uni_load_more2 + _easycom_uni_icons2)();
}
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_tag + _easycom_uni_load_more + _easycom_uni_icons)();
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
    const currentQuestionId = common_vendor.computed(() => {
      var _a;
      return (_a = questions.value[currentIndex.value]) == null ? void 0 : _a.id;
    });
    const currentSelected = common_vendor.computed(() => answers[currentQuestionId.value] || []);
    const hasAnswered = common_vendor.computed(() => Boolean(feedback[currentQuestionId.value]));
    const renderType = (type) => {
      const t = String(type || "").toLowerCase();
      if (t.includes("multiple"))
        return "多选";
      if (t.includes("true") || t.includes("judge"))
        return "判断";
      if (t.includes("fill") || t.includes("short"))
        return "简答";
      return "单选";
    };
    const isMultiple = (type) => String(type || "").toLowerCase().includes("multiple");
    const isShortAnswer = (type) => {
      const t = String(type || "").toLowerCase();
      return t.includes("fill") || t.includes("short");
    };
    const onSingleChange = (e) => {
      if (!currentQuestionId.value)
        return;
      answers[currentQuestionId.value] = [e.detail.value];
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
        common_vendor.index.__f__("error", "at pages/questions/practice.vue:200", err);
      }
    };
    const initAnswers = () => {
      questions.value.forEach((q) => {
        if (!answers[q.id]) {
          answers[q.id] = [];
        }
      });
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
        questions.value = append ? [...questions.value, ...list] : list;
        initAnswers();
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/practice.vue:246", err);
        common_vendor.index.showToast({ title: "加载题目失败", icon: "none" });
      } finally {
        pagination.loading = false;
      }
    };
    const loadSession = async (options) => {
      loading.value = true;
      try {
        params.categoryId = (options == null ? void 0 : options.categoryId) ? Number(options.categoryId) || options.categoryId : "";
        if (!params.categoryId) {
          common_vendor.index.showToast({ title: "缺少分类参数", icon: "none" });
          return;
        }
        params.count = (options == null ? void 0 : options.count) ? Number(options.count) : 0;
        params.mode = (options == null ? void 0 : options.mode) === "random" ? "random" : "order";
        await loadCategoryInfo(params.categoryId);
        if (params.mode === "random") {
          await loadRandom();
        } else {
          await loadSequencePage(1, false);
        }
        currentIndex.value = 0;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/practice.vue:271", err);
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
        if (res.isCorrect) {
          common_vendor.index.showToast({ title: "正确，自动跳转", icon: "success" });
          setTimeout(() => goNext(true), 500);
        } else {
          common_vendor.index.showToast({ title: "查看解析，左滑下一题", icon: "none" });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/practice.vue:309", err);
        common_vendor.index.showToast({ title: "提交失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    };
    const goNext = (auto = false) => {
      var _a, _b;
      if (currentIndex.value >= session.total - 1) {
        common_vendor.index.showToast({ title: "练习完成", icon: "success" });
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
            g: isShortAnswer(item.type),
            l: common_vendor.o(submitAnswer, item.id)
          }, ((_a2 = feedback[currentQuestionId.value]) == null ? void 0 : _a2.isCorrect) ? {} : {}, feedback[currentQuestionId.value] ? common_vendor.e({
            m: "1e7fffe1-2-" + i0,
            n: common_vendor.p({
              type: feedback[currentQuestionId.value].isCorrect ? "checkmarkempty" : "closeempty",
              color: feedback[currentQuestionId.value].isCorrect ? "#10b981" : "#ef4444",
              size: "22"
            }),
            o: common_vendor.t(feedback[currentQuestionId.value].isCorrect ? "回答正确" : "回答错误"),
            p: common_vendor.t(feedback[currentQuestionId.value].correctAnswer.join(", ")),
            q: common_vendor.t(feedback[currentQuestionId.value].explanation),
            r: !feedback[currentQuestionId.value].isCorrect
          }, !feedback[currentQuestionId.value].isCorrect ? {} : {}, {
            s: common_vendor.n(feedback[currentQuestionId.value].isCorrect ? "success" : "danger")
          }) : {}, {
            t: item.id
          });
        }),
        j: common_vendor.t(hasAnswered.value ? "已提交" : "提交答案"),
        k: submitting.value,
        l: !currentSelected.value.length || hasAnswered.value,
        m: (_c = feedback[currentQuestionId.value]) == null ? void 0 : _c.isCorrect,
        n: feedback[currentQuestionId.value],
        o: currentIndex.value,
        p: common_vendor.o(onSwipe)
      }, {
        h: !session.total
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1e7fffe1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questions/practice.js.map
