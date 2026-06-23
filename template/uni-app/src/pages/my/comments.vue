<template>
  <view class="page">
    <view class="tab-bar">
      <view :class="['tab', type === 'case' && 'active']" @click="switchType('case')">案例评论</view>
      <view :class="['tab', type === 'moment' && 'active']" @click="switchType('moment')">朋友圈评论</view>
    </view>

    <view v-for="item in list" :key="item.id" class="comment-item">
      <text class="comment-content">{{ item.content }}</text>
      <text v-if="type === 'case'" class="comment-ref">案例: {{ item.case_title }}</text>
      <text v-else class="comment-ref">帖子: {{ item.moment_content }}</text>
      <text class="comment-time">{{ item.add_time }}</text>
    </view>
    <view v-if="list.length === 0 && !loading" class="empty">暂无评论</view>
  </view>
</template>

<script>
import { getMyComments } from '@/api/my.js';

export default {
  data() { return { type: 'case', list: [], loading: false }; },
  onShow() { this.loadData(); },
  methods: {
    switchType(t) { this.type = t; this.loadData(); },
    async loadData() {
      this.loading = true;
      try {
        const res = await getMyComments({ type: this.type, page: 1, limit: 50 });
        this.list = res.data.list || [];
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>

<style>
.page { background: #f5f5f5; min-height: 100vh; }
.tab-bar { display: flex; background: #fff; }
.tab { flex: 1; text-align: center; padding: 24rpx; font-size: 28rpx; color: #666; border-bottom: 4rpx solid transparent; }
.tab.active { color: #e93323; border-bottom-color: #e93323; }
.comment-item { background: #fff; padding: 30rpx; margin: 10rpx 0; }
.comment-content { font-size: 28rpx; color: #333; display: block; }
.comment-ref { font-size: 24rpx; color: #666; display: block; margin-top: 8rpx; }
.comment-time { font-size: 24rpx; color: #999; display: block; margin-top: 8rpx; }
.empty { text-align: center; padding: 60rpx; font-size: 28rpx; color: #999; }
</style>
