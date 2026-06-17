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

use app\dao\teaching\CourseOrderDao;
use app\services\BaseServices;
use crmeb\exceptions\ApiException;

/**
 * 课程订单服务
 */
class CourseOrderServices extends BaseServices
{
    public function __construct(CourseOrderDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 创建试听订单
     * @param int $uid
     * @param int $courseId
     * @param float $price
     * @return string order_sn
     */
    public function createOrder(int $uid, int $courseId, float $price)
    {
        $orderSn = date('YmdHis') . rand(10000, 99999);
        $this->dao->save([
            'uid' => $uid,
            'course_id' => $courseId,
            'order_sn' => $orderSn,
            'price' => $price,
            'pay_type' => 'wechat',
            'paid' => 0,
            'add_time' => time(),
        ]);
        return $orderSn;
    }

    /**
     * 支付成功回调处理
     * @param string $orderSn
     * @return bool
     */
    public function paySuccess(string $orderSn)
    {
        $order = $this->dao->getOne(['order_sn' => $orderSn]);
        if (!$order) throw new ApiException('订单不存在');
        if ($order['paid']) return true;
        return $this->dao->update($order['id'], [
            'paid' => 1,
            'pay_time' => time(),
        ]);
    }

    /**
     * 检查用户是否购买过某课程
     * @param int $uid
     * @param int $courseId
     * @return bool
     */
    public function hasPurchased(int $uid, int $courseId): bool
    {
        return $this->dao->be(['uid' => $uid, 'course_id' => $courseId, 'paid' => 1]);
    }
}