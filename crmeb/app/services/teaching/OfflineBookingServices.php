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

use app\dao\teaching\OfflineBookingDao;
use app\services\BaseServices;
use crmeb\exceptions\ApiException;

/**
 * 线下预约服务
 */
class OfflineBookingServices extends BaseServices
{
    public function __construct(OfflineBookingDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 创建预约
     * @param int $uid
     * @param int $classId
     * @param string $name
     * @param string $phone
     * @return mixed
     * @throws ApiException
     */
    public function createBooking(int $uid, int $classId, string $name, string $phone)
    {
        // 检查是否已预约
        if ($this->dao->be(['uid' => $uid, 'class_id' => $classId, 'status' => 0])) {
            throw new ApiException('您已预约过该课程');
        }
        return $this->dao->save([
            'uid' => $uid,
            'class_id' => $classId,
            'name' => $name,
            'phone' => $phone,
            'status' => 0,
            'add_time' => time(),
        ]);
    }

    /**
     * 获取某排期的已预约人数
     * @param int $classId
     * @return int
     */
    public function getBookedCount(int $classId): int
    {
        return $this->dao->getCount(['class_id' => $classId, 'status' => 0]);
    }

    /**
     * 获取预约列表
     * @param array $where
     * @return array
     */
    public function getList(array $where)
    {
        [$page, $limit] = $this->getPageValue();
        $field = 'id,uid,class_id,name,phone,status,add_time';
        $list = $this->dao->bookingList($where, $field, $page, $limit);
        foreach ($list as &$item) {
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
        }
        $count = $this->dao->bookingCount($where);
        return compact('list', 'count');
    }
}