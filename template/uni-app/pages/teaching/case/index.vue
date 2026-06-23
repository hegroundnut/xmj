<template>
	<view class="case-page">
		<!-- 顶部标题 -->
		<view class="page-header">
			<text class="page-title">案例展示</text>
			<text class="page-subtitle">来自学员的真实反馈</text>
		</view>
		<!-- Tab 切换 -->
		<view class="tabs">
			<view
				v-for="tab in tabs" :key="tab.value"
				:class="['tab-item', { active: activeTab === tab.value }]"
				@click="switchTab(tab.value)"
			>{{ tab.label }}</view>
		</view>
		<!-- 瀑布流列表 -->
		<view class="case-list">
			<view class="case-card" v-for="item in list" :key="item.id" @click="openDetail(item)">
				<view class="card-media">
					<image :src="item.cover" mode="aspectFill" class="case-cover" />
					<view class="media-badge" v-if="item.type == 2">
						<text class="iconfont">▶</text>
					</view>
				</view>
				<view class="card-body">
					<text class="card-title">{{ item.title }}</text>
					<view class="card-meta">
						<text class="meta-time">{{ item.add_time }}</text>
						<view class="meta-comment" @click.stop="openComment(item)">
							<text class="comment-icon">💬</text>
							<text class="comment-count">{{ item.comment_count || 0 }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 加载更多 -->
		<view class="load-more-text">{{ loadStatus === "noMore" ? "— 没有更多了 —" : loadStatus === "loading" ? "加载中..." : "" }}</view>

		<!-- 案例详情弹窗 -->
		<view v-if="showDetail" class="popup-overlay" @click="showDetail = false">
			<view class="detail-popup" @click.stop>
				<view class="detail-header">
					<text class="detail-title">{{ currentItem.title }}</text>
					<text class="detail-close" @click="showDetail = false">✕</text>
				</view>
				<scroll-view scroll-y class="detail-body">
					<image v-if="currentItem.type == 1" :src="currentItem.media_url" mode="widthFix" class="detail-image" @click="previewImage(currentItem.media_url)" />
					<video v-else :src="currentItem.media_url" class="detail-video" controls />
					<!-- 评论区域 -->
					<view class="comment-section">
						<view class="comment-header">
							<text class="comment-title">评论 ({{ commentData.count || 0 }})</text>
						</view>
						<view class="comment-list">
							<view class="comment-item" v-for="c in commentData.list" :key="c.id">
								<image :src="c.avatar || '/static/images/default-avatar.png'" class="comment-avatar" />
								<view class="comment-content">
									<text class="comment-nick">{{ c.nickname }}</text>
									<text class="comment-text">{{ c.content }}</text>
									<view class="comment-actions">
										<text class="comment-time">{{ c.add_time }}</text>
										<text class="reply-btn" @click="startReply(c)">回复</text>
									</view>
									<!-- 回复列表 -->
									<view class="reply-list" v-if="c.replies && c.replies.length">
										<view class="reply-item" v-for="r in c.replies" :key="r.id">
											<text class="reply-nick">{{ r.nickname }}</text>
											<text class="reply-arrow">回复</text>
											<text class="reply-target">{{ r.reply_nickname }}</text>
											<text class="reply-text">：{{ r.content }}</text>
										</view>
									</view>
								</view>
							</view>
							<view v-if="!commentData.list || !commentData.list.length" class="empty-comment">
								<text>暂无评论，快来抢沙发吧～</text>
							</view>
						</view>
					</view>
				</scroll-view>
				<!-- 评论输入框 -->
				<view class="comment-input-bar">
					<input
						v-model="commentText"
						:placeholder="replyTo ? '回复 ' + replyTo.nickname + '...' : '写评论...'"
						class="comment-input"
						confirm-type="send"
						@confirm="submitComment"
					/>
					<view class="send-btn" @click="submitComment">
						<text>发送</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			tabs: [
				{ label: '全部', value: 0 },
				{ label: '图片', value: 1 },
				{ label: '视频', value: 2 },
			],
			activeTab: 0,
			list: [],
			page: 1,
			limit: 10,
			loadStatus: 'more',
			showDetail: false,
			currentItem: {},
			commentData: { list: [], count: 0 },
			commentText: '',
			replyTo: null,
		};
	},
	onLoad() {
		this.loadList();
	},
	onReachBottom() {
		this.loadList();
	},
	methods: {
		switchTab(val) {
			this.activeTab = val;
			this.page = 1;
			this.list = [];
			this.loadStatus = 'more';
			this.loadList();
		},
		async loadList() {
			if (this.loadStatus === 'loading' || this.loadStatus === 'noMore') return;
			this.loadStatus = 'loading';
			try {
				const params = { page: this.page, limit: this.limit };
				if (this.activeTab > 0) params.type = this.activeTab;
				const res = await this.$api.get('v2/case/list', params);
				const data = res.data || {};
				this.list = this.page === 1 ? (data.list || []) : this.list.concat(data.list || []);
				this.page++;
				this.loadStatus = (data.list || []).length < this.limit ? 'noMore' : 'more';
			} catch (e) {
				this.loadStatus = 'more';
			}
		},
		openDetail(item) {
			if (item.type == 1) {
				this.currentItem = item;
				this.showDetail = true;
				this.loadComments(item.id);
			} else {
				this.currentItem = item;
				this.showDetail = true;
				this.loadComments(item.id);
			}
		},
		openComment(item) {
			this.currentItem = item;
			this.showDetail = true;
			this.loadComments(item.id);
		},
		previewImage(url) {
			uni.previewImage({ urls: [url] });
		},
		async loadComments(caseId) {
			try {
				const res = await this.$api.get('v2/case_comment/list', { case_id: caseId, page: 1, limit: 50 });
				this.commentData = res.data || { list: [], count: 0 };
			} catch (e) {
				this.commentData = { list: [], count: 0 };
			}
		},
		startReply(comment) {
			this.replyTo = comment;
		},
		async submitComment() {
			if (!this.commentText.trim()) {
				return uni.showToast({ title: '请输入评论内容', icon: 'none' });
			}
			try {
				const data = {
					case_id: this.currentItem.id,
					content: this.commentText.trim(),
				};
				if (this.replyTo) {
					data.pid = this.replyTo.id;
					data.reply_uid = this.replyTo.uid;
					data.reply_nickname = this.replyTo.nickname;
				}
				await this.$api.post('v2/case_comment/add', data);
				this.commentText = '';
				this.replyTo = null;
				uni.showToast({ title: '评论成功', icon: 'success' });
				this.loadComments(this.currentItem.id);
			} catch (e) {
				if (e && e.msg && e.msg.indexOf('登') > -1) {
					uni.navigateTo({ url: '/pages/users/wechat_login/index' });
				} else {
					uni.showToast({ title: e.msg || '评论失败', icon: 'none' });
				}
			}
		},
	},
};
</script>

<style scoped>
.case-page {
	padding-bottom: 20rpx;
	background: #f5f5f5;
	min-height: 100vh;
}
.page-header {
	padding: 40rpx 30rpx 20rpx;
	background: linear-gradient(135deg, #e93323, #ff6b5a);
	color: #fff;
}
.page-title {
	font-size: 40rpx;
	font-weight: bold;
	display: block;
}
.page-subtitle {
	font-size: 24rpx;
	opacity: 0.8;
	margin-top: 8rpx;
	display: block;
}
.tabs {
	display: flex;
	padding: 20rpx 30rpx;
	background: #fff;
	position: sticky;
	top: 0;
	z-index: 10;
}
.tab-item {
	margin-right: 40rpx;
	font-size: 28rpx;
	color: #666;
	padding-bottom: 8rpx;
	position: relative;
}
.tab-item.active {
	color: #e93323;
	font-weight: bold;
}
.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 40rpx;
	height: 4rpx;
	background: #e93323;
	border-radius: 2rpx;
}
.case-list {
	padding: 16rpx;
}
.case-card {
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}
.card-media {
	position: relative;
}
.case-cover {
	width: 100%;
	height: 400rpx;
}
.media-badge {
	position: absolute;
	right: 20rpx;
	bottom: 20rpx;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 50%;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.media-badge .iconfont {
	color: #fff;
	font-size: 28rpx;
}
.card-body {
	padding: 20rpx 24rpx;
}
.card-title {
	font-size: 30rpx;
	font-weight: 500;
	color: #333;
	display: block;
	margin-bottom: 12rpx;
}
.card-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.meta-time {
	font-size: 24rpx;
	color: #999;
}
.meta-comment {
	display: flex;
	align-items: center;
}
.comment-icon {
	font-size: 28rpx;
	margin-right: 4rpx;
}
.comment-count {
	font-size: 24rpx;
	color: #999;
}
.load-more-text {
	text-align: center;
	font-size: 24rpx;
	color: #999;
	padding: 20rpx;
}
/* 详情弹窗 */
.popup-overlay {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	z-index: 999;
	display: flex;
	align-items: flex-end;
}
.detail-popup {
	width: 100%;
	height: 85vh;
	background: #fff;
	border-radius: 24rpx 24rpx 0 0;
	display: flex;
	flex-direction: column;
}
.detail-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 30rpx;
	border-bottom: 1rpx solid #eee;
}
.detail-title {
	font-size: 32rpx;
	font-weight: bold;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.detail-close {
	font-size: 36rpx;
	color: #999;
	padding: 0 10rpx;
}
.detail-body {
	flex: 1;
	overflow-y: auto;
}
.detail-image {
	width: 100%;
}
.detail-video {
	width: 100%;
	height: 420rpx;
}
/* 评论区域 */
.comment-section {
	padding: 20rpx 30rpx;
}
.comment-header {
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #f0f0f0;
}
.comment-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
}
.comment-list {
	padding-top: 16rpx;
}
.comment-item {
	display: flex;
	padding: 16rpx 0;
}
.comment-avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	flex-shrink: 0;
	margin-right: 16rpx;
}
.comment-content {
	flex: 1;
}
.comment-nick {
	font-size: 26rpx;
	color: #e93323;
	font-weight: 500;
	display: block;
}
.comment-text {
	font-size: 28rpx;
	color: #333;
	margin-top: 8rpx;
	display: block;
	line-height: 1.5;
}
.comment-actions {
	display: flex;
	align-items: center;
	margin-top: 8rpx;
}
.comment-time {
	font-size: 22rpx;
	color: #999;
	margin-right: 20rpx;
}
.reply-btn {
	font-size: 22rpx;
	color: #e93323;
}
.reply-list {
	margin-top: 12rpx;
	padding: 12rpx 16rpx;
	background: #f8f8f8;
	border-radius: 8rpx;
}
.reply-item {
	font-size: 26rpx;
	line-height: 1.6;
	margin-bottom: 8rpx;
}
.reply-nick {
	color: #e93323;
	font-weight: 500;
}
.reply-arrow {
	color: #999;
	margin: 0 4rpx;
}
.reply-target {
	color: #e93323;
}
.reply-text {
	color: #333;
}
.empty-comment {
	text-align: center;
	padding: 40rpx 0;
	color: #999;
	font-size: 26rpx;
}
/* 评论输入栏 */
.comment-input-bar {
	display: flex;
	align-items: center;
	padding: 16rpx 20rpx;
	border-top: 1rpx solid #eee;
	background: #fff;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}
.comment-input {
	flex: 1;
	height: 68rpx;
	background: #f5f5f5;
	border-radius: 34rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
}
.send-btn {
	margin-left: 16rpx;
	background: #e93323;
	color: #fff;
	border-radius: 34rpx;
	padding: 0 30rpx;
	height: 68rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
}
</style>
