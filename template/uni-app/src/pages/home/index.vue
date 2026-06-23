<template>
  <view class="page">
    <!-- 顶部 Banner -->
    <swiper v-if="config.banner && config.banner.enabled && config.banner.items.length" class="banner" indicator-dots autoplay circular>
      <swiper-item v-for="(item, i) in config.banner.items" :key="i">
        <image :src="item.image" mode="aspectFill" class="banner-img" />
      </swiper-item>
    </swiper>

    <!-- 公告 -->
    <view v-if="config.notice && config.notice.enabled" class="notice">
      <text class="notice-text">{{ config.notice.text }}</text>
    </view>

    <!-- 快捷导航 -->
    <view v-if="config.quick_nav && config.quick_nav.enabled" class="quick-nav">
      <view v-for="(item, i) in config.quick_nav.items" :key="i" class="nav-item" @click="onNavClick(item)">
        <image :src="item.icon" mode="aspectFit" class="nav-icon" />
        <text class="nav-label">{{ item.label }}</text>
      </view>
    </view>

    <!-- 精选案例 -->
    <view v-if="featuredCases.length" class="section">
      <view class="section-title">精选案例</view>
      <scroll-view scroll-x class="case-scroll">
        <view v-for="item in featuredCases" :key="item.id" class="case-card" @click="goCaseDetail(item.id)">
          <image :src="item.cover" mode="aspectFill" class="case-cover" />
          <text class="case-title">{{ item.title }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 课程推荐 -->
    <view v-if="latestCourses.length" class="section">
      <view class="section-title">课程推荐</view>
      <view v-for="item in latestCourses" :key="item.id" class="course-item" @click="goCourseDetail(item.id)">
        <image :src="item.cover" mode="aspectFill" class="course-cover" />
        <view class="course-info">
          <text class="course-title">{{ item.title }}</text>
          <text class="course-desc">{{ item.desc }}</text>
          <text v-if="item.price > 0" class="course-price">¥{{ item.price }}</text>
          <text v-else class="course-free">免费</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getHomeConfig } from '@/api/teaching.js';

export default {
  data() {
    return {
      config: { banner: {}, notice: {}, quick_nav: {} },
      featuredCases: [],
      latestCourses: [],
    };
  },
  onShow() {
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const res = await getHomeConfig();
        this.config = res.data;
        this.featuredCases = (res.data.featured_cases && res.data.featured_cases.data) || [];
        this.latestCourses = (res.data.latest_courses && res.data.latest_courses.data) || [];
      } catch (e) {
        console.error('load home config error', e);
      }
    },
    onNavClick(item) {
      if (item.path) {
        uni.switchTab({ url: item.path }).catch(() => {
          uni.navigateTo({ url: item.path }).catch(() => {});
        });
      }
    },
    goCaseDetail(id) {
      // case detail is not a page yet, skip or go to case tab
      uni.switchTab({ url: '/pages/case/index' });
    },
    goCourseDetail(id) {
      // navigate to course detail if exists, skip for now
    },
  },
};
</script>

<style>
.page { background: #f5f5f5; min-height: 100vh; }
.banner { width: 100%; height: 400rpx; }
.banner-img { width: 100%; height: 100%; }
.notice { background: #fff; padding: 16rpx 30rpx; margin: 10rpx 0; }
.notice-text { font-size: 26rpx; color: #e93323; }
.quick-nav { display: flex; flex-wrap: wrap; background: #fff; padding: 20rpx; }
.nav-item { width: 25%; text-align: center; margin-bottom: 20rpx; }
.nav-icon { width: 80rpx; height: 80rpx; }
.nav-label { display: block; font-size: 24rpx; color: #333; margin-top: 8rpx; }
.section { background: #fff; margin: 20rpx 0; padding: 20rpx; }
.section-title { font-size: 32rpx; font-weight: bold; margin-bottom: 20rpx; }
.case-scroll { white-space: nowrap; }
.case-card { display: inline-block; width: 280rpx; margin-right: 20rpx; }
.case-cover { width: 280rpx; height: 200rpx; border-radius: 10rpx; }
.case-title { display: block; font-size: 26rpx; color: #333; margin-top: 8rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.course-item { display: flex; margin-bottom: 20rpx; }
.course-cover { width: 200rpx; height: 150rpx; border-radius: 10rpx; }
.course-info { flex: 1; margin-left: 20rpx; display: flex; flex-direction: column; justify-content: space-between; }
.course-title { font-size: 28rpx; color: #333; }
.course-desc { font-size: 24rpx; color: #999; overflow: hidden; text-overflow: ellipsis; }
.course-price { font-size: 28rpx; color: #e93323; }
.course-free { font-size: 24rpx; color: #4caf50; }
</style>
