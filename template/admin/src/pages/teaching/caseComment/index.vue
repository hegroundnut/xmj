<template>
  <div class="teaching-case-comment">
    <el-card>
      <div slot="header" class="clearfix">
        <span style="font-weight:bold">案例评论管理</span>
        <el-input v-model="keyword" placeholder="搜索评论/昵称" clearable size="small" style="width:200px;margin-left:10px" @change="loadList" />
        <el-select v-model="filterStatus" placeholder="状态" clearable size="small" style="margin-left:10px;width:120px" @change="loadList">
          <el-option label="已显示" :value="1" />
          <el-option label="已隐藏" :value="0" />
        </el-select>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="头像" width="60">
          <template slot-scope="{row}"><img :src="row.avatar" style="width:32px;height:32px;border-radius:50%;object-fit:cover" /></template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="content" label="评论内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="case_id" label="案例ID" width="80" />
        <el-table-column label="类型" width="80">
          <template slot-scope="{row}">{{ row.pid > 0 ? '回复' : '评论' }}</template>
        </el-table-column>
        <el-table-column prop="add_time" label="时间" width="140" />
        <el-table-column label="状态" width="80">
          <template slot-scope="{row}">
            <el-switch :value="row.status" :active-value="1" :inactive-value="0" @change="(v) => handleStatus(row, v)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="{row}">
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
        style="margin-top:15px"
      />
    </el-card>
  </div>
</template>

<script>
import { getCaseCommentList, setCaseCommentStatus, deleteCaseComment } from '@/api/teaching';

export default {
  name: 'teachingCaseComment',
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      limit: 20,
      loading: false,
      keyword: '',
      filterStatus: '',
    };
  },
  mounted() {
    this.loadList();
  },
  methods: {
    async loadList() {
      this.loading = true;
      try {
        const params = { page: this.page, limit: this.limit };
        if (this.keyword) params.keyword = this.keyword;
        if (this.filterStatus !== '') params.status = this.filterStatus;
        const res = await getCaseCommentList(params);
        this.list = res.data.list || [];
        this.total = res.data.count || 0;
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(p) {
      this.page = p;
      this.loadList();
    },
    async handleStatus(row, val) {
      await setCaseCommentStatus(row.id, val);
      this.$message.success('操作成功');
      this.loadList();
    },
    handleDelete(id) {
      this.$confirm('确定删除该评论？', '提示', { type: 'warning' }).then(async () => {
        await deleteCaseComment(id);
        this.$message.success('删除成功');
        this.loadList();
      });
    },
  },
};
</script>
