<template>
  <view class="page">
    <view class="tab-bar">
      <view :class="['tab', type === 'moment' && 'active']" @click="switchType('moment')">帖子</view>
      <view :class="['tab', type === 'case' && 'active']" @click="switchType('case')">案例</view>
    </view>

    <!-- 帖子收藏 -->
    <view v-if="type === 'moment'">
      <view v-for="item in list" :key="'m'+item.id" class="moment-item" @click="goMomentDetail(item.id)">
        <text class="moment-content">{{ item.content || '[图片]' }}</text>
        <text class="moment-time">{{ item.fav_time }}</text>
      </view>
    </view>

    <!-- 案例收藏 -->
    <view v-if="type === 'case'">
      <view v-for="item in list" :key="'c'+item.id" class="case-item">
        <image :src="item.cover" mode="aspectFill" class="case-cover" />
        <view class="case-info">
          <text class="case-title">{{ item.title }}</text>
          <text class="case-time">{{ item.fav_time }}</text>
        </view>
      </view>
    </view>

    <view v-if="list.length === 0 && !loading" class="empty">暂无收藏</view>
  </view>
</template>

<script>
import { getMyFavorites } from '@/api/my.js';

export default {
  data() {
    return { type: 'moment', list: [], loading: false };
  },
  onShow() {
    this.loadData();
  },
  methods: {
    switchType(t) { this.type = t; this.loadData(); },
    async loadData() {
      this.loading = true;
      try {
        const res = await getMyFavorites({ type: this.type, page: 1, limit: 50 });
        this.list = res.data.list || [];
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    goMomentDetail(id) {
      uni.navigateTo({ url: '/pages/moment/detail?id=' + id });
    },
  },
};
</script>

<style>
.page { background: #f5f5f5; min-height: 100vh; }
.tab-bar { display: flex; background: #fff; }
.tab { flex: 1; text-align: center; padding: 24rpx; font-size: 28rpx; color: #666; border-bottom: 4rpx solid transparent; }
.tab.active { color: #e93323; border-bottom-color: #e93323; }
.moment-item { background: #fff; padding: 30rpx; margin: 10rpx 0; }
.moment-content { font-size: 28rpx; color: #333; display: block; }
.moment-time { font-size: 24rpx; color: #999; margin-top: 10rpx; display: block; }
.case-item { display: flex; background: #fff; padding: 20rpx; margin: 10rpx 0; }
.case-cover { width: 160rpx; height: 120rpx; border-radius: 8rpx; }
.case-info { margin-left: 20rpx; flex: 1; }
.case-title { font-size: 28rpx; color: #333; }
.case-time { font-size: 24rpx; color: #999; margin-top: 10rpx; display: block; }
.empty { text-align: center; padding: 60rpx; font-size: 28rpx; color: #999; }
</style>
