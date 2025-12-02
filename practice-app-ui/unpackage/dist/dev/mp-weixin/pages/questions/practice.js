"use strict";
const common_vendor = require("../../common/vendor.js");
const api_mock = require("../../api/mock.js");
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_tag2 + _easycom_uni_icons2)();
}
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_tag + _easycom_uni_icons)();
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
    const currentIndex = common_vendor.ref(0);
    const answers = common_vendor.reactive({});
    const feedback = common_vendor.reactive({});
    const submitting = common_vendor.ref(false);
    const currentQuestionId = common_vendor.computed(() => {
      var _a;
      return (_a = questions.value[currentIndex.value]) == null ? void 0 : _a.id;
    });
    const currentSelected = common_vendor.computed(() => answers[currentQuestionId.value] || []);
    const hasAnswered = common_vendor.computed(() => Boolean(feedback[currentQuestionId.value]));
    const renderType = (type) => {
      if (type === "multiple")
        return "多选";
      if (type === "truefalse")
        return "判断";
      return "单选";
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
    const submitAnswer = async () => {
      const question = questions.value[currentIndex.value];
      if (!question)
        return;
      const chosen = answers[question.id] || [];
      if (!chosen.length) {
        common_vendor.index.showToast({ title: "请选择答案", icon: "none" });
        return;
      }
      if (feedback[question.id])
        return;
      submitting.value = true;
      try {
        const res = await api_mock.submitAnswer({
          questionId: question.id,
          chosen,
          spentSeconds: question.duration || 20
        });
        feedback[question.id] = res;
        if (res.isCorrect) {
          common_vendor.index.showToast({ title: "正确，自动跳转", icon: "success" });
          setTimeout(() => goNext(true), 500);
        } else {
          common_vendor.index.showToast({ title: "查看解析，左滑下一题", icon: "none" });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/practice.vue:175", err);
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
      const nextId = (_a = questions.value[currentIndex.value]) == null ? void 0 : _a.id;
      if (auto && nextId && ((_b = feedback[nextId]) == null ? void 0 : _b.isCorrect)) {
        goNext(true);
      }
    };
    const onSwipe = (e) => {
      currentIndex.value = e.detail.current;
    };
    const loadSession = async (options) => {
      const categoryId = options == null ? void 0 : options.categoryId;
      if (!categoryId) {
        common_vendor.index.showToast({ title: "缺少分类参数", icon: "none" });
        return;
      }
      const count = Number(options == null ? void 0 : options.count);
      const mode = (options == null ? void 0 : options.mode) === "random" ? "random" : "order";
      const sessionData = await api_mock.startPracticeSession({
        categoryId,
        mode,
        count: Number.isFinite(count) ? count : void 0
      });
      questions.value = sessionData.questions || [];
      session.total = sessionData.total || 0;
      session.mode = sessionData.mode;
      session.category = sessionData.category;
      session.parent = sessionData.parent;
      currentIndex.value = 0;
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
        f: !session.total
      }, !session.total ? {} : {
        g: common_vendor.f(questions.value, (item, idx, i0) => {
          var _a2;
          return common_vendor.e({
            a: common_vendor.t(renderType(item.type)),
            b: common_vendor.t(idx + 1),
            c: common_vendor.t(item.title),
            d: item.type === "multiple"
          }, item.type === "multiple" ? {
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
          } : {
            g: common_vendor.f(item.options, (opt, k1, i1) => {
              return {
                a: opt.value,
                b: currentSelected.value.includes(opt.value),
                c: common_vendor.t(opt.value),
                d: common_vendor.t(opt.text),
                e: opt.value
              };
            }),
            h: common_vendor.o(onSingleChange, item.id)
          }, {
            i: common_vendor.o(submitAnswer, item.id)
          }, ((_a2 = feedback[currentQuestionId.value]) == null ? void 0 : _a2.isCorrect) ? {} : {}, feedback[currentQuestionId.value] ? common_vendor.e({
            j: "1e7fffe1-1-" + i0,
            k: common_vendor.p({
              type: feedback[currentQuestionId.value].isCorrect ? "checkmarkempty" : "closeempty",
              color: feedback[currentQuestionId.value].isCorrect ? "#10b981" : "#ef4444",
              size: "22"
            }),
            l: common_vendor.t(feedback[currentQuestionId.value].isCorrect ? "回答正确" : "回答错误"),
            m: common_vendor.t(feedback[currentQuestionId.value].correctAnswer.join(", ")),
            n: common_vendor.t(feedback[currentQuestionId.value].explanation),
            o: !feedback[currentQuestionId.value].isCorrect
          }, !feedback[currentQuestionId.value].isCorrect ? {} : {}, {
            p: common_vendor.n(feedback[currentQuestionId.value].isCorrect ? "success" : "danger")
          }) : {}, {
            q: item.id
          });
        }),
        h: common_vendor.t(hasAnswered.value ? "已提交" : "提交答案"),
        i: submitting.value,
        j: !currentSelected.value.length || hasAnswered.value,
        k: (_c = feedback[currentQuestionId.value]) == null ? void 0 : _c.isCorrect,
        l: feedback[currentQuestionId.value],
        m: currentIndex.value,
        n: common_vendor.o(onSwipe)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1e7fffe1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questions/practice.js.map
