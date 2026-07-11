<?php
namespace app\services\teaching;

use app\dao\teaching\CourseFavoriteDao;
use app\services\BaseServices;
use crmeb\exceptions\ApiException;

class CourseFavoriteServices extends BaseServices
{
    public function __construct(CourseFavoriteDao $dao)
    {
        $this->dao = $dao;
    }

    public function toggleFavorite($courseId, $uid)
    {
        $exists = $this->dao->getOrderOne([
            'course_id' => $courseId,
            'uid' => $uid,
        ]);
        if ($exists) {
            $this->dao->delete($exists->id);
            return 'unfavorited';
        }
        $this->dao->save([
            'course_id' => $courseId,
            'uid' => $uid,
            'add_time' => time(),
        ]);
        return 'favorited';
    }

    public function getFavorites($uid, $page, $limit)
    {
        $list = $this->dao->getFavoriteList($uid, $page, $limit);
        $count = $this->dao->getFavoriteCount($uid);
        foreach ($list as &$item) {
            if (!empty($item['cover'])) {
                $item['cover'] = media_url($item['cover']);
            }
            if (!empty($item['video_url'])) {
                $item['video_url'] = media_url($item['video_url']);
            }
            $item['fav_time'] = date('Y-m-d H:i', $item['fav_time']);
        }
        return ['list' => $list, 'count' => $count];
    }
}
