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
use app\model\teaching\TeachingHomeConfig;

/**
 * 首页配置 DAO
 */
class TeachingHomeConfigDao extends BaseDao
{
    /**
     * @return string
     */
    protected function setModel(): string
    {
        return TeachingHomeConfig::class;
    }

    /**
     * 获取配置
     * @param string $name
     * @return mixed
     */
    public function getConfig(string $name)
    {
        return $this->getModel()->where('name', $name)->value('value');
    }

    /**
     * 设置配置
     * @param string $name
     * @param string $value
     * @return bool
     */
    public function setConfig(string $name, string $value)
    {
        $exists = $this->getModel()->where('name', $name)->find();
        if ($exists) {
            return $this->getModel()->where('name', $name)->update([
                'value' => $value,
                'update_time' => time(),
            ]);
        }
        return $this->getModel()->insert([
            'name' => $name,
            'value' => $value,
            'add_time' => time(),
            'update_time' => time(),
        ]);
    }
}
