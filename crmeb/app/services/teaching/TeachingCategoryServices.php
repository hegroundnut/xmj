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

use app\dao\teaching\TeachingCategoryDao;
use app\services\BaseServices;

/**
 * 教学分类服务
 */
class TeachingCategoryServices extends BaseServices
{
    public function __construct(TeachingCategoryDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 获取分类列表
     * @param int $type 1=案例 2=课程
     * @param bool $onlyActive
     * @return array
     */
    public function getCategoryList(int $type, bool $onlyActive = false)
    {
        return $this->dao->getCategoryList($type, $onlyActive);
    }
}
