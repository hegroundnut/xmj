<template>
  <div class="teaching-case-list">
    <el-card>
      <div slot="header" class="clearfix">
        <el-button type="primary" size="small" @click="handleAdd">+ 添加案例</el-button>
        <el-select v-model="filterType" placeholder="类型筛选" clearable size="small" style="margin-left:10px;width:120px" @change="loadList">
          <el-option label="图片" :value="1" />
          <el-option label="视频" :value="2" />
        </el-select>
        <el-select v-model="filterCategoryId" placeholder="分类筛选" clearable size="small" style="margin-left:10px;width:150px" @change="loadList">
          <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
        <el-button type="text" size="small" style="margin-left:10px" @click="categoryDialogVisible = true">管理分类</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column label="封面" width="100">
          <template slot-scope="{row}"><img :src="row.cover" style="width:60px;height:60px;object-fit:cover" /></template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="category_name" label="分类" width="120" />
        <el-table-column label="类型" width="80">
          <template slot-scope="{row}">{{ row.type == 1 ? '图片' : '视频' }}</template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="80">
          <template slot-scope="{row}">
            <el-switch :value="row.status" :active-value="1" :inactive-value="0" @change="(v) => handleStatus(row, v)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="{row}">
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" style="color:#f56c6c" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="page"
        :page-size="limit"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false">
      <el-form ref="caseForm" :model="caseForm" label-width="80px">
        <el-form-item label="封面">
          <el-button type="primary" size="small" @click="coverModal = true">选择图片</el-button>
          <div v-if="caseForm.cover" style="margin-top:8px">
            <img :src="caseForm.cover" style="width:80px;height:80px;object-fit:cover;border-radius:4px" />
          </div>
          <el-dialog :visible.sync="coverModal" width="950px" title="选择封面" :close-on-click-modal="false" append-to-body>
            <uploadPictures :isChoice="'单选'" @getPic="getCoverPic" :gridBtn="gridBtn" :gridPic="gridPic" v-if="coverModal" />
          </el-dialog>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="caseForm.category_id" placeholder="选择分类" clearable style="width:100%">
            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="caseForm.type">
            <el-radio :label="1">图片</el-radio>
            <el-radio :label="2">视频</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="媒体文件">
          <template v-if="caseForm.type === 1">
            <el-button type="primary" size="small" @click="mediaModal = true">选择图片</el-button>
            <div v-if="caseForm.media_url" style="margin-top:8px">
              <img :src="caseForm.media_url" style="width:80px;height:80px;object-fit:cover;border-radius:4px" />
            </div>
            <el-dialog :visible.sync="mediaModal" width="950px" title="选择媒体图片" :close-on-click-modal="false" append-to-body>
              <uploadPictures :isChoice="'单选'" @getPic="getMediaPic" :gridBtn="gridBtn" :gridPic="gridPic" v-if="mediaModal" />
            </el-dialog>
          </template>
          <template v-else>
            <el-button type="primary" size="small" @click="videoModal = true">选择视频</el-button>
            <div v-if="caseForm.media_url" style="margin-top:8px;color:#409eff">{{ caseForm.media_url }}</div>
            <el-dialog :visible.sync="videoModal" width="950px" title="选择视频" :close-on-click-modal="false" append-to-body>
              <uploadVideo :isChoice="'one'" @getVideo="getMediaVideo" :gridBtn="gridBtn" :gridPic="gridPic" v-if="videoModal" />
            </el-dialog>
          </template>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="caseForm.title" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="caseForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="caseForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 分类管理弹窗 -->
    <el-dialog title="案例分类管理" :visible.sync="categoryDialogVisible" width="500px" :close-on-click-modal="false">
      <el-form :inline="true" style="margin-bottom:10px">
        <el-form-item>
          <el-input v-model="newCategoryName" placeholder="输入分类名称" size="small" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="handleAddCategory">添加</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="categoryList" border size="small">
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="120">
          <template slot-scope="{row}">
            <el-button type="text" style="color:#f56c6c" @click="handleDeleteCategory(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { getCaseList, saveCase, updateCase, deleteCase, getCategoryList, saveCategory, deleteCategory } from '@/api/teaching';
import uploadPictures from '@/components/uploadPictures';
import uploadVideo from '@/components/uploadVideo2';

export default {
  name: 'TeachingCaseList',
  components: { uploadPictures, uploadVideo },
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      limit: 15,
      total: 0,
      filterType: 0,
      filterCategoryId: '',
      dialogVisible: false,
      dialogTitle: '添加案例',
      submitLoading: false,
      caseForm: { title: '', type: 1, category_id: 0, cover: '', media_url: '', sort: 0, status: 1 },
      editId: null,
      coverModal: false,
      mediaModal: false,
      videoModal: false,
      gridBtn: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
      gridPic: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
      categoryList: [],
      categoryDialogVisible: false,
      newCategoryName: '',
    };
  },
  created() {
    this.loadCategoryList();
    this.loadList();
  },
  methods: {
    async loadCategoryList() {
      try {
        const { data } = await getCategoryList({ type: 1 });
        this.categoryList = data || [];
      } catch (e) {}
    },
    async loadList() {
      this.loading = true;
      try {
        const params = { page: this.page, limit: this.limit, type: this.filterType };
        if (this.filterCategoryId) params.category_id = this.filterCategoryId;
        const { data } = await getCaseList(params);
        this.list = data.list || [];
        this.total = data.count || 0;
      } finally { this.loading = false; }
    },
    handlePageChange(p) { this.page = p; this.loadList(); },
    handleAdd() {
      this.editId = null;
      this.dialogTitle = '添加案例';
      this.caseForm = { title: '', type: 1, category_id: 0, cover: '', media_url: '', sort: 0, status: 1 };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.editId = row.id;
      this.dialogTitle = '编辑案例';
      this.caseForm = { title: row.title, type: row.type, category_id: row.category_id || 0, cover: row.cover, media_url: row.media_url, sort: row.sort, status: row.status };
      this.dialogVisible = true;
    },
    getCoverPic(pc) {
      this.caseForm.cover = pc.att_dir;
      this.coverModal = false;
    },
    getMediaPic(pc) {
      this.caseForm.media_url = pc.att_dir;
      this.mediaModal = false;
    },
    getMediaVideo(url) {
      this.caseForm.media_url = url;
      this.videoModal = false;
    },
    async handleSubmit() {
      this.submitLoading = true;
      try {
        if (this.editId) {
          await updateCase(this.editId, this.caseForm);
        } else {
          await saveCase(this.caseForm);
        }
        this.$message.success(this.editId ? '修改成功' : '添加成功');
        this.dialogVisible = false;
        this.loadList();
      } finally { this.submitLoading = false; }
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该案例吗？', '提示', { type: 'warning' });
        await deleteCase(id);
        this.$message.success('删除成功');
        this.loadList();
      } catch (e) {}
    },
    async handleStatus(row, val) {
      await updateCase(row.id, { ...row, status: val });
      this.$message.success('状态已更新');
    },
    async handleAddCategory() {
      if (!this.newCategoryName.trim()) return this.$message.warning('请输入分类名称');
      await saveCategory({ name: this.newCategoryName.trim(), type: 1 });
      this.newCategoryName = '';
      this.$message.success('添加成功');
      this.loadCategoryList();
    },
    async handleDeleteCategory(id) {
      try {
        await this.$confirm('确定删除该分类吗？', '提示', { type: 'warning' });
        await deleteCategory(id);
        this.$message.success('删除成功');
        this.loadCategoryList();
      } catch (e) {}
    },
  },
};
</script>
