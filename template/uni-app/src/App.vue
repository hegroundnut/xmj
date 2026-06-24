<script>
import { HTTP_REQUEST_URL } from "./config/app";
import Auth from "@/libs/wechat.js";
import Routine from "./libs/routine.js";
import { mapGetters } from "vuex";

export default {
  globalData: {
    spid: 0,
    code: 0,
    isLogin: false,
    userInfo: {},
    MyMenus: [],
    globalData: false,
    isIframe: false,
    tabbarShow: true,
    windowHeight: 0,
    locale: "",
  },
  computed: mapGetters(["isLogin", "cartNum"]),
  watch: {
    isLogin: {
      deep: true,
      handler: function (newV, oldV) {
        if (!newV) {
          this.$store.commit("indexData/setCartNum", "");
        }
      },
    },
    cartNum(newCart, b) {
      this.$store.commit("indexData/setCartNum", newCart + "");
      if (newCart > 0) {
        uni.setTabBarBadge({
          index: Number(uni.getStorageSync("FOOTER_ADDCART")) || 2,
          text: newCart + "",
        });
      } else {
        uni.hideTabBarRedDot({
          index: Number(uni.getStorageSync("FOOTER_ADDCART")) || 2,
        });
      }
    },
  },
  async onLaunch(option) {
    let that = this;

    // #ifdef MP
    if (HTTP_REQUEST_URL == "") {
      console.error("请配置根目录下的config.js文件中的 'HTTP_REQUEST_URL'");
      return false;
    }

    const updateManager = wx.getUpdateManager();
    const startParamObj = wx.getEnterOptionsSync();
    if (wx.canIUse("getUpdateManager") && startParamObj.scene != 1154) {
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: "更新提示",
              content: "新版本已经下载好，是否重启当前应用？",
              success(res) {
                if (res.confirm) updateManager.applyUpdate();
              },
            });
          });
          updateManager.onUpdateFailed(function () {
            wx.showModal({
              title: "发现新版本",
              content: "请删除当前小程序，重启搜索打开...",
            });
          });
        }
      });
    }
    // #endif

    uni.getSystemInfo({
      success: function (res) {
        that.globalData.navHeight = res.statusBarHeight * (750 / res.windowWidth) + 91;
      },
    });

    // #ifdef MP
    let menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    that.globalData.navH = menuButtonInfo.top * 2 + menuButtonInfo.height / 2;
    const version = uni.getSystemInfoSync().SDKVersion;
    if (Routine.compareVersion(version, "2.21.3") >= 0) {
      that.$Cache.set("MP_VERSION_ISNEW", true);
    } else {
      that.$Cache.set("MP_VERSION_ISNEW", false);
    }
    // #endif
  },
  onHide() {
    this.$Cache.clear("previewThemeId");
  },
};
</script>

<style>
view {
  box-sizing: border-box;
}

page {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
    Helvetica Neue, Arial, sans-serif;
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
}
</style>
