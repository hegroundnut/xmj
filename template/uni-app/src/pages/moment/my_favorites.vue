<template>
  <view class="favorites-page">
    <view v-if="list.length === 0 && loadStatus !== 'loading'" class="empty">暂无收藏</view>
    <view class="moment-item" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
      <view class="moment-header">
        <image :src="item.user_avatar || '/static/images/def_avatar.png'" class="avatar" mode="aspectFill" />
        <view class="user-info">
          <text class="nickname">{{ item.user_nickname || '用户' + item.uid }}</text>
          <text class="time">{{ item.add_time }}</text>
        </view>
        <text class="unfav-btn" @click.stop="handleUnfav(item)">取消收藏</text>
      </view>
      <text class="content-text">{{ item.content }}</text>
      <image v-if="item.images && item.images.length" :src="item.images[0]" mode="aspectFill" class="thumb" />
    </view>
    <view class="load-more">{{ loadStatus === 'noMore' ? '没有更多了' : loadStatus === 'loading' ? '加载中...' : '' }}</view>
  </view>
</template>

<script>
import { getFavorites, toggleFavorite } from '@/api/moment';

export default {
  data() {
    return {
      list: [],
      page: 1,
      limit: 10,
      loadStatus: 'more',
    };
  },
  onLoad() { this.loadList(); },
  onReachBottom() { this.loadList(); },
  methods: {
    async loadList() {
      if (this.loadStatus === 'loading' || this.loadStatus === 'noMore') return;
      this.loadStatus = 'loading';
      try {
        const res = await getFavorites({ page: this.page, limit: this.limit });
        const data = res.data || {};
        const newList = data.list || [];
        this.list = this.page === 1 ? newList : this.list.concat(newList);
        this.page++;
        this.loadStatus = newList.length < this.limit ? 'noMore' : 'more';
      } catch (e) { this.loadStatus = 'more'; }
    },
    goDetail(id) { uni.navigateTo({ url: `/pages/moment/detail?id=${id}` }); },
    async handleUnfav(item) {
      try {
        await toggleFavorite(item.id);
        this.list = this.list.filter(i => i.id !== item.id);
        uni.showToast({ title: '已取消收藏', icon: 'none' });
      } catch (e) {}
    },
  },
};
</script>

<style scoped>
.favorites-page { background: #f5f5f5; min-height: 100vh; padding: 16rpx; }
.empty { text-align: center; color: #999; padding: 100rpx 0; }
.moment-item { background: #fff; margin-bottom: 16rpx; border-radius: 12rpx; padding: 24rpx; }
.moment-header { display: flex; align-items: center; margin-bottom: 12rpx; }
.avatar { width: 56rpx; height: 56rpx; border-radius: 50%; margin-right: 12rpx; }
.user-info { flex: 1; }
.nickname { font-size: 26rpx; font-weight: bold; }
.time { font-size: 20rpx; color: #999; }
.unfav-btn { color: #f56c6c; font-size: 22rpx; }
.content-text { font-size: 28rpx; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
.thumb { width: 120rpx; height: 120rpx; border-radius: 6rpx; margin-top: 12rpx; }
.load-more { text-align: center; padding: 20rpx; font-size: 24rpx; color: #999; }
</style>
