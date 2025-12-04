"use strict";
const common_vendor = require("../../common/vendor.js");
const api_categories = require("../../api/categories.js");
const api_questions = require("../../api/questions.js");
const api_answers = require("../../api/answers.js");
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_tag2 + _easycom_uni_card2 + _easycom_uni_icons2)();
}
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_tag + _easycom_uni_card + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const question = common_vendor.ref({
      options: []
    });
    const categories = common_vendor.ref([]);
    const selected = common_vendor.ref([]);
    const feedback = common_vendor.ref(null);
    const submitting = common_vendor.ref(false);
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
    const onSingleChange = (e) => {
      selected.value = [e.detail.value];
    };
    const onMultipleChange = (e) => {
      selected.value = e.detail.value || [];
    };
    const onTextChange = (e) => {
      selected.value = [e.detail.value || ""];
    };
    const getCategoryName = (id) => {
      var _a;
      return ((_a = categories.value.find((c) => String(c.id) === String(id))) == null ? void 0 : _a.name) || "未分类";
    };
    const backToList = () => {
      common_vendor.index.switchTab({ url: "/pages/questions/index" });
    };
    const loadData = async (id) => {
      try {
        const [catTree, detail] = await Promise.all([api_categories.fetchCategoryTree(), api_questions.fetchQuestionDetail(id)]);
        categories.value = api_categories.flattenCategoryTree(catTree);
        if (!(detail == null ? void 0 : detail.id)) {
          common_vendor.index.showToast({ title: "题目不存在", icon: "none" });
          question.value = { options: [] };
          return;
        }
        question.value = detail;
        selected.value = [];
        feedback.value = null;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/detail.vue:162", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    };
    const handleSubmit = async () => {
      if (!question.value.id)
        return;
      const chosen = (selected.value || []).map((v) => typeof v === "string" ? v.trim() : v);
      if (!chosen.length || !chosen.some((v) => v)) {
        common_vendor.index.showToast({ title: "请选择答案", icon: "none" });
        return;
      }
      submitting.value = true;
      try {
        const res = await api_answers.submitAnswer({
          questionId: question.value.id,
          chosen,
          timeSpent: question.value.duration || 20
        });
        feedback.value = res;
        common_vendor.index.showToast({
          title: res.isCorrect ? "回答正确" : "再接再厉",
          icon: res.isCorrect ? "success" : "none"
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/detail.vue:187", err);
        common_vendor.index.showToast({ title: "提交失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    };
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.id) {
        loadData(options.id);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(renderType(question.value.type)),
        b: common_vendor.t(question.value.title),
        c: common_vendor.p({
          text: getCategoryName(question.value.categoryId),
          size: "small",
          type: "success"
        }),
        d: common_vendor.p({
          text: "分值 " + question.value.score,
          size: "small",
          type: "primary"
        }),
        e: common_vendor.t(question.value.duration),
        f: isMultiple(question.value.type)
      }, isMultiple(question.value.type) ? {
        g: common_vendor.f(question.value.options, (opt, k0, i0) => {
          return {
            a: opt.value,
            b: selected.value.includes(opt.value),
            c: common_vendor.t(opt.value),
            d: common_vendor.t(opt.text),
            e: opt.value
          };
        }),
        h: common_vendor.o(onMultipleChange)
      } : isShortAnswer(question.value.type) ? {
        j: selected.value[0] || "",
        k: common_vendor.o(onTextChange)
      } : {
        l: common_vendor.f(question.value.options, (opt, k0, i0) => {
          return {
            a: opt.value,
            b: selected.value.includes(opt.value),
            c: common_vendor.t(opt.value),
            d: common_vendor.t(opt.text),
            e: opt.value
          };
        }),
        m: common_vendor.o(onSingleChange)
      }, {
        i: isShortAnswer(question.value.type),
        n: submitting.value,
        o: !selected.value.length,
        p: common_vendor.o(handleSubmit),
        q: common_vendor.o(backToList),
        r: common_vendor.p({
          ["is-shadow"]: false
        }),
        s: feedback.value
      }, feedback.value ? common_vendor.e({
        t: common_vendor.p({
          type: feedback.value.isCorrect ? "checkmarkempty" : "closeempty",
          color: feedback.value.isCorrect ? "#10b981" : "#ef4444",
          size: "24"
        }),
        v: common_vendor.t(feedback.value.isCorrect ? "回答正确" : "回答错误"),
        w: feedback.value.isCorrect ? 1 : "",
        x: !feedback.value.isCorrect ? 1 : "",
        y: common_vendor.t(feedback.value.correctAnswer.join(", ")),
        z: common_vendor.t(feedback.value.explanation),
        A: feedback.value.progress
      }, feedback.value.progress ? {
        B: common_vendor.t(feedback.value.progress.points),
        C: common_vendor.t(feedback.value.progress.percent)
      } : {}, {
        D: common_vendor.p({
          title: "判题结果",
          ["is-shadow"]: false
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5057af5f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questions/detail.js.map
