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
            'hero_text' => [
                'enabled' => true,
                'brand' => 'ALI LAOXI',
                'title' => '阿利老西',
                'subtitle' => '专业洗眉设备 · 第5代新品',
            ],
            'featured_cases' => [
                'enabled' => true,
                'title' => '精选案例',
                'title_en' => 'SELECTED CASES',
                'limit' => 4,
            ],
            'latest_courses' => [
                'enabled' => true,
                'title' => '热门课程',
                'title_en' => 'HOT COURSES',
                'limit' => 3,
            ],
            'contact' => [
                'enabled' => true,
                'title' => '联系我们',
                'title_en' => 'CONTACT US',
                'phone' => '',
                'wechat' => '',
                'hours' => '周一至周六 10:00-19:30',
                'qrcode' => '',
            ],
        ];
    }
}
