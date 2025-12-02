"use strict";
const common_vendor = require("../../common/vendor.js");
const api_mock = require("../../api/mock.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_easyinput2 + _easycom_uni_tag2 + _easycom_uni_icons2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_tag + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const categoryTree = common_vendor.ref([]);
    const selectedParent = common_vendor.ref("");
    const keyword = common_vendor.ref("");
    const childrenOfParent = common_vendor.computed(() => {
      const parent = categoryTree.value.find((p) => p.id === selectedParent.value);
      return parent ? parent.children : [];
    });
    const filteredChildren = common_vendor.computed(() => {
      const kw = keyword.value.trim().toLowerCase();
      if (!kw)
        return childrenOfParent.value;
      return childrenOfParent.value.filter(
        (item) => item.name.toLowerCase().includes(kw) || (item.description || "").toLowerCase().includes(kw)
      );
    });
    const loadCategories = async () => {
      const list = await api_mock.fetchCategoryTree();
      categoryTree.value = list;
      if (!selectedParent.value && list.length) {
        selectedParent.value = list[0].id;
      }
    };
    const switchParent = (id) => {
      selectedParent.value = id;
    };
    const handleSearch = () => {
    };
    const clearSearch = () => {
      keyword.value = "";
    };
    const goCategory = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/questions/category?categoryId=${item.id}`
      });
    };
    common_vendor.onShow(() => {
      loadCategories();
    });
    common_vendor.onPullDownRefresh(async () => {
      await loadCategories();
      common_vendor.index.stopPullDownRefresh();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleSearch),
        b: common_vendor.o(clearSearch),
        c: common_vendor.o(($event) => keyword.value = $event),
        d: common_vendor.p({
          placeholder: "搜索想练习的考试或子分类",
          prefixIcon: "search",
          clearable: true,
          modelValue: keyword.value
        }),
        e: common_vendor.f(categoryTree.value, (parent, k0, i0) => {
          return {
            a: common_vendor.t(parent.name),
            b: parent.id,
            c: parent.id === selectedParent.value ? 1 : "",
            d: common_vendor.o(($event) => switchParent(parent.id), parent.id)
          };
        }),
        f: filteredChildren.value.length
      }, filteredChildren.value.length ? {
        g: common_vendor.f(filteredChildren.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.name),
            b: item.badge
          }, item.badge ? {
            c: "29918ac5-1-" + i0,
            d: common_vendor.p({
              text: item.badge,
              type: "warning",
              size: "mini"
            })
          } : {}, {
            e: "29918ac5-2-" + i0,
            f: common_vendor.t(item.description || "点击进入详情与练习"),
            g: common_vendor.t(item.questionCount || 0),
            h: common_vendor.t(item.updatedAt || "--"),
            i: item.id,
            j: common_vendor.o(($event) => goCategory(item), item.id)
          });
        }),
        h: common_vendor.p({
          type: "arrowright",
          color: "#9ca3af",
          size: "20"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-29918ac5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questions/index.js.map
