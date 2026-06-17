<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\services\teaching;

use app\dao\teaching\CaseDao;
use app\services\BaseServices;

/**
 * 案例服务
 */
class CaseServices extends BaseServices
{
    public function __construct(CaseDao $dao)
    {
        $this->dao = $dao;
    }

    public function getList(array $where)
    {
        [$page, $limit] = $this->getPageValue();
        $field = 'id,title,type,cover,media_url,sort,status,add_time';
        $list = $this->dao->caseList($where, $field, $page, $limit);
        foreach ($list as &$item) {
            $item['cover'] = set_file_url($item['cover']);
            $item['media_url'] = set_file_url($item['media_url']);
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
        }
        $count = $this->dao->caseCount($where);
        return compact('list', 'count');
    }
}