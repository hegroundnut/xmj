<template>
	<view class="course-page">
		<!-- 会员横幅 -->
		<view class="member-banner" v-if="!isMember">
			<text>开通会员，解锁全部课程</text>
			<button class="member-btn" @click="openMember">开通会员 ¥299</button>
		</view>
		<view class="member-banner is-member" v-else>
			<text>您是会员，全部课程免费看</text>
		</view>
		<!-- 课程列表 -->
		<view class="course-list">
			<view class="course-item" v-for="item in list" :key="item.id" @click="handleCourse(item)">
				<image :src="item.cover" mode="aspectFill" class="course-cover" />
				<view class="course-info">
					<text class="course-title">{{ item.title }}</text>
					<text class="course-desc">{{ item.desc }}</text>
					<view class="course-bottom">
						<text class="course-price" :class="{ free: item.can_watch }">
							{{ item.can_watch ? '免费' : '¥' + item.price + ' 试听' }}
						</text>
					</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadStatus" />
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
		this.checkMember();
		this.loadList();
	},
	onReachBottom() {
		this.loadList();
	},
	methods: {
		checkMember() {
			// 在课程列表 API 中 is_member 字段携带会员信息
		},
		async loadList() {
			if (this.loadStatus === 'loading' || this.loadStatus === 'noMore') return;
			this.loadStatus = 'loading';
			try {
				const res = await this.$api.get('v2/course/list', {
					page: this.page,
					limit: this.limit,
				});
				const data = res.data || {};
				this.isMember = (data.list?.[0]?.is_member) || false;
				this.list =
					this.page === 1
						? data.list || []
						: this.list.concat(data.list || []);
				this.page++;
				this.loadStatus =
					(data.list || []).length < this.limit ? 'noMore' : 'more';
			} catch (e) {
				this.loadStatus = 'more';
			}
		},
		handleCourse(item) {
			uni.navigateTo({ url: `/pages/teaching/course/detail?id=${item.id}` });
		},
		openMember() {
			uni.showToast({ title: '会员购买功能', icon: 'none' });
		},
	},
};
</script>

<style scoped>
.member-banner {
	padding: 30rpx;
	background: #fff5f5;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 28rpx;
}
.member-banner.is-member {
	background: #f0f9f0;
	color: #2e7d32;
}
.member-btn {
	background: #e93323;
	color: #fff;
	font-size: 26rpx;
	padding: 10rpx 24rpx;
	border-radius: 30rpx;
}
.course-item {
	display: flex;
	margin: 20rpx;
	background: #fff;
	border-radius: 12rpx;
	overflow: hidden;
}
.course-cover {
	width: 240rpx;
	height: 180rpx;
	flex-shrink: 0;
}
.course-info {
	flex: 1;
	padding: 16rpx;
	display: flex;
	flex-direction: column;
}
.course-title {
	font-size: 30rpx;
	font-weight: bold;
}
.course-desc {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
	flex: 1;
}
.course-bottom {
	margin-top: 8rpx;
}
.course-price {
	color: #e93323;
	font-size: 28rpx;
}
.course-price.free {
	color: #2e7d32;
}
</style>