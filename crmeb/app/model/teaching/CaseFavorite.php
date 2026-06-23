<?php
namespace app\model\teaching;

use crmeb\basic\BaseModel;
use crmeb\traits\ModelTrait;

class CaseFavorite extends BaseModel
{
    use ModelTrait;

    protected $pk = 'id';
    protected $name = 'case_favorite';
    protected $autoWriteTimestamp = false;
}
