"use strict";
const common_vendor = require("../../common/vendor.js");
const api_mock = require("../../api/mock.js");
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  (_easycom_uni_tag2 + _easycom_uni_card2)();
}
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
if (!Math) {
  (_easycom_uni_tag + _easycom_uni_card)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const categories = common_vendor.ref([{ id: "", name: "全部" }]);
    const records = common_vendor.ref([]);
    const selectedCategory = common_vendor.ref("");
    const categoryNames = common_vendor.computed(() => categories.value.map((c) => c.name));
    const currentCategoryLabel = common_vendor.computed(
      () => {
        var _a;
        return ((_a = categories.value.find((c) => c.id === selectedCategory.value)) == null ? void 0 : _a.name) || "全部";
      }
    );
    const filteredRecords = common_vendor.computed(() => {
      if (!selectedCategory.value)
        return records.value;
      return records.value.filter((item) => {
        var _a;
        return ((_a = item.question) == null ? void 0 : _a.categoryId) === selectedCategory.value;
      });
    });
    const getCategoryName = (id) => {
      var _a;
      return ((_a = categories.value.find((c) => c.id === id)) == null ? void 0 : _a.name) || "未分类";
    };
    const onCategoryChange = (e) => {
      var _a;
      const index = Number(e.detail.value);
      selectedCategory.value = ((_a = categories.value[index]) == null ? void 0 : _a.id) || "";
    };
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
    };
    const loadData = async () => {
      const [catList, recordList] = await Promise.all([api_mock.fetchCategories(), api_mock.fetchRecords()]);
      categories.value = [{ id: "", name: "全部" }, ...catList];
      records.value = recordList;
    };
    common_vendor.onShow(() => {
      loadData();
    });
    common_vendor.onPullDownRefresh(async () => {
      await loadData();
      common_vendor.index.stopPullDownRefresh();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(currentCategoryLabel.value),
        b: categoryNames.value,
        c: common_vendor.o(onCategoryChange),
        d: filteredRecords.value.length
      }, filteredRecords.value.length ? {
        e: common_vendor.f(filteredRecords.value, (item, k0, i0) => {
          var _a, _b, _c;
          return {
            a: "f1512143-1-" + i0 + "," + ("f1512143-0-" + i0),
            b: common_vendor.p({
              text: item.isCorrect ? "正确" : "错误",
              type: item.isCorrect ? "success" : "warning"
            }),
            c: common_vendor.t(item.score),
            d: common_vendor.t(item.spentSeconds),
            e: common_vendor.t(formatTime(item.answeredAt)),
            f: common_vendor.t(getCategoryName((_a = item.question) == null ? void 0 : _a.categoryId)),
            g: common_vendor.t(item.chosen.join("、") || "-"),
            h: common_vendor.t((((_b = item.question) == null ? void 0 : _b.answer) || []).join("、")),
            i: item.id,
            j: "f1512143-0-" + i0,
            k: common_vendor.p({
              ["is-shadow"]: false,
              title: ((_c = item.question) == null ? void 0 : _c.title) || "未知题目"
            })
          };
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f1512143"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/records/index.js.map
