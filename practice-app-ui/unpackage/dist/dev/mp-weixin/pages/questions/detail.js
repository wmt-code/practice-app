"use strict";
const common_vendor = require("../../common/vendor.js");
const api_mock = require("../../api/mock.js");
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
      if (type === "multiple")
        return "多选";
      if (type === "truefalse")
        return "判断";
      return "单选";
    };
    const onSingleChange = (e) => {
      selected.value = [e.detail.value];
    };
    const onMultipleChange = (e) => {
      selected.value = e.detail.value || [];
    };
    const getCategoryName = (id) => {
      var _a;
      return ((_a = categories.value.find((c) => c.id === id)) == null ? void 0 : _a.name) || "未分类";
    };
    const backToList = () => {
      common_vendor.index.switchTab({ url: "/pages/questions/index" });
    };
    const loadData = async (id) => {
      const [catList, detail] = await Promise.all([api_mock.fetchCategories(), api_mock.fetchQuestionDetail(id)]);
      categories.value = catList;
      if (!(detail == null ? void 0 : detail.id)) {
        common_vendor.index.showToast({ title: "题目不存在", icon: "none" });
        question.value = { options: [] };
        return;
      }
      question.value = detail;
    };
    const handleSubmit = async () => {
      if (!question.value.id)
        return;
      if (!selected.value.length) {
        common_vendor.index.showToast({ title: "请选择答案", icon: "none" });
        return;
      }
      submitting.value = true;
      try {
        const res = await api_mock.submitAnswer({
          questionId: question.value.id,
          chosen: selected.value,
          spentSeconds: question.value.duration || 20
        });
        feedback.value = res;
        common_vendor.index.showToast({
          title: res.isCorrect ? "回答正确" : "再接再厉",
          icon: res.isCorrect ? "success" : "none"
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/detail.vue:149", err);
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
        f: question.value.type === "multiple"
      }, question.value.type === "multiple" ? {
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
      } : {
        i: common_vendor.f(question.value.options, (opt, k0, i0) => {
          return {
            a: opt.value,
            b: selected.value.includes(opt.value),
            c: common_vendor.t(opt.value),
            d: common_vendor.t(opt.text),
            e: opt.value
          };
        }),
        j: common_vendor.o(onSingleChange)
      }, {
        k: submitting.value,
        l: !selected.value.length,
        m: common_vendor.o(handleSubmit),
        n: common_vendor.o(backToList),
        o: common_vendor.p({
          ["is-shadow"]: false
        }),
        p: feedback.value
      }, feedback.value ? common_vendor.e({
        q: common_vendor.p({
          type: feedback.value.isCorrect ? "checkmarkempty" : "closeempty",
          color: feedback.value.isCorrect ? "#10b981" : "#ef4444",
          size: "24"
        }),
        r: common_vendor.t(feedback.value.isCorrect ? "回答正确" : "回答错误"),
        s: feedback.value.isCorrect ? 1 : "",
        t: !feedback.value.isCorrect ? 1 : "",
        v: common_vendor.t(feedback.value.correctAnswer.join(", ")),
        w: common_vendor.t(feedback.value.explanation),
        x: feedback.value.progress
      }, feedback.value.progress ? {
        y: common_vendor.t(feedback.value.progress.points),
        z: common_vendor.t(feedback.value.progress.percent)
      } : {}, {
        A: common_vendor.p({
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
