"use strict";
const common_vendor = require("../../common/vendor.js");
const api_auth = require("../../api/auth.js");
const api_progress = require("../../api/progress.js");
const api_user = require("../../api/user.js");
if (!Array) {
  const _easycom_uni_badge2 = common_vendor.resolveComponent("uni-badge");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_badge2 + _easycom_uni_card2 + _easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_forms2)();
}
const _easycom_uni_badge = () => "../../uni_modules/uni-badge/components/uni-badge/uni-badge.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_badge + _easycom_uni_card + _easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_forms)();
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
    const isWeixin = common_vendor.ref(false);
    const showProfileCard = common_vendor.ref(false);
    const formModel = common_vendor.reactive({
      nickname: ((_a = user.value) == null ? void 0 : _a.nickname) || "",
      avatar: ((_b = user.value) == null ? void 0 : _b.avatar) || "",
      email: ((_c = user.value) == null ? void 0 : _c.email) || "",
      avatarLocal: ""
    });
    const rules = {
      nickname: {
        rules: [{ required: true, errorMessage: "请输入昵称" }]
      }
    };
    const formRef = common_vendor.ref(null);
    const previewAvatar = common_vendor.computed(() => formModel.avatarLocal || formModel.avatar || "/static/uni.png");
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
    const handleChooseAvatar = (e) => {
      var _a2;
      const avatarUrl = (_a2 = e == null ? void 0 : e.detail) == null ? void 0 : _a2.avatarUrl;
      if (avatarUrl) {
        formModel.avatarLocal = avatarUrl;
      }
    };
    const handleChooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed", "original"],
        success: (res) => {
          var _a2;
          const path = (_a2 = res.tempFilePaths) == null ? void 0 : _a2[0];
          if (path) {
            formModel.avatarLocal = path;
          }
        }
      });
    };
    const handleWeixinLogin = async () => {
      try {
        common_vendor.index.showLoading({ title: "登录中" });
        const resp = await api_auth.wechatLogin();
        user.value = resp.user || fallbackUser();
        await loadData();
        showProfileCard.value = true;
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/profile/index.vue:208", err);
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
        let avatarUrlToSave = formModel.avatar;
        if (formModel.avatarLocal) {
          avatarUrlToSave = await api_user.uploadAvatar(formModel.avatarLocal);
        }
        const info = await api_user.updateProfile({
          nickname: formModel.nickname,
          avatar: avatarUrlToSave,
          email: formModel.email
        });
        user.value = info || fallbackUser();
        showProfileCard.value = false;
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        return true;
      } catch (err) {
        if (err == null ? void 0 : err.errMsg) {
          common_vendor.index.showToast({ title: err.errMsg, icon: "none" });
        } else {
          common_vendor.index.showToast({ title: "保存失败", icon: "none" });
        }
        return false;
      }
    };
    const goRecords = () => {
      common_vendor.index.switchTab({ url: "/pages/records/index" });
    };
    const closeProfileCard = () => {
      showProfileCard.value = false;
    };
    common_vendor.onShow(() => {
      try {
        const info = common_vendor.index.getSystemInfoSync && common_vendor.index.getSystemInfoSync();
        isWeixin.value = (info == null ? void 0 : info.uniPlatform) === "mp-weixin" || (info == null ? void 0 : info.appName) === "WeChat";
      } catch (e) {
        isWeixin.value = false;
      }
      loadData();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: previewAvatar.value,
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
        h: formModel.nickname,
        i: common_vendor.o((e) => formModel.nickname = e.detail.value),
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
        n: isWeixin.value
      }, isWeixin.value ? {
        o: common_vendor.o(handleChooseAvatar)
      } : {}, {
        p: common_vendor.o(handleChooseImage),
        q: common_vendor.p({
          label: "选择头像",
          name: "avatarLocal"
        }),
        r: common_vendor.o(($event) => formModel.email = $event),
        s: common_vendor.p({
          placeholder: "邮箱（可选）",
          modelValue: formModel.email
        }),
        t: common_vendor.p({
          label: "邮箱",
          name: "email"
        }),
        v: common_vendor.sr(formRef, "201c0da5-3,201c0da5-2", {
          "k": "formRef"
        }),
        w: common_vendor.p({
          modelValue: formModel,
          rules,
          ["label-position"]: "top"
        }),
        x: common_vendor.o(handleSave),
        y: common_vendor.p({
          title: "个人信息",
          ["is-shadow"]: false
        }),
        z: common_vendor.t(progress.value.answeredQuestions),
        A: common_vendor.t(progress.value.totalQuestions),
        B: common_vendor.t(progress.value.correctRate),
        C: common_vendor.o(goRecords),
        D: common_vendor.p({
          title: "学习进度",
          ["is-shadow"]: false
        }),
        E: showProfileCard.value
      }, showProfileCard.value ? common_vendor.e({
        F: previewAvatar.value,
        G: isWeixin.value
      }, isWeixin.value ? {
        H: common_vendor.o(handleChooseAvatar)
      } : {}, {
        I: common_vendor.o(handleChooseImage),
        J: formModel.nickname,
        K: common_vendor.o((e) => formModel.nickname = e.detail.value),
        L: common_vendor.o(closeProfileCard),
        M: common_vendor.o(handleSave)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
