<template>
  <div class="teaching-course-list">
    <el-card>
      <div slot="header" class="clearfix">
        <el-button type="primary" size="small" @click="handleAdd">+ 添加课程</el-button>
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
        <el-table-column prop="type" label="类型" width="80">
          <template slot-scope="{row}">
            <el-tag v-if="row.type == 2" type="info" size="small">图片</el-tag>
            <el-tag v-else type="" size="small">视频</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category_name" label="分类" width="120" />
        <el-table-column label="可看等级" width="120">
          <template slot-scope="{row}">
            <el-tag v-if="row.member_level == 2" type="warning" size="small">超级会员</el-tag>
            <el-tag v-else type="success" size="small">普通会员</el-tag>
          </template>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="550px" :close-on-click-modal="false">
      <el-form ref="courseForm" :model="courseForm" label-width="130px">
        <el-form-item label="封面">
          <el-button type="primary" size="small" @click="coverModal = true">选择图片</el-button>
          <div v-if="courseForm.cover" style="margin-top:8px">
            <img :src="courseForm.cover" style="width:80px;height:80px;object-fit:cover;border-radius:4px" />
          </div>
          <el-dialog :visible.sync="coverModal" width="950px" title="选择封面" :close-on-click-modal="false" append-to-body>
            <uploadPictures :isChoice="'单选'" @getPic="getCoverPic" :gridBtn="gridBtn" :gridPic="gridPic" v-if="coverModal" />
          </el-dialog>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="courseForm.category_id" placeholder="选择分类" clearable style="width:100%">
            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="courseForm.title" />
        </el-form-item>
        <el-form-item label="可看等级">
          <el-radio-group v-model="courseForm.member_level">
            <el-radio :label="1">普通会员可看</el-radio>
            <el-radio :label="2">超级会员可看</el-radio>
          </el-radio-group>
          <div style="font-size:12px;color:#999;margin-top:4px">
            普通会员可看 = 普通会员和超级会员均可观看；超级会员可看 = 仅超级会员可观看
          </div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="courseForm.desc" type="textarea" :rows="3" placeholder="课程描述" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="courseForm.type">
            <el-radio :label="1">视频</el-radio>
            <el-radio :label="2">图片</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="视频" v-if="courseForm.type === 1">
          <el-input v-model="courseForm.video_url" placeholder="视频链接（可手动填写，或点击右侧选择已有视频）" />
          <el-button type="primary" size="small" style="margin-left:8px" @click="videoModal = true">选择视频</el-button>
          <div style="font-size:12px;color:#999;margin-top:4px">
            可从视频素材库选择已上传的COS视频，也可直接粘贴外部视频链接。
          </div>
          <div v-if="courseForm.video_url" style="margin-top:8px">
            <p style="font-size:12px;color:#409eff;word-break:break-all">{{ courseForm.video_url }}</p>
            <video :src="courseForm.video_url" style="width:220px;max-height:140px;border-radius:4px;margin-top:4px" controls></video>
          </div>
          <el-dialog :visible.sync="videoModal" width="950px" title="选择视频" :close-on-click-modal="false" append-to-body>
            <uploadVideo :isChoice="'one'" @getVideo="getCourseVideo" v-if="videoModal" />
          </el-dialog>
        </el-form-item>
        <el-form-item label="课程图片" v-if="courseForm.type === 2">
          <el-button type="primary" size="small" @click="imagesModal = true">选择图片</el-button>
          <div v-if="courseForm.images && courseForm.images.length" style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            <img v-for="(img, i) in courseForm.images" :key="i" :src="img" style="width:80px;height:80px;object-fit:cover;border-radius:4px" />
          </div>
          <el-dialog :visible.sync="imagesModal" width="950px" title="选择课程图片" :close-on-click-modal="false" append-to-body>
            <uploadPictures :isChoice="'多选'" @getPic="getImagesPics" :gridBtn="gridBtn" :gridPic="gridPic" v-if="imagesModal" />
          </el-dialog>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="courseForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="courseForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 分类管理弹窗 -->
    <el-dialog title="课程分类管理" :visible.sync="categoryDialogVisible" width="500px" :close-on-click-modal="false">
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
import { getCourseList, saveCourse, updateCourse, deleteCourse, getCategoryList, saveCategory, deleteCategory } from '@/api/teaching';
import uploadPictures from '@/components/uploadPictures';
import uploadVideo from '@/components/uploadVideo2';

export default {
  name: 'TeachingCourseList',
  components: { uploadPictures, uploadVideo },
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      limit: 15,
      total: 0,
      filterCategoryId: '',
      dialogVisible: false,
      dialogTitle: '添加课程',
      submitLoading: false,
      courseForm: { title: '', category_id: 0, cover: '', member_level: 1, desc: '', type: 1, video_url: '', images: [], sort: 0, status: 1 },
      editId: null,
      coverModal: false,
      imagesModal: false,
      gridBtn: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
      gridPic: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
      categoryList: [],
      categoryDialogVisible: false,
      newCategoryName: '',
      videoModal: false,
    };
  },
  created() {
    this.loadCategoryList();
    this.loadList();
  },
  methods: {
    async loadCategoryList() {
      try {
        const { data } = await getCategoryList({ type: 2 });
        this.categoryList = data || [];
      } catch (e) {}
    },
    async loadList() {
      this.loading = true;
      try {
        const params = { page: this.page, limit: this.limit };
        if (this.filterCategoryId) params.category_id = this.filterCategoryId;
        const { data } = await getCourseList(params);
        this.list = data.list || [];
        this.total = data.count || 0;
      } finally { this.loading = false; }
    },
    handlePageChange(p) { this.page = p; this.loadList(); },
    handleAdd() {
      this.editId = null;
      this.dialogTitle = '添加课程';
      this.courseForm = { title: '', category_id: 0, cover: '', member_level: 1, desc: '', type: 1, video_url: '', images: [], sort: 0, status: 1 };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.editId = row.id;
      this.dialogTitle = '编辑课程';
      this.courseForm = {
        title: row.title,
        category_id: row.category_id || 0,
        cover: row.cover,
        member_level: row.member_level || 1,
        desc: row.desc || '',
        type: row.type || 1,
        video_url: row.video_url || '',
        images: row.images || [],
        sort: row.sort || 0,
        status: row.status,
      };
      this.dialogVisible = true;
    },
    getCoverPic(pc) {
      this.courseForm.cover = pc.att_dir;
      this.coverModal = false;
    },
    getImagesPics(pc) {
      const pics = Array.isArray(pc) ? pc : [pc];
      this.courseForm.images = pics.map(p => p.att_dir || p);
      this.imagesModal = false;
    },
    getCourseVideo(url) {
      this.courseForm.video_url = url;
      this.videoModal = false;
    },
    async handleSubmit() {
      this.submitLoading = true;
      try {
        if (this.editId) {
          await updateCourse(this.editId, this.courseForm);
        } else {
          await saveCourse(this.courseForm);
        }
        this.$message.success(this.editId ? '修改成功' : '添加成功');
        this.dialogVisible = false;
        this.loadList();
      } finally { this.submitLoading = false; }
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该课程吗？', '提示', { type: 'warning' });
        await deleteCourse(id);
        this.$message.success('删除成功');
        this.loadList();
      } catch (e) {}
    },
    async handleStatus(row, val) {
      await updateCourse(row.id, { ...row, status: val, member_level: row.member_level || 1 });
      this.$message.success('状态已更新');
      this.loadList();
    },
    async handleAddCategory() {
      if (!this.newCategoryName.trim()) return this.$message.warning('请输入分类名称');
      await saveCategory({ name: this.newCategoryName.trim(), type: 2 });
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
