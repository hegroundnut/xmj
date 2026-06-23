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
namespace app\adminapi\controller\v1\teaching;

use app\services\teaching\CaseCommentServices;
use think\facade\App;

/**
 * 案例评论管理控制器（后台）
 */
class CaseCommentController
{
    /**
     * @var CaseCommentServices
     */
    protected $services;

    /**
     * @param App $app
     * @param CaseCommentServices $services
     */
    public function __construct(App $app, CaseCommentServices $services)
    {
        $this->services = $services;
    }

    /**
     * 评论列表
     * @return mixed
     */
    public function index()
    {
        $where = request()->getMore([
            ['case_id', 0],
            ['status', ''],
            ['keyword', ''],
        ]);
        return app('json')->success($this->services->adminList($where));
    }

    /**
     * 审核评论（显示/隐藏）
     * @param int $id
     * @return mixed
     */
    public function setStatus($id)
    {
        [$status] = request()->getMore([
            ['status', 1],
        ], true);
        $this->services->setStatus((int)$id, (int)$status);
        return app('json')->success('操作成功');
    }

    /**
     * 删除评论
     * @param int $id
     * @return mixed
     */
    public function delete($id)
    {
        $this->services->deleteComment((int)$id);
        return app('json')->success('删除成功');
    }
}
