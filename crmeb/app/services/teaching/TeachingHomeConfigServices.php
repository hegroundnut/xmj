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

use app\dao\teaching\TeachingHomeConfigDao;
use app\services\BaseServices;

/**
 * 首页配置服务
 */
class TeachingHomeConfigServices extends BaseServices
{
    /**
     * @param TeachingHomeConfigDao $dao
     */
    public function __construct(TeachingHomeConfigDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 获取首页配置
     * @return array
     */
    public function getHomeConfig()
    {
        $json = $this->dao->getConfig('home_page');
        if ($json) {
            $config = json_decode($json, true);
            if ($config) return $config;
        }
        return $this->getDefaultConfig();
    }

    /**
     * 保存首页配置
     * @param array $data
     * @return bool
     */
    public function saveHomeConfig(array $data)
    {
        return $this->dao->setConfig('home_page', json_encode($data, JSON_UNESCAPED_UNICODE));
    }

    /**
     * 默认首页配置
     * @return array
     */
    protected function getDefaultConfig()
    {
        return [
            'banner' => [
                'enabled' => true,
                'items' => [],
            ],
            'notice' => [
                'enabled' => true,
                'text' => '欢迎来到洗眉机教学平台',
            ],
            'quick_nav' => [
                'enabled' => true,
                'items' => [
                    ['icon' => 'product', 'title' => '产品展示', 'page' => '/pages/teaching/product/index'],
                    ['icon' => 'case', 'title' => '案例展示', 'page' => '/pages/teaching/case/index'],
                    ['icon' => 'course', 'title' => '教学课程', 'page' => '/pages/teaching/course/index'],
                    ['icon' => 'offline', 'title' => '线下课程', 'page' => '/pages/teaching/offline/index'],
                ],
            ],
            'featured_cases' => [
                'enabled' => true,
                'title' => '精选案例',
                'limit' => 4,
            ],
            'latest_courses' => [
                'enabled' => true,
                'title' => '热门课程',
                'limit' => 3,
            ],
            'contact' => [
                'enabled' => true,
                'title' => '联系我们',
                'qrcode' => '',
                'phone' => '',
                'wechat' => '',
            ],
        ];
    }
}
