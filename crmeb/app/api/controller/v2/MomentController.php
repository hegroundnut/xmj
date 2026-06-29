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

use app\services\moment\MomentServices;

/**
 * 朋友圈前端控制器
 */
class MomentController
{
    protected $services;

    public function __construct(MomentServices $services)
    {
        $this->services = $services;
    }

    protected function uid()
    {
        return (int) request()->uid();
    }

    /**
     * 帖子列表
     */
    public function get_list()
    {
        $where = request()->getMore([
            ['page', 1],
            ['limit', 10],
        ]);
        return app('json')->success($this->services->getList($where, $this->uid()));
    }

    /**
     * 帖子详情
     */
    public function get_detail($id)
    {
        return app('json')->success($this->services->getDetail((int) $id, $this->uid()));
    }

    /**
     * 发布帖子
     */
    public function create()
    {
        $data = request()->getMore([
            ['content', ''],
            ['images', ''],
            ['video_url', ''],
        ]);
        if (empty($data['content']) && empty($data['images']) && empty($data['video_url'])) {
            return app('json')->fail('内容不能为空');
        }
        $this->services->create($this->uid(), $data);
        return app('json')->success('发布成功');
    }

    /**
     * 删除帖子
     */
    public function delete_moment($id)
    {
        $this->services->deleteMoment((int) $id, $this->uid());
        return app('json')->success('删除成功');
    }

    /**
     * 点赞/取消点赞
     */
    public function toggle_like($id)
    {
        $result = $this->services->toggleLike((int) $id, $this->uid());
        return app('json')->success(['action' => $result]);
    }

    /**
     * 收藏/取消收藏
     */
    public function toggle_favorite($id)
    {
        $result = $this->services->toggleFavorite((int) $id, $this->uid());
        return app('json')->success(['action' => $result]);
    }

    /**
     * 我的收藏
     */
    public function get_favorites()
    {
        return app('json')->success($this->services->getFavorites($this->uid()));
    }

    /**
     * 发表评论
     */
    public function create_comment()
    {
        $data = request()->getMore([
            ['moment_id', 0],
            ['content', ''],
            ['parent_id', 0],
            ['reply_uid', 0],
        ]);
        if (empty($data['content'])) {
            return app('json')->fail('评论内容不能为空');
        }
        $this->services->addComment($this->uid(), $data);
        return app('json')->success('评论成功');
    }

    /**
     * 删除评论
     */
    public function delete_comment($id)
    {
        $this->services->deleteComment((int) $id, $this->uid());
        return app('json')->success('删除成功');
    }

    /**
     * 分享
     */
    public function share($id)
    {
        $this->services->incrShare((int) $id, $this->uid());
        return app('json')->success();
    }
}
