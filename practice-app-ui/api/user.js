import { request, getStoredUser, setStoredUser } from './http';

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
    points: user.points ?? 0,
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
