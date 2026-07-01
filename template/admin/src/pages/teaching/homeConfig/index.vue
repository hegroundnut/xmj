<template>
  <div class="teaching-home-config">
    <el-card v-loading="loading">
      <div slot="header"><span style="font-weight:bold">小程序首页配置</span></div>

      <!-- 轮播图配置 -->
      <el-divider content-position="left">轮播图（Hero Banner）</el-divider>
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

      <!-- Hero 文字配置 -->
      <el-divider content-position="left">品牌文字（Hero Text）</el-divider>
      <el-form label-width="100px">
        <el-form-item label="启用">
          <el-switch v-model="config.hero_text.enabled" />
        </el-form-item>
        <el-form-item label="品牌英文" v-if="config.hero_text.enabled">
          <el-input v-model="config.hero_text.brand" style="width:300px" placeholder="ALI LAOXI" />
        </el-form-item>
        <el-form-item label="品牌中文" v-if="config.hero_text.enabled">
          <el-input v-model="config.hero_text.title" style="width:300px" placeholder="阿利老西" />
        </el-form-item>
        <el-form-item label="副标题" v-if="config.hero_text.enabled">
          <el-input v-model="config.hero_text.subtitle" style="width:300px" placeholder="专业洗眉设备 · 第5代新品" />
        </el-form-item>
      </el-form>

      <!-- 精选案例 -->
      <el-divider content-position="left">精选案例（SELECTED CASES）</el-divider>
      <el-form label-width="100px">
        <el-form-item label="启用">
          <el-switch v-model="config.featured_cases.enabled" />
        </el-form-item>
        <el-form-item label="板块标题" v-if="config.featured_cases.enabled">
          <el-input v-model="config.featured_cases.title" style="width:200px" />
          <el-input v-model="config.featured_cases.title_en" style="width:200px;margin-left:8px" placeholder="英文标题" />
        </el-form-item>
        <el-form-item label="显示数量" v-if="config.featured_cases.enabled">
          <el-input-number v-model="config.featured_cases.limit" :min="1" :max="10" />
        </el-form-item>
        <el-form-item v-if="config.featured_cases.enabled">
          <el-alert type="info" :closable="false" show-icon>
            精选案例数据来源：在「案例管理」中将案例设为「精选」即可在首页显示
          </el-alert>
        </el-form-item>
      </el-form>

      <!-- 热门课程 -->
      <el-divider content-position="left">热门课程（HOT COURSES）</el-divider>
      <el-form label-width="100px">
        <el-form-item label="启用">
          <el-switch v-model="config.latest_courses.enabled" />
        </el-form-item>
        <el-form-item label="板块标题" v-if="config.latest_courses.enabled">
          <el-input v-model="config.latest_courses.title" style="width:200px" />
          <el-input v-model="config.latest_courses.title_en" style="width:200px;margin-left:8px" placeholder="英文标题" />
        </el-form-item>
        <el-form-item label="显示数量" v-if="config.latest_courses.enabled">
          <el-input-number v-model="config.latest_courses.limit" :min="1" :max="10" />
        </el-form-item>
      </el-form>

      <!-- 联系我们 -->
      <el-divider content-position="left">联系我们（CONTACT US）</el-divider>
      <el-form label-width="100px">
        <el-form-item label="启用">
          <el-switch v-model="config.contact.enabled" />
        </el-form-item>
        <el-form-item label="板块标题" v-if="config.contact.enabled">
          <el-input v-model="config.contact.title" style="width:200px" />
          <el-input v-model="config.contact.title_en" style="width:200px;margin-left:8px" placeholder="英文标题" />
        </el-form-item>
        <el-form-item label="联系电话" v-if="config.contact.enabled">
          <el-input v-model="config.contact.phone" style="width:300px" placeholder="400-888-9999" />
        </el-form-item>
        <el-form-item label="微信号" v-if="config.contact.enabled">
          <el-input v-model="config.contact.wechat" style="width:300px" placeholder="alilaoxi_official" />
        </el-form-item>
        <el-form-item label="营业时间" v-if="config.contact.enabled">
          <el-input v-model="config.contact.hours" style="width:300px" placeholder="周一至周六 10:00-19:30" />
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
        hero_text: { enabled: true, brand: 'ALI LAOXI', title: '阿利老西', subtitle: '专业洗眉设备 · 第5代新品' },
        featured_cases: { enabled: true, title: '精选案例', title_en: 'SELECTED CASES', limit: 4 },
        latest_courses: { enabled: true, title: '热门课程', title_en: 'HOT COURSES', limit: 3 },
        contact: { enabled: true, title: '联系我们', title_en: 'CONTACT US', phone: '', wechat: '', hours: '周一至周六 10:00-19:30', qrcode: '' },
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
          const d = res.data;
          this.config = {
            banner: d.banner || this.config.banner,
            hero_text: d.hero_text || this.config.hero_text,
            featured_cases: d.featured_cases || this.config.featured_cases,
            latest_courses: d.latest_courses || this.config.latest_courses,
            contact: d.contact || this.config.contact,
          };
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
