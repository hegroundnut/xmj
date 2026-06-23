<template>
  <view class="page">
    <view v-for="item in list" :key="item.id" class="booking-item">
      <text class="booking-title">{{ item.class_title }}</text>
      <text class="booking-detail">{{ item.class_date }} {{ item.start_time }}-{{ item.end_time }}</text>
      <text class="booking-addr">{{ item.address }}</text>
      <text class="booking-name">预约人: {{ item.name }} {{ item.phone }}</text>
      <text :class="['booking-status', item.status === 0 ? 'active' : 'cancel']">
        {{ item.status === 0 ? '已预约' : '已取消' }}
      </text>
    </view>
    <view v-if="list.length === 0 && !loading" class="empty">暂无预约记录</view>
  </view>
</template>

<script>
import { getMyBookings } from '@/api/my.js';

export default {
  data() { return { list: [], loading: false }; },
  onShow() { this.loadData(); },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const res = await getMyBookings({ page: 1, limit: 50 });
        this.list = res.data.list || [];
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>

<style>
.page { background: #f5f5f5; min-height: 100vh; }
.booking-item { background: #fff; padding: 30rpx; margin: 10rpx 0; }
.booking-title { font-size: 30rpx; color: #333; display: block; font-weight: bold; }
.booking-detail { font-size: 26rpx; color: #666; display: block; margin-top: 10rpx; }
.booking-addr { font-size: 24rpx; color: #999; display: block; margin-top: 6rpx; }
.booking-name { font-size: 26rpx; color: #333; display: block; margin-top: 10rpx; }
.booking-status { display: inline-block; margin-top: 10rpx; font-size: 24rpx; padding: 4rpx 16rpx; border-radius: 8rpx; }
.booking-status.active { background: #4caf50; color: #fff; }
.booking-status.cancel { background: #999; color: #fff; }
.empty { text-align: center; padding: 60rpx; font-size: 28rpx; color: #999; }
</style>
