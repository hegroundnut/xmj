<?php
namespace app\dao\teaching;

use app\dao\BaseDao;
use app\model\teaching\CaseFavorite;

class CaseFavoriteDao extends BaseDao
{
    protected function setModel(): string
    {
        return CaseFavorite::class;
    }

    public function isFavorited($caseId, $uid)
    {
        return $this->getModel()
            ->where('case_id', $caseId)
            ->where('uid', $uid)
            ->count() > 0;
    }

    public function getUserFavoriteIds($uid, $caseIds)
    {
        return $this->getModel()
            ->where('uid', $uid)
            ->whereIn('case_id', $caseIds)
            ->column('case_id');
    }

    public function getFavoriteList($uid, $page, $limit)
    {
        return $this->getModel()
            ->alias('f')
            ->where('f.uid', $uid)
            ->join('eb_case c', 'f.case_id = c.id')
            ->where('c.status', 1)
            ->field('c.id,c.title,c.type,c.cover,c.media_url,c.sort,f.add_time as fav_time')
            ->order('f.id desc')
            ->page($page, $limit)
            ->select()->toArray();
    }

    public function getFavoriteCount($uid)
    {
        return $this->getModel()
            ->alias('f')
            ->where('f.uid', $uid)
            ->join('eb_case c', 'f.case_id = c.id')
            ->where('c.status', 1)
            ->count();
    }
}
