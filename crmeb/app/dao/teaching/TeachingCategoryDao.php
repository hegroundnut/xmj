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
namespace app\dao\teaching;

use app\dao\BaseDao;
use app\model\teaching\TeachingCategory;

/**
 * 教学分类 DAO
 */
class TeachingCategoryDao extends BaseDao
{
    protected function setModel(): string
    {
        return TeachingCategory::class;
    }

    /**
     * 获取分类列表（按类型）
     * @param int $type 1=案例 2=课程
     * @param bool $onlyActive 是否仅查启用的
     * @return array
     */
    public function getCategoryList(int $type, bool $onlyActive = false)
    {
        return $this->getModel()
            ->where('type', $type)
            ->when($onlyActive, function ($query) {
                $query->where('status', 1);
            })
            ->order('sort desc, id desc')
            ->select()
            ->toArray();
    }
}
