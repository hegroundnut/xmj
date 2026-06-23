<template>
  <view class="page">
    <view class="filter-bar">
      <view :class="['filter-item', type === 0 && 'active']" @click="switchType(0)">全部</view>
      <view :class="['filter-item', type === 1 && 'active']" @click="switchType(1)">图片</view>
      <view :class="['filter-item', type === 2 && 'active']" @click="switchType(2)">视频</view>
    </view>
    <view class="case-grid">
      <view v-for="item in list" :key="item.id" class="case-item" @click="previewCase(item)">
        <image :src="item.cover" mode="aspectFill" class="case-img" />
        <view v-if="item.type === 2" class="video-badge">▶</view>
        <text class="case-name">{{ item.title }}</text>
      </view>
    </view>
    <view v-if="list.length === 0 && !loading" class="empty">暂无案例</view>
    <view v-if="loading" class="loading">加载中...</view>
    <view v-if="hasMore && !loading" class="load-more" @click="loadMore">加载更多</view>
  </view>
</template>

<script>
import { getCaseList } from '@/api/case.js';

export default {
  data() {
    return { type: 0, list: [], page: 1, loading: false, hasMore: true };
  },
  onShow() {
    this.page = 1;
    this.list = [];
    this.hasMore = true;
    this.loadData();
  },
  methods: {
    switchType(t) {
      this.type = t;
      this.page = 1;
      this.list = [];
      this.hasMore = true;
      this.loadData();
    },
    async loadData() {
      if (this.loading) return;
      this.loading = true;
      try {
        const params = { page: this.page, limit: 10 };
        if (this.type > 0) params.type = this.type;
        const res = await getCaseList(params);
        const data = res.data.list || [];
        this.list = this.list.concat(data);
        this.hasMore = data.length >= 10;
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      this.page++;
      this.loadData();
    },
    previewCase(item) {
      const urls = [item.media_url || item.cover];
      uni.previewImage({ urls, current: urls[0] });
    },
  },
};
</script>

<style>
.page { background: #f5f5f5; min-height: 100vh; }
.filter-bar { display: flex; background: #fff; padding: 20rpx; }
.filter-item { flex: 1; text-align: center; font-size: 28rpx; color: #666; padding: 10rpx 0; }
.filter-item.active { color: #e93323; font-weight: bold; }
.case-grid { display: flex; flex-wrap: wrap; padding: 10rpx; }
.case-item { width: 48%; margin: 1%; background: #fff; border-radius: 10rpx; overflow: hidden; position: relative; }
.case-img { width: 100%; height: 280rpx; }
.case-name { display: block; padding: 10rpx; font-size: 26rpx; color: #333; }
.video-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 60rpx; color: rgba(255,255,255,0.9); }
.empty, .loading, .load-more { text-align: center; padding: 40rpx; font-size: 28rpx; color: #999; }
.load-more { color: #e93323; }
</style>
