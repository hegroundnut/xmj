<template>
	<view class="product-page">
		<!-- 自定义导航栏 -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<text class="nav-title">产品展示</text>
			</view>
		</view>

		<!-- 轮播图 -->
		<swiper v-if="info.banner && info.banner.length" :indicator-dots="true" autoplay circular indicator-active-color="#e93323" class="banner">
			<swiper-item v-for="(url, i) in info.banner" :key="i" @click="previewBanner(i)">
				<image :src="url" mode="aspectFill" class="banner-img" />
			</swiper-item>
		</swiper>

		<!-- 产品信息卡片 -->
		<view class="info-card">
			<text class="product-title">{{ info.title || '洗眉机' }}</text>
			<text class="product-desc">{{ info.desc }}</text>
		</view>

		<!-- 参数规格 -->
		<view class="specs-card" v-if="info.specs && info.specs.length">
			<view class="card-header">
				<text class="card-title">参数规格</text>
			</view>
			<view class="spec-item" v-for="(item, i) in info.specs" :key="i">
				<text class="spec-key">{{ item.key || item.name }}</text>
				<text class="spec-value">{{ item.value }}</text>
			</view>
		</view>

		<!-- 产品视频 -->
		<view class="video-card" v-if="info.video_url">
			<view class="card-header">
				<text class="card-title">产品视频</text>
			</view>
			<video :src="info.video_url" class="product-video" controls show-play-btn />
		</view>

		<!-- 图文详情 -->
		<view class="detail-card" v-if="info.detail">
			<view class="card-header">
				<text class="card-title">详细介绍</text>
			</view>
			<rich-text :nodes="info.detail" class="detail-content"></rich-text>
		</view>

		<!-- 底部咨询按钮 -->
		<view class="bottom-bar">
			<view class="consult-btn" @click="handleConsult">
				<text>立即咨询</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			statusBarHeight: 20,
			info: {},
		};
	},
	onLoad() {
		const sysInfo = uni.getSystemInfoSync();
		this.statusBarHeight = sysInfo.statusBarHeight || 20;
		this.loadData();
	},
	methods: {
		async loadData() {
			try {
				const res = await this.$api.get('v2/product/info');
				this.info = res.data || {};
			} catch (e) {
				console.error(e);
			}
		},
		previewBanner(index) {
			if (this.info.banner && this.info.banner.length) {
				uni.previewImage({ urls: this.info.banner, current: index });
			}
		},
		handleConsult() {
			uni.showModal({
				title: '联系我们',
				content: '请通过首页联系方式咨询，或添加微信了解详情',
				showCancel: false,
			});
		},
	},
};
</script>

<style scoped>
.product-page {
	background: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 120rpx;
}
.custom-nav {
	background: linear-gradient(135deg, #e93323, #ff6b5a);
	position: sticky;
	top: 0;
	z-index: 100;
}
.nav-content {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.nav-title {
	color: #fff;
	font-size: 34rpx;
	font-weight: bold;
}
.banner {
	width: 100%;
	height: 560rpx;
}
.banner-img {
	width: 100%;
	height: 100%;
}
.info-card {
	margin: -30rpx 20rpx 0;
	background: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	position: relative;
	z-index: 1;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}
.product-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
	display: block;
}
.product-desc {
	font-size: 28rpx;
	color: #666;
	margin-top: 16rpx;
	display: block;
	line-height: 1.6;
}
.specs-card, .video-card, .detail-card {
	margin: 16rpx 20rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
}
.card-header {
	margin-bottom: 20rpx;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #f0f0f0;
}
.card-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
}
.spec-item {
	display: flex;
	justify-content: space-between;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #f8f8f8;
}
.spec-item:last-child {
	border-bottom: none;
}
.spec-key {
	font-size: 28rpx;
	color: #666;
}
.spec-value {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}
.product-video {
	width: 100%;
	height: 420rpx;
	border-radius: 12rpx;
}
.detail-content {
	font-size: 28rpx;
	line-height: 1.8;
	color: #333;
}
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 16rpx 30rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
	background: #fff;
	box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
	z-index: 100;
}
.consult-btn {
	background: linear-gradient(135deg, #e93323, #ff6b5a);
	color: #fff;
	height: 88rpx;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: bold;
}
</style>
