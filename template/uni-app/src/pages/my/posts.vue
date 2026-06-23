<template>
  <view class="page">
    <view v-for="item in list" :key="item.id" class="post-item" @click="goDetail(item.id)">
      <text class="post-content">{{ item.content || '[图片/视频]' }}</text>
      <view class="post-meta">
        <text class="post-time">{{ item.add_time }}</text>
        <text class="post-stats">❤️{{ item.like_count }} 💬{{ item.comment_count }}</text>
      </view>
    </view>
    <view v-if="list.length === 0 && !loading" class="empty">暂无发帖</view>
  </view>
</template>

<script>
import { getMyPosts } from '@/api/my.js';

export default {
  data() { return { list: [], loading: false }; },
  onShow() { this.loadData(); },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const res = await getMyPosts({ page: 1, limit: 50 });
        this.list = res.data.list || [];
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/moment/detail?id=' + id });
    },
  },
};
</script>

<style>
.page { background: #f5f5f5; min-height: 100vh; }
.post-item { background: #fff; padding: 30rpx; margin: 10rpx 0; }
.post-content { font-size: 28rpx; color: #333; display: block; }
.post-meta { display: flex; justify-content: space-between; margin-top: 15rpx; }
.post-time { font-size: 24rpx; color: #999; }
.post-stats { font-size: 24rpx; color: #666; }
.empty { text-align: center; padding: 60rpx; font-size: 28rpx; color: #999; }
</style>
