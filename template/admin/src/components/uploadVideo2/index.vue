<template>
  <div class="Modal">
    <div class="colLeft">
      <div class="Nav">
        <div class="trees-coadd">
          <div v-if="isPage" class="tree_tit" v-db-click @click="addSort">
            <i class="el-icon-circle-plus"></i>
            添加分类
          </div>
          <div class="scollhide">
            <div :class="isPage ? 'tree' : 'isTree'">
              <el-tree
                :data="treeData"
                node-key="id"
                default-expand-all
                highlight-current
                :expand-on-click-node="false"
                @node-click="appendBtn"
                :current-node-key="treeId"
              >
                <span class="custom-tree-node" slot-scope="{ data }">
                  <div class="file-name">
                    <img v-if="!data.pid" class="icon" src="@/assets/images/file.jpg" />
                    <el-tooltip class="item" effect="dark" :content="data.title" placement="top">
                      <div class="text line1">{{ data.title }}</div>
                    </el-tooltip>
                  </div>
                  <span>
                    <el-dropdown @command="(command) => clickMenu(data, command)">
                      <i class="el-icon-more el-icon--right"></i>
                      <template slot="dropdown">
                        <el-dropdown-menu>
                          <el-dropdown-item command="1">新增分类</el-dropdown-item>
                          <el-dropdown-item v-if="data.id" command="2">编辑分类</el-dropdown-item>
                          <el-dropdown-item v-if="data.id" command="3">删除</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </span>
                </span>
              </el-tree>
            </div>
          </div>
        </div>
      </div>
      <div class="conter">
        <div class="bnt acea-row row-middle df-jcsb">
          <div class="">
            <el-button
              class="mr8"
              type="primary"
              :disabled="checkPicList.length === 0"
              v-db-click
              @click="checkPics"
              size="small"
              v-if="isShow !== 0"
            >使用选中视频</el-button>
            <el-upload
              class="mr8"
              :show-file-list="false"
              :action="uploadAction"
              :before-upload="beforeVideoUpload"
              :on-success="onVideoUploadSuccess"
              :on-error="onVideoUploadError"
              :data="uploadData"
              :headers="header"
              :multiple="true"
              accept="video/*"
              style="display: inline-block"
            >
              <el-button :loading="videoUploading" size="small" type="primary">
                {{ videoUploading ? '上传中...' : '上传视频到COS' }}
              </el-button>
            </el-upload>
            <el-button class="mr8" size="small" type="primary" icon="el-icon-link" @click="openInputModal"></el-button>
            <el-button
              class="mr8"
              size="small"
              :disabled="!checkPicList.length && !ids.length"
              v-db-click
              @click.stop="editPicList()"
            >删除视频</el-button>
            <el-cascader
              v-model="pids"
              placeholder="视频移动至"
              style="width: 150px"
              class="treeSel"
              :options="treeData2"
              :props="{ checkStrictly: true, emitPath: false, label: 'title', value: 'id' }"
              clearable
              size="small"
              @visible-change="moveImg"
            ></el-cascader>
          </div>
          <div>
            <el-input
              class="mr8"
              v-model="fileData.real_name"
              placeholder="请输入视频名"
              size="small"
              style="width: 150px"
              @change="searchFile"
            >
              <i slot="suffix" class="el-icon-search el-input__icon" v-db-click @click="getFileList"></i>
            </el-input>
            <el-radio-group class="mr10" v-if="isPage" v-model="lietStyle" size="small" @input="radioChange">
              <el-radio-button label="list"><i class="el-icon-menu"></i></el-radio-button>
              <el-radio-button label="table"><span class="iconfont iconliebiao"></span></el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="pictrueList acea-row" :class="{ 'is-modal': !isPage }">
          <div v-if="lietStyle == 'list'" style="width: 100%">
            <div v-show="isShowPic" class="imagesNo">
              <i class="el-icon-picture" style="color: #dbdbdb; font-size: 60px"></i>
              <span class="imagesNo_sp">视频库为空</span>
            </div>
            <div ref="imgListBox" class="acea-row mb10">
              <div
                class="pictrueList_pic mb10 mt10"
                v-for="(item, index) in pictrueList"
                :key="index"
                :style="{ margin: picmargin }"
                @mouseenter="enterMouse(item)"
                @mouseleave="enterMouse(item)"
              >
                <p class="number" v-if="item.num > 0">
                  <el-badge :value="item.num" type="primary">
                    <a href="#" class="demo-badge"></a>
                  </el-badge>
                </p>
                <div
                  class="img"
                  :class="item.isSelect ? 'on' : ''"
                  v-db-click
                  @click.stop="changImage(item, index, pictrueList)"
                >
                  <video :src="item.satt_dir" />
                </div>
                <div class="operate-item" @mouseenter="enterLeave(item)" @mouseleave="enterLeave(item)">
                  <p v-if="!item.isEdit">{{ item.editName }}</p>
                  <el-input size="small" type="text" v-model="item.real_name" v-else @blur="bindTxt(item)" />
                  <div class="operate-height">
                    <span class="operate mr10" v-db-click @click="editPicList(item.att_id)" v-if="item.isShowEdit">删除</span>
                    <span class="operate mr10" v-db-click @click="item.isEdit = !item.isEdit" v-if="item.isShowEdit">改名</span>
                    <span class="operate" v-db-click @click="lookImg(item)" v-if="item.isShowEdit">查看</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-table
            v-if="lietStyle == 'table'"
            ref="table"
            :data="pictrueList"
            v-loading="loading"
            highlight-row
            :row-key="getRowKey"
            @selection-change="handleSelectRow"
            no-data-text="暂无数据"
            no-filtered-data-text="暂无筛选结果"
          >
            <el-table-column type="selection" width="60" :reserve-selection="true"></el-table-column>
            <el-table-column label="视频名称" min-width="190">
              <template slot-scope="scope">
                <div class="df-aic">
                  <div class="tabBox_img mr10">
                    <video :src="scope.row.att_dir" @click="lookImg(scope.row)" />
                  </div>
                  <span v-if="!scope.row.isEdit" class="line2 real-name">{{ scope.row.real_name }}</span>
                  <el-input size="small" type="text" style="width: 90%" v-model="scope.row.real_name" v-else @blur="bindTxt(scope.row)" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="链接" min-width="200">
              <template slot-scope="scope">
                <div class="link-cell">
                  <span class="link-text">{{ scope.row.att_dir }}</span>
                  <el-button type="text" size="mini" icon="el-icon-document-copy" @click="copyLink(scope.row.att_dir)"></el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="上传时间" min-width="100">
              <template slot-scope="scope"><span>{{ scope.row.time }}</span></template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="170">
              <template slot-scope="scope">
                <a v-db-click @click="editPicList(scope.row)">删除</a>
                <el-divider direction="vertical"></el-divider>
                <a v-db-click @click="scope.row.isEdit = !scope.row.isEdit">{{ scope.row.isEdit ? '确定' : '重命名' }}</a>
                <el-divider direction="vertical"></el-divider>
                <a v-db-click @click="lookImg(scope.row)">查看</a>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="footer acea-row row-right">
          <pagination
            v-if="total"
            :total="total"
            :pageCount="9"
            layout="total, prev, pager, next"
            :page.sync="fileData.page"
            @pagination="pageChange"
            :limit.sync="fileData.limit"
          ></pagination>
        </div>
      </div>
    </div>
    <el-dialog title="查看视频" append-to-body :visible.sync="videoModal" width="1024px">
      <video :src="imageUrl" controls style="width:100%" />
    </el-dialog>
    <el-dialog title="输入视频链接" append-to-body :visible.sync="inputModal" width="400px">
      <div class="flex">
        <el-input class="mr-20" v-model="inputUrl" placeholder="请输入视频链接" />
        <el-button type="primary" @click="uploadByUrl">使用</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCategoryListApi, createApi, fileListApi, categoryEditApi, moveApi, fileUpdateApi } from '@/api/uploadPictures';
import Setting from '@/setting';
import { getCookies } from '@/libs/util';

export default {
  name: 'uploadVideo2',
  props: {
    isChoice: { type: String, default: 'one' },
    isPage: { type: Boolean, default: false },
    isIframe: { type: Boolean, default: false },
    gridBtn: { type: Object, default: null },
    gridPic: { type: Object, default: null },
    isShow: { type: Number, default: 1 },
    pageLimit: { type: Number, default: 0 },
  },
  data() {
    return {
      uploadAction: Setting.apiBaseURL + '/teaching_material/upload_video',
      treeData: [],
      treeData2: [],
      pictrueList: [],
      uploadData: {},
      checkPicList: [],
      uploadName: { name: '', all: 1, type: 1 },
      treeId: '',
      fileData: { pid: 0, real_name: '', page: 1, limit: this.pageLimit || 18, type: 1 },
      total: 0,
      pids: 0,
      isShowPic: false,
      header: {},
      ids: [],
      lietStyle: 'list',
      imageUrl: '',
      loading: false,
      multipleSelection: [],
      picmargin: '5px',
      videoModal: false,
      videoUploading: false,
      inputModal: false,
      inputUrl: '',
    };
  },
  mounted() {
    if (this.isPage) {
      let hang = parseInt((document.body.clientHeight - this.$refs.imgListBox?.clientHeight - 325) / 180);
      let col = parseInt(this.$refs.imgListBox?.clientWidth / 156);
      this.fileData.limit = col * hang;
      this.picmargin = parseInt(this.$refs.imgListBox?.clientWidth - col * 146) / (2 * col) + 'px';
    }
    this.getToken();
    this.getList();
    this.getFileList();
  },
  methods: {
    // ---- 上传 ----
    getToken() {
      this.header['Authori-zation'] = 'Bearer ' + getCookies('token');
    },
    beforeVideoUpload(file) {
      if (file.type.indexOf('video/') !== 0) {
        this.$message.error('只能上传视频文件');
        return false;
      }
      const t = getCookies('token') || '';
      this.header = { 'Authori-zation': 'Bearer ' + t };
      this.uploadData = { pid: this.treeId || 0 };
      this.videoUploading = true;
      return true;
    },
    onVideoUploadSuccess(res) {
      this.videoUploading = false;
      if (res.status === 200) {
        this.$message.success('视频已上传到COS');
        this.getFileList();
      } else {
        this.$message.error(res.msg || '上传失败');
      }
    },
    onVideoUploadError() {
      this.videoUploading = false;
      this.$message.error('上传失败，请检查COS配置');
    },
    // ---- 输入链接 ----
    openInputModal() { this.inputModal = true; },
    uploadByUrl() {
      if (!this.inputUrl) { this.$message.error('请输入视频链接'); return; }
      this.$emit('getVideo', this.inputUrl);
      this.inputUrl = '';
      this.inputModal = false;
    },
    // ---- 查看 ----
    lookImg(item) {
      this.imageUrl = item.att_dir;
      this.videoModal = true;
    },
    copyLink(url) {
      if (!url) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => this.$message.success('链接已复制')).catch(() => this.$message.error('复制失败'));
      } else {
        const ta = document.createElement('textarea');
        ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); this.$message.success('链接已复制'); } catch { this.$message.error('复制失败'); }
        document.body.removeChild(ta);
      }
    },
    // ---- 分类 ----
    addSort() { this.append({ id: this.treeId || 0 }); },
    clickMenu(data, name) {
      if (name == 1) this.append(data);
      else if (name == 2) this.editPic(data);
      else if (name == 3) this.remove(data, '分类');
    },
    remove(data, tit) {
      let delfromData = { title: '删除 [ ' + data.title + ' ] 分类', url: `file/category/${data.id}`, method: 'DELETE', ids: '' };
      this.$modalSure(delfromData).then(() => { this.$message.success('删除成功'); this.getList(); this.checkPicList = []; }).catch(() => {});
    },
    editPic(data) { this.$modalForm(categoryEditApi(data.id)).then(() => this.getList()); },
    getList(type) {
      let root = { title: '全部视频', id: '', pid: 0 };
      getCategoryListApi(this.uploadName).then(async (res) => {
        if (type !== 'search') this.treeData2 = JSON.parse(JSON.stringify([...res.data.list]));
        res.data.list.unshift(root);
        this.treeData = res.data.list;
      }).catch(() => {});
    },
    getFrom() { this.$modalForm(createApi({ id: this.treeId, type: 1 })).then(() => this.getList()); },
    append(data) { this.treeId = data.id; this.getFrom(); },
    appendBtn(data) { this.treeId = data.id; this.fileData.page = 1; this.getFileList(); },
    // ---- 文件列表 ----
    searchFile() { this.fileData.page = 1; this.getFileList(); },
    getFileList() {
      this.fileData.pid = this.treeId;
      fileListApi(this.fileData).then(async (res) => {
        res.data.list.forEach((el) => {
          el.isSelect = false; el.isEdit = false; el.isShowEdit = false; el.realName = false; el.num = 0;
          this.editName(el);
        });
        this.pictrueList = res.data.list;
        this.isShowPic = !this.pictrueList.length;
        this.total = res.data.count;
      }).catch(() => {});
    },
    editName(item) {
      let it = item.real_name.split('.');
      let it1 = it[1] == undefined ? [] : it[1];
      let len = it[0].length + it1.length;
      item.editName = len < 10 ? item.real_name : item.real_name.substr(0, 4) + '...' + item.real_name.substr(-5, 5);
    },
    // ---- 选中 ----
    changImage(item, index, row) {
      let activeIndex = 0;
      if (!item.isSelect) { item.isSelect = true; this.checkPicList.push(item); }
      else {
        item.isSelect = false;
        this.checkPicList.map((el, i) => { if (el.att_id == item.att_id) activeIndex = i; });
        this.checkPicList.splice(activeIndex, 1);
      }
      this.ids = this.checkPicList.map((el) => el.att_id);
      this.pictrueList.map((el) => {
        el.num = el.isSelect ? this.checkPicList.filter((e2) => e2.att_id == el.att_id).length : 0;
      });
    },
    checkPics() {
      if (this.isChoice === 'one') {
        if (this.checkPicList.length > 1) return this.$message.warning('最多只能选一个视频');
        this.$emit('getVideo', this.checkPicList[0].att_dir);
      } else {
        let max = this.$route.query.maxLength;
        if (max != undefined && this.checkPicList.length > Number(max)) return this.$message.warning('最多只能选' + max + '个视频');
        this.$emit('getVideo', this.checkPicList);
      }
    },
    // ---- 删除 ----
    editPicList(id) {
      let ids = { ids: id || this.ids.toString() };
      let delfromData = { title: '删除选中视频', url: 'file/file/delete', method: 'POST', ids };
      this.$modalSure(delfromData).then(() => { this.$message.success('删除成功'); this.getFileList(); this.initData(); }).catch(() => {});
    },
    initData() { this.checkPicList = []; this.ids = []; this.multipleSelection = []; },
    // ---- 移动 ----
    moveImg(status) {
      if (!status) this.getMove();
      else if (!this.ids.toString()) this.$message.warning('请先选择视频');
    },
    getMove() {
      let data = { pid: this.pids, images: this.ids.toString() };
      if (!data.images) return;
      moveApi(data).then(async (res) => {
        this.$message.success('移动成功'); this.getFileList(); this.pids = 0; this.checkPicList = []; this.ids = [];
      }).catch(() => {});
    },
    // ---- 改名 ----
    bindTxt(item) {
      if (!item.real_name) { this.$message.error('请填写内容'); return; }
      fileUpdateApi(item.att_id, { real_name: item.real_name }).then(() => {
        this.editName(item); item.isEdit = false; this.$message.success('修改成功');
      }).catch(() => {});
    },
    // ---- 分页/切换 ----
    radioChange() { this.initData(); },
    pageChange(index) { this.fileData.page = index; this.getFileList(); this.checkPicList = []; },
    enterMouse(item) { item.realName = !item.realName; },
    enterLeave(item) { item.isShowEdit = !item.isShowEdit; },
    handleSelectRow(selection) {
      let arr = this.unique(selection);
      this.ids = []; arr.forEach((item) => { if (!this.ids.includes(item.att_id)) this.ids.push(item.att_id); });
      this.multipleSelection = arr;
    },
    getRowKey(row) { return row.att_id; },
    unique(arr) {
      return arr.reduce((acc, curr) => { if (!acc.find((item) => item.att_id === curr.att_id)) acc.push(curr); return acc; }, []);
    },
  },
};
</script>

<style scoped lang="scss">
.nameStyle { position: absolute; white-space: nowrap; z-index: 9; background: #eee; height: 20px; line-height: 20px; color: #555; border: 1px solid #ebebeb; padding: 0 5px; left: 56px; bottom: -18px; }
.iconbianji1 { font-size: 13px; }
.selectTreeClass { background: #d5e8fc; }
.tree_tit { padding-top: 7px; }
.treeBox { width: 100%; height: 100%; max-width: 180px; }
.is-modal .pictrueList_pic {
  width: 100px; margin: 10px 5px !important;
  .img { display: flex; align-items: center; justify-content: center; width: 100px; height: 100px; background-color: rgb(248, 248, 248); padding: 2px;
    img { max-width: 96px; max-height: 96px; }
    .operate-height { bottom: -8px; }
  }
}
.pictrueList_pic {
  position: relative; width: 146px; cursor: pointer;
  .img { display: flex; align-items: center; justify-content: center; width: 146px; height: 146px; background-color: rgb(248, 248, 248); padding: 3px;
    video { max-width: 100px; max-height: 100px; }
  }
  p { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 20px; font-size: 12px; color: #515a6d; text-align: center; }
  .number { height: 33px; position: absolute; right: 0; top: 0; }
}
.Nav { width: 100%; border-right: 1px solid #eee; min-width: 220px; max-width: max-content; }
.trees-coadd { width: 100%; border-radius: 4px; overflow: hidden; position: relative;
  .scollhide { overflow-x: hidden; overflow-y: scroll; padding: 0 0 10px 0; box-sizing: border-box;
    .isTree { min-height: 374px; max-height: 550px;
      ::v-deep .file-name { display: flex; align-items: center; .name { max-width: 7em; } .icon { width: 12px; height: 12px; margin-right: 8px; } }
      ::v-deep .el-tree-node { margin-right: 16px; }
      ::v-deep .el-tree-node__children .el-tree-node { margin-right: 0; }
      ::v-deep .el-tree-node__content { width: 100%; height: 36px; }
      ::v-deep .custom-tree-node { flex: 1; display: flex; align-items: center; justify-content: space-between; padding-right: 20px; font-size: 13px; font-weight: 400; color: rgba(0,0,0,0.6); line-height: 13px; }
      ::v-deep .is-current { background: #f1f9ff !important; color: var(--prev-color-primary) !important; }
      ::v-deep .is-current .custom-tree-node { color: var(--prev-color-primary) !important; }
    }
  }
  .scollhide::-webkit-scrollbar { display: none; }
}
.treeSel ::v-deep .ivu-select-dropdown-list { padding: 0 5px !important; box-sizing: border-box; width: 200px; }
.imagesNo { display: flex; justify-content: center; flex-direction: column; align-items: center; margin: 65px 0;
  .imagesNo_sp { font-size: 13px; color: #dbdbdb; line-height: 3; }
}
.Modal { width: 100%; height: 100%; background: #fff !important; }
.fill-window { height: 100vh; }
.colLeft { padding-right: 0 !important; height: 100%; display: flex; flex-wrap: nowrap; }
.conter { width: 100%; height: 100%; margin-left: 20px !important; .iconliebiao { font-size: 12px; } }
.conter .bnt { width: 100%; padding: 0 0px 20px 0px; box-sizing: border-box; }
.conter .pictrueList { overflow-x: hidden; overflow-y: auto; min-height: 463px; }
.conter .pictrueList.is-modal { max-height: 480px; }
.right-col { }
.conter .pictrueList img { max-width: 100%; }
.conter .pictrueList .img.on { border: 2px solid var(--prev-color-primary); }
.conter .footer { padding: 0 20px 10px 20px; }
.tabBox_img { display: flex; align-items: center; video { max-width: 90px; max-height: 30px; } }
.real-name { flex: 1; }
.df-aic { display: flex; align-items: center; }
.demo-badge { width: 42px; height: 42px; background: transparent; border-radius: 6px; display: inline-block; }
.bnt ::v-deep .ivu-tree-children { padding: 5px 0; }
.operate-item { display: flex; align-items: center; justify-content: center; flex-direction: column; margin: 5px 0; }
.operate-height { display: flex; align-items: center; justify-content: center; height: 16px; position: absolute; bottom: -10px; }
.operate { color: var(--prev-color-primary); font-size: 12px; white-space: nowrap; }
.link-cell { display: flex; align-items: center; }
.link-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; font-size: 12px; color: #909399; }
</style>
