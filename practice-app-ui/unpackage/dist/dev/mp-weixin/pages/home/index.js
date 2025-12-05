"use strict";
const common_vendor = require("../../common/vendor.js");
const api_categories = require("../../api/categories.js");
const api_questions = require("../../api/questions.js");
const api_user = require("../../api/user.js");
const api_progress = require("../../api/progress.js");
if (!Array) {
  const _easycom_uni_badge2 = common_vendor.resolveComponent("uni-badge");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  (_easycom_uni_badge2 + _easycom_uni_card2 + _easycom_uni_section2 + _easycom_uni_tag2)();
}
const _easycom_uni_badge = () => "../../uni_modules/uni-badge/components/uni-badge/uni-badge.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_uni_section = () => "../../uni_modules/uni-section/components/uni-section/uni-section.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
if (!Math) {
  (_easycom_uni_badge + _easycom_uni_card + _easycom_uni_section + _easycom_uni_tag)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const fallbackUser = () => api_user.getCachedProfile() || {
      nickname: "未登录",
      avatar: "/static/uni.png",
      loggedIn: false
    };
    const user = common_vendor.ref(fallbackUser());
    const progress = common_vendor.ref(api_progress.emptyProgress());
    const recommended = common_vendor.ref([]);
    const categories = common_vendor.ref([]);
    const categoryTree = common_vendor.ref([]);
    const loadData = async () => {
      const [userResult, progressResult, catTreeRes, recommendList] = await Promise.allSettled([
        api_user.fetchProfile(),
        api_progress.fetchProgressSummary(),
        api_categories.fetchCategoryTree(),
        api_questions.fetchPracticeRandom({ limit: 3 })
      ]);
      user.value = userResult.status === "fulfilled" && userResult.value ? userResult.value : fallbackUser();
      progress.value = progressResult.status === "fulfilled" && progressResult.value ? progressResult.value : api_progress.emptyProgress();
      categoryTree.value = catTreeRes.status === "fulfilled" ? catTreeRes.value : [];
      categories.value = catTreeRes.status === "fulfilled" && Array.isArray(catTreeRes.value) ? api_categories.flattenCategoryTree(catTreeRes.value) : [];
      recommended.value = recommendList.status === "fulfilled" ? recommendList.value : [];
    };
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
    const getCategoryName = (id) => api_categories.categoryNameById(categories.value, id) || "未分类";
    const renderDifficulty = (difficulty) => {
      if (!difficulty)
        return "不限难度";
      if (difficulty === "HARD")
        return "困难";
      if (difficulty === "MEDIUM")
        return "中等";
      if (difficulty === "EASY")
        return "容易";
      return difficulty;
    };
    const goQuestionBank = () => {
      common_vendor.index.switchTab({ url: "/pages/questions/index" });
    };
    const goQuestion = (id) => {
      common_vendor.index.navigateTo({ url: `/pages/questions/detail?id=${id}` });
    };
    const goProfile = () => {
      common_vendor.index.switchTab({ url: "/pages/profile/index" });
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
        a: user.value.avatar || "/static/uni.png",
        b: common_vendor.t(user.value.nickname || "未登录"),
        c: user.value.loggedIn
      }, user.value.loggedIn ? {
        d: common_vendor.p({
          text: "已登录",
          type: "success"
        })
      } : {}, {
        e: common_vendor.t(progress.value.answeredQuestions),
        f: common_vendor.t(progress.value.totalQuestions),
        g: !user.value.loggedIn
      }, !user.value.loggedIn ? {
        h: common_vendor.o(goProfile)
      } : {}, {
        i: common_vendor.t(progress.value.correctRate || 0),
        j: progress.value.percent || 0,
        k: common_vendor.t(progress.value.answeredQuestions),
        l: common_vendor.t(progress.value.totalQuestions),
        m: common_vendor.p({
          ["is-shadow"]: false
        }),
        n: common_vendor.p({
          title: "分类进度",
          type: "line",
          padding: true
        }),
        o: common_vendor.f(progress.value.categories, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat.name),
            b: "4978fed5-3-" + i0,
            c: common_vendor.p({
              text: cat.correct + "/" + cat.total,
              type: "primary"
            }),
            d: common_vendor.t(cat.correctRate),
            e: cat.total ? Math.round(cat.answered / cat.total * 100) : 0,
            f: cat.id
          };
        }),
        p: common_vendor.p({
          title: "推荐题目",
          ["sub-title"]: "从未做过的题目里精选",
          type: "line",
          padding: true
        }),
        q: recommended.value.length
      }, recommended.value.length ? {
        r: common_vendor.f(recommended.value, (item, k0, i0) => {
          return common_vendor.e({
            a: "4978fed5-6-" + i0 + "," + ("4978fed5-5-" + i0),
            b: common_vendor.p({
              text: renderType(item.type),
              size: "mini",
              type: "primary"
            }),
            c: item.difficulty
          }, item.difficulty ? {
            d: "4978fed5-7-" + i0 + "," + ("4978fed5-5-" + i0),
            e: common_vendor.p({
              text: renderDifficulty(item.difficulty),
              size: "mini",
              type: "warning"
            })
          } : {}, {
            f: "4978fed5-8-" + i0 + "," + ("4978fed5-5-" + i0),
            g: common_vendor.p({
              text: getCategoryName(item.categoryId),
              size: "mini",
              type: "success"
            }),
            h: common_vendor.t(item.score),
            i: item.id,
            j: common_vendor.o(($event) => goQuestion(item.id), item.id),
            k: "4978fed5-5-" + i0,
            l: common_vendor.p({
              ["is-shadow"]: false,
              title: item.title
            })
          });
        })
      } : {}, {
        s: common_vendor.o(goQuestionBank)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map
