// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import LayoutMain from '@/layout';
import setting from '@/setting';
let routePre = setting.routePre;

const pre = 'teaching_';

export default {
  path: routePre + '/teaching',
  name: 'teaching',
  header: 'teaching',
  meta: {
    title: '洗眉机',
    auth: ['admin-teaching-index'],
  },
  redirect: {
    name: `${pre}productInfo`,
  },
  component: LayoutMain,
  children: [
    {
      path: 'product_info',
      name: `${pre}productInfo`,
      meta: {
        title: '产品管理',
        auth: ['admin-teaching-product-info'],
      },
      component: () => import('@/pages/teaching/productInfo/index'),
    },
    {
      path: 'case_list',
      name: `${pre}caseList`,
      meta: {
        title: '案例管理',
        auth: ['admin-teaching-case-list'],
        keepAlive: true,
      },
      component: () => import('@/pages/teaching/caseList/index'),
    },
    {
      path: 'course_list',
      name: `${pre}courseList`,
      meta: {
        title: '课程管理',
        auth: ['admin-teaching-course-list'],
        keepAlive: true,
      },
      component: () => import('@/pages/teaching/courseList/index'),
    },
    {
      path: 'offline_class',
      name: `${pre}offlineClass`,
      meta: {
        title: '线下排期',
        auth: ['admin-teaching-offline-class'],
        keepAlive: true,
      },
      component: () => import('@/pages/teaching/offlineClass/index'),
    },
    {
      path: 'booking_list',
      name: `${pre}bookingList`,
      meta: {
        title: '预约记录',
        auth: ['admin-teaching-booking-list'],
        keepAlive: true,
      },
      component: () => import('@/pages/teaching/booking/index'),
    },
  ],
};