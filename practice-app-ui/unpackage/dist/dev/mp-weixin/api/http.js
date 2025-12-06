"use strict";
const common_vendor = require("../common/vendor.js");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
var define_import_meta_env_default = { VITE_CJS_IGNORE_WARNING: "true", VITE_ROOT_DIR: "E:/project/practice-app/practice-app-ui", VITE_USER_NODE_ENV: "development", BASE_URL: "/", MODE: "development", DEV: true, PROD: false, SSR: false };
const ACCESS_TOKEN_KEY = "practice_app_access_token";
const REFRESH_TOKEN_KEY = "practice_app_refresh_token";
const USER_CACHE_KEY = "practice_app_user";
const DEFAULT_BASE = "http://localhost:8888/api";
const API_BASE = (() => {
  let base = DEFAULT_BASE;
  try {
    if (typeof { url: typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.src || new URL("api/http.js", document.baseURI).href } !== "undefined" && define_import_meta_env_default && define_import_meta_env_default.VITE_API_BASE_URL) {
      base = define_import_meta_env_default.VITE_API_BASE_URL;
    } else if (typeof process !== "undefined" && process.env && process.env.API_BASE_URL) {
      base = process.env.API_BASE_URL;
    }
  } catch (err) {
  }
  return (base || DEFAULT_BASE).replace(/\/$/, "");
})();
function safeGetStorage(key) {
  if (typeof common_vendor.index === "undefined")
    return null;
  try {
    return common_vendor.index.getStorageSync(key);
  } catch (err) {
    common_vendor.index.__f__("warn", "at api/http.js:26", "read storage failed", err);
    return null;
  }
}
function safeSetStorage(key, value) {
  if (typeof common_vendor.index === "undefined")
    return;
  try {
    common_vendor.index.setStorageSync(key, value);
  } catch (err) {
    common_vendor.index.__f__("warn", "at api/http.js:36", "write storage failed", err);
  }
}
function safeRemoveStorage(key) {
  if (typeof common_vendor.index === "undefined")
    return;
  try {
    common_vendor.index.removeStorageSync(key);
  } catch (err) {
    common_vendor.index.__f__("warn", "at api/http.js:45", "remove storage failed", err);
  }
}
function getAccessToken() {
  return safeGetStorage(ACCESS_TOKEN_KEY);
}
function setTokens(accessToken, refreshToken) {
  if (accessToken) {
    safeSetStorage(ACCESS_TOKEN_KEY, accessToken);
  } else {
    safeRemoveStorage(ACCESS_TOKEN_KEY);
  }
  if (refreshToken) {
    safeSetStorage(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    safeRemoveStorage(REFRESH_TOKEN_KEY);
  }
}
function clearTokens() {
  safeRemoveStorage(ACCESS_TOKEN_KEY);
  safeRemoveStorage(REFRESH_TOKEN_KEY);
}
function getStoredUser() {
  return safeGetStorage(USER_CACHE_KEY);
}
function setStoredUser(user) {
  if (!user) {
    safeRemoveStorage(USER_CACHE_KEY);
  } else {
    safeSetStorage(USER_CACHE_KEY, user);
  }
}
function buildUrl(url) {
  if (!url)
    return API_BASE;
  return `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
}
function doRequest(options) {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      ...options,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });
}
async function request({ url, method = "GET", data = {}, header = {}, auth = true }) {
  var _a, _b;
  const finalHeaders = { "Content-Type": "application/json", ...header };
  if (auth) {
    const token = getAccessToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }
  const fullUrl = buildUrl(url || "");
  const res = await doRequest({ url: fullUrl, method, data, header: finalHeaders });
  const status = res.statusCode;
  if (status === 401) {
    clearTokens();
    setStoredUser(null);
    throw new Error("未登录或登录已过期");
  }
  if (status >= 400) {
    const message = ((_a = res.data) == null ? void 0 : _a.message) || ((_b = res.data) == null ? void 0 : _b.msg) || "请求失败";
    throw new Error(message);
  }
  const body = res.data;
  if (body && body.success === false) {
    throw new Error(body.message || "请求失败");
  }
  return body && Object.prototype.hasOwnProperty.call(body, "data") ? body.data : body;
}
async function upload({ url, filePath, name = "file", formData = {}, header = {}, auth = true }) {
  const fullUrl = buildUrl(url || "");
  const finalHeaders = { ...header };
  if (auth) {
    const token = getAccessToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: fullUrl,
      filePath,
      name,
      formData,
      header: finalHeaders,
      success: (res) => {
        if (res.statusCode === 401) {
          clearTokens();
          setStoredUser(null);
          reject(new Error("未登录或登录已过期"));
          return;
        }
        if (res.statusCode >= 400) {
          reject(new Error(res.data || "上传失败"));
          return;
        }
        try {
          const body = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          if (body && body.success === false) {
            reject(new Error(body.message || "上传失败"));
          } else {
            resolve(body && Object.prototype.hasOwnProperty.call(body, "data") ? body.data : body);
          }
        } catch (err) {
          reject(new Error("上传结果解析失败"));
        }
      },
      fail: (err) => reject(err)
    });
  });
}
exports.API_BASE = API_BASE;
exports.getStoredUser = getStoredUser;
exports.request = request;
exports.setStoredUser = setStoredUser;
exports.setTokens = setTokens;
exports.upload = upload;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/http.js.map
