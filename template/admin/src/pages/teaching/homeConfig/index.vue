<template>
  <div class="teaching-home-config">
    <el-card v-loading="loading">
      <div slot="header"><span style="font-weight:bold">小程序首页配置</span></div>

      <!-- 轮播图配置 -->
      <el-divider content-position="left">轮播图</el-divider>
      <el-form label-width="100px">
        <el-form-item label="启用">
          <el-switch v-model="config.banner.enabled" />
        </el-form-item>
        <el-form-item label="轮播图片" v-if="config.banner.enabled">
          <div class="banner-list">
            <div v-for="(item, i) in config.banner.items" :key="i" class="banner-item">
              <img :src="item.image" style="width:120px;height:60px;object-fit:cover;border-radius:4px" />
              <el-input v-model="item.link" placeholder="跳转链接(可选)" size="small" style="width:200px;margin:0 8px" />
              <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="config.banner.items.splice(i, 1)" />
            </div>
            <el-button type="primary" size="small" @click="bannerModal = true">+ 添加图片</el-button>
          </div>
          <el-dialog :visible.sync="bannerModal" width="950px" title="选择轮播图" :close-on-click-modal="false" append-to-body>
            <uploadPictures :isChoice="'单选'" @getPic="addBannerPic" :gridBtn="gridBtn" :gridPic="gridPic" v-if="bannerModal" />
          </el-dialog>
        </el-form-item>
      </el-form>

      <!-- 公告配置 -->
      <el-divider content-position="left">顶部公告</el-divider>
      <el-form label-width="100px">
        <el-form-item label="启用">
          <el-switch v-model="config.notice.enabled" />
        </el-form-item>
        <el-form-item label="公告文字" v-if="config.notice.enabled">
          <el-input v-model="config.notice.text" placeholder="公告内容" />
        </el-form-item>
      </el-form>

      <!-- 快捷导航 -->
      <el-divider content-position="left">快捷导航</el-divider>
      <el-form label-width="100px">
        <el-form-item label="启用">
          <el-switch v-model="config.quick_nav.enabled" />
        </el-form-item>
        <el-form-item v-if="config.quick_nav.enabled">
          <el-table :data="config.quick_nav.items" border size="small">
            <el-table-column label="图标" width="120">
              <template slot-scope="{row}">
                <el-select v-model="row.icon" size="mini">
                  <el-option label="产品" value="product" />
                  <el-option label="案例" value="case" />
                  <el-option label="课程" value="course" />
                  <el-option label="线下" value="offline" />
                  <el-option label="会员" value="member" />
                  <el-option label="自定义" value="custom" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="标题">
              <template slot-scope="{row}"><el-input v-model="row.title" size="mini" /></template>
            </el-table-column>
            <el-table-column label="跳转页面">
              <template slot-scope="{row}"><el-input v-model="row.page" size="mini" placeholder="/pages/..." /></template>
            </el-table-column>
            <el-table-column label="操作" width="60">
              <template slot-scope="{$index}">
                <el-button type="text" style="color:#f56c6c" @click="config.quick_nav.items.splice($index, 1)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="text" @click="config.quick_nav.items.push({ icon: 'custom', title: '', page: '' })">+ 添加导航</el-button>
        </el-form-item>
      </el-form>

      <!-- 精选案例 -->
      <el-divider content-position="left">精选案例</el-divider>
      <el-form label-width="100px">
        <el-form-item label="启用">
          <el-switch v-model="config.featured_cases.enabled" />
        </el-form-item>
        <el-form-item label="板块标题" v-if="config.featured_cases.enabled">
          <el-input v-model="config.featured_cases.title" style="width:300px" />
        </el-form-item>
        <el-form-item label="显示数量" v-if="config.featured_cases.enabled">
          <el-input-number v-model="config.featured_cases.limit" :min="1" :max="10" />
        </el-form-item>
      </el-form>

      <!-- 热门课程 -->
      <el-divider content-position="left">热门课程</el-divider>
      <el-form label-width="100px">
        <el-form-item label="启用">
          <el-switch v-model="config.latest_courses.enabled" />
        </el-form-item>
        <el-form-item label="板块标题" v-if="config.latest_courses.enabled">
          <el-input v-model="config.latest_courses.title" style="width:300px" />
        </el-form-item>
        <el-form-item label="显示数量" v-if="config.latest_courses.enabled">
          <el-input-number v-model="config.latest_courses.limit" :min="1" :max="10" />
        </el-form-item>
      </el-form>

      <!-- 联系我们 -->
      <el-divider content-position="left">联系我们</el-divider>
      <el-form label-width="100px">
        <el-form-item label="启用">
          <el-switch v-model="config.contact.enabled" />
        </el-form-item>
        <el-form-item label="联系电话" v-if="config.contact.enabled">
          <el-input v-model="config.contact.phone" style="width:300px" />
        </el-form-item>
        <el-form-item label="微信号" v-if="config.contact.enabled">
          <el-input v-model="config.contact.wechat" style="width:300px" />
        </el-form-item>
        <el-form-item label="二维码" v-if="config.contact.enabled">
          <el-button type="primary" size="small" @click="qrcodeModal = true">选择图片</el-button>
          <div v-if="config.contact.qrcode" style="margin-top:8px">
            <img :src="config.contact.qrcode" style="width:100px;height:100px;object-fit:cover;border-radius:4px" />
          </div>
          <el-dialog :visible.sync="qrcodeModal" width="950px" title="选择二维码" :close-on-click-modal="false" append-to-body>
            <uploadPictures :isChoice="'单选'" @getPic="getQrcodePic" :gridBtn="gridBtn" :gridPic="gridPic" v-if="qrcodeModal" />
          </el-dialog>
        </el-form-item>
      </el-form>

      <div style="text-align:center;margin-top:20px">
        <el-button type="primary" size="medium" :loading="saving" @click="handleSave">保存配置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getHomeConfig, saveHomeConfig } from '@/api/teaching';
import uploadPictures from '@/components/uploadPictures';

export default {
  name: 'teachingHomeConfig',
  components: { uploadPictures },
  data() {
    return {
      loading: false,
      saving: false,
      bannerModal: false,
      qrcodeModal: false,
      gridBtn: { xl: 150, lg: 150, md: 150, sm: 150, xs: 150 },
      gridPic: { xl: 200, lg: 200, md: 200, sm: 200, xs: 200 },
      config: {
        banner: { enabled: true, items: [] },
        notice: { enabled: true, text: '' },
        quick_nav: {
          enabled: true,
          items: [
            { icon: 'product', title: '产品展示', page: '/pages/teaching/product/index' },
            { icon: 'case', title: '案例展示', page: '/pages/teaching/case/index' },
            { icon: 'course', title: '教学课程', page: '/pages/teaching/course/index' },
            { icon: 'offline', title: '线下课程', page: '/pages/teaching/offline/index' },
          ],
        },
        featured_cases: { enabled: true, title: '精选案例', limit: 4 },
        latest_courses: { enabled: true, title: '热门课程', limit: 3 },
        contact: { enabled: true, title: '联系我们', qrcode: '', phone: '', wechat: '' },
      },
    };
  },
  mounted() {
    this.loadConfig();
  },
  methods: {
    async loadConfig() {
      this.loading = true;
      try {
        const res = await getHomeConfig();
        if (res.data && typeof res.data === 'object' && res.data.banner) {
          this.config = res.data;
        }
      } finally {
        this.loading = false;
      }
    },
    addBannerPic(pic) {
      this.config.banner.items.push({ image: pic.satt_dir || pic.att_dir, link: '' });
      this.bannerModal = false;
    },
    getQrcodePic(pic) {
      this.config.contact.qrcode = pic.satt_dir || pic.att_dir;
      this.qrcodeModal = false;
    },
    async handleSave() {
      this.saving = true;
      try {
        await saveHomeConfig(this.config);
        this.$message.success('保存成功');
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.banner-list { }
.banner-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
</style>
