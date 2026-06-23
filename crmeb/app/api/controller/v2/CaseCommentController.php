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
namespace app\api\controller\v2;

use app\services\teaching\CaseCommentServices;
use think\facade\App;

/**
 * 案例评论控制器（前端API）
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
     * 获取案例评论列表
     * GET /api/v2/case_comment/list
     * @return mixed
     */
    public function get_list()
    {
        [$caseId] = request()->getMore([
            ['case_id', 0],
        ], true);
        if (!$caseId) return app('json')->fail('参数错误');
        return app('json')->success($this->services->getCommentList((int)$caseId));
    }

    /**
     * 发表评论/回复
     * POST /api/v2/case_comment/add
     * @return mixed
     */
    public function add()
    {
        $data = request()->getMore([
            ['case_id', 0],
            ['content', ''],
            ['pid', 0],
            ['reply_uid', 0],
            ['reply_nickname', ''],
        ]);
        $uid = request()->uid;
        $this->services->addComment($uid, $data);
        return app('json')->success('评论成功');
    }
}
