<template>
  <view class="moment-detail">
    <!-- 帖子内容 -->
    <view class="detail-card">
      <view class="moment-header">
        <image :src="detail.user_avatar || '/static/images/def_avatar.png'" class="avatar" mode="aspectFill" />
        <view class="user-info">
          <text class="nickname">{{ detail.user_nickname || '用户' + detail.uid }}</text>
          <text class="time">{{ detail.add_time }}</text>
        </view>
        <view v-if="detail.uid == uid" class="delete-btn" @click="handleDelete">删除</view>
      </view>
      <view class="moment-content">
        <text class="content-text">{{ detail.content }}</text>
      </view>
      <view v-if="detail.images && detail.images.length" class="image-grid" :class="'grid-' + Math.min(detail.images.length, 9)">
        <image
          v-for="(img, i) in detail.images"
          :key="i"
          :src="img"
          mode="aspectFill"
          class="grid-image"
          @longpress="saveImage(img)"
          @click="previewImages(detail.images, i)"
        />
      </view>
      <video v-if="detail.video_url" :src="detail.video_url" class="detail-video" controls object-fit="contain" @longpress="saveVideo(detail.video_url)" />
      <view class="detail-actions">
        <view class="action-item" @click="handleLike">
          <text>{{ detail.is_liked ? '❤️' : '🤍' }}</text>
          <text>{{ detail.like_count || 0 }}</text>
        </view>
        <view><text>💬 {{ detail.comment_total || 0 }}</text></view>
        <view class="action-item" @click="handleFavorite">
          <text>{{ detail.is_favorited ? '⭐已收藏' : '☆收藏' }}</text>
        </view>
      </view>
    </view>

    <!-- 评论区 -->
    <view class="comment-section">
      <view class="comment-title">评论 ({{ detail.comment_total || 0 }})</view>
      <view v-for="c in commentList" :key="c.id" class="comment-item">
        <image :src="c.user_avatar || '/static/images/def_avatar.png'" class="comment-avatar" mode="aspectFill" />
        <view class="comment-body">
          <view class="comment-header">
            <text class="comment-name">{{ c.user_nickname || '用户' + c.uid }}</text>
            <text class="comment-time">{{ c.add_time }}</text>
            <text v-if="c.uid == uid" class="comment-delete" @click="handleDeleteComment(c.id)">删除</text>
          </view>
          <text class="comment-content">
            <text v-if="c.reply_uid > 0" style="color:#409eff">回复 </text>
            {{ c.content }}
          </text>
          <text v-if="isMember" class="comment-reply" @click="setReply(c)">回复</text>
          <!-- 子回复 -->
          <view v-if="c.children && c.children.length" class="sub-comments">
            <view v-for="sub in c.children" :key="sub.id" class="sub-comment">
              <text class="sub-name">{{ sub.user_nickname || '用户' + sub.uid }}</text>
              <text v-if="sub.reply_uid > 0" style="color:#409eff"> 回复 </text>
              <text>{{ sub.content }}</text>
              <text v-if="sub.uid == uid" class="comment-delete" @click="handleDeleteComment(sub.id)">删除</text>
            </view>
          </view>
        </view>
      </view>
      <view v-if="commentList.length === 0" class="no-comment">暂无评论</view>
    </view>

    <!-- 底部输入栏（仅会员） -->
    <view v-if="isMember" class="comment-input-bar">
      <input v-model="commentText" :placeholder="replyHint" class="comment-input" confirm-type="send" @confirm="submitComment" />
      <button type="primary" size="mini" @click="submitComment" :disabled="!commentText">发送</button>
    </view>
  </view>
</template>

<script>
import { getMomentDetail, deleteMoment, createComment, deleteComment, toggleLike, toggleFavorite } from '@/api/moment';

export default {
  data() {
    return {
      id: 0,
      uid: 0,
      detail: {},
      commentList: [],
      commentText: '',
      replyToUid: 0,
      replyParentId: 0,
      isMember: false,
    };
  },
  computed: {
    replyHint() {
      return this.replyParentId > 0 ? '回复评论...' : '写评论...';
    },
  },
  onLoad(options) {
    this.id = parseInt(options.id);
    this.checkMember();
    this.loadDetail();
  },
  methods: {
    async checkMember() {
      try {
        const res = await this.$api.get('v2/user/info');
        if (res.data) {
          this.uid = res.data.uid || 0;
          this.isMember = res.data.is_teaching_member == 1 || res.data.overdue_time > Date.now() / 1000;
        }
      } catch (e) {}
    },
    async loadDetail() {
      try {
        const res = await getMomentDetail(this.id);
        this.detail = res.data || {};
        this.commentList = this.detail.comments || [];
      } catch (e) {
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' });
      }
    },
    async handleLike() {
      if (!this.isMember) { uni.showToast({ title: '仅会员可点赞', icon: 'none' }); return; }
      try {
        const res = await toggleLike(this.id);
        this.detail.is_liked = res.data.action === 'liked';
        this.detail.like_count += res.data.action === 'liked' ? 1 : -1;
        if (this.detail.like_count < 0) this.detail.like_count = 0;
      } catch (e) {}
    },
    async handleFavorite() {
      if (!this.isMember) return;
      try {
        const res = await toggleFavorite(this.id);
        this.detail.is_favorited = res.data.action === 'favorited';
        uni.showToast({ title: this.detail.is_favorited ? '已收藏' : '已取消', icon: 'none' });
      } catch (e) {}
    },
    async handleDelete() {
      const confirm = await new Promise(r => uni.showModal({ title: '确认删除？', success: e => r(e.confirm) }));
      if (!confirm) return;
      try {
        await deleteMoment(this.id);
        uni.showToast({ title: '已删除', icon: 'none' });
        setTimeout(() => uni.navigateBack(), 1000);
      } catch (e) { uni.showToast({ title: e.msg || '失败', icon: 'none' }); }
    },
    async submitComment() {
      if (!this.commentText.trim()) return;
      try {
        await createComment({
          moment_id: this.id,
          content: this.commentText.trim(),
          parent_id: this.replyParentId,
          reply_uid: this.replyToUid,
        });
        this.commentText = '';
        this.replyParentId = 0;
        this.replyToUid = 0;
        uni.showToast({ title: '评论成功', icon: 'none' });
        this.id && this.loadDetail();
      } catch (e) { uni.showToast({ title: e.msg || '失败', icon: 'none' }); }
    },
    setReply(comment) {
      this.replyParentId = comment.id;
      this.replyToUid = comment.uid;
      this.commentText = '';
    },
    async handleDeleteComment(id) {
      try {
        await deleteComment(id);
        uni.showToast({ title: '已删除', icon: 'none' });
        this.loadDetail();
      } catch (e) {}
    },
    previewImages(urls, current) { uni.previewImage({ urls, current }); },
    saveImage(url) {
      if (!this.isMember) return;
      uni.showLoading({ title: '保存中...' });
      uni.downloadFile({
        url,
        success: res => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => uni.showToast({ title: '已保存到相册', icon: 'none' }),
            fail: () => uni.showToast({ title: '保存失败', icon: 'none' }),
            complete: () => uni.hideLoading(),
          });
        },
        fail: () => { uni.hideLoading(); uni.showToast({ title: '下载失败', icon: 'none' }); },
      });
    },
    saveVideo(url) {
      if (!this.isMember) return;
      uni.showLoading({ title: '下载中...' });
      uni.downloadFile({
        url,
        success: res => {
          uni.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => uni.showToast({ title: '已保存到相册', icon: 'none' }),
            fail: () => uni.showToast({ title: '保存失败', icon: 'none' }),
            complete: () => uni.hideLoading(),
          });
        },
        fail: () => { uni.hideLoading(); uni.showToast({ title: '下载失败', icon: 'none' }); },
      });
    },
  },
};
</script>

<style scoped>
.moment-detail { background: #f5f5f5; min-height: 100vh; padding-bottom: 100rpx; }
.detail-card { background: #fff; padding: 24rpx; margin-bottom: 16rpx; }
.moment-header { display: flex; align-items: center; margin-bottom: 16rpx; }
.avatar { width: 72rpx; height: 72rpx; border-radius: 50%; margin-right: 16rpx; }
.user-info { flex: 1; }
.nickname { font-size: 28rpx; font-weight: bold; }
.time { font-size: 22rpx; color: #999; }
.delete-btn { color: #f56c6c; font-size: 24rpx; }
.content-text { font-size: 30rpx; line-height: 1.6; white-space: pre-wrap; }
.image-grid { display: flex; flex-wrap: wrap; gap: 6rpx; margin: 16rpx 0; }
.grid-image { width: calc(33.33% - 4rpx); height: 220rpx; border-radius: 6rpx; }
.detail-video { width: 100%; height: 400rpx; border-radius: 6rpx; margin: 16rpx 0; }
.detail-actions { display: flex; justify-content: space-around; padding-top: 16rpx; border-top: 1rpx solid #f0f0f0; font-size: 26rpx; }
.comment-section { background: #fff; padding: 24rpx; }
.comment-title { font-size: 28rpx; font-weight: bold; margin-bottom: 16rpx; }
.comment-item { display: flex; margin-bottom: 20rpx; }
.comment-avatar { width: 56rpx; height: 56rpx; border-radius: 50%; margin-right: 12rpx; flex-shrink: 0; }
.comment-body { flex: 1; }
.comment-header { display: flex; align-items: center; margin-bottom: 4rpx; }
.comment-name { font-size: 24rpx; color: #409eff; }
.comment-time { font-size: 20rpx; color: #ccc; margin-left: 12rpx; }
.comment-delete { font-size: 20rpx; color: #f56c6c; margin-left: auto; }
.comment-content { font-size: 26rpx; color: #333; }
.comment-reply { font-size: 22rpx; color: #409eff; margin-top: 4rpx; }
.sub-comments { background: #f8f8f8; border-radius: 8rpx; padding: 12rpx; margin-top: 12rpx; }
.sub-comment { font-size: 24rpx; margin-bottom: 8rpx; }
.sub-name { color: #409eff; }
.no-comment { text-align: center; color: #999; padding: 40rpx; }
.comment-input-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; align-items: center; padding: 12rpx 24rpx;
  background: #fff; border-top: 1rpx solid #eee; z-index: 99;
}
.comment-input { flex: 1; height: 64rpx; background: #f5f5f5; border-radius: 32rpx; padding: 0 24rpx; font-size: 26rpx; margin-right: 12rpx; }
</style>
