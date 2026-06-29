<template>
  <div class="teaching-product-info">
    <el-card>
      <div slot="header" class="clearfix">
        <span>产品管理</span>
        <el-button type="primary" size="small" style="float:right" @click="handleAdd">+ 添加产品</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column label="轮播图" width="100">
          <template slot-scope="{row}">
            <img v-if="row.banner && row.banner.length" :src="row.banner[0]" style="width:60px;height:60px;object-fit:cover" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="产品标题" />
        <el-table-column label="首页显示" width="100">
          <template slot-scope="{row}">
            <el-tag :type="row.is_home ? 'success' : 'info'" size="small">{{ row.is_home ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="{row}">
            <el-tag :type="row.status ? 'success' : 'danger'" size="small">{{ row.status ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="{row}">
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" style="color:#f56c6c" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="轮播图">
          <el-button type="primary" size="small" @click="bannerModal = true">选择轮播图</el-button>
          <div v-if="form.banner.length" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px">
            <div v-for="(item, idx) in form.banner" :key="idx" style="position:relative;width:80px;height:80px">
              <img :src="item" style="width:100%;height:100%;object-fit:cover;border-radius:4px" />
              <i class="el-icon-delete" style="position:absolute;top:-6px;right:-6px;cursor:pointer;color:#f56c6c;font-size:16px" @click="form.banner.splice(idx,1)" />
            </div>
          </div>
          <el-dialog :visible.sync="bannerModal" width="950px" title="选择轮播图" :close-on-click-modal="false" append-to-body>
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
        <el-form-item label="首页显示">
          <el-switch v-model="form.is_home" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSave">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getProductList, saveProductInfo, deleteProduct } from '@/api/teaching';
import uploadPictures from '@/components/uploadPictures';
import WangEditor from '@/components/wangEditor/index.vue';

export default {
  name: 'TeachingProductInfo',
  components: { uploadPictures, WangEditor },
  data() {
    return {
      list: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '添加产品',
      submitLoading: false,
      bannerModal: false,
      gridBtn: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
      gridPic: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
      editId: 0,
      form: {
        banner: [],
        title: '',
        desc: '',
        detail: '',
        specs: [],
        video_url: '',
        is_home: 0,
        status: 1,
      },
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const { data } = await getProductList();
        this.list = data || [];
      } finally {
        this.loading = false;
      }
    },
    handleAdd() {
      this.editId = 0;
      this.dialogTitle = '添加产品';
      this.form = { banner: [], title: '', desc: '', detail: '', specs: [], video_url: '', is_home: 0, status: 1 };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.editId = row.id;
      this.dialogTitle = '编辑产品';
      this.form = {
        banner: row.banner || [],
        title: row.title || '',
        desc: row.desc || '',
        detail: row.detail || '',
        specs: row.specs || [],
        video_url: row.video_url || '',
        is_home: row.is_home ?? 0,
        status: row.status ?? 1,
      };
      this.dialogVisible = true;
    },
    getBannerPicD(pc) {
      this.form.banner = pc.map((item) => item.att_dir);
      this.bannerModal = false;
    },
    async handleSave() {
      this.submitLoading = true;
      try {
        await saveProductInfo({ ...this.form, id: this.editId });
        this.$message.success('保存成功');
        this.dialogVisible = false;
        this.loadData();
      } finally {
        this.submitLoading = false;
      }
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该产品吗？', '提示', { type: 'warning' });
        await deleteProduct(id);
        this.$message.success('删除成功');
        this.loadData();
      } catch (e) {}
    },
  },
};
</script>
