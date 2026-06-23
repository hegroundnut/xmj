<?php
namespace app\services\teaching;

use app\dao\teaching\CaseFavoriteDao;
use app\services\BaseServices;
use crmeb\exceptions\ApiException;

class CaseFavoriteServices extends BaseServices
{
    public function __construct(CaseFavoriteDao $dao)
    {
        $this->dao = $dao;
    }

    public function toggleFavorite($caseId, $uid)
    {
        $exists = $this->dao->getOrderOne([
            'case_id' => $caseId,
            'uid' => $uid,
        ]);
        if ($exists) {
            $this->dao->delete($exists->id);
            return 'unfavorited';
        }
        $this->dao->save([
            'case_id' => $caseId,
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
                $item['cover'] = set_file_url($item['cover']);
            }
            if (!empty($item['media_url'])) {
                $item['media_url'] = set_file_url($item['media_url']);
            }
        }
        return ['list' => $list, 'count' => $count];
    }
}
