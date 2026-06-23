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

use app\services\pay\PayServices;
use crmeb\exceptions\ApiException;

/**
 * 课程支付服务
 */
class CoursePayServices
{
    /**
     * 课程支付 - 复用CRMEB支付
     * @param string $orderSn
     * @param float $price
     * @param string $payType routine=小程序 weixin=微信
     * @return array
     */
    public function pay(string $orderSn, float $price, string $payType = 'routine')
    {
        if ($price <= 0) {
            throw new ApiException('支付金额异常');
        }

        /** @var PayServices $payServices */
        $payServices = app()->make(PayServices::class);

        return $payServices->pay(
            $payType,
            $orderSn,
            (string)$price,
            'course_pay_success',
            '课程试听订单'
        );
    }
}
