"use strict";
const common_vendor = require("../../common/vendor.js");
const api_mock = require("../../api/mock.js");
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
    const user = common_vendor.ref({});
    const progress = common_vendor.ref({
      answeredQuestions: 0,
      totalQuestions: 0,
      correctRate: 0
    });
    const formModel = common_vendor.reactive({
      nickname: "",
      avatar: "",
      password: ""
    });
    const rules = {
      nickname: {
        rules: [{ required: true, errorMessage: "请输入昵称" }]
      },
      password: {
        rules: [{ minLength: 6, errorMessage: "密码长度至少 6 位" }]
      }
    };
    const formRef = common_vendor.ref(null);
    const loadData = async () => {
      const [userInfo, progressInfo] = await Promise.all([api_mock.fetchCurrentUser(), api_mock.fetchProgress()]);
      user.value = userInfo;
      progress.value = progressInfo;
      formModel.nickname = userInfo.nickname || "";
      formModel.avatar = userInfo.avatar || "";
      formModel.password = "";
    };
    const handleWeixinLogin = async () => {
      try {
        common_vendor.index.showLoading({ title: "登录中" });
        if (common_vendor.index.login) {
          await new Promise((resolve) => {
            common_vendor.index.login({
              provider: "weixin",
              success: resolve,
              fail: resolve
            });
          });
        }
        let profile = {};
        if (common_vendor.index.getUserProfile) {
          const res = await common_vendor.index.getUserProfile({ desc: "用于完善个人资料" });
          profile = res.userInfo || {};
        }
        const info = await api_mock.loginWithWeixin(profile);
        user.value = info;
        loadData();
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/profile/index.vue:120", err);
        common_vendor.index.showToast({ title: "登录失败，稍后再试", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleSave = async () => {
      if (!formRef.value)
        return;
      try {
        await formRef.value.validate();
        const info = await api_mock.updateUserProfile({
          nickname: formModel.nickname,
          avatar: formModel.avatar,
          password: formModel.password
        });
        user.value = info;
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
        n: common_vendor.o(($event) => formModel.password = $event),
        o: common_vendor.p({
          type: "password",
          placeholder: "6-20 位新密码",
          modelValue: formModel.password
        }),
        p: common_vendor.p({
          label: "密码",
          name: "password"
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
