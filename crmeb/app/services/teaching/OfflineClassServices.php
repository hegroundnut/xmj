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
        $field = 'id,title,cover,class_date,start_time,end_time,address,max_people,qrcode,desc,status,add_time';
        $list = $this->dao->offlineClassList($where, $field, $page, $limit);
        /** @var OfflineBookingServices $bookingServices */
        $bookingServices = app()->make(OfflineBookingServices::class);
        foreach ($list as &$item) {
            $item['cover'] = set_file_url($item['cover']);
            $item['qrcode'] = set_file_url($item['qrcode']);
            $item['booked_count'] = $bookingServices->getBookedCount($item['id']);
        }
        $count = $this->dao->offlineClassCount($where);
        return compact('list', 'count');
    }
}