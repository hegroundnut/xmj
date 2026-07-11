<?php
namespace app\dao\teaching;

use app\dao\BaseDao;
use app\model\teaching\CourseFavorite;

class CourseFavoriteDao extends BaseDao
{
    protected function setModel(): string
    {
        return CourseFavorite::class;
    }

    public function isFavorited($courseId, $uid)
    {
        return $this->getModel()
            ->where('course_id', $courseId)
            ->where('uid', $uid)
            ->count() > 0;
    }

    public function getUserFavoriteIds($uid, $courseIds)
    {
        return $this->getModel()
            ->where('uid', $uid)
            ->whereIn('course_id', $courseIds)
            ->column('course_id');
    }

    public function getFavoriteList($uid, $page, $limit)
    {
        return $this->getModel()
            ->alias('f')
            ->where('f.uid', $uid)
            ->join('eb_course c', 'f.course_id = c.id')
            ->where('c.status', 1)
            ->field('c.id,c.title,c.cover,c.desc,c.video_url,c.price,f.add_time as fav_time')
            ->order('f.id desc')
            ->page($page, $limit)
            ->select()->toArray();
    }

    public function getFavoriteCount($uid)
    {
        return $this->getModel()
            ->alias('f')
            ->where('f.uid', $uid)
            ->join('eb_course c', 'f.course_id = c.id')
            ->where('c.status', 1)
            ->count();
    }
}
