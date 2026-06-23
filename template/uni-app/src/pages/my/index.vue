<template>
  <view class="page">
    <!-- 用户信息区 -->
    <view class="user-card">
      <image :src="user.avatar || '/static/images/def_avatar.png'" mode="aspectFill" class="avatar" />
      <view class="user-info">
        <text class="nickname">{{ user.nickname || '未登录' }}</text>
        <text :class="['member-tag', user.is_teaching_member ? 'is-member' : 'no-member']">
          {{ user.is_teaching_member ? '会员' : '非会员' }}
        </text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="goPage('/pages/my/favorites')">
        <text class="menu-label">我的收藏</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages/my/courses')">
        <text class="menu-label">已购课程</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages/my/bookings')">
        <text class="menu-label">线下课预约</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages/my/comments')">
        <text class="menu-label">我的评论</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPage('/pages/my/posts')">
        <text class="menu-label">我的发帖</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo } from '@/api/my.js';

export default {
  data() {
    return { user: {} };
  },
  onShow() {
    this.loadUser();
  },
  methods: {
    async loadUser() {
      try {
        const res = await getUserInfo();
        this.user = res.data || {};
      } catch (e) {
        console.error('load user error', e);
      }
    },
    goPage(path) {
      uni.navigateTo({ url: path }).catch(() => {
        uni.showToast({ title: '页面跳转失败', icon: 'none' });
      });
    },
  },
};
</script>

<style>
.page { background: #f5f5f5; min-height: 100vh; }
.user-card { display: flex; align-items: center; background: #fff; padding: 40rpx 30rpx; margin-bottom: 20rpx; }
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; }
.user-info { margin-left: 20rpx; }
.nickname { font-size: 36rpx; color: #333; display: block; }
.member-tag { display: inline-block; margin-top: 10rpx; padding: 4rpx 16rpx; border-radius: 8rpx; font-size: 22rpx; }
.is-member { background: #4caf50; color: #fff; }
.no-member { background: #ff9800; color: #fff; }
.menu-list { background: #fff; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 30rpx; border-bottom: 1rpx solid #f0f0f0; }
.menu-label { font-size: 30rpx; color: #333; }
.menu-arrow { font-size: 36rpx; color: #ccc; }
</style>
