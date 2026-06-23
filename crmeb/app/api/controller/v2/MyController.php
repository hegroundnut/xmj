<?php
namespace app\api\controller\v2;

use app\dao\moment\MomentFavoriteDao;
use app\dao\teaching\CaseFavoriteDao;
use app\dao\teaching\CourseOrderDao;
use app\dao\teaching\OfflineBookingDao;
use app\dao\teaching\CaseCommentDao;
use app\dao\moment\MomentDao;
use app\dao\moment\MomentCommentDao;

class MyController
{
    protected function uid()
    {
        return (int) request()->uid();
    }

    protected function getPage()
    {
        [$page, $limit] = request()->getMore([
            ['page', 1],
            ['limit', 10],
        ]);
        return [(int)$page, (int)$limit];
    }

    /**
     * 我的收藏聚合 — 帖子收藏 + 案例收藏
     */
    public function favorites()
    {
        [$page, $limit] = $this->getPage();
        $type = request()->get('type', 'moment');

        if ($type === 'case') {
            $dao = app()->make(CaseFavoriteDao::class);
            $list = $dao->getFavoriteList($this->uid(), $page, $limit);
            $count = $dao->getFavoriteCount($this->uid());
            foreach ($list as &$item) {
                if (!empty($item['cover'])) $item['cover'] = set_file_url($item['cover']);
                if (!empty($item['media_url'])) $item['media_url'] = set_file_url($item['media_url']);
                $item['fav_time'] = date('Y-m-d H:i', $item['fav_time']);
            }
        } else {
            $dao = app()->make(MomentFavoriteDao::class);
            $list = $dao->getFavoriteList($this->uid(), $page, $limit);
            $count = $dao->getFavoriteCount($this->uid());
            foreach ($list as &$item) {
                if (!empty($item['images'])) {
                    $item['images'] = json_decode($item['images'], true) ?: [];
                }
                if (!empty($item['user_avatar'])) $item['user_avatar'] = set_file_url($item['user_avatar']);
                $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
                $item['fav_time'] = date('Y-m-d H:i', $item['fav_time']);
            }
        }

        return app('json')->success(['list' => $list, 'count' => $count]);
    }

    /**
     * 已购课程
     */
    public function courses()
    {
        [$page, $limit] = $this->getPage();
        $dao = app()->make(CourseOrderDao::class);
        $list = $dao->courseOrderList(
            ['uid' => $this->uid(), 'paid' => 1],
            'id,course_id,order_sn,price,pay_time,add_time',
            $page, $limit, 'id desc'
        );
        $count = $dao->courseOrderCount(['uid' => $this->uid(), 'paid' => 1]);
        $courseIds = array_column($list, 'course_id');
        if ($courseIds) {
            $courses = app()->make(\app\model\teaching\Course::class)
                ->whereIn('id', $courseIds)
                ->column('title,cover,video_url', 'id');
            foreach ($list as &$item) {
                $item['course_title'] = $courses[$item['course_id']]['title'] ?? '';
                $item['course_cover'] = set_file_url($courses[$item['course_id']]['cover'] ?? '');
                $item['pay_time'] = $item['pay_time'] ? date('Y-m-d H:i', $item['pay_time']) : '';
            }
        }
        return app('json')->success(['list' => $list, 'count' => $count]);
    }

    /**
     * 线下课预约
     */
    public function bookings()
    {
        [$page, $limit] = $this->getPage();
        $dao = app()->make(OfflineBookingDao::class);
        $list = $dao->offlineBookingList(
            ['uid' => $this->uid()],
            'id,class_id,name,phone,status,add_time',
            $page, $limit, 'id desc'
        );
        $count = $dao->offlineBookingCount(['uid' => $this->uid()]);
        $classIds = array_column($list, 'class_id');
        if ($classIds) {
            $classes = app()->make(\app\model\teaching\OfflineClass::class)
                ->whereIn('id', $classIds)
                ->column('title,cover,class_date,start_time,end_time,address', 'id');
            foreach ($list as &$item) {
                $cls = $classes[$item['class_id']] ?? [];
                $item['class_title'] = $cls['title'] ?? '';
                $item['class_cover'] = set_file_url($cls['cover'] ?? '');
                $item['class_date'] = $cls['class_date'] ?? '';
                $item['start_time'] = $cls['start_time'] ?? '';
                $item['end_time'] = $cls['end_time'] ?? '';
                $item['address'] = $cls['address'] ?? '';
                $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
            }
        }
        return app('json')->success(['list' => $list, 'count' => $count]);
    }

    /**
     * 我的评论 — 案例评论 + 朋友圈评论
     */
    public function comments()
    {
        [$page, $limit] = $this->getPage();
        $type = request()->get('type', 'case');
        $uid = $this->uid();

        if ($type === 'moment') {
            $dao = app()->make(MomentCommentDao::class);
            $list = $dao->getModel()
                ->where('uid', $uid)
                ->where('status', 1)
                ->field('id,moment_id,parent_id,reply_uid,content,status,add_time')
                ->order('id desc')
                ->page($page, $limit)
                ->select()->toArray();
            $count = $dao->getModel()->where('uid', $uid)->where('status', 1)->count();
            $momentIds = array_column($list, 'moment_id');
            if ($momentIds) {
                $moments = app()->make(\app\model\moment\Moment::class)
                    ->whereIn('id', $momentIds)
                    ->column('content', 'id');
                foreach ($list as &$item) {
                    $item['moment_content'] = mb_substr($moments[$item['moment_id']] ?? '', 0, 50);
                }
            }
        } else {
            $dao = app()->make(CaseCommentDao::class);
            $list = $dao->getModel()
                ->where('uid', $uid)
                ->where('status', 1)
                ->field('id,case_id,content,pid,reply_nickname,status,add_time')
                ->order('id desc')
                ->page($page, $limit)
                ->select()->toArray();
            $count = $dao->getModel()->where('uid', $uid)->where('status', 1)->count();
            $caseIds = array_column($list, 'case_id');
            if ($caseIds) {
                $cases = app()->make(\app\model\teaching\TeachingCase::class)
                    ->whereIn('id', $caseIds)
                    ->column('title', 'id');
                foreach ($list as &$item) {
                    $item['case_title'] = $cases[$item['case_id']] ?? '';
                }
            }
        }
        foreach ($list as &$item) {
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
            $item['comment_type'] = $type;
        }

        return app('json')->success(['list' => $list, 'count' => $count]);
    }

    /**
     * 我的发帖
     */
    public function posts()
    {
        [$page, $limit] = $this->getPage();
        $dao = app()->make(MomentDao::class);
        $list = $dao->getList(
            ['uid' => $this->uid()],
            'id,content,images,video_url,like_count,comment_count,status,add_time',
            $page, $limit, 'id desc'
        );
        $count = $dao->getCount(['uid' => $this->uid()]);
        foreach ($list as &$item) {
            if (!empty($item['images'])) {
                $item['images'] = json_decode($item['images'], true) ?: [];
            }
            if (!empty($item['user_avatar'])) $item['user_avatar'] = set_file_url($item['user_avatar']);
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
        }
        return app('json')->success(['list' => $list, 'count' => $count]);
    }
}
