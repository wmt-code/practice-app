<template>
  <view class="page">
    <uni-card :is-shadow="false" class="profile-card">
      <view class="profile-header">
        <image :src="user.avatar || '/static/uni.png'" class="avatar" mode="aspectFill" />
        <view class="info">
          <view class="nickname">{{ user.nickname || '未登录' }}</view>
          <view class="row">
            <uni-badge text="积分" type="primary" />
            <text class="muted"> {{ user.points || 0 }}</text>
          </view>
        </view>
        <button size="mini" type="primary" class="login-btn" @tap="handleWeixinLogin">
          {{ user.loggedIn ? '重新登录' : '微信登录' }}
        </button>
      </view>
    </uni-card>

    <uni-card title="个人信息" :is-shadow="false">
      <uni-forms ref="formRef" :modelValue="formModel" :rules="rules" label-position="top">
        <uni-forms-item label="昵称" name="nickname">
          <uni-easyinput v-model="formModel.nickname" placeholder="请输入昵称" />
        </uni-forms-item>
        <uni-forms-item label="头像 URL" name="avatar">
          <uni-easyinput v-model="formModel.avatar" placeholder="可填写自定义头像链接" />
        </uni-forms-item>
        <uni-forms-item label="密码" name="password">
          <uni-easyinput type="password" v-model="formModel.password" placeholder="6-20 位新密码" />
        </uni-forms-item>
      </uni-forms>
      <button type="primary" class="primary-btn" @tap="handleSave">保存修改</button>
    </uni-card>

    <uni-card title="学习进度" :is-shadow="false">
      <view class="stats-row">
        <view class="stat">
          <text class="stat-num">{{ progress.answeredQuestions }}</text>
          <text class="muted">已完成</text>
        </view>
        <view class="stat">
          <text class="stat-num">{{ progress.totalQuestions }}</text>
          <text class="muted">总题目</text>
        </view>
        <view class="stat">
          <text class="stat-num">{{ progress.correctRate }}%</text>
          <text class="muted">正确率</text>
        </view>
      </view>
      <button class="ghost-btn" @tap="goRecords">查看答题记录</button>
    </uni-card>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import {
  fetchCurrentUser,
  fetchProgress,
  loginWithWeixin,
  updateUserProfile,
} from '@/api/mock.js';

const user = ref({});
const progress = ref({
  answeredQuestions: 0,
  totalQuestions: 0,
  correctRate: 0,
});

const formModel = reactive({
  nickname: '',
  avatar: '',
  password: '',
});

const rules = {
  nickname: {
    rules: [{ required: true, errorMessage: '请输入昵称' }],
  },
  password: {
    rules: [{ minLength: 6, errorMessage: '密码长度至少 6 位' }],
  },
};

const formRef = ref(null);

const loadData = async () => {
  const [userInfo, progressInfo] = await Promise.all([fetchCurrentUser(), fetchProgress()]);
  user.value = userInfo;
  progress.value = progressInfo;
  formModel.nickname = userInfo.nickname || '';
  formModel.avatar = userInfo.avatar || '';
  formModel.password = '';
};

const handleWeixinLogin = async () => {
  try {
    uni.showLoading({ title: '登录中' });
    // 微信环境下可直接获取用户信息；H5/APP 仍返回模拟数据
    if (uni.login) {
      await new Promise((resolve) => {
        uni.login({
          provider: 'weixin',
          success: resolve,
          fail: resolve,
        });
      });
    }
    let profile = {};
    if (uni.getUserProfile) {
      const res = await uni.getUserProfile({ desc: '用于完善个人资料' });
      profile = res.userInfo || {};
    }
    const info = await loginWithWeixin(profile);
    user.value = info;
    loadData();
    uni.showToast({ title: '登录成功', icon: 'success' });
  } catch (err) {
    console.error(err);
    uni.showToast({ title: '登录失败，稍后再试', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

const handleSave = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    const info = await updateUserProfile({
      nickname: formModel.nickname,
      avatar: formModel.avatar,
      password: formModel.password,
    });
    user.value = info;
    uni.showToast({ title: '保存成功', icon: 'success' });
  } catch (err) {
    if (err?.errMsg) {
      uni.showToast({ title: err.errMsg, icon: 'none' });
    } else {
      uni.showToast({ title: '保存失败', icon: 'none' });
    }
  }
};

const goRecords = () => {
  uni.switchTab({ url: '/pages/records/index' });
};

onShow(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.page {
  padding: 20rpx;
}

.profile-card {
  background: linear-gradient(135deg, #1f2937, #111827);
  color: #fff;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.nickname {
  font-size: 32rpx;
  font-weight: 700;
}

.row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.login-btn {
  background: #2563eb;
  color: #fff;
}

.primary-btn {
  width: 100%;
  margin-top: 12rpx;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.ghost-btn {
  width: 100%;
  margin-top: 12rpx;
  background: #f3f4f6;
  color: #1f2937;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  text-align: center;
}

.stat-num {
  font-size: 32rpx;
  font-weight: 700;
}

.muted {
  color: #6b7280;
}
</style>
