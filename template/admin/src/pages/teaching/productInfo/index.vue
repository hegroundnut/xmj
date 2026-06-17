<template>
  <div class="teaching-product-info">
    <el-card>
      <div slot="header">
        <span>产品信息</span>
      </div>
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="轮播图">
          <el-button type="primary" size="small" @click="bannerModal = true">选择轮播图</el-button>
          <div v-if="form.banner.length" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px">
            <div v-for="(item, idx) in form.banner" :key="idx" style="position:relative;width:80px;height:80px">
              <img :src="item" style="width:100%;height:100%;object-fit:cover;border-radius:4px" />
              <i class="el-icon-delete" style="position:absolute;top:-6px;right:-6px;cursor:pointer;color:#f56c6c;font-size:16px" @click="form.banner.splice(idx,1)" />
            </div>
          </div>
          <el-dialog :visible.sync="bannerModal" width="950px" title="选择轮播图" :close-on-click-modal="false">
            <uploadPictures :isChoice="'多选'" @getPicD="getBannerPicD" :gridBtn="gridBtn" :gridPic="gridPic" v-if="bannerModal" />
          </el-dialog>
        </el-form-item>
        <el-form-item label="产品标题">
          <el-input v-model="form.title" maxlength="255" placeholder="请输入产品标题" />
        </el-form-item>
        <el-form-item label="产品描述">
          <el-input v-model="form.desc" type="textarea" :rows="4" placeholder="请输入产品描述" />
        </el-form-item>
        <el-form-item label="图文详情">
          <WangEditor :content="form.detail" @editorContent="(v) => form.detail = v" />
        </el-form-item>
        <el-form-item label="参数规格">
          <div v-for="(item, index) in form.specs" :key="index" style="margin-bottom:8px">
            <el-input v-model="item.key" placeholder="参数名" style="width:150px" />
            <el-input v-model="item.value" placeholder="参数值" style="width:200px;margin-left:8px" />
            <el-button type="danger" icon="el-icon-delete" circle size="small" @click="form.specs.splice(index,1)" />
          </div>
          <el-button type="primary" size="small" @click="form.specs.push({key:'',value:''})">+ 添加规格</el-button>
        </el-form-item>
        <el-form-item label="视频链接">
          <el-input v-model="form.video_url" placeholder="视频链接（可选）" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getProductInfo, saveProductInfo } from '@/api/teaching';
import uploadPictures from '@/components/uploadPictures';
import WangEditor from '@/components/wangEditor/index.vue';

export default {
  name: 'TeachingProductInfo',
  components: { uploadPictures, WangEditor },
  data() {
    return {
      loading: false,
      bannerModal: false,
      gridBtn: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
      gridPic: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
      form: {
        banner: [],
        title: '',
        desc: '',
        detail: '',
        specs: [],
        video_url: '',
        status: 1,
      },
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const { data } = await getProductInfo();
      if (data && Object.keys(data).length) {
        this.form = {
          banner: data.banner || [],
          title: data.title || '',
          desc: data.desc || '',
          detail: data.detail || '',
          specs: data.specs || [],
          video_url: data.video_url || '',
          status: data.status ?? 1,
        };
      }
    },
    getBannerPicD(pc) {
      this.form.banner = pc.map((item) => item.att_dir);
      this.bannerModal = false;
    },
    async handleSave() {
      this.loading = true;
      try {
        await saveProductInfo(this.form);
        this.$message.success('保存成功');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>