<template>
	<view class="case-page">
		<!-- Tab 切换 -->
		<view class="tabs">
			<view
				v-for="tab in tabs" :key="tab.value"
				:class="['tab-item', { active: activeTab === tab.value }]"
				@click="switchTab(tab.value)"
			>{{ tab.label }}</view>
		</view>
		<!-- 网格列表 -->
		<view class="case-grid">
			<view class="case-item" v-for="item in list" :key="item.id" @click="handleClick(item)">
				<image :src="item.cover" mode="aspectFill" class="case-cover" />
				<view class="case-info">
					<text class="case-type">{{ item.type == 1 ? '图片' : '视频' }}</text>
					<text class="case-title">{{ item.title }}</text>
				</view>
			</view>
		</view>
		<!-- 加载更多 -->
		<uni-load-more :status="loadStatus" />
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
		handleClick(item) {
			if (item.type == 1) {
				uni.previewImage({ urls: [item.media_url] });
			} else {
				uni.navigateTo({
					url: `/pages/annex/web_view/index?url=${encodeURIComponent(item.media_url)}`,
				});
			}
		},
	},
};
</script>

<style scoped>
.case-page {
	padding-bottom: 20rpx;
}
.tabs {
	display: flex;
	padding: 20rpx 30rpx;
	background: #fff;
}
.tab-item {
	margin-right: 40rpx;
	font-size: 28rpx;
	color: #666;
}
.tab-item.active {
	color: #e93323;
	font-weight: bold;
	border-bottom: 4rpx solid #e93323;
}
.case-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 10rpx;
}
.case-item {
	width: calc(50% - 20rpx);
	margin: 10rpx;
	background: #fff;
	border-radius: 8rpx;
	overflow: hidden;
}
.case-cover {
	width: 100%;
	height: 240rpx;
}
.case-info {
	padding: 12rpx;
	display: flex;
	align-items: center;
}
.case-type {
	font-size: 22rpx;
	color: #fff;
	background: #e93323;
	padding: 2rpx 10rpx;
	border-radius: 4rpx;
	margin-right: 10rpx;
	flex-shrink: 0;
}
.case-title {
	font-size: 26rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>