<template>
	<view class="product-page">
		<!-- 轮播图 -->
		<swiper v-if="info.banner && info.banner.length" :indicator-dots="true" autoplay circular class="banner">
			<swiper-item v-for="(url, i) in info.banner" :key="i">
				<image :src="url" mode="aspectFill" class="banner-img" />
			</swiper-item>
		</swiper>
		<!-- 标题 -->
		<view class="title-section">
			<text class="title">{{ info.title || '洗眉机' }}</text>
			<text class="desc">{{ info.desc }}</text>
		</view>
		<!-- 参数规格 -->
		<view class="specs-section" v-if="info.specs && info.specs.length">
			<view class="spec-item" v-for="(item, i) in info.specs" :key="i">
				<text class="spec-key">{{ item.key }}</text>
				<text class="spec-value">{{ item.value }}</text>
			</view>
		</view>
		<!-- 图文详情 -->
		<view class="detail-section">
			<rich-text :nodes="info.detail"></rich-text>
		</view>
		<!-- 视频 -->
		<video v-if="info.video_url" :src="info.video_url" class="product-video" />
	</view>
</template>

<script>
export default {
	data() {
		return {
			info: {},
		};
	},
	onLoad() {
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
	},
};
</script>

<style scoped>
.banner {
	width: 750rpx;
	height: 750rpx;
}
.banner-img {
	width: 100%;
	height: 100%;
}
.title-section {
	padding: 30rpx;
}
.title {
	font-size: 40rpx;
	font-weight: bold;
}
.desc {
	font-size: 28rpx;
	color: #666;
	margin-top: 16rpx;
	display: block;
}
.specs-section {
	padding: 20rpx 30rpx;
	background: #f8f8f8;
}
.spec-item {
	display: flex;
	justify-content: space-between;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #eee;
}
.spec-item:last-child {
	border-bottom: none;
}
.spec-key {
	font-size: 28rpx;
	color: #333;
}
.spec-value {
	font-size: 28rpx;
	color: #666;
}
.detail-section {
	padding: 20rpx 30rpx;
}
.product-video {
	width: 100%;
	height: 400rpx;
	margin-top: 20rpx;
}
</style>