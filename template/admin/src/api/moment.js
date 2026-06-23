// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import request from '@/libs/request';

/**
 * 帖子管理
 */
export function getMomentList(params) {
  return request({ url: 'moment/list', method: 'get', params });
}
export function deleteMoment(id) {
  return request({ url: `moment/delete/${id}`, method: 'delete' });
}

/**
 * 评论管理
 */
export function getCommentList(params) {
  return request({ url: 'moment_comment/list', method: 'get', params });
}
export function deleteComment(id) {
  return request({ url: `moment_comment/delete/${id}`, method: 'delete' });
}
