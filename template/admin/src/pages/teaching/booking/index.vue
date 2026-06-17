<template>
  <div class="teaching-booking-list">
    <el-card>
      <div slot="header" class="clearfix">
        <el-select v-model="classId" placeholder="按排期筛选" clearable @change="loadList" style="width:300px">
          <el-option v-for="item in classList" :key="item.id" :label="item.title + ' (' + item.class_date + ')'" :value="item.id" />
        </el-select>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="add_time" label="预约时间" />
        <el-table-column label="状态" width="80">
          <template slot-scope="{row}">{{ row.status == 0 ? '已预约' : '已取消' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="{row}">
            <el-button v-if="row.status == 0" type="text" style="color:#f56c6c" @click="handleCancel(row.id)">取消</el-button>
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
import { getBookingList, cancelBooking, getOfflineClassList } from '@/api/teaching';

export default {
  name: 'TeachingBookingList',
  data() {
    return {
      list: [],
      classList: [],
      classId: null,
      loading: false,
      page: 1,
      limit: 15,
      total: 0,
    };
  },
  created() {
    this.loadClassList();
    this.loadList();
  },
  methods: {
    async loadClassList() {
      const { data } = await getOfflineClassList({ show_all: 1, limit: 999 });
      this.classList = data.list || [];
    },
    async loadList() {
      this.loading = true;
      try {
        const params = { page: this.page, limit: this.limit };
        if (this.classId) params.class_id = this.classId;
        const { data } = await getBookingList(params);
        this.list = data.list || [];
        this.total = data.count || 0;
      } finally { this.loading = false; }
    },
    handlePageChange(p) { this.page = p; this.loadList(); },
    async handleCancel(id) {
      try {
        await this.$confirm('确定取消该预约？', '提示', { type: 'warning' });
        await cancelBooking(id);
        this.$message.success('已取消');
        this.loadList();
      } catch (e) {}
    },
  },
};
</script>