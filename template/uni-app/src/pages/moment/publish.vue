<template>
  <view class="publish-page">
    <view class="publish-form">
      <textarea v-model="content" placeholder="分享你的生活..." class="content-input" maxlength="5000" />
      <!-- 图片区域 -->
      <view class="image-area">
        <view v-for="(img, i) in images" :key="i" class="image-item">
          <image :src="img" mode="aspectFill" class="preview-img" />
          <text class="remove-btn" @click="removeImage(i)">×</text>
        </view>
        <view v-if="images.length < 9" class="add-btn" @click="chooseImage">+</view>
      </view>
      <!-- 视频 -->
      <view v-if="videoUrl" class="video-area">
        <video :src="videoUrl" class="preview-video" controls />
        <text class="remove-btn" @click="videoUrl = ''">× 移除视频</text>
      </view>
      <view v-if="!videoUrl && images.length === 0" class="add-video-btn" @click="chooseVideo">+ 添加视频</view>
    </view>
    <button type="primary" class="submit-btn" :loading="submitting" @click="handleSubmit">发布</button>
  </view>
</template>

<script>
import { createMoment } from '@/api/moment';

export default {
  data() {
    return {
      content: '',
      images: [],
      videoUrl: '',
      submitting: false,
    };
  },
  methods: {
    chooseImage() {
      const count = 9 - this.images.length;
      uni.chooseImage({
        count,
        success: res => {
          this.uploadFiles(res.tempFilePaths);
        },
      });
    },
    chooseVideo() {
      uni.chooseVideo({
        maxDuration: 60,
        success: res => {
          this.uploadFiles([res.tempFilePath], 'video');
        },
      });
    },
    uploadFiles(paths, type = 'image') {
      uni.showLoading({ title: '上传中...' });
      const uploads = paths.map(p => {
        return new Promise((resolve, reject) => {
          uni.uploadFile({
            url: this.$api.baseUrl + '/api/upload',
            filePath: p,
            name: 'file',
            success: res => {
              const data = JSON.parse(res.data);
              if (data.data && data.data.url) resolve(data.data.url);
              else reject(new Error('上传失败'));
            },
            fail: reject,
          });
        });
      });
      Promise.all(uploads).then(urls => {
        uni.hideLoading();
        if (type === 'video') this.videoUrl = urls[0];
        else this.images = this.images.concat(urls).slice(0, 9);
      }).catch(() => {
        uni.hideLoading();
        uni.showToast({ title: '上传失败', icon: 'none' });
      });
    },
    removeImage(i) { this.images.splice(i, 1); },
    async handleSubmit() {
      if (!this.content.trim() && this.images.length === 0 && !this.videoUrl) {
        return uni.showToast({ title: '请输入内容或添加图片/视频', icon: 'none' });
      }
      this.submitting = true;
      try {
        await createMoment({
          content: this.content,
          images: JSON.stringify(this.images),
          video_url: this.videoUrl,
        });
        uni.showToast({ title: '发布成功', icon: 'none' });
        setTimeout(() => uni.navigateBack(), 1000);
      } catch (e) {
        uni.showToast({ title: e.msg || '发布失败', icon: 'none' });
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.publish-page { padding: 24rpx; background: #f5f5f5; min-height: 100vh; }
.publish-form { background: #fff; border-radius: 12rpx; padding: 24rpx; }
.content-input { width: 100%; min-height: 200rpx; font-size: 30rpx; line-height: 1.6; }
.image-area { display: flex; flex-wrap: wrap; margin-top: 20rpx; gap: 12rpx; }
.image-item { position: relative; }
.preview-img { width: 200rpx; height: 200rpx; border-radius: 8rpx; }
.preview-video { width: 100%; height: 300rpx; border-radius: 8rpx; margin: 12rpx 0; }
.remove-btn { position: absolute; top: -10rpx; right: -10rpx; background: #e93323; color: #fff; width: 40rpx; height: 40rpx; border-radius: 50%; text-align: center; line-height: 40rpx; font-size: 24rpx; }
.add-btn { width: 200rpx; height: 200rpx; background: #f0f0f0; border-radius: 8rpx; display: flex; align-items: center; justify-content: center; font-size: 60rpx; color: #999; }
.add-video-btn { margin-top: 20rpx; padding: 24rpx; background: #f0f0f0; text-align: center; border-radius: 8rpx; color: #666; font-size: 28rpx; }
.submit-btn { margin-top: 40rpx; background: #e93323; }
.video-area { position: relative; margin-top: 12rpx; }
</style>
