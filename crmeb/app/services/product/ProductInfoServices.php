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
namespace app\services\product;

use app\dao\product\ProductInfoDao;
use app\dao\teaching\TeachingCategoryDao;
use app\services\BaseServices;

/**
 * 洗眉机产品信息服务
 */
class ProductInfoServices extends BaseServices
{
    public function __construct(ProductInfoDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 格式化单条产品信息
     * @param mixed $info
     * @return array
     */
    protected function formatInfo($info)
    {
        if (!$info) return [];
        if (is_object($info)) $info = $info->toArray();
        $info['banner'] = json_decode($info['banner'], true) ?? [];
        $info['specs'] = json_decode($info['specs'], true) ?? [];
        if (is_array($info['banner'])) {
            foreach ($info['banner'] as $key => $url) {
                $info['banner'][$key] = set_file_url($url);
            }
        }
        return $info;
    }

    /**
     * 批量填充分类名称
     * @param array $list
     * @return array
     */
    protected function fillCategoryName(array $list)
    {
        $categoryIds = array_unique(array_column($list, 'category_id'));
        $categoryIds = array_filter($categoryIds);
        $categoryMap = [];
        if ($categoryIds) {
            $categoryDao = app()->make(TeachingCategoryDao::class);
            $categories = $categoryDao->getModel()->whereIn('id', $categoryIds)->column('name', 'id');
            $categoryMap = $categories;
        }
        foreach ($list as &$item) {
            $item['category_name'] = $categoryMap[$item['category_id'] ?? 0] ?? '';
        }
        return $list;
    }

    /**
     * 获取产品信息（首页展示的那条，兼容旧逻辑）
     * @return array
     */
    public function getProductInfo()
    {
        $info = $this->dao->getModel()
            ->where('is_home', 1)
            ->where('status', 1)
            ->order('id asc')
            ->find();
        if (!$info) {
            $info = $this->dao->get(1);
        }
        $formatted = $this->formatInfo($info);
        if ($formatted) {
            $list = $this->fillCategoryName([$formatted]);
            return $list[0];
        }
        return $formatted;
    }

    /**
     * 获取全部产品列表（后台管理用）
     * @return array
     */
    public function getProductList()
    {
        $list = $this->dao->getModel()
            ->order('id desc')
            ->select()
            ->toArray();
        foreach ($list as &$item) {
            $item['banner'] = json_decode($item['banner'], true) ?? [];
            $item['specs'] = json_decode($item['specs'], true) ?? [];
            if (is_array($item['banner'])) {
                foreach ($item['banner'] as $key => $url) {
                    $item['banner'][$key] = set_file_url($url);
                }
            }
        }
        return $this->fillCategoryName($list);
    }

    /**
     * 获取前端产品列表（仅启用的产品）
     * @return array
     */
    public function getActiveProductList()
    {
        $list = $this->dao->getModel()
            ->where('status', 1)
            ->order('is_home desc, id desc')
            ->select()
            ->toArray();
        foreach ($list as &$item) {
            $item = $this->formatInfo($item);
        }
        return $this->fillCategoryName($list);
    }

    /**
     * 保存产品信息（指定 ID 则更新，否则新增）
     * @param array $data
     * @param int $id
     * @return mixed
     */
    public function saveProductInfo(array $data, int $id = 0)
    {
        $data['update_time'] = time();
        if ($id > 0) {
            return $this->dao->update($id, $data);
        } else {
            $data['add_time'] = time();
            return $this->dao->save($data);
        }
    }

    /**
     * 删除产品
     * @param int $id
     * @return bool
     */
    public function deleteProduct(int $id)
    {
        return $this->dao->delete($id);
    }
}
