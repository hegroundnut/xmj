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
namespace app\adminapi\controller\v1\moment;

use app\adminapi\controller\AuthController;
use app\services\moment\MomentServices;
use think\facade\App;

/**
 * 朋友圈后台管理
 */
class MomentController extends AuthController
{
    protected $services;

    public function __construct(App $app, MomentServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    /**
     * 帖子列表（含已删除）
     */
    public function index()
    {
        $where = $this->request->getMore([
            ['keyword', ''],
            ['status', ''],
            ['page', 1],
            ['limit', 15],
        ]);
        $where['show_all'] = 1;
        return app('json')->success($this->services->getList($where));
    }

    /**
     * 删除帖子
     */
    public function delete($id)
    {
        $this->services->deleteMoment((int) $id, 0, true);
        return app('json')->success([], '删除成功');
    }

    /**
     * 评论列表（含已删除）
     */
    public function comment_list()
    {
        $where = $this->request->getMore([
            ['moment_id', 0],
            ['page', 1],
            ['limit', 15],
        ]);
        $where['show_all'] = 1;
        return app('json')->success($this->services->getAdminCommentList($where));
    }

    /**
     * 删除评论
     */
    public function delete_comment($id)
    {
        $this->services->deleteComment((int) $id, 0, true);
        return app('json')->success([], '删除成功');
    }
}
