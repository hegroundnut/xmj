<template>
  <div class="comment-list">
    <el-card>
      <div slot="header" class="clearfix">
        <el-input v-model="filterMomentId" placeholder="帖子ID" size="small" style="width:120px" clearable />
        <el-button type="primary" size="small" style="margin-left:10px" @click="loadList">搜索</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column label="帖子ID" width="80" prop="moment_id" />
        <el-table-column label="评论者" width="150">
          <template slot-scope="{row}">
            <div style="display:flex;align-items:center">
              <img :src="row.user_avatar || '/statics/system_images/default_avatar.jpeg'" style="width:28px;height:28px;border-radius:50%;margin-right:6px" />
              <span>{{ row.user_nickname || ('用户' + row.uid) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" min-width="200" />
        <el-table-column label="回复" width="80">
          <template slot-scope="{row}">{{ row.parent_id > 0 ? '回复#' + row.parent_id : '-' }}</template>
        </el-table-column>
        <el-table-column label="时间" width="160">
          <template slot-scope="{row}">{{ row.add_time }}</template>
        </el-table-column>
        <el-table-column label="状态" width="70">
          <template slot-scope="{row}">
            <el-tag :type="row.status == 1 ? 'success' : 'danger'" size="mini">{{ row.status == 1 ? '正常' : '已删' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="{row}">
            <el-button v-if="row.status == 1" type="text" style="color:#f56c6c" @click="handleDelete(row.id)">删除</el-button>
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
  </div>
</template>

<script>
import { getCommentList, deleteComment } from '@/api/moment';

export default {
  name: 'CommentList',
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      limit: 15,
      total: 0,
      filterMomentId: '',
    };
  },
  created() { this.loadList(); },
  methods: {
    async loadList() {
      this.loading = true;
      try {
        const params = { page: this.page, limit: this.limit };
        if (this.filterMomentId) params.moment_id = this.filterMomentId;
        const { data } = await getCommentList(params);
        this.list = data.list || [];
        this.total = data.count || 0;
      } finally { this.loading = false; }
    },
    handlePageChange(p) { this.page = p; this.loadList(); },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该评论吗？', '提示', { type: 'warning' });
        await deleteComment(id);
        this.$message.success('删除成功');
        this.loadList();
      } catch (e) {}
    },
  },
};
</script>
