<template>
  <view class="page">
    <view class="sub-tab">
      <view :class="['tab-item', activeTab === 'course' && 'active']" @click="switchTab('course')">线上课程</view>
      <view :class="['tab-item', activeTab === 'offline' && 'active']" @click="switchTab('offline')">线下课</view>
    </view>

    <!-- 线上课程 -->
    <view v-if="activeTab === 'course'" class="course-list">
      <view v-for="item in courseList" :key="item.id" class="course-item">
        <image :src="item.cover" mode="aspectFill" class="course-cover" />
        <view class="course-info">
          <text class="course-title">{{ item.title }}</text>
          <text class="course-desc">{{ item.subtitle || item.desc }}</text>
          <view class="course-bottom">
            <text class="course-price">¥{{ item.price }}</text>
            <text class="buy-btn" @click="buyCourse(item)">立即购买</text>
          </view>
        </view>
      </view>
      <view v-if="courseList.length === 0 && !loading" class="empty">暂无线上课程</view>
    </view>

    <!-- 线下课 -->
    <view v-if="activeTab === 'offline'" class="offline-list">
      <view v-for="item in offlineList" :key="item.id" class="offline-item">
        <image :src="item.cover" mode="aspectFill" class="offline-cover" />
        <view class="offline-info">
          <text class="offline-title">{{ item.title }}</text>
          <text class="offline-time">{{ item.class_time }}</text>
          <text class="offline-address">{{ item.address }}</text>
          <text class="offline-price">¥{{ item.price }}</text>
          <text class="book-btn" @click="openBooking(item)">立即预约</text>
        </view>
      </view>
      <view v-if="offlineList.length === 0 && !loading" class="empty">暂无线下课</view>
    </view>

    <view v-if="loading" class="loading">加载中...</view>

    <!-- 预约弹窗 -->
    <view v-if="showBooking" class="modal-mask" @click="closeBooking">
      <view class="modal" @click.stop>
        <text class="modal-title">预约课程</text>
        <text class="modal-label">姓名</text>
        <input v-model="bookingForm.name" class="modal-input" placeholder="请输入姓名" />
        <text class="modal-label">手机号</text>
        <input v-model="bookingForm.phone" class="modal-input" placeholder="请输入手机号" type="tel" />
        <view class="modal-actions">
          <text class="modal-cancel" @click="closeBooking">取消</text>
          <text class="modal-confirm" @click="submitBooking">确认预约</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getCourseList, getOfflineClassList, createCourseOrder, createOfflineBooking } from '@/api/teaching.js';

export default {
  data() {
    return {
      activeTab: 'course',
      courseList: [],
      offlineList: [],
      loading: false,
      showBooking: false,
      bookingTarget: null,
      bookingForm: { name: '', phone: '' },
    };
  },
  onShow() {
    this.loadData();
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab;
      this.loadData();
    },
    async loadData() {
      this.loading = true;
      try {
        if (this.activeTab === 'course') {
          const res = await getCourseList({ page: 1, limit: 20 });
          this.courseList = res.data.list || [];
        } else {
          const res = await getOfflineClassList({ page: 1, limit: 20 });
          this.offlineList = res.data.list || [];
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async buyCourse(item) {
      try {
        await createCourseOrder(item.id);
        uni.showToast({ title: '购买成功', icon: 'none' });
        this.loadData();
      } catch (e) {
        uni.showToast({ title: e.msg || '购买失败', icon: 'none' });
      }
    },
    openBooking(item) {
      this.bookingTarget = item;
      this.bookingForm = { name: '', phone: '' };
      this.showBooking = true;
    },
    closeBooking() {
      this.showBooking = false;
      this.bookingTarget = null;
    },
    async submitBooking() {
      if (!this.bookingForm.name) {
        uni.showToast({ title: '请输入姓名', icon: 'none' });
        return;
      }
      if (!this.bookingForm.phone) {
        uni.showToast({ title: '请输入手机号', icon: 'none' });
        return;
      }
      try {
        await createOfflineBooking({
          offline_class_id: this.bookingTarget.id,
          name: this.bookingForm.name,
          phone: this.bookingForm.phone,
        });
        uni.showToast({ title: '预约成功', icon: 'none' });
        this.closeBooking();
      } catch (e) {
        uni.showToast({ title: e.msg || '预约失败', icon: 'none' });
      }
    },
  },
};
</script>

<style>
.page { background: #f5f5f5; min-height: 100vh; }
.sub-tab { display: flex; background: #fff; padding: 20rpx; }
.tab-item { flex: 1; text-align: center; font-size: 28rpx; color: #666; padding: 10rpx 0; }
.tab-item.active { color: #e93323; font-weight: bold; }

.course-list { padding: 20rpx; }
.course-item { background: #fff; border-radius: 10rpx; overflow: hidden; margin-bottom: 20rpx; }
.course-cover { width: 100%; height: 320rpx; }
.course-info { padding: 20rpx; }
.course-title { font-size: 30rpx; font-weight: bold; color: #333; display: block; }
.course-desc { font-size: 26rpx; color: #999; margin-top: 10rpx; display: block; }
.course-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 20rpx; }
.course-price { font-size: 32rpx; color: #e93323; font-weight: bold; }
.buy-btn { background: #e93323; color: #fff; padding: 12rpx 40rpx; border-radius: 40rpx; font-size: 26rpx; }

.offline-list { padding: 20rpx; }
.offline-item { background: #fff; border-radius: 10rpx; overflow: hidden; margin-bottom: 20rpx; }
.offline-cover { width: 100%; height: 280rpx; }
.offline-info { padding: 20rpx; }
.offline-title { font-size: 28rpx; font-weight: bold; color: #333; display: block; }
.offline-time, .offline-address { font-size: 24rpx; color: #999; margin-top: 8rpx; display: block; }
.offline-price { font-size: 30rpx; color: #e93323; font-weight: bold; margin-top: 12rpx; display: block; }
.book-btn { display: inline-block; background: #e93323; color: #fff; padding: 12rpx 40rpx; border-radius: 40rpx; font-size: 26rpx; margin-top: 12rpx; }

.empty, .loading { text-align: center; padding: 40rpx; font-size: 28rpx; color: #999; }

.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal { background: #fff; width: 600rpx; border-radius: 20rpx; padding: 40rpx; }
.modal-title { font-size: 32rpx; font-weight: bold; color: #333; display: block; text-align: center; margin-bottom: 30rpx; }
.modal-label { font-size: 26rpx; color: #666; display: block; margin-top: 20rpx; margin-bottom: 10rpx; }
.modal-input { border: 1rpx solid #ddd; border-radius: 8rpx; padding: 20rpx; font-size: 26rpx; width: 100%; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: space-between; margin-top: 40rpx; }
.modal-cancel, .modal-confirm { flex: 1; text-align: center; padding: 20rpx; font-size: 28rpx; border-radius: 10rpx; }
.modal-cancel { background: #f5f5f5; color: #666; margin-right: 20rpx; }
.modal-confirm { background: #e93323; color: #fff; }
</style>
