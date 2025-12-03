"use strict";
const api_http = require("./http.js");
const DEFAULT_AVATAR = "/static/uni.png";
function normalizeUser(user) {
  if (!user) {
    return null;
  }
  return {
    ...user,
    nickname: user.nickname || user.username || "未登录",
    avatar: user.avatar || DEFAULT_AVATAR,
    loggedIn: !!user.id,
    points: user.points ?? 0
  };
}
async function fetchProfile() {
  const user = await api_http.request({ url: "/user/me", method: "GET" });
  const normalized = normalizeUser(user);
  if (normalized) {
    api_http.setStoredUser(normalized);
  }
  return normalized;
}
async function updateProfile(payload = {}) {
  const data = {
    nickname: payload.nickname,
    avatar: payload.avatar
  };
  if (payload.email) {
    data.email = payload.email;
  }
  await api_http.request({ url: "/user/me", method: "PUT", data });
  return fetchProfile();
}
function getCachedProfile() {
  const stored = api_http.getStoredUser();
  return stored ? normalizeUser(stored) : null;
}
async function uploadAvatar(filePath) {
  if (!filePath) {
    throw new Error("缺少头像文件路径");
  }
  const isRemote = /^https?:\/\//i.test(filePath);
  if (isRemote) {
    const res2 = await api_http.request({
      url: "/user/me/avatar",
      method: "POST",
      data: { avatarUrl: filePath }
    });
    return res2;
  }
  const res = await api_http.upload({ url: "/user/me/avatar", filePath, name: "file" });
  if (typeof res === "string")
    return res;
  if (res == null ? void 0 : res.url)
    return res.url;
  return res;
}
exports.fetchProfile = fetchProfile;
exports.getCachedProfile = getCachedProfile;
exports.normalizeUser = normalizeUser;
exports.updateProfile = updateProfile;
exports.uploadAvatar = uploadAvatar;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
