"use strict";
const common_vendor = require("../common/vendor.js");
const api_http = require("./http.js");
const api_user = require("./user.js");
async function getWxCode() {
  return new Promise((resolve, reject) => {
    if (!common_vendor.index || !common_vendor.index.login) {
      reject(new Error("uni.login 不存在，当前不是正确的小程序运行环境"));
      return;
    }
    common_vendor.index.login({
      // provider 在微信小程序里写不写都行，这里保留也没问题
      provider: "weixin",
      success: (res) => {
        common_vendor.index.__f__("log", "at api/auth.js:16", "uni.login success 原始返回：", res);
        const { code } = res || {};
        if (code) {
          common_vendor.index.__f__("log", "at api/auth.js:19", "获取到登录 code：", code);
          resolve(code);
        } else {
          reject(new Error("uni.login 调用成功，但未获取到 code"));
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("log", "at api/auth.js:26", "uni.login fail：", err);
        reject(err);
      }
    });
  });
}
async function wechatLogin({ code, nickname, avatar } = {}) {
  const ensuredCode = code || await getWxCode();
  const data = await api_http.request({
    url: "/auth/wechat",
    method: "POST",
    data: { code: ensuredCode, nickname, avatar },
    auth: false
  });
  const normalizedUser = api_user.normalizeUser(data == null ? void 0 : data.user);
  if (data == null ? void 0 : data.accessToken) {
    api_http.setTokens(data.accessToken, data.refreshToken);
  }
  if (normalizedUser) {
    api_http.setStoredUser(normalizedUser);
  }
  return { ...data, user: normalizedUser };
}
exports.wechatLogin = wechatLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/auth.js.map
