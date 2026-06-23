<template>
  <view class="page">
    <view v-for="item in list" :key="item.id" class="course-item">
      <image :src="item.course_cover" mode="aspectFill" class="course-cover" />
      <view class="course-info">
        <text class="course-title">{{ item.course_title }}</text>
        <text class="course-price">¥{{ item.price }}</text>
        <text class="course-time">购买时间: {{ item.pay_time }}</text>
      </view>
    </view>
    <view v-if="list.length === 0 && !loading" class="empty">暂无已购课程</view>
  </view>
</template>

<script>
import { getMyCourses } from '@/api/my.js';

export default {
  data() { return { list: [], loading: false }; },
  onShow() { this.loadData(); },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const res = await getMyCourses({ page: 1, limit: 50 });
        this.list = res.data.list || [];
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>

<style>
.page { background: #f5f5f5; min-height: 100vh; }
.course-item { display: flex; background: #fff; padding: 20rpx; margin: 10rpx 0; }
.course-cover { width: 160rpx; height: 120rpx; border-radius: 8rpx; }
.course-info { margin-left: 20rpx; flex: 1; }
.course-title { font-size: 28rpx; color: #333; display: block; }
.course-price { font-size: 26rpx; color: #e93323; display: block; margin-top: 8rpx; }
.course-time { font-size: 24rpx; color: #999; display: block; margin-top: 8rpx; }
.empty { text-align: center; padding: 60rpx; font-size: 28rpx; color: #999; }
</style>
