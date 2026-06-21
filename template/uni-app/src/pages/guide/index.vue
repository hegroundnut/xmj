<template>
	<view></view>
</template>

<script>
export default {
	onLoad() {
		uni.switchTab({
			url: '/pages/teaching/product/index'
		});
	}
};
</script>

<style>
page {
	width: 100%;
	height: 100%;
}
</style>
