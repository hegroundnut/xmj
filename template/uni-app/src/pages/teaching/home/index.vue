<template>
	<view class="home-page">
		<!-- 自定义导航栏 -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<text class="nav-title">洗眉机教学</text>
			</view>
		</view>

		<!-- 轮播图 -->
		<view v-if="config.banner && config.banner.enabled && config.banner.items && config.banner.items.length" class="banner-section">
			<swiper :indicator-dots="true" autoplay circular indicator-active-color="#e93323" class="banner-swiper">
				<swiper-item v-for="(item, i) in config.banner.items" :key="i" @click="handleBannerClick(item)">
					<image :src="item.image" mode="aspectFill" class="banner-img" />
				</swiper-item>
			</swiper>
		</view>
		<!-- 默认轮播（无配置时） -->
		<view v-else class="banner-section">
			<view class="default-banner">
				<view class="banner-text">
					<text class="banner-main">专业洗眉设备</text>
					<text class="banner-sub">安全高效，精准清洗</text>
				</view>
			</view>
		</view>

		<!-- 公告 -->
		<view v-if="config.notice && config.notice.enabled && config.notice.text" class="notice-bar">
			<text class="notice-icon">📢</text>
			<text class="notice-text">{{ config.notice.text }}</text>
		</view>

		<!-- 快捷导航 -->
		<view v-if="config.quick_nav && config.quick_nav.enabled" class="nav-grid">
			<view class="nav-item" v-for="(item, i) in config.quick_nav.items" :key="i" @click="navigateTo(item.page)">
				<view class="nav-icon-wrap" :class="'icon-' + item.icon">
					<text class="nav-icon-text">{{ getIconEmoji(item.icon) }}</text>
				</view>
				<text class="nav-label">{{ item.title }}</text>
			</view>
		</view>

		<!-- 精选案例 -->
		<view v-if="config.featured_cases && config.featured_cases.enabled" class="section">
			<view class="section-header">
				<text class="section-title">{{ config.featured_cases.title || '精选案例' }}</text>
				<text class="section-more" @click="switchToTab('/pages/teaching/case/index')">查看更多 ></text>
			</view>
			<scroll-view scroll-x class="case-scroll">
				<view class="case-scroll-item" v-for="item in (config.featured_cases.data || [])" :key="item.id">
					<image :src="item.cover" mode="aspectFill" class="case-scroll-img" />
					<text class="case-scroll-title">{{ item.title }}</text>
				</view>
				<view v-if="!config.featured_cases.data || !config.featured_cases.data.length" class="empty-hint">
					<text>暂无案例数据</text>
				</view>
			</scroll-view>
		</view>

		<!-- 热门课程 -->
		<view v-if="config.latest_courses && config.latest_courses.enabled" class="section">
			<view class="section-header">
				<text class="section-title">{{ config.latest_courses.title || '热门课程' }}</text>
				<text class="section-more" @click="switchToTab('/pages/teaching/course/index')">查看更多 ></text>
			</view>
			<view class="course-list">
				<view class="course-card" v-for="item in (config.latest_courses.data || [])" :key="item.id">
					<image :src="item.cover" mode="aspectFill" class="course-card-img" />
					<view class="course-card-info">
						<text class="course-card-title">{{ item.title }}</text>
						<text class="course-card-desc">{{ item.desc }}</text>
						<view class="course-card-bottom">
							<text class="course-card-price" v-if="item.can_watch">免费</text>
							<text class="course-card-price paid" v-else>¥{{ item.price }}</text>
							<text class="course-card-tag" v-if="item.is_member">会员</text>
						</view>
					</view>
				</view>
				<view v-if="!config.latest_courses.data || !config.latest_courses.data.length" class="empty-hint">
					<text>暂无课程数据</text>
				</view>
			</view>
		</view>

		<!-- 联系我们 -->
		<view v-if="config.contact && config.contact.enabled" class="section contact-section">
			<view class="section-header">
				<text class="section-title">{{ config.contact.title || '联系我们' }}</text>
			</view>
			<view class="contact-card">
				<view class="contact-item" v-if="config.contact.phone">
					<text class="contact-label">电话</text>
					<text class="contact-value" @click="makeCall(config.contact.phone)">{{ config.contact.phone }}</text>
				</view>
				<view class="contact-item" v-if="config.contact.wechat">
					<text class="contact-label">微信</text>
					<text class="contact-value">{{ config.contact.wechat }}</text>
				</view>
				<image v-if="config.contact.qrcode" :src="config.contact.qrcode" mode="aspectFit" class="contact-qrcode" @click="previewQrcode" />
			</view>
		</view>

		<view class="footer">
			<text class="footer-text">— 洗眉机教学平台 —</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			statusBarHeight: 20,
			config: {},
		};
	},
	onLoad() {
		const sysInfo = uni.getSystemInfoSync();
		this.statusBarHeight = sysInfo.statusBarHeight || 20;
		this.loadConfig();
	},
	onPullDownRefresh() {
		this.loadConfig().finally(() => {
			uni.stopPullDownRefresh();
		});
	},
	methods: {
		async loadConfig() {
			try {
				const res = await this.$api.get('v2/home/config');
				this.config = res.data || {};
			} catch (e) {
				console.error('加载首页配置失败', e);
			}
		},
		getIconEmoji(icon) {
			const map = {
				product: '🔧',
				case: '📸',
				course: '🎓',
				offline: '📅',
				member: '👑',
				custom: '⭐',
			};
			return map[icon] || '⭐';
		},
		navigateTo(url) {
			if (!url) return;
			// 检查是否是tabBar页面
			const tabPages = [
				'/pages/teaching/home/index',
				'/pages/teaching/case/index',
				'/pages/teaching/course/index',
				'/pages/teaching/offline/index',
			];
			if (tabPages.indexOf(url) > -1) {
				uni.switchTab({ url });
			} else {
				uni.navigateTo({ url });
			}
		},
		switchToTab(url) {
			uni.switchTab({ url });
		},
		handleBannerClick(item) {
			if (item.link) {
				this.navigateTo(item.link);
			}
		},
		makeCall(phone) {
			uni.makePhoneCall({ phoneNumber: phone });
		},
		previewQrcode() {
			if (this.config.contact && this.config.contact.qrcode) {
				uni.previewImage({ urls: [this.config.contact.qrcode] });
			}
		},
	},
};
</script>

<style scoped>
.home-page {
	background: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 20rpx;
}
/* 自定义导航栏 */
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
/* 轮播图 */
.banner-section {
	margin: 0 20rpx;
	margin-top: -1rpx;
}
.banner-swiper {
	height: 360rpx;
	border-radius: 0 0 16rpx 16rpx;
	overflow: hidden;
}
.banner-img {
	width: 100%;
	height: 100%;
}
.default-banner {
	height: 360rpx;
	background: linear-gradient(135deg, #e93323, #ff6b5a);
	border-radius: 0 0 16rpx 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.banner-text {
	text-align: center;
}
.banner-main {
	font-size: 44rpx;
	font-weight: bold;
	color: #fff;
	display: block;
}
.banner-sub {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
	margin-top: 12rpx;
	display: block;
}
/* 公告 */
.notice-bar {
	margin: 16rpx 20rpx;
	background: #fff7e6;
	border-radius: 12rpx;
	padding: 16rpx 24rpx;
	display: flex;
	align-items: center;
}
.notice-icon {
	font-size: 28rpx;
	margin-right: 12rpx;
}
.notice-text {
	font-size: 26rpx;
	color: #d48806;
	flex: 1;
}
/* 快捷导航 */
.nav-grid {
	margin: 16rpx 20rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 30rpx 20rpx;
	display: flex;
	justify-content: space-around;
}
.nav-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.nav-icon-wrap {
	width: 88rpx;
	height: 88rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 12rpx;
}
.icon-product { background: #fff0f0; }
.icon-case { background: #f0f5ff; }
.icon-course { background: #f6ffed; }
.icon-offline { background: #fff7e6; }
.icon-member { background: #f9f0ff; }
.icon-custom { background: #f0f0f0; }
.nav-icon-text {
	font-size: 40rpx;
}
.nav-label {
	font-size: 24rpx;
	color: #333;
}
/* 板块通用 */
.section {
	margin: 16rpx 20rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
}
.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}
.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}
.section-more {
	font-size: 24rpx;
	color: #e93323;
}
/* 精选案例横滚 */
.case-scroll {
	white-space: nowrap;
}
.case-scroll-item {
	display: inline-block;
	width: 280rpx;
	margin-right: 16rpx;
	vertical-align: top;
}
.case-scroll-img {
	width: 280rpx;
	height: 200rpx;
	border-radius: 12rpx;
}
.case-scroll-title {
	font-size: 24rpx;
	color: #333;
	display: block;
	margin-top: 8rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
/* 课程列表 */
.course-list { }
.course-card {
	display: flex;
	margin-bottom: 16rpx;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #f0f0f0;
}
.course-card:last-child {
	border-bottom: none;
	margin-bottom: 0;
	padding-bottom: 0;
}
.course-card-img {
	width: 200rpx;
	height: 140rpx;
	border-radius: 12rpx;
	flex-shrink: 0;
	margin-right: 20rpx;
}
.course-card-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
.course-card-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
}
.course-card-desc {
	font-size: 24rpx;
	color: #999;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-top: 8rpx;
}
.course-card-bottom {
	display: flex;
	align-items: center;
	margin-top: 8rpx;
}
.course-card-price {
	font-size: 28rpx;
	color: #52c41a;
	font-weight: bold;
}
.course-card-price.paid {
	color: #e93323;
}
.course-card-tag {
	font-size: 20rpx;
	color: #fff;
	background: #e93323;
	padding: 2rpx 12rpx;
	border-radius: 4rpx;
	margin-left: 12rpx;
}
/* 联系我们 */
.contact-card { }
.contact-item {
	display: flex;
	justify-content: space-between;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}
.contact-label {
	font-size: 28rpx;
	color: #666;
}
.contact-value {
	font-size: 28rpx;
	color: #e93323;
}
.contact-qrcode {
	width: 240rpx;
	height: 240rpx;
	margin: 20rpx auto 0;
	display: block;
}
.empty-hint {
	text-align: center;
	padding: 30rpx 0;
	color: #999;
	font-size: 24rpx;
}
/* 底部 */
.footer {
	text-align: center;
	padding: 40rpx 0 20rpx;
}
.footer-text {
	font-size: 24rpx;
	color: #ccc;
}
</style>
