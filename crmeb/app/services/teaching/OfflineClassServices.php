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

use app\dao\teaching\OfflineClassDao;
use app\services\BaseServices;

/**
 * 线下课程排期服务
 */
class OfflineClassServices extends BaseServices
{
    public function __construct(OfflineClassDao $dao)
    {
        $this->dao = $dao;
    }

    public function getList(array $where)
    {
        [$page, $limit] = $this->getPageValue();
        $field = 'id,title,cover,start_date,end_date,start_time,end_time,address,max_people,qrcode,photos,desc,status,add_time';
        $list = $this->dao->offlineClassList($where, $field, $page, $limit);
        /** @var OfflineBookingServices $bookingServices */
        $bookingServices = app()->make(OfflineBookingServices::class);
        foreach ($list as &$item) {
            $item['cover'] = media_url($item['cover']);
            $item['qrcode'] = media_url($item['qrcode']);
            $item['photos'] = $item['photos'] ? json_decode($item['photos'], true) : [];
            if (!empty($item['photos'])) {
                foreach ($item['photos'] as &$photo) {
                    $photo = media_url($photo);
                }
            }
            $item['booked_count'] = $bookingServices->getBookedCount($item['id']);
            if ($item['max_people'] > 0) {
                $item['remaining_seats'] = max(0, (int)$item['max_people'] - (int)$item['booked_count']);
                $item['is_full'] = (int)$item['booked_count'] >= (int)$item['max_people'];
            } else {
                $item['remaining_seats'] = null;
                $item['is_full'] = false;
            }
        }
        $count = $this->dao->offlineClassCount($where);
        return compact('list', 'count');
    }

    /**
     * 获取排期详情
     * @param int $id
     * @return array
     */
    public function getDetail($id)
    {
        $info = $this->dao->get($id);
        if ($info) {
            $info = $info->toArray();
            $info['cover'] = media_url($info['cover']);
            $info['qrcode'] = media_url($info['qrcode']);
            $info['photos'] = $info['photos'] ? json_decode($info['photos'], true) : [];
            if (!empty($info['photos'])) {
                foreach ($info['photos'] as &$photo) {
                    $photo = media_url($photo);
                }
            }
            /** @var OfflineBookingServices $bookingServices */
            $bookingServices = app()->make(OfflineBookingServices::class);
            $info['booked_count'] = $bookingServices->getBookedCount($info['id']);
            if ($info['max_people'] > 0) {
                $info['remaining_seats'] = max(0, (int)$info['max_people'] - (int)$info['booked_count']);
                $info['is_full'] = (int)$info['booked_count'] >= (int)$info['max_people'];
            } else {
                $info['remaining_seats'] = null;
                $info['is_full'] = false;
            }
        }
        return $info ?: [];
    }
}