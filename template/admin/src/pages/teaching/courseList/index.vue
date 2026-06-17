<template>
  <div class="teaching-course-list">
    <el-card>
      <div slot="header" class="clearfix">
        <el-button type="primary" size="small" @click="handleAdd">+ 添加课程</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column label="封面" width="100">
          <template slot-scope="{row}"><img :src="row.cover" style="width:60px;height:60px;object-fit:cover" /></template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
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
        <el-form-item label="标题">
          <el-input v-model="courseForm.title" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="courseForm.price" placeholder="9.9">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="会员免费">
          <el-switch v-model="courseForm.is_free_for_member" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="courseForm.desc" type="textarea" :rows="3" placeholder="课程描述" />
        </el-form-item>
        <el-form-item label="视频链接">
          <el-input v-model="courseForm.video_url" placeholder="视频链接" />
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
  </div>
</template>

<script>
import { getCourseList, saveCourse, updateCourse, deleteCourse } from '@/api/teaching';
import uploadPictures from '@/components/uploadPictures';

export default {
  name: 'TeachingCourseList',
  components: { uploadPictures },
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      limit: 15,
      total: 0,
      dialogVisible: false,
      dialogTitle: '添加课程',
      submitLoading: false,
      courseForm: { title: '', cover: '', price: '9.9', is_free_for_member: 0, desc: '', video_url: '', sort: 0, status: 1 },
      editId: null,
      coverModal: false,
      gridBtn: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
      gridPic: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
    };
  },
  created() { this.loadList(); },
  methods: {
    async loadList() {
      this.loading = true;
      try {
        const { data } = await getCourseList({ page: this.page, limit: this.limit });
        this.list = data.list || [];
        this.total = data.count || 0;
      } finally { this.loading = false; }
    },
    handlePageChange(p) { this.page = p; this.loadList(); },
    handleAdd() {
      this.editId = null;
      this.dialogTitle = '添加课程';
      this.courseForm = { title: '', cover: '', price: '9.9', is_free_for_member: 0, desc: '', video_url: '', sort: 0, status: 1 };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.editId = row.id;
      this.dialogTitle = '编辑课程';
      this.courseForm = {
        title: row.title,
        cover: row.cover,
        price: row.price || '9.9',
        is_free_for_member: row.is_free_for_member ?? 0,
        desc: row.desc || '',
        video_url: row.video_url || '',
        sort: row.sort || 0,
        status: row.status,
      };
      this.dialogVisible = true;
    },
    getCoverPic(pc) {
      this.courseForm.cover = pc.att_dir;
      this.coverModal = false;
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
      await updateCourse(row.id, { ...row, status: val });
      this.$message.success('状态已更新');
    },
  },
};
</script>