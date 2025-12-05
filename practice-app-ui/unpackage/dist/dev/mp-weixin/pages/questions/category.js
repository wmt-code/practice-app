"use strict";
const common_vendor = require("../../common/vendor.js");
const api_categories = require("../../api/categories.js");
const api_questions = require("../../api/questions.js");
const api_progress = require("../../api/progress.js");
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  (_easycom_uni_tag2 + _easycom_uni_load_more2 + _easycom_uni_icons2 + _easycom_uni_easyinput2)();
}
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
if (!Math) {
  (_easycom_uni_tag + _easycom_uni_load_more + _easycom_uni_icons + _easycom_uni_easyinput)();
}
const _sfc_main = {
  __name: "category",
  setup(__props) {
    const navigateWithFallback = (url, { timeout = 1500 } = {}) => new Promise((resolve, reject) => {
      let settled = false;
      const clear = () => {
        settled = true;
        if (timer)
          clearTimeout(timer);
      };
      const timer = setTimeout(() => {
        if (settled)
          return;
        common_vendor.index.redirectTo({
          url,
          success: () => {
            clear();
            resolve();
          },
          fail: (err) => {
            clear();
            reject(err);
          }
        });
      }, timeout);
      common_vendor.index.navigateTo({
        url,
        success: () => {
          clear();
          resolve();
        },
        fail: (err) => {
          if (settled)
            return;
          common_vendor.index.redirectTo({
            url,
            success: () => {
              clear();
              resolve();
            },
            fail: (redirectErr) => {
              clear();
              reject(redirectErr || err);
            }
          });
        }
      });
    });
    const category = common_vendor.ref(null);
    const parentName = common_vendor.ref("");
    const summary = common_vendor.ref({
      total: 0,
      answered: 0
    });
    const customCount = common_vendor.ref(5);
    const loading = common_vendor.ref(false);
    const navigating = common_vendor.ref(false);
    const minCount = common_vendor.computed(() => 1);
    const loadData = async (categoryId) => {
      loading.value = true;
      try {
        const tree = await api_categories.fetchCategoryTree();
        const flat = api_categories.flattenCategoryTree(tree);
        const current = flat.find((c) => `${c.id}` === `${categoryId}`);
        const parent = flat.find((c) => c.id === (current == null ? void 0 : current.parentId));
        if (!current) {
          common_vendor.index.showToast({ title: "分类不存在", icon: "none" });
          return;
        }
        category.value = current;
        parentName.value = (parent == null ? void 0 : parent.name) || "题库";
        const baseTotal = current.questionCount || 0;
        summary.value = {
          total: baseTotal,
          answered: 0
        };
        const fallbackCount = baseTotal || 5;
        customCount.value = Math.min(baseTotal || fallbackCount, customCount.value || fallbackCount);
        loading.value = false;
        api_questions.fetchPracticeSequence({ categoryId, page: 1, size: 1 }).then((practicePage) => {
          const total = practicePage.total || baseTotal;
          summary.value = {
            ...summary.value,
            total
          };
          customCount.value = Math.min(total || fallbackCount, customCount.value || fallbackCount);
        }).catch((err) => {
          common_vendor.index.__f__("warn", "at pages/questions/category.vue:185", "practice sequence fallback to cached count", err);
        });
        api_progress.fetchProgressSummary().then((progressData) => {
          const progressItem = Array.isArray(progressData == null ? void 0 : progressData.categories) ? progressData.categories.find((c) => `${c.id}` === `${categoryId}`) : null;
          if (progressItem) {
            summary.value = {
              ...summary.value,
              answered: progressItem.answered || progressItem.completedQuestions || 0
            };
          }
        }).catch((err) => {
          common_vendor.index.__f__("warn", "at pages/questions/category.vue:202", "progress summary skipped", err);
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/category.vue:205", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
        loading.value = false;
      }
    };
    const normalizeRandomCount = () => {
      const total = summary.value.total || 0;
      if (!total)
        return 0;
      const raw = Number(customCount.value) || 0;
      const clamped = Math.min(Math.max(raw, minCount.value), total);
      return clamped;
    };
    const startPractice = async (mode) => {
      if (loading.value) {
        common_vendor.index.showToast({ title: "数据加载中，请稍后", icon: "none" });
        return;
      }
      if (!category.value) {
        common_vendor.index.showToast({ title: "分类信息未加载", icon: "none" });
        return;
      }
      if (!summary.value.total) {
        common_vendor.index.showToast({ title: "该分类暂无题目", icon: "none" });
        return;
      }
      const isRandom = mode === "random";
      const count = isRandom ? normalizeRandomCount() : 0;
      if (navigating.value)
        return;
      navigating.value = true;
      const url = `/pages/questions/practice?categoryId=${category.value.id}&mode=${mode}&count=${count}`;
      try {
        await navigateWithFallback(url, { timeout: 1200 });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questions/category.vue:240", "navigate to practice failed", err);
        common_vendor.index.showToast({ title: "打开练习页失败，请重试", icon: "none" });
      } finally {
        navigating.value = false;
      }
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
      }, category.value ? common_vendor.e({
        b: common_vendor.t(parentName.value),
        c: common_vendor.t(category.value.name),
        d: common_vendor.p({
          text: "题库",
          type: "primary",
          size: "mini"
        }),
        e: category.value.description
      }, category.value.description ? {
        f: common_vendor.t(category.value.description)
      } : {}, {
        g: common_vendor.t(summary.value.total),
        h: common_vendor.t(summary.value.answered),
        i: common_vendor.t(category.value.updatedAt || "--")
      }) : {}, {
        j: loading.value
      }, loading.value ? {
        k: common_vendor.p({
          status: "loading",
          iconType: "circle"
        })
      } : {
        l: common_vendor.p({
          type: "redo",
          size: "22",
          color: "#fff"
        }),
        m: common_vendor.t(summary.value.total),
        n: common_vendor.t(summary.value.answered),
        o: !summary.value.total || loading.value || navigating.value,
        p: loading.value || navigating.value,
        q: common_vendor.o(startOrder),
        r: common_vendor.o(startOrder),
        s: common_vendor.p({
          type: "hand-up",
          size: "22",
          color: "#111827"
        }),
        t: common_vendor.o(common_vendor.m(($event) => customCount.value = $event, {
          number: true
        }, true)),
        v: common_vendor.p({
          type: "number",
          placeholder: "输入数量",
          clearable: false,
          inputBorder: true,
          modelValue: customCount.value
        }),
        w: common_vendor.t(summary.value.total),
        x: !summary.value.total || loading.value || navigating.value,
        y: loading.value || navigating.value,
        z: common_vendor.o(startRandom)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-099975ac"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questions/category.js.map
