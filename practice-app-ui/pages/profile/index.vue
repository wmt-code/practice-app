• <template>
    <view class="page">
      <uni-card :is-shadow="false" class="profile-card">
        <view class="profile-header">
          <image :src="previewAvatar" class="avatar" mode="aspectFill" />
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
            <!-- #ifdef MP-WEIXIN -->
            <input
              class="uni-input"
              type="nickname"
              :value="formModel.nickname"
              placeholder="点击上方按钮可一键使用微信昵称"
              @input="(e) => (formModel.nickname = e.detail.value)"
            />
            <!-- #endif -->
            <!-- #ifndef MP-WEIXIN -->
            <uni-easyinput v-model="formModel.nickname" placeholder="请输入昵称" />
            <!-- #endif -->
          </uni-forms-item>
          <uni-forms-item label="头像 URL" name="avatar">
            <uni-easyinput v-model="formModel.avatar" placeholder="可填写自定义头像链接" />
          </uni-forms-item>
          <uni-forms-item label="选择头像" name="avatarLocal">
            <view class="avatar-row">
              <button
                class="ghost-btn"
                size="mini"
                open-type="chooseAvatar"
                v-if="isWeixin"
                @chooseavatar="handleChooseAvatar"
              >
                从微信头像选择
              </button>
              <button class="ghost-btn" size="mini" @tap="handleChooseImage">从相册上传</button>
            </view>
            <view class="muted">优先上传头像，其次使用填写的头像 URL</view>
          </uni-forms-item>
          <uni-forms-item label="邮箱" name="email">
            <uni-easyinput v-model="formModel.email" placeholder="邮箱（可选）" />
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
            <text class="muted">总题量</text>
          </view>
          <view class="stat">
            <text class="stat-num">{{ progress.correctRate }}%</text>
            <text class="muted">正确率</text>
          </view>
        </view>
        <button class="ghost-btn" @tap="goRecords">查看答题记录</button>
    </uni-card>

    <view v-if="showProfileCard" class="overlay">
      <view class="profile-popup">
        <view class="popup-title">完善头像昵称</view>
        <view class="row popup-row">
          <image :src="previewAvatar" class="avatar" mode="aspectFill" />
          <view class="muted">选择头像并填写昵称后保存</view>
        </view>
        <view class="avatar-row">
          <button
            class="ghost-btn"
            size="mini"
            open-type="chooseAvatar"
            v-if="isWeixin"
            @chooseavatar="handleChooseAvatar"
          >
            从微信头像选择
          </button>
          <button class="ghost-btn" size="mini" @tap="handleChooseImage">从相册上传</button>
        </view>
        <view class="popup-field">
          <!-- #ifdef MP-WEIXIN -->
          <input
            class="uni-input"
            type="nickname"
            :value="formModel.nickname"
            placeholder="点击选择微信昵称或手动输入"
            @input="(e) => (formModel.nickname = e.detail.value)"
          />
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <uni-easyinput v-model="formModel.nickname" placeholder="请输入昵称" />
          <!-- #endif -->
        </view>
        <view class="popup-actions">
          <button class="ghost-btn" @tap="closeProfileCard">稍后再说</button>
          <button type="primary" class="primary-btn" @tap="handleSave">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>
  <script setup>
  import { reactive, ref, computed } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import { wechatLogin } from '@/api/auth';
import { emptyProgress, fetchProgressSummary } from '@/api/progress';
import {
  fetchProfile,
  getCachedProfile,
  normalizeUser,
  updateProfile,
  uploadAvatar,
} from '@/api/user';

const defaultUser = {
  nickname: '未登录',
  avatar: '/static/uni.png',
  loggedIn: false,
  points: 0,
};

  const fallbackUser = () => normalizeUser(getCachedProfile()) || defaultUser;

const user = ref(fallbackUser());
const progress = ref(emptyProgress());
const isWeixin = ref(false);
const showProfileCard = ref(false);

  const formModel = reactive({
    nickname: user.value?.nickname || '',
    avatar: user.value?.avatar || '',
    email: user.value?.email || '',
    avatarLocal: '',
  });

  const rules = {
    nickname: {
      rules: [{ required: true, errorMessage: '请输入昵称' }],
    },
  };

  const formRef = ref(null);
  const previewAvatar = computed(() => formModel.avatarLocal || formModel.avatar || '/static/uni.png');

  const loadData = async () => {
    try {
      const profile = await fetchProfile();
      user.value = profile || fallbackUser();
    } catch (err) {
      user.value = fallbackUser();
    }
    formModel.nickname = user.value.nickname || '';
    formModel.avatar = user.value.avatar || '';
    formModel.email = user.value.email || '';
    try {
      progress.value = await fetchProgressSummary();
    } catch (err) {
      progress.value = emptyProgress();
    }
  };

  const handleChooseAvatar = (e) => {
    const avatarUrl = e?.detail?.avatarUrl;
    if (avatarUrl) {
      formModel.avatarLocal = avatarUrl;
    }
	console.log(avatarUrl)
  };

  const handleChooseImage = () => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed', 'original'],
      success: (res) => {
        const path = res.tempFilePaths?.[0];
        if (path) {
          formModel.avatarLocal = path;
        }
      },
    });
  };

const handleWeixinLogin = async () => {
  try {
    uni.showLoading({ title: '登录中' });
    const resp = await wechatLogin();
    user.value = resp.user || fallbackUser();
    await loadData();
    showProfileCard.value = true; // 登录后提示完善头像昵称
    uni.showToast({ title: '登录成功', icon: 'success' });
  } catch (err) {
    console.error(err);
    uni.showToast({ title: err.message || '登录失败，稍后再试', icon: 'none' });
  } finally {
    uni.hideLoading();
    }
  };

const handleSave = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    if (formModel.email && !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(formModel.email)) {
        uni.showToast({ title: '邮箱格式不正确', icon: 'none' });
        return;
      }
      let avatarUrlToSave = formModel.avatar;
      if (formModel.avatarLocal) {
        avatarUrlToSave = await uploadAvatar(formModel.avatarLocal);
      }
    const info = await updateProfile({
      nickname: formModel.nickname,
      avatar: avatarUrlToSave,
      email: formModel.email,
    });
    user.value = info || fallbackUser();
    showProfileCard.value = false;
    uni.showToast({ title: '保存成功', icon: 'success' });
    return true;
  } catch (err) {
    if (err?.errMsg) {
      uni.showToast({ title: err.errMsg, icon: 'none' });
    } else {
      uni.showToast({ title: '保存失败', icon: 'none' });
    }
    return false;
  }
};

const goRecords = () => {
  uni.switchTab({ url: '/pages/records/index' });
};

const closeProfileCard = () => {
  showProfileCard.value = false;
};

onShow(() => {
  try {
    const info = uni.getSystemInfoSync && uni.getSystemInfoSync();
    isWeixin.value = info?.uniPlatform === 'mp-weixin' || info?.appName === 'WeChat';
  } catch (e) {
      isWeixin.value = false;
    }
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

  .avatar-row {
    display: flex;
    gap: 12rpx;
    flex-wrap: wrap;
    margin-top: 8rpx;
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
