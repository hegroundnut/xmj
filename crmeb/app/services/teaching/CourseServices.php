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

use app\dao\teaching\CourseDao;
use app\services\BaseServices;
use app\services\user\UserServices;
use crmeb\exceptions\ApiException;

/**
 * 教学课程服务
 */
class CourseServices extends BaseServices
{
    public function __construct(CourseDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 获取课程列表（含会员权限信息）
     * @param array $where
     * @param int $uid
     * @return array
     */
    public function getList(array $where, int $uid)
    {
        [$page, $limit] = $this->getPageValue();
        $field = 'id,title,cover,desc,price,is_free_for_member,sort,status,add_time';
        $list = $this->dao->courseList($where, $field, $page, $limit);
        // 检查是否教学会员
        $isMember = false;
        if ($uid > 0) {
            /** @var UserServices $userServices */
            $userServices = app()->make(UserServices::class);
            $isMember = (bool)$userServices->value(['uid' => $uid], 'is_teaching_member');
        }
        foreach ($list as &$item) {
            $item['cover'] = set_file_url($item['cover']);
            $item['is_member'] = $isMember;
            $item['can_watch'] = $isMember || $item['is_free_for_member'];
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
        }
        $count = $this->dao->courseCount($where);
        return compact('list', 'count');
    }

    /**
     * 获取课程详情
     * @param int $id
     * @param int $uid
     * @return array
     * @throws ApiException
     */
    public function getDetail(int $id, int $uid)
    {
        $info = $this->dao->get($id);
        if (!$info || !$info['status']) {
            throw new ApiException('课程不存在或已下架');
        }
        $info['cover'] = set_file_url($info['cover']);
        $info['video_url'] = set_file_url($info['video_url']);
        // 检查会员
        $isMember = false;
        if ($uid > 0) {
            $userServices = app()->make(UserServices::class);
            $isMember = (bool)$userServices->value(['uid' => $uid], 'is_teaching_member');
        }
        $info['is_member'] = $isMember;
        $info['can_watch'] = $isMember || $info['is_free_for_member'];
        return $info;
    }
}