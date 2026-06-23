<template>
	<view class="course-page">
		<!-- 会员横幅 -->
		<view class="member-banner" v-if="!isMember" @click="openMember">
			<view class="member-info">
				<text class="member-title">开通会员</text>
				<text class="member-desc">解锁全部课程，畅享学习</text>
			</view>
			<view class="member-btn">
				<text>立即开通</text>
			</view>
		</view>
		<view class="member-banner is-member" v-else>
			<text class="member-badge">👑</text>
			<text class="member-status">您已是会员，全部课程免费观看</text>
		</view>

		<!-- 课程列表 -->
		<view class="course-list">
			<view class="course-item" v-for="item in list" :key="item.id" @click="handleCourse(item)">
				<view class="course-cover-wrap">
					<image :src="item.cover" mode="aspectFill" class="course-cover" />
					<view class="price-tag" v-if="item.can_watch">
						<text>免费</text>
					</view>
					<view class="price-tag paid" v-else>
						<text>¥{{ item.price }}</text>
					</view>
				</view>
				<view class="course-info">
					<text class="course-title">{{ item.title }}</text>
					<text class="course-desc">{{ item.desc }}</text>
					<view class="course-bottom">
						<view class="course-tags">
							<text class="tag" v-if="item.is_member">会员免费</text>
							<text class="tag trial" v-if="!item.can_watch">可试听</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="load-more-text">{{ loadStatus === "noMore" ? "— 没有更多了 —" : loadStatus === "loading" ? "加载中..." : "" }}</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isMember: false,
			list: [],
			page: 1,
			limit: 10,
			loadStatus: 'more',
		};
	},
	onLoad() {
		this.loadList();
	},
	onReachBottom() {
		this.loadList();
	},
	methods: {
		async loadList() {
			if (this.loadStatus === 'loading' || this.loadStatus === 'noMore') return;
			this.loadStatus = 'loading';
			try {
				const res = await this.$api.get('v2/course/list', {
					page: this.page,
					limit: this.limit,
				});
				const data = res.data || {};
				if (data.list && data.list.length > 0) {
					this.isMember = data.list[0].is_member || false;
				}
				this.list = this.page === 1 ? (data.list || []) : this.list.concat(data.list || []);
				this.page++;
				this.loadStatus = (data.list || []).length < this.limit ? 'noMore' : 'more';
			} catch (e) {
				this.loadStatus = 'more';
			}
		},
		handleCourse(item) {
			if (item.can_watch) {
				uni.navigateTo({ url: `/pages/teaching/course/detail?id=${item.id}` });
			} else {
				this.handlePurchase(item);
			}
		},
		async handlePurchase(item) {
			uni.showModal({
				title: '购买课程',
				content: `确定花费 ¥${item.price} 购买「${item.title}」吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							const orderRes = await this.$api.post('v2/course/create_order', {
								course_id: item.id,
							});
							const orderData = orderRes.data || {};
							if (orderData.pay_params) {
								// 调起微信支付
								uni.requestPayment({
									...orderData.pay_params,
									success: () => {
										uni.showToast({ title: '支付成功', icon: 'success' });
										this.page = 1;
										this.list = [];
										this.loadStatus = 'more';
										this.loadList();
									},
									fail: () => {
										uni.showToast({ title: '支付取消', icon: 'none' });
									},
								});
							} else {
								uni.showToast({ title: '订单已创建，请在订单中支付', icon: 'none' });
							}
						} catch (e) {
							if (e && e.msg && e.msg.indexOf('登') > -1) {
								uni.navigateTo({ url: '/pages/users/wechat_login/index' });
							} else {
								uni.showToast({ title: e.msg || '操作失败', icon: 'none' });
							}
						}
					}
				},
			});
		},
		openMember() {
			uni.showToast({ title: '请联系管理员开通会员', icon: 'none' });
		},
	},
};
</script>

<style scoped>
.course-page {
	background: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 20rpx;
}
/* 会员横幅 */
.member-banner {
	margin: 16rpx 20rpx;
	background: linear-gradient(135deg, #ffd700, #ffaa00);
	border-radius: 16rpx;
	padding: 24rpx 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.member-banner.is-member {
	background: linear-gradient(135deg, #52c41a, #73d13d);
	justify-content: flex-start;
}
.member-badge {
	font-size: 40rpx;
	margin-right: 16rpx;
}
.member-status {
	font-size: 28rpx;
	color: #fff;
	font-weight: 500;
}
.member-info { }
.member-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #fff;
	display: block;
}
.member-desc {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
	margin-top: 6rpx;
	display: block;
}
.member-btn {
	background: #fff;
	color: #ff8800;
	font-size: 26rpx;
	font-weight: bold;
	padding: 12rpx 30rpx;
	border-radius: 30rpx;
	flex-shrink: 0;
}
/* 课程列表 */
.course-list {
	padding: 0 20rpx;
}
.course-item {
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	margin-bottom: 16rpx;
	display: flex;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
.course-cover-wrap {
	position: relative;
	flex-shrink: 0;
}
.course-cover {
	width: 240rpx;
	height: 180rpx;
}
.price-tag {
	position: absolute;
	bottom: 8rpx;
	left: 8rpx;
	background: #52c41a;
	color: #fff;
	font-size: 22rpx;
	padding: 4rpx 14rpx;
	border-radius: 6rpx;
}
.price-tag.paid {
	background: #e93323;
}
.course-info {
	flex: 1;
	padding: 16rpx 20rpx;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
.course-title {
	font-size: 30rpx;
	font-weight: 500;
	color: #333;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}
.course-desc {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.course-bottom {
	margin-top: 8rpx;
}
.course-tags {
	display: flex;
}
.tag {
	font-size: 20rpx;
	color: #e93323;
	border: 1rpx solid #e93323;
	padding: 2rpx 10rpx;
	border-radius: 4rpx;
	margin-right: 8rpx;
}
.tag.trial {
	color: #1890ff;
	border-color: #1890ff;
}
.load-more-text {
	text-align: center;
	font-size: 24rpx;
	color: #999;
	padding: 20rpx;
}
</style>
