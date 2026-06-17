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
namespace app\model\teaching;

use crmeb\basic\BaseModel;
use crmeb\traits\ModelTrait;

/**
 * 线下课程预约
 */
class OfflineBooking extends BaseModel
{
    use ModelTrait;

    protected $pk = 'id';

    protected $name = 'offline_booking';

    protected $autoWriteTimestamp = false;
}