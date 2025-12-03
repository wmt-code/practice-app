"use strict";
const common_vendor = require("../../common/vendor.js");
const api_auth = require("../../api/auth.js");
const api_progress = require("../../api/progress.js");
const api_user = require("../../api/user.js");
if (!Array) {
  const _easycom_uni_badge2 = common_vendor.resolveComponent("uni-badge");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_badge2 + _easycom_uni_card2 + _easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_forms2)();
}
const _easycom_uni_badge = () => "../../uni_modules/uni-badge/components/uni-badge/uni-badge.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_badge + _easycom_uni_card + _easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    var _a, _b, _c;
    const defaultUser = {
      nickname: "未登录",
      avatar: "/static/uni.png",
      loggedIn: false,
      points: 0
    };
    const fallbackUser = () => api_user.normalizeUser(api_user.getCachedProfile()) || defaultUser;
    const user = common_vendor.ref(fallbackUser());
    const progress = common_vendor.ref(api_progress.emptyProgress());
    const formModel = common_vendor.reactive({
      nickname: ((_a = user.value) == null ? void 0 : _a.nickname) || "",
      avatar: ((_b = user.value) == null ? void 0 : _b.avatar) || "",
      email: ((_c = user.value) == null ? void 0 : _c.email) || ""
    });
    const rules = {
      nickname: {
        rules: [{ required: true, errorMessage: "请输入昵称" }]
      }
    };
    const formRef = common_vendor.ref(null);
    const loadData = async () => {
      try {
        const profile = await api_user.fetchProfile();
        user.value = profile || fallbackUser();
      } catch (err) {
        user.value = fallbackUser();
      }
      formModel.nickname = user.value.nickname || "";
      formModel.avatar = user.value.avatar || "";
      formModel.email = user.value.email || "";
      try {
        progress.value = await api_progress.fetchProgressSummary();
      } catch (err) {
        progress.value = api_progress.emptyProgress();
      }
    };
    const getWxProfile = async () => {
      if (!common_vendor.index.getUserProfile)
        return {};
      const res = await common_vendor.index.getUserProfile({ desc: "用于完善个人资料" });
      return (res == null ? void 0 : res.userInfo) || {};
    };
    const handleWeixinLogin = async () => {
      try {
        common_vendor.index.showLoading({ title: "登录中" });
        const profile = await getWxProfile().catch(() => ({}));
        const resp = await api_auth.wechatLogin({
          nickname: profile.nickName || profile.nickname,
          avatar: profile.avatarUrl || profile.avatar
        });
        user.value = resp.user || fallbackUser();
        await loadData();
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/profile/index.vue:122", err);
        common_vendor.index.showToast({ title: err.message || "登录失败，稍后再试", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleSave = async () => {
      if (!formRef.value)
        return;
      try {
        await formRef.value.validate();
        if (formModel.email && !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(formModel.email)) {
          common_vendor.index.showToast({ title: "邮箱格式不正确", icon: "none" });
          return;
        }
        const info = await api_user.updateProfile({
          nickname: formModel.nickname,
          avatar: formModel.avatar,
          email: formModel.email
        });
        user.value = info || fallbackUser();
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
      } catch (err) {
        if (err == null ? void 0 : err.errMsg) {
          common_vendor.index.showToast({ title: err.errMsg, icon: "none" });
        } else {
          common_vendor.index.showToast({ title: "保存失败", icon: "none" });
        }
      }
    };
    const goRecords = () => {
      common_vendor.index.switchTab({ url: "/pages/records/index" });
    };
    common_vendor.onShow(() => {
      loadData();
    });
    return (_ctx, _cache) => {
      return {
        a: user.value.avatar || "/static/uni.png",
        b: common_vendor.t(user.value.nickname || "未登录"),
        c: common_vendor.p({
          text: "积分",
          type: "primary"
        }),
        d: common_vendor.t(user.value.points || 0),
        e: common_vendor.t(user.value.loggedIn ? "重新登录" : "微信登录"),
        f: common_vendor.o(handleWeixinLogin),
        g: common_vendor.p({
          ["is-shadow"]: false
        }),
        h: common_vendor.o(($event) => formModel.nickname = $event),
        i: common_vendor.p({
          placeholder: "请输入昵称",
          modelValue: formModel.nickname
        }),
        j: common_vendor.p({
          label: "昵称",
          name: "nickname"
        }),
        k: common_vendor.o(($event) => formModel.avatar = $event),
        l: common_vendor.p({
          placeholder: "可填写自定义头像链接",
          modelValue: formModel.avatar
        }),
        m: common_vendor.p({
          label: "头像 URL",
          name: "avatar"
        }),
        n: common_vendor.o(($event) => formModel.email = $event),
        o: common_vendor.p({
          placeholder: "邮箱（可选）",
          modelValue: formModel.email
        }),
        p: common_vendor.p({
          label: "邮箱",
          name: "email"
        }),
        q: common_vendor.sr(formRef, "201c0da5-3,201c0da5-2", {
          "k": "formRef"
        }),
        r: common_vendor.p({
          modelValue: formModel,
          rules,
          ["label-position"]: "top"
        }),
        s: common_vendor.o(handleSave),
        t: common_vendor.p({
          title: "个人信息",
          ["is-shadow"]: false
        }),
        v: common_vendor.t(progress.value.answeredQuestions),
        w: common_vendor.t(progress.value.totalQuestions),
        x: common_vendor.t(progress.value.correctRate),
        y: common_vendor.o(goRecords),
        z: common_vendor.p({
          title: "学习进度",
          ["is-shadow"]: false
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
