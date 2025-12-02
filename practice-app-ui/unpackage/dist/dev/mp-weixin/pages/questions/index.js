"use strict";
const common_vendor = require("../../common/vendor.js");
const api_mock = require("../../api/mock.js");
if (!Array) {
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_search_bar2 + _easycom_uni_tag2 + _easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_search_bar = () => "../../uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_list_item = () => "../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../uni_modules/uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_search_bar + _easycom_uni_tag + _easycom_uni_list_item + _easycom_uni_list)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const categories = common_vendor.ref([{ id: "", name: "全部" }]);
    const selectedCategory = common_vendor.ref("");
    const questions = common_vendor.ref([]);
    const keyword = common_vendor.ref("");
    const loadCategories = async () => {
      const list = await api_mock.fetchCategories();
      categories.value = [{ id: "", name: "全部" }, ...list];
    };
    const loadQuestions = async () => {
      const list = await api_mock.fetchQuestions({
        categoryId: selectedCategory.value,
        keyword: keyword.value
      });
      questions.value = list;
    };
    const switchCategory = (id) => {
      selectedCategory.value = id;
      loadQuestions();
    };
    const clearSearch = () => {
      keyword.value = "";
      loadQuestions();
    };
    const goDetail = (id) => {
      common_vendor.index.navigateTo({ url: `/pages/questions/detail?id=${id}` });
    };
    const renderType = (type) => {
      if (type === "multiple")
        return "多选";
      if (type === "truefalse")
        return "判断";
      return "单选";
    };
    const getCategoryName = (id) => {
      const found = categories.value.find((c) => c.id === id);
      return found ? found.name : "未分类";
    };
    common_vendor.onShow(() => {
      loadCategories();
      loadQuestions();
    });
    common_vendor.onPullDownRefresh(async () => {
      await loadCategories();
      await loadQuestions();
      common_vendor.index.stopPullDownRefresh();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(loadQuestions),
        b: common_vendor.o(clearSearch),
        c: common_vendor.o(clearSearch),
        d: common_vendor.o(($event) => keyword.value = $event),
        e: common_vendor.p({
          placeholder: "搜索题目关键词",
          ["cancel-button"]: "always",
          ["clear-button"]: "always",
          modelValue: keyword.value
        }),
        f: common_vendor.f(categories.value, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat.name),
            b: cat.id || "all",
            c: cat.id === selectedCategory.value ? 1 : "",
            d: common_vendor.o(($event) => switchCategory(cat.id), cat.id || "all")
          };
        }),
        g: common_vendor.f(questions.value, (item, k0, i0) => {
          return {
            a: "29918ac5-3-" + i0 + "," + ("29918ac5-2-" + i0),
            b: common_vendor.p({
              text: renderType(item.type),
              size: "mini",
              type: "primary"
            }),
            c: common_vendor.t(item.score),
            d: common_vendor.t(item.duration),
            e: item.id,
            f: common_vendor.o(($event) => goDetail(item.id), item.id),
            g: "29918ac5-2-" + i0 + ",29918ac5-1",
            h: common_vendor.p({
              title: item.title,
              clickable: true,
              note: getCategoryName(item.categoryId)
            })
          };
        }),
        h: !questions.value.length
      }, !questions.value.length ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-29918ac5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questions/index.js.map
