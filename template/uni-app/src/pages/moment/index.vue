<template>
  <view class="moment-page">
    <!-- 列表 -->
    <view class="moment-item" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
      <!-- 用户信息 -->
      <view class="moment-header">
        <image :src="item.user_avatar || '/static/images/def_avatar.png'" class="avatar" mode="aspectFill" />
        <view class="user-info">
          <text class="nickname">{{ item.user_nickname || '用户' + item.uid }}</text>
          <text class="time">{{ item.add_time }}</text>
        </view>
      </view>
      <!-- 内容 -->
      <view class="moment-content">
        <text class="content-text">{{ item.content }}</text>
      </view>
      <!-- 图片网格 -->
      <view v-if="item.images && item.images.length" class="image-grid" :class="'grid-' + Math.min(item.images.length, 9)">
        <image
          v-for="(img, i) in item.images"
          :key="i"
          :src="img"
          mode="aspectFill"
          class="grid-image"
          @click.stop="previewImages(item.images, i)"
        />
      </view>
      <!-- 视频 -->
      <video v-if="item.video_url" :src="item.video_url" class="moment-video" controls object-fit="contain" />
      <!-- 操作栏 -->
      <view class="moment-actions">
        <view class="action-item" @click.stop="handleLike(item)">
          <text :class="item.is_liked ? 'icon-heart-filled' : 'icon-heart'">{{ item.is_liked ? '❤️' : '🤍' }}</text>
          <text class="action-text">{{ item.like_count || 0 }}</text>
        </view>
        <view class="action-item" @click.stop="goDetail(item.id)">
          <text>💬</text>
          <text class="action-text">{{ item.comment_count || 0 }}</text>
        </view>
        <view class="action-item" @click.stop="handleFavorite(item)">
          <text>{{ item.is_favorited ? '⭐' : '☆' }}</text>
          <text class="action-text">收藏</text>
        </view>
        <view class="action-item" @click.stop="handleShare(item.id)">
          <text>↗</text>
          <text class="action-text">{{ item.share_count || 0 }}</text>
        </view>
      </view>
      <!-- 评论区预览 -->
      <view v-if="item.preview_comments && item.preview_comments.length" class="comment-preview" @click.stop="goDetail(item.id)">
        <view class="preview-comment" v-for="c in item.preview_comments" :key="c.id">
          <text class="pc-name">{{ c.user_nickname || '用户' + c.uid }}</text>
          <text class="pc-content">{{ c.content }}</text>
        </view>
        <text v-if="item.has_more_comments" class="view-more">查看全部 {{ item.comment_count }} 条评论</text>
      </view>
    </view>
    <!-- 加载更多 -->
    <view class="load-more">{{ loadStatus === 'noMore' ? '没有更多了' : loadStatus === 'loading' ? '加载中...' : '上拉加载更多' }}</view>
    <!-- 发布按钮（仅会员可见） -->
    <view v-if="isMember" class="publish-btn" @click="goPublish">+</view>
  </view>
</template>

<script>
import { getMomentList, toggleLike, toggleFavorite, shareMoment } from '@/api/moment';

export default {
  data() {
    return {
      list: [],
      page: 1,
      limit: 10,
      loadStatus: 'more',
      isMember: false,
    };
  },
  onLoad() {
    this.checkMember();
    this.loadList();
  },
  onShow() {
    // 从发布页返回时刷新
    if (this.page > 1) this.loadList();
  },
  onReachBottom() { this.loadList(); },
  onPullDownRefresh() {
    this.page = 1;
    this.list = [];
    this.loadList().then(() => uni.stopPullDownRefresh());
  },
  methods: {
    async checkMember() {
      try {
        const res = await this.$api.get('v2/user/info');
        if (res.data) {
          this.isMember = res.data.is_teaching_member == 1 || res.data.overdue_time > Date.now() / 1000;
        }
      } catch (e) {}
    },
    async loadList() {
      if (this.loadStatus === 'loading' || this.loadStatus === 'noMore') return;
      this.loadStatus = 'loading';
      try {
        const res = await getMomentList({ page: this.page, limit: this.limit });
        const data = res.data || {};
        const newList = data.list || [];
        this.list = this.page === 1 ? newList : this.list.concat(newList);
        this.page++;
        this.loadStatus = newList.length < this.limit ? 'noMore' : 'more';
      } catch (e) {
        this.loadStatus = 'more';
      }
    },
    goDetail(id) { uni.navigateTo({ url: `/pages/moment/detail?id=${id}` }); },
    goPublish() { uni.navigateTo({ url: '/pages/moment/publish' }); },
    async handleLike(item) {
      if (!this.isMember) { uni.showToast({ title: '仅会员可点赞', icon: 'none' }); return; }
      try {
        const res = await toggleLike(item.id);
        item.is_liked = res.data.action === 'liked';
        item.like_count += res.data.action === 'liked' ? 1 : -1;
        if (item.like_count < 0) item.like_count = 0;
      } catch (e) { uni.showToast({ title: e.msg || '操作失败', icon: 'none' }); }
    },
    async handleFavorite(item) {
      if (!this.isMember) { uni.showToast({ title: '仅会员可收藏', icon: 'none' }); return; }
      try {
        const res = await toggleFavorite(item.id);
        item.is_favorited = res.data.action === 'favorited';
        uni.showToast({ title: item.is_favorited ? '已收藏' : '已取消收藏', icon: 'none' });
      } catch (e) { uni.showToast({ title: e.msg || '操作失败', icon: 'none' }); }
    },
    async handleShare(id) {
      try { await shareMoment(id); } catch (e) {}
      uni.showToast({ title: '分享成功', icon: 'none' });
    },
    previewImages(urls, current) {
      uni.previewImage({ urls, current });
    },
  },
};
</script>

<style scoped>
.moment-page { padding-bottom: 120rpx; background: #f5f5f5; min-height: 100vh; }
.moment-item { background: #fff; margin: 16rpx; border-radius: 12rpx; padding: 24rpx; }
.moment-header { display: flex; align-items: center; margin-bottom: 16rpx; }
.avatar { width: 72rpx; height: 72rpx; border-radius: 50%; margin-right: 16rpx; }
.user-info { flex: 1; }
.nickname { font-size: 28rpx; font-weight: bold; color: #333; }
.time { font-size: 22rpx; color: #999; margin-top: 4rpx; }
.moment-content { margin-bottom: 16rpx; }
.content-text { font-size: 30rpx; color: #333; line-height: 1.6; white-space: pre-wrap; }
.image-grid { display: flex; flex-wrap: wrap; gap: 6rpx; margin-bottom: 16rpx; }
.grid-image { width: calc(33.33% - 4rpx); height: 220rpx; border-radius: 6rpx; }
.grid-1 .grid-image { width: 100%; height: 400rpx; }
.grid-2 .grid-image { width: calc(50% - 3rpx); height: 280rpx; }
.moment-video { width: 100%; height: 400rpx; border-radius: 6rpx; margin-bottom: 16rpx; }
.moment-actions { display: flex; justify-content: space-around; padding-top: 16rpx; border-top: 1rpx solid #f0f0f0; }
.action-item { display: flex; align-items: center; font-size: 26rpx; }
.action-text { margin-left: 6rpx; color: #999; font-size: 24rpx; }
.publish-btn {
  position: fixed; right: 40rpx; bottom: 120rpx;
  width: 100rpx; height: 100rpx; background: #e93323;
  border-radius: 50%; color: #fff; font-size: 60rpx; line-height: 100rpx;
  text-align: center; box-shadow: 0 4rpx 12rpx rgba(233,51,35,.4); z-index: 99;
}
.comment-preview { margin-top: 12rpx; padding: 16rpx; background: #f8f8f8; border-radius: 8rpx; }
.preview-comment { margin-bottom: 8rpx; line-height: 1.5; }
.pc-name { font-size: 24rpx; color: #409eff; margin-right: 8rpx; }
.pc-content { font-size: 26rpx; color: #333; }
.view-more { font-size: 24rpx; color: #409eff; margin-top: 4rpx; display: block; }
.load-more { text-align: center; padding: 20rpx; font-size: 24rpx; color: #999; }
</style>
