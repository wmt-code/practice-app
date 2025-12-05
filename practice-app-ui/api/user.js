import { request, getStoredUser, setStoredUser, upload } from './http';

const DEFAULT_AVATAR = '/static/uni.png';

export function normalizeUser(user) {
  if (!user) {
    return null;
  }
  return {
    ...user,
    nickname: user.nickname || user.username || '未登录',
    avatar: user.avatar || DEFAULT_AVATAR,
    loggedIn: !!user.id,
  };
}

export async function fetchProfile() {
  const user = await request({ url: '/user/me', method: 'GET' });
  const normalized = normalizeUser(user);
  if (normalized) {
    setStoredUser(normalized);
  }
  return normalized;
}

export async function updateProfile(payload = {}) {
  const data = {
    nickname: payload.nickname,
    avatar: payload.avatar,
  };
  if (payload.email) {
    data.email = payload.email;
  }
  await request({ url: '/user/me', method: 'PUT', data });
  return fetchProfile();
}

export function getCachedProfile() {
  const stored = getStoredUser();
  return stored ? normalizeUser(stored) : null;
}

export async function uploadAvatar(filePath) {
  if (!filePath) {
    throw new Error('缺少头像文件路径');
  }
  const isRemote = /^https?:\/\//i.test(filePath);
  // 远程地址（如微信头像 CDN）直接走普通请求，后端会直接使用该 URL
  if (isRemote) {
    const res = await request({
      url: '/user/me/avatar',
      method: 'POST',
      data: { avatarUrl: filePath },
    });
    return res;
  }

  // 本地文件走文件上传
  const res = await upload({ url: '/user/me/avatar', filePath, name: 'file' });
  if (typeof res === 'string') return res;
  if (res?.url) return res.url;
  return res;
}
