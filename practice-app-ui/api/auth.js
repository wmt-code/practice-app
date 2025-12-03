import { clearTokens, getStoredUser, request, setStoredUser, setTokens } from './http';
import { normalizeUser } from './user';

export async function getWxCode() {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    if (!uni || !uni.login) {
      reject(new Error('uni.login 不存在，当前不是正确的小程序运行环境'));
      return;
    }

    uni.login({
      // provider 在微信小程序里写不写都行，这里保留也没问题
      provider: 'weixin',
      success: (res) => {
        console.log('uni.login success 原始返回：', res);
        const { code } = res || {};
        if (code) {
          console.log('获取到登录 code：', code);
          resolve(code);
        } else {
          reject(new Error('uni.login 调用成功，但未获取到 code'));
        }
      },
      fail: (err) => {
        console.log('uni.login fail：', err);
        reject(err);
      },
    });
    // #endif

    // #ifndef MP-WEIXIN
    reject(new Error('当前不是微信小程序环境（MP-WEIXIN）'));
    // #endif
  });
}

export async function wechatLogin({ code, nickname, avatar } = {}) {
  const ensuredCode = code || (await getWxCode());
  const data = await request({
    url: '/auth/wechat',
    method: 'POST',
    data: { code: ensuredCode, nickname, avatar },
    auth: false,
  });
  const normalizedUser = normalizeUser(data?.user);
  if (data?.accessToken) {
    setTokens(data.accessToken, data.refreshToken);
  }
  if (normalizedUser) {
    setStoredUser(normalizedUser);
  }
  return { ...data, user: normalizedUser };
}

export function logout() {
  clearTokens();
  setStoredUser(null);
  return getStoredUser();
}
