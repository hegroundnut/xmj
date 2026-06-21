(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/privacyAgreementPopup/index"],{"04e8":function(e,t,a){"use strict";var i=a("f94d"),n=a.n(i);n.a},"50c1":function(e,t,a){"use strict";a.r(t);var i,n=function(){var e=this,t=e.$createElement,a=(e._self._c,e.$t("服务与隐私协议")),i=e.$t("欢迎您使用"+e.mpData.siteName+"！请仔细阅读以下内容，并作出适当的选择："),n=e.$t("隐私政策概要"),s=e.$t("当您点击同意并开始时用产品服务时，即表示您已理解并同息该条款内容，该条款将对您产生法律约束力。如您拒绝，将无法继续下一步操作。"),c=e.$t("点击阅读"),o=e.$t("同意并继续"),r=e.$t("取消");e.$mp.data=Object.assign({},{$root:{m0:a,m1:i,m2:n,m3:s,m4:c,m5:o,m6:r}})},s=[],c=a("ad61"),o=c["a"],r=(a("04e8"),a("7521"),a("f0c5")),m=Object(r["a"])(o,n,s,!1,null,"c325f76c",null,!1,void 0,i);t["default"]=m.exports},7521:function(e,t,a){"use strict";var i=a("e8e3"),n=a.n(i);n.a},ad61:function(e,t,a){"use strict";(function(e,i){var n=a("37cf");a("c24f");t["a"]={mixins:[n["a"]],data(){return{isShow:!1,agreementName:"",mpData:e.getStorageSync("copyRight")}},mounted(){i.getPrivacySetting({success:e=>{e.needAuthorization?(this.isShow=!0,this.agreementName=e.privacyContractName):this.$emit("onAgree")},fail:()=>{},complete:()=>{}})},methods:{handleAgree(){this.isShow=!1,this.$emit("onAgree")},rejectAgreement(){this.isShow=!1,e.switchTab({url:"/pages/index/index"}),this.$emit("onReject")},closeAttr(){this.$emit("onCloseAgePop")},privacy(t){e.navigateTo({url:"/pages/users/privacy/index?type="+t})}}}}).call(this,a("543d")["default"],a("bc2e")["default"])},e8e3:function(e,t,a){},f94d:function(e,t,a){}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/privacyAgreementPopup/index-create-component',
    {
        'components/privacyAgreementPopup/index-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("50c1"))
        })
    },
    [['components/privacyAgreementPopup/index-create-component']]
]);
