const ACCESS_TOKEN_KEY = 'practice_app_access_token';
const REFRESH_TOKEN_KEY = 'practice_app_refresh_token';
const USER_CACHE_KEY = 'practice_app_user';

const DEFAULT_BASE = 'http://localhost:8888/api';

const API_BASE = (() => {
  let base = DEFAULT_BASE;
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      base = import.meta.env.VITE_API_BASE_URL;
    } else if (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) {
      base = process.env.API_BASE_URL;
    }
  } catch (err) {
    // ignore env resolution errors
  }
  return (base || DEFAULT_BASE).replace(/\/$/, '');
})();

function safeGetStorage(key) {
  if (typeof uni === 'undefined') return null;
  try {
    return uni.getStorageSync(key);
  } catch (err) {
    console.warn('read storage failed', err);
    return null;
  }
}

function safeSetStorage(key, value) {
  if (typeof uni === 'undefined') return;
  try {
    uni.setStorageSync(key, value);
  } catch (err) {
    console.warn('write storage failed', err);
  }
}

function safeRemoveStorage(key) {
  if (typeof uni === 'undefined') return;
  try {
    uni.removeStorageSync(key);
  } catch (err) {
    console.warn('remove storage failed', err);
  }
}

export function getAccessToken() {
  return safeGetStorage(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return safeGetStorage(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken, refreshToken) {
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

export function clearTokens() {
  safeRemoveStorage(ACCESS_TOKEN_KEY);
  safeRemoveStorage(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  return safeGetStorage(USER_CACHE_KEY);
}

export function setStoredUser(user) {
  if (!user) {
    safeRemoveStorage(USER_CACHE_KEY);
  } else {
    safeSetStorage(USER_CACHE_KEY, user);
  }
}

function buildUrl(url) {
  if (!url) return API_BASE;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
}

function doRequest(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    });
  });
}

export async function request({ url, method = 'GET', data = {}, header = {}, auth = true }) {
  const finalHeaders = { 'Content-Type': 'application/json', ...header };
  if (auth) {
    const token = getAccessToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }
  const fullUrl = buildUrl(url || '');
  const res = await doRequest({ url: fullUrl, method, data, header: finalHeaders });
  const status = res.statusCode;

  if (status === 401) {
    clearTokens();
    setStoredUser(null);
    throw new Error('未登录或登录已过期');
  }
  if (status >= 400) {
    const message = res.data?.message || res.data?.msg || '请求失败';
    throw new Error(message);
  }

  const body = res.data;
  if (body && body.success === false) {
    throw new Error(body.message || '请求失败');
  }
  return body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body;
}

export async function upload({ url, filePath, name = 'file', formData = {}, header = {}, auth = true }) {
  const fullUrl = buildUrl(url || '');
  const finalHeaders = { ...header };
  if (auth) {
    const token = getAccessToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: fullUrl,
      filePath,
      name,
      formData,
      header: finalHeaders,
      success: (res) => {
        if (res.statusCode === 401) {
          clearTokens();
          setStoredUser(null);
          reject(new Error('未登录或登录已过期'));
          return;
        }
        if (res.statusCode >= 400) {
          reject(new Error(res.data || '上传失败'));
          return;
        }
        try {
          const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          if (body && body.success === false) {
            reject(new Error(body.message || '上传失败'));
          } else {
            resolve(body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body);
          }
        } catch (err) {
          reject(new Error('上传结果解析失败'));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

export { API_BASE };
