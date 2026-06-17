<template>
  <div class="teaching-offline-class">
    <el-card>
      <div slot="header" class="clearfix">
        <el-button type="primary" size="small" @click="handleAdd">+ 添加排期</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="class_date" label="日期" width="120" />
        <el-table-column prop="start_time" label="开始时间" width="100" />
        <el-table-column prop="end_time" label="结束时间" width="100" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="max_people" label="人数上限" width="80" />
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
      <el-form ref="classForm" :model="classForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="classForm.title" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="classForm.class_date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" style="width:100%" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker v-model="classForm.start_time" placeholder="选择时间" value-format="HH:mm" style="width:100%" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker v-model="classForm.end_time" placeholder="选择时间" value-format="HH:mm" style="width:100%" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="classForm.address" placeholder="上课地址" />
        </el-form-item>
        <el-form-item label="人数上限">
          <el-input-number v-model="classForm.max_people" :min="1" />
        </el-form-item>
        <el-form-item label="二维码">
          <el-button type="primary" size="small" @click="qrcodeModal = true">选择图片</el-button>
          <div v-if="classForm.qrcode" style="margin-top:8px">
            <img :src="classForm.qrcode" style="width:80px;height:80px;object-fit:cover;border-radius:4px" />
          </div>
          <el-dialog :visible.sync="qrcodeModal" width="950px" title="选择二维码" :close-on-click-modal="false" append-to-body>
            <uploadPictures :isChoice="'单选'" @getPic="getQrcodePic" :gridBtn="gridBtn" :gridPic="gridPic" v-if="qrcodeModal" />
          </el-dialog>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="classForm.desc" type="textarea" :rows="3" placeholder="排期描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="classForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="classForm.status" :active-value="1" :inactive-value="0" />
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
import { getOfflineClassList, saveOfflineClass, updateOfflineClass, deleteOfflineClass } from '@/api/teaching';
import uploadPictures from '@/components/uploadPictures';

export default {
  name: 'TeachingOfflineClass',
  components: { uploadPictures },
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      limit: 15,
      total: 0,
      dialogVisible: false,
      dialogTitle: '添加排期',
      submitLoading: false,
      classForm: { title: '', class_date: '', start_time: '', end_time: '', address: '', max_people: 1, qrcode: '', desc: '', sort: 0, status: 1 },
      editId: null,
      qrcodeModal: false,
      gridBtn: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
      gridPic: { xl: 6, lg: 8, md: 12, sm: 24, xs: 24 },
    };
  },
  created() { this.loadList(); },
  methods: {
    async loadList() {
      this.loading = true;
      try {
        const { data } = await getOfflineClassList({ page: this.page, limit: this.limit });
        this.list = data.list || [];
        this.total = data.count || 0;
      } finally { this.loading = false; }
    },
    handlePageChange(p) { this.page = p; this.loadList(); },
    handleAdd() {
      this.editId = null;
      this.dialogTitle = '添加排期';
      this.classForm = { title: '', class_date: '', start_time: '', end_time: '', address: '', max_people: 1, qrcode: '', desc: '', sort: 0, status: 1 };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.editId = row.id;
      this.dialogTitle = '编辑排期';
      this.classForm = {
        title: row.title,
        class_date: row.class_date || '',
        start_time: row.start_time || '',
        end_time: row.end_time || '',
        address: row.address || '',
        max_people: row.max_people || 1,
        qrcode: row.qrcode || '',
        desc: row.desc || '',
        sort: row.sort || 0,
        status: row.status,
      };
      this.dialogVisible = true;
    },
    getQrcodePic(pc) {
      this.classForm.qrcode = pc.att_dir;
      this.qrcodeModal = false;
    },
    async handleSubmit() {
      this.submitLoading = true;
      try {
        if (this.editId) {
          await updateOfflineClass(this.editId, this.classForm);
        } else {
          await saveOfflineClass(this.classForm);
        }
        this.$message.success(this.editId ? '修改成功' : '添加成功');
        this.dialogVisible = false;
        this.loadList();
      } finally { this.submitLoading = false; }
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该排期吗？', '提示', { type: 'warning' });
        await deleteOfflineClass(id);
        this.$message.success('删除成功');
        this.loadList();
      } catch (e) {}
    },
    async handleStatus(row, val) {
      await updateOfflineClass(row.id, { ...row, status: val });
      this.$message.success('状态已更新');
    },
  },
};
</script>