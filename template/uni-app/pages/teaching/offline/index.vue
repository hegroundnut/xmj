<template>
	<view class="offline-page">
		<view class="class-item" v-for="item in list" :key="item.id" @click="handleDetail(item)">
			<view class="class-header">
				<text class="class-title">{{ item.title }}</text>
				<text class="class-date">{{ item.class_date }}</text>
			</view>
			<view class="class-info">
				<text v-if="item.start_time">时间: {{ item.start_time }} - {{ item.end_time }}</text>
				<text>地点: {{ item.address }}</text>
				<text v-if="item.max_people > 0">
					剩余名额: {{ item.max_people - (item.booked_count || 0) }} / {{ item.max_people }}
				</text>
				<text v-else>不限名额 (已约 {{ item.booked_count || 0 }} 人)</text>
			</view>
			<button class="book-btn" @click.stop="handleBook(item)">预约</button>
		</view>
		<uni-load-more :status="loadStatus" />

		<!-- 预约弹窗 -->
		<uni-popup ref="bookPopup" type="center">
			<view class="book-form">
				<text class="form-title">填写预约信息</text>
				<input v-model="bookForm.name" placeholder="姓名" class="form-input" />
				<input v-model="bookForm.phone" placeholder="手机号" class="form-input" />
				<button class="submit-btn" :loading="submitting" @click="submitBook">确认预约</button>
				<text class="close-btn" @click="$refs.bookPopup.close()">取消</text>
			</view>
		</uni-popup>

		<!-- 预约成功二维码弹窗 -->
		<uni-popup ref="qrcodePopup" type="center">
			<view class="qrcode-modal">
				<text class="qrcode-title">请添加店主微信确认预约</text>
				<image :src="qrcodeUrl" mode="widthFix" class="qrcode-img" />
				<button class="close-qr-btn" @click="$refs.qrcodePopup.close()">关闭</button>
			</view>
		</uni-popup>
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
				const res = await this.$api.get('v2/offline_class/list', {
					page: this.page,
					limit: 10,
				});
				const data = res.data || {};
				this.list =
					this.page === 1
						? data.list || []
						: this.list.concat(data.list || []);
				this.page++;
				this.loadStatus =
					(data.list || []).length < 10 ? 'noMore' : 'more';
			} catch (e) {
				this.loadStatus = 'more';
			}
		},
		handleDetail(item) {
			uni.navigateTo({
				url: `/pages/teaching/offline/detail?id=${item.id}`,
			});
		},
		handleBook(item) {
			this.currentClass = item;
			this.bookForm = { name: '', phone: '' };
			this.$refs.bookPopup.open();
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
				this.$refs.bookPopup.close();
				this.qrcodeUrl = res.data?.qrcode || this.currentClass.qrcode;
				this.$refs.qrcodePopup.open();
			} catch (e) {
				uni.showToast({ title: e.msg || '预约失败', icon: 'none' });
			} finally {
				this.submitting = false;
			}
		},
	},
};
</script>

<style scoped>
.class-item {
	margin: 20rpx;
	padding: 24rpx;
	background: #fff;
	border-radius: 12rpx;
}
.class-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.class-title {
	font-size: 32rpx;
	font-weight: bold;
}
.class-date {
	font-size: 26rpx;
	color: #e93323;
}
.class-info {
	margin-top: 16rpx;
}
.class-info text {
	display: block;
	font-size: 26rpx;
	color: #666;
	margin-bottom: 6rpx;
}
.book-btn {
	margin-top: 20rpx;
	background: #e93323;
	color: #fff;
	font-size: 28rpx;
}
.book-form {
	background: #fff;
	padding: 40rpx;
	border-radius: 16rpx;
	width: 560rpx;
}
.form-title {
	font-size: 32rpx;
	font-weight: bold;
	display: block;
	text-align: center;
	margin-bottom: 30rpx;
}
.form-input {
	border: 1rpx solid #ddd;
	padding: 16rpx;
	margin-bottom: 20rpx;
	border-radius: 8rpx;
	font-size: 28rpx;
}
.submit-btn {
	background: #e93323;
	color: #fff;
}
.close-btn {
	display: block;
	text-align: center;
	color: #999;
	margin-top: 16rpx;
}
.qrcode-modal {
	background: #fff;
	padding: 40rpx;
	border-radius: 16rpx;
	text-align: center;
}
.qrcode-title {
	font-size: 28rpx;
	display: block;
	margin-bottom: 20rpx;
}
.qrcode-img {
	width: 360rpx;
}
.close-qr-btn {
	margin-top: 20rpx;
	background: #e93323;
	color: #fff;
}
</style>