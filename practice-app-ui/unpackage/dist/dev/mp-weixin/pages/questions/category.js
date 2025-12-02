"use strict";
const common_vendor = require("../../common/vendor.js");
const api_mock = require("../../api/mock.js");
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  (_easycom_uni_tag2 + _easycom_uni_icons2 + _easycom_uni_easyinput2)();
}
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
if (!Math) {
  (_easycom_uni_tag + _easycom_uni_icons + _easycom_uni_easyinput)();
}
const _sfc_main = {
  __name: "category",
  setup(__props) {
    const category = common_vendor.ref(null);
    const parentName = common_vendor.ref("");
    const summary = common_vendor.ref({
      total: 0,
      answered: 0
    });
    const customCount = common_vendor.ref(5);
    const minCount = common_vendor.computed(() => 1);
    const loadData = async (categoryId) => {
      const [tree, detail] = await Promise.all([
        api_mock.fetchCategoryTree(),
        api_mock.fetchCategoryDetail(categoryId)
      ]);
      const parent = tree.find((p) => p.children.some((c) => c.id === categoryId));
      if (!detail) {
        common_vendor.index.showToast({ title: "分类不存在", icon: "none" });
        return;
      }
      category.value = detail;
      parentName.value = (parent == null ? void 0 : parent.name) || "题库";
      summary.value = {
        total: detail.total,
        answered: detail.answered
      };
      customCount.value = Math.min(detail.total, customCount.value || detail.total || 5);
    };
    const startPractice = (mode) => {
      if (!category.value)
        return;
      if (!summary.value.total) {
        common_vendor.index.showToast({ title: "该分类暂无题目", icon: "none" });
        return;
      }
      const count = mode === "random" ? Math.min(Math.max(customCount.value || 0, minCount.value), summary.value.total || 0) : summary.value.total;
      common_vendor.index.navigateTo({
        url: `/pages/questions/practice?categoryId=${category.value.id}&mode=${mode}&count=${count}`
      });
    };
    const startOrder = () => startPractice("order");
    const startRandom = () => startPractice("random");
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.categoryId) {
        loadData(options.categoryId);
      } else {
        common_vendor.index.showToast({ title: "缺少分类参数", icon: "none" });
      }
    });
    common_vendor.onPullDownRefresh(async () => {
      var _a;
      if ((_a = category.value) == null ? void 0 : _a.id) {
        await loadData(category.value.id);
      }
      common_vendor.index.stopPullDownRefresh();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: category.value
      }, category.value ? {
        b: common_vendor.t(parentName.value),
        c: common_vendor.t(category.value.name),
        d: common_vendor.p({
          text: "题库",
          type: "primary",
          size: "mini"
        }),
        e: common_vendor.t(category.value.description || "进入本分类，开始专项练习"),
        f: common_vendor.t(summary.value.total),
        g: common_vendor.t(summary.value.answered),
        h: common_vendor.t(category.value.updatedAt || "--")
      } : {}, {
        i: common_vendor.p({
          type: "redo",
          size: "22",
          color: "#fff"
        }),
        j: common_vendor.t(summary.value.total),
        k: common_vendor.t(summary.value.answered),
        l: common_vendor.o(startOrder),
        m: common_vendor.o(startOrder),
        n: common_vendor.p({
          type: "hand-up",
          size: "22",
          color: "#111827"
        }),
        o: common_vendor.o(common_vendor.m(($event) => customCount.value = $event, {
          number: true
        }, true)),
        p: common_vendor.p({
          type: "number",
          placeholder: "输入数量",
          clearable: false,
          inputBorder: true,
          modelValue: customCount.value
        }),
        q: common_vendor.t(summary.value.total),
        r: common_vendor.o(startRandom)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-099975ac"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questions/category.js.map
