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
use app\dao\teaching\TeachingCategoryDao;
use app\services\BaseServices;
use app\model\user\User;
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
     * 获取用户会员类型
     * @param int $uid
     * @return string super|regular|none
     */
    protected function getUserMemberType(int $uid): string
    {
        if ($uid <= 0) return 'none';
        $user = User::find($uid);
        if (!$user) return 'none';
        if ($user->is_teaching_member == 1) return 'super';
        if ($user->overdue_time > time()) return 'regular';
        return 'none';
    }

    /**
     * 判断用户是否能观看指定课程
     * member_level=1: 普通会员可看（普通+超级）
     * member_level=2: 超级会员可看（仅超级）
     * @param string $memberType
     * @param int $memberLevel
     * @return bool
     */
    protected function canWatch(string $memberType, int $memberLevel): bool
    {
        if ($memberType === 'super') return true;
        if ($memberType === 'regular' && $memberLevel <= 1) return true;
        return false;
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
        $field = 'id,title,category_id,cover,desc,member_level,sort,status,add_time';
        $list = $this->dao->courseList($where, $field, $page, $limit);
        $memberType = $this->getUserMemberType($uid);
        /** @var TeachingCategoryDao $categoryDao */
        $categoryDao = app()->make(TeachingCategoryDao::class);
        $categories = $categoryDao->getCategoryList(2);
        $categoryMap = array_column($categories, 'name', 'id');
        foreach ($list as &$item) {
            $item['cover'] = set_file_url($item['cover']);
            $item['member_type'] = $memberType;
            $item['can_watch'] = $this->canWatch($memberType, (int)$item['member_level']);
            $item['member_level_text'] = $item['member_level'] == 2 ? '超级会员' : '普通会员';
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
            $item['category_name'] = $categoryMap[$item['category_id']] ?? '';
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
        $info = $info->toArray();
        $info['cover'] = set_file_url($info['cover']);
        $info['video_url'] = set_file_url($info['video_url']);
        $memberType = $this->getUserMemberType($uid);
        $info['member_type'] = $memberType;
        $info['can_watch'] = $this->canWatch($memberType, (int)$info['member_level']);
        $info['member_level_text'] = $info['member_level'] == 2 ? '超级会员' : '普通会员';
        return $info;
    }
}
