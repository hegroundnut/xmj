(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/BaseMoney"],{a6d8:function(e,t,a){"use strict";var l=a("cbdb"),i=a.n(l);i.a},cb3c:function(e,t,a){"use strict";var l;a.r(t);var i,n=function(){var e=this,t=e.$createElement;e._self._c},o=[],d={name:"BaseMoney",props:{digits:{type:Number,default:2},money:{type:String|Number,default:""},line:{type:Boolean,default:!1},weight:{type:Boolean,default:!1},symbol:{type:Boolean,default:!0},color:{type:String,default:"var(--view-theme)"},textColor:{type:String,default:"#999"},symbolSize:{type:String,default:"20"},integerSize:{type:String,default:"26"},decimalSize:{type:String,default:"24"},inline:{type:Boolean,default:!1},preFix:{type:String,default:""},preFixSize:{type:String,default:"24"},SemiBold:{type:Boolean,default:!0},isCoupon:{type:Boolean,default:!1}},data(){return{integer:0,decimal:0}},watch:{money:{handler(e,t){let a=Number(e).toFixed(this.digits);a=a.split("."),this.integer=a[0].replace(/\B(?=(\d{3})+(?!\d))/g,","),a[1]&&(this.decimal=a[1])},immediate:!0}},computed:{}},r=d,u=(a("a6d8"),a("f0c5")),p=Object(u["a"])(r,n,o,!1,null,"5112a064",null,!1,l,i);t["default"]=p.exports},cbdb:function(e,t,a){}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/BaseMoney-create-component',
    {
        'components/BaseMoney-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("cb3c"))
        })
    },
    [['components/BaseMoney-create-component']]
]);
