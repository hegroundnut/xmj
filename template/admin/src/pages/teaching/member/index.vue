<template>
  <div class="teaching-member">
    <el-card>
      <div slot="header" class="clearfix">
        <span style="font-weight:bold">教学会员管理</span>
        <el-input v-model="keyword" placeholder="搜索昵称/手机号/UID" clearable size="small" style="width:240px;margin-left:10px" @change="loadList" />
        <el-select v-model="filterMember" placeholder="会员状态" clearable size="small" style="margin-left:10px;width:120px" @change="loadList">
          <el-option label="会员" :value="1" />
          <el-option label="非会员" :value="0" />
        </el-select>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="uid" label="UID" width="80" />
        <el-table-column label="头像" width="60">
          <template slot-scope="{row}"><img :src="row.avatar" style="width:32px;height:32px;border-radius:50%;object-fit:cover" /></template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="140" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="add_time" label="注册时间" width="150" />
        <el-table-column label="会员状态" width="120">
          <template slot-scope="{row}">
            <el-tag :type="row.is_teaching_member ? 'success' : 'info'" size="small">
              {{ row.is_teaching_member ? '会员' : '非会员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="{row}">
            <el-button
              :type="row.is_teaching_member ? 'warning' : 'primary'"
              size="mini"
              @click="handleToggle(row)"
            >{{ row.is_teaching_member ? '取消会员' : '设为会员' }}</el-button>
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
import { getTeachingMemberList, setTeachingMember } from '@/api/teaching';

export default {
  name: 'teachingMember',
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      limit: 20,
      loading: false,
      keyword: '',
      filterMember: '',
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
        if (this.filterMember !== '') params.is_teaching_member = this.filterMember;
        const res = await getTeachingMemberList(params);
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
    handleToggle(row) {
      const newStatus = row.is_teaching_member ? 0 : 1;
      const action = newStatus ? '设为会员' : '取消会员';
      this.$confirm(`确定${action}「${row.nickname}」？`, '提示', { type: 'warning' }).then(async () => {
        await setTeachingMember(row.uid, newStatus);
        this.$message.success('操作成功');
        this.loadList();
      });
    },
  },
};
</script>
