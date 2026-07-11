<?php
namespace app\model\teaching;

use crmeb\basic\BaseModel;
use crmeb\traits\ModelTrait;

/**
 * 课程收藏
 */
class CourseFavorite extends BaseModel
{
    use ModelTrait;

    protected $pk = 'id';
    protected $name = 'course_favorite';
    protected $autoWriteTimestamp = false;
}
