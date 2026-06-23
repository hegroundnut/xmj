<template>
  <div class="moment-list">
    <el-card>
      <div slot="header" class="clearfix">
        <el-input v-model="keyword" placeholder="搜索帖子内容" size="small" style="width:200px" clearable @keyup.enter="loadList" />
        <el-select v-model="filterStatus" placeholder="状态" clearable size="small" style="margin-left:10px;width:100px" @change="loadList">
          <el-option label="正常" :value="1" />
          <el-option label="已删除" :value="0" />
        </el-select>
        <el-button type="primary" size="small" style="margin-left:10px" @click="loadList">搜索</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column label="用户" width="180">
          <template slot-scope="{row}">
            <div style="display:flex;align-items:center">
              <img :src="row.user_avatar || '/statics/system_images/default_avatar.jpeg'" style="width:32px;height:32px;border-radius:50%;margin-right:8px" />
              <span>{{ row.user_nickname || ('用户' + row.uid) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="200">
          <template slot-scope="{row}">
            <div>{{ row.content ? row.content.substring(0, 50) + (row.content.length > 50 ? '...' : '') : '[无文字]' }}</div>
            <div style="margin-top:4px">
              <el-tag v-if="row.images && row.images !== '[]'" size="mini">{{ (typeof row.images === 'string' ? JSON.parse(row.images) : row.images).length }}张图片</el-tag>
              <el-tag v-if="row.video_url" type="success" size="mini">视频</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="互动" width="140">
          <template slot-scope="{row}">
            <span>❤ {{ row.like_count }}</span>
            <span style="margin-left:8px">💬 {{ row.comment_count }}</span>
            <span style="margin-left:8px">↗ {{ row.share_count }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160">
          <template slot-scope="{row}">{{ row.add_time }}</template>
        </el-table-column>
        <el-table-column label="状态" width="70">
          <template slot-scope="{row}">
            <el-tag :type="row.status == 1 ? 'success' : 'danger'" size="mini">{{ row.status == 1 ? '正常' : '已删' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="{row}">
            <el-button type="text" @click="handleView(row)">详情</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog :visible.sync="detailVisible" title="帖子详情" width="600px">
      <div v-if="detail">
        <div style="display:flex;align-items:center;margin-bottom:12px">
          <img :src="detail.user_avatar || '/statics/system_images/default_avatar.jpeg'" style="width:40px;height:40px;border-radius:50%;margin-right:10px" />
          <div><div style="font-weight:bold">{{ detail.user_nickname || ('用户' + detail.uid) }}</div><div style="color:#999;font-size:12px">{{ detail.add_time }}</div></div>
        </div>
        <div style="margin-bottom:12px;white-space:pre-wrap">{{ detail.content }}</div>
        <div v-if="detailImages.length" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
          <img v-for="(img, i) in detailImages" :key="i" :src="img" style="width:100px;height:100px;object-fit:cover;border-radius:4px" />
        </div>
        <video v-if="detail.video_url" :src="detail.video_url" controls style="width:100%;max-height:300px;margin-bottom:12px" />
        <div style="color:#999;font-size:12px">❤ {{ detail.like_count }} | 💬 {{ detail.comment_count }} | ↗ {{ detail.share_count }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMomentList, deleteMoment } from '@/api/moment';

export default {
  name: 'MomentList',
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      limit: 15,
      total: 0,
      keyword: '',
      filterStatus: '',
      detail: null,
      detailImages: [],
      detailVisible: false,
    };
  },
  created() { this.loadList(); },
  methods: {
    async loadList() {
      this.loading = true;
      try {
        const params = { page: this.page, limit: this.limit };
        if (this.keyword) params.keyword = this.keyword;
        if (this.filterStatus !== '') params.status = this.filterStatus;
        const { data } = await getMomentList(params);
        this.list = data.list || [];
        this.total = data.count || 0;
      } finally { this.loading = false; }
    },
    handlePageChange(p) { this.page = p; this.loadList(); },
    handleView(row) {
      this.detail = row;
      this.detailImages = row.images && row.images !== '[]' ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : [];
      this.detailVisible = true;
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该帖子吗？', '提示', { type: 'warning' });
        await deleteMoment(id);
        this.$message.success('删除成功');
        this.loadList();
      } catch (e) {}
    },
  },
};
</script>
