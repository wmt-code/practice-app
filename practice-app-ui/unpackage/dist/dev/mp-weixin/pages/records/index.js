"use strict";
const common_vendor = require("../../common/vendor.js");
const api_categories = require("../../api/categories.js");
const api_answers = require("../../api/answers.js");
const api_questions = require("../../api/questions.js");
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_tag2 + _easycom_uni_card2 + _easycom_uni_load_more2)();
}
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_tag + _easycom_uni_card + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const categories = common_vendor.ref([{ id: "", name: "全部" }]);
    const records = common_vendor.ref([]);
    const selectedCategory = common_vendor.ref("");
    const pager = common_vendor.reactive({
      page: 1,
      size: 10,
      total: 0,
      finished: false,
      loading: false
    });
    const questionCache = common_vendor.reactive({});
    const loading = common_vendor.ref(false);
    const categoryNames = common_vendor.computed(() => categories.value.map((c) => c.name));
    const currentCategoryLabel = common_vendor.computed(() => {
      var _a;
      const target = String(selectedCategory.value || "");
      return ((_a = categories.value.find((c) => String(c.id) === target)) == null ? void 0 : _a.name) || "全部";
    });
    const filteredRecords = common_vendor.computed(() => {
      if (!selectedCategory.value)
        return records.value;
      const target = String(selectedCategory.value);
      return records.value.filter((item) => String(item.categoryId) === target);
    });
    const getCategoryName = (id) => {
      var _a;
      return ((_a = categories.value.find((c) => String(c.id) === String(id))) == null ? void 0 : _a.name) || "未分类";
    };
    const renderDifficulty = (difficulty) => {
      const t = String(difficulty || "").toLowerCase();
      if (t.includes("hard"))
        return "困难";
      if (t.includes("medium"))
        return "中等";
      if (t.includes("easy"))
        return "容易";
      return difficulty || "未设置";
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
    const loadCategories = async () => {
      try {
        const list = await api_categories.fetchCategories();
        categories.value = [{ id: "", name: "全部" }, ...list];
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/records/index.vue:109", err);
      }
    };
    const enrichWithQuestionDetail = async (list = []) => {
      const ids = [...new Set(list.map((item) => item.questionId).filter(Boolean))].filter(
        (id) => !questionCache[id]
      );
      if (ids.length) {
        const detailList = await Promise.all(
          ids.map(
            (id) => api_questions.fetchQuestionDetail(id).then((detail) => ({ id, detail })).catch(() => ({ id, detail: null }))
          )
        );
        detailList.forEach(({ id, detail }) => {
          questionCache[id] = detail;
        });
      }
      return list.map((item) => {
        const detail = questionCache[item.questionId];
        return {
          ...item,
          categoryId: detail == null ? void 0 : detail.categoryId,
          categoryName: detail ? getCategoryName(detail.categoryId) : ""
        };
      });
    };
    const loadRecords = async (reset = false) => {
      if (pager.loading || pager.finished && !reset)
        return;
      pager.loading = true;
      loading.value = reset;
      try {
        const pageToLoad = reset ? 1 : pager.page;
        const res = await api_answers.fetchAnswerHistory({ page: pageToLoad, size: pager.size });
        pager.total = res.total || 0;
        const enriched = await enrichWithQuestionDetail(res.records || []);
        if (reset) {
          records.value = enriched;
          pager.page = 2;
          pager.finished = records.value.length >= pager.total || !enriched.length;
        } else {
          records.value = [...records.value, ...enriched];
          pager.page += 1;
          if (!enriched.length || records.value.length >= pager.total) {
            pager.finished = true;
          }
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/records/index.vue:160", err);
        common_vendor.index.showToast({ title: "加载记录失败", icon: "none" });
      } finally {
        pager.loading = false;
        loading.value = false;
      }
    };
    common_vendor.onShow(() => {
      loadCategories();
      loadRecords(true);
    });
    common_vendor.onPullDownRefresh(async () => {
      await loadCategories();
      await loadRecords(true);
      common_vendor.index.stopPullDownRefresh();
    });
    common_vendor.onReachBottom(() => {
      loadRecords(false);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(currentCategoryLabel.value),
        b: categoryNames.value,
        c: common_vendor.o(onCategoryChange),
        d: filteredRecords.value.length
      }, filteredRecords.value.length ? {
        e: common_vendor.f(filteredRecords.value, (item, k0, i0) => {
          return common_vendor.e({
            a: "f1512143-1-" + i0 + "," + ("f1512143-0-" + i0),
            b: common_vendor.p({
              text: item.isCorrect ? "正确" : "错误",
              type: item.isCorrect ? "success" : "warning"
            }),
            c: item.difficulty
          }, item.difficulty ? {
            d: "f1512143-2-" + i0 + "," + ("f1512143-0-" + i0),
            e: common_vendor.p({
              text: renderDifficulty(item.difficulty),
              size: "small",
              type: "primary"
            })
          } : {}, {
            f: common_vendor.t(item.score),
            g: common_vendor.t(item.timeSpent),
            h: common_vendor.t(formatTime(item.answeredAt)),
            i: common_vendor.t(item.categoryName || getCategoryName(item.categoryId)),
            j: item.questionId + "-" + item.answeredAt,
            k: "f1512143-0-" + i0,
            l: common_vendor.p({
              ["is-shadow"]: false,
              title: item.questionTitle || "未知题目"
            })
          });
        }),
        f: common_vendor.p({
          status: pager.finished ? "noMore" : pager.loading ? "loading" : "more"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f1512143"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/records/index.js.map
