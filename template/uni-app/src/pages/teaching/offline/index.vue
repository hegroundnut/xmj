<template>
	<view class="offline-page">
		<!-- 课程卡片列表 -->
		<view class="class-card" v-for="item in list" :key="item.id">
			<view class="class-header">
				<view class="class-date-badge">
					<text class="date-day">{{ formatDay(item.class_date) }}</text>
					<text class="date-month">{{ formatMonth(item.class_date) }}</text>
				</view>
				<view class="class-title-wrap">
					<text class="class-title">{{ item.title }}</text>
					<text class="class-time" v-if="item.start_time">{{ item.start_time }} - {{ item.end_time }}</text>
				</view>
			</view>
			<view class="class-body">
				<view class="class-info-row">
					<text class="info-label">📍 地点</text>
					<text class="info-value">{{ item.address }}</text>
				</view>
				<view class="class-info-row">
					<text class="info-label">👥 名额</text>
					<text class="info-value" v-if="item.max_people > 0">
						剩余 {{ item.max_people - (item.booked_count || 0) }} / {{ item.max_people }}
					</text>
					<text class="info-value" v-else>不限名额 (已报 {{ item.booked_count || 0 }} 人)</text>
				</view>
			</view>
			<view class="class-footer">
				<view class="book-btn" @click.stop="handleBook(item)">
					<text>立即预约</text>
				</view>
			</view>
		</view>

		<view class="load-more-text">{{ loadStatus === "noMore" ? "— 没有更多了 —" : loadStatus === "loading" ? "加载中..." : "" }}</view>

		<!-- 预约弹窗 -->
		<view v-if="showBookForm" class="popup-overlay" @click="showBookForm = false">
			<view class="popup-content" @click.stop>
				<view class="popup-header">
					<text class="popup-title">填写预约信息</text>
					<text class="popup-close" @click="showBookForm = false">✕</text>
				</view>
				<view class="form-group">
					<text class="form-label">姓名</text>
					<input v-model="bookForm.name" placeholder="请输入姓名" class="form-input" />
				</view>
				<view class="form-group">
					<text class="form-label">手机号</text>
					<input v-model="bookForm.phone" placeholder="请输入手机号" class="form-input" type="tel" />
				</view>
				<view class="submit-btn" :class="{ loading: submitting }" @click="submitBook">
					<text>{{ submitting ? '提交中...' : '确认预约' }}</text>
				</view>
			</view>
		</view>

		<!-- 预约成功二维码弹窗 -->
		<view v-if="showQrcode" class="popup-overlay" @click="showQrcode = false">
			<view class="popup-content qrcode-popup" @click.stop>
				<view class="popup-header">
					<text class="popup-title">预约成功</text>
					<text class="popup-close" @click="showQrcode = false">✕</text>
				</view>
				<view class="qrcode-hint">
					<text>请添加店主微信确认预约</text>
				</view>
				<image :src="qrcodeUrl" mode="widthFix" class="qrcode-img" />
				<view class="close-qr-btn" @click="showQrcode = false">
					<text>我知道了</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: [],
			page: 1,
			loadStatus: 'more',
			submitting: false,
			bookForm: { name: '', phone: '' },
			currentClass: null,
			qrcodeUrl: '',
			showBookForm: false,
			showQrcode: false,
		};
	},
	onLoad() {
		this.loadList();
	},
	onReachBottom() {
		this.loadList();
	},
	methods: {
		formatDay(dateStr) {
			if (!dateStr) return '';
			const parts = dateStr.split('-');
			return parts[2] || '';
		},
		formatMonth(dateStr) {
			if (!dateStr) return '';
			const parts = dateStr.split('-');
			return (parts[1] || '') + '月';
		},
		async loadList() {
			if (this.loadStatus === 'loading' || this.loadStatus === 'noMore') return;
			this.loadStatus = 'loading';
			try {
				const res = await this.$api.get('v2/offline_class/list', {
					page: this.page,
					limit: 10,
				});
				const data = res.data || {};
				this.list = this.page === 1 ? (data.list || []) : this.list.concat(data.list || []);
				this.page++;
				this.loadStatus = (data.list || []).length < 10 ? 'noMore' : 'more';
			} catch (e) {
				this.loadStatus = 'more';
			}
		},
		handleBook(item) {
			this.currentClass = item;
			this.bookForm = { name: '', phone: '' };
			this.showBookForm = true;
		},
		async submitBook() {
			if (!this.bookForm.name || !this.bookForm.phone) {
				return uni.showToast({ title: '请填写完整信息', icon: 'none' });
			}
			this.submitting = true;
			try {
				const res = await this.$api.post('v2/offline_class/booking', {
					class_id: this.currentClass.id,
					name: this.bookForm.name,
					phone: this.bookForm.phone,
				});
				this.showBookForm = false;
				if (this.currentClass.qrcode) {
					this.qrcodeUrl = this.currentClass.qrcode;
					this.showQrcode = true;
				} else {
					uni.showToast({ title: '预约成功', icon: 'success' });
				}
				this.page = 1;
				this.list = [];
				this.loadStatus = 'more';
				this.loadList();
			} catch (e) {
				if (e && e.msg && e.msg.indexOf('登') > -1) {
					uni.navigateTo({ url: '/pages/users/wechat_login/index' });
				} else {
					uni.showToast({ title: e.msg || '预约失败', icon: 'none' });
				}
			} finally {
				this.submitting = false;
			}
		},
	},
};
</script>

<style scoped>
.offline-page {
	background: #f5f5f5;
	min-height: 100vh;
	padding: 16rpx 20rpx;
	padding-bottom: 20rpx;
}
.class-card {
	background: #fff;
	border-radius: 16rpx;
	margin-bottom: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
.class-header {
	display: flex;
	align-items: center;
	padding: 24rpx;
	border-bottom: 1rpx solid #f0f0f0;
}
.class-date-badge {
	width: 88rpx;
	height: 88rpx;
	background: linear-gradient(135deg, #e93323, #ff6b5a);
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	flex-shrink: 0;
}
.date-day {
	font-size: 36rpx;
	font-weight: bold;
	color: #fff;
}
.date-month {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.8);
}
.class-title-wrap {
	flex: 1;
}
.class-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	display: block;
}
.class-time {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
	display: block;
}
.class-body {
	padding: 16rpx 24rpx;
}
.class-info-row {
	display: flex;
	align-items: center;
	padding: 8rpx 0;
}
.info-label {
	font-size: 26rpx;
	color: #666;
	width: 140rpx;
	flex-shrink: 0;
}
.info-value {
	font-size: 26rpx;
	color: #333;
	flex: 1;
}
.class-footer {
	padding: 16rpx 24rpx 24rpx;
}
.book-btn {
	background: linear-gradient(135deg, #e93323, #ff6b5a);
	color: #fff;
	height: 76rpx;
	border-radius: 38rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	font-weight: bold;
}
.load-more-text {
	text-align: center;
	font-size: 24rpx;
	color: #999;
	padding: 20rpx;
}
/* 弹窗 */
.popup-overlay {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
}
.popup-content {
	width: 600rpx;
	background: #fff;
	border-radius: 24rpx;
	padding: 30rpx;
}
.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}
.popup-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}
.popup-close {
	font-size: 36rpx;
	color: #999;
}
.form-group {
	margin-bottom: 20rpx;
}
.form-label {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 8rpx;
	display: block;
}
.form-input {
	height: 80rpx;
	border: 1rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
}
.submit-btn {
	background: linear-gradient(135deg, #e93323, #ff6b5a);
	color: #fff;
	height: 80rpx;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	font-weight: bold;
	margin-top: 20rpx;
}
.submit-btn.loading {
	opacity: 0.7;
}
/* 二维码弹窗 */
.qrcode-popup {
	text-align: center;
}
.qrcode-hint {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 20rpx;
}
.qrcode-img {
	width: 400rpx;
	margin: 0 auto;
}
.close-qr-btn {
	background: #f5f5f5;
	color: #333;
	height: 76rpx;
	border-radius: 38rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	margin-top: 20rpx;
}
</style>
