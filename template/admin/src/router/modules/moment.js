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

const pre = 'moment_';

export default {
  path: routePre + '/moment',
  name: 'moment',
  header: 'moment',
  meta: {
    title: '朋友圈管理',
    auth: ['admin-moment-index'],
  },
  redirect: {
    name: `${pre}momentList`,
  },
  component: LayoutMain,
  children: [
    {
      path: 'moment_list',
      name: `${pre}momentList`,
      meta: {
        title: '帖子管理',
        auth: ['admin-moment-moment-list'],
        keepAlive: true,
      },
      component: () => import('@/pages/moment/momentList/index'),
    },
    {
      path: 'comment_list',
      name: `${pre}commentList`,
      meta: {
        title: '评论管理',
        auth: ['admin-moment-comment-list'],
        keepAlive: true,
      },
      component: () => import('@/pages/moment/commentList/index'),
    },
  ],
};
