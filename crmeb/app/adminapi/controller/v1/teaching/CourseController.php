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

use app\adminapi\controller\AuthController;
use app\services\teaching\CourseServices;
use app\services\other\CosVideoService;
use app\adminapi\validate\v1\teaching\CourseValidator;
use think\facade\App;

/**
 * 课程管理控制器
 */
class CourseController extends AuthController
{
    protected $services;

    public function __construct(App $app, CourseServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    public function index()
    {
        $where = $this->request->getMore([
            ['title', ''],
            ['status', ''],
            ['category_id', 0],
            ['page', 1],
            ['limit', 15],
        ]);
        $where['show_all'] = 1;
        return app('json')->success($this->services->getList($where, 0));
    }

    public function save(CourseValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['category_id', 0],
            ['cover', ''],
            ['desc', ''],
            ['type', 1],
            ['video_url', ''],
            ['images', ''],
            ['member_level', 1],
            ['sort', 0],
            ['status', 1],
        ]);
        if (is_array($data['images'])) {
            $data['images'] = json_encode($data['images'], JSON_UNESCAPED_UNICODE);
        }
        $data['price'] = 0;
        $data['is_free_for_member'] = 1;
        $data['add_time'] = time();
        $this->services->save($data);
        return app('json')->success('添加成功');
    }

    public function update($id, CourseValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['category_id', 0],
            ['cover', ''],
            ['desc', ''],
            ['type', 1],
            ['video_url', ''],
            ['images', ''],
            ['member_level', 1],
            ['sort', 0],
            ['status', 1],
        ]);
        if (is_array($data['images'])) {
            $data['images'] = json_encode($data['images'], JSON_UNESCAPED_UNICODE);
        }
        $data['price'] = 0;
        $data['is_free_for_member'] = 1;
        $this->services->update((int)$id, $data);
        return app('json')->success('修改成功');
    }

    public function delete($id)
    {
        $this->services->update((int)$id, ['status' => 0]);
        return app('json')->success('删除成功');
    }

    /**
     * 上传课程视频到腾讯云 COS，返回视频链接
     * 同时写入素材库，使其在"视频素材"界面可见
     * @return mixed
     */
    public function upload_video()
    {
        if (!CosVideoService::isEnabled()) {
            return app('json')->fail('COS 未配置，请联系管理员在服务器 .env 中填写腾讯云 COS 信息');
        }
        [$pid] = $this->request->postMore([
            ['pid', 0],
        ], true);
        try {
            $res = CosVideoService::upload('file');
        } catch (\Throwable $e) {
            return app('json')->fail($e->getMessage());
        }
        // 同步写入素材库，使 COS 视频出现在"视频素材"列表
        try {
            /** @var \app\services\system\attachment\SystemAttachmentServices $attachmentService */
            $attachmentService = app()->make(\app\services\system\attachment\SystemAttachmentServices::class);
            $attachmentService->attachmentAdd(
                basename($res['url']),
                0,
                'video/mp4',
                $res['url'],
                $res['url'],
                (int)$pid,
                (int)sys_config('upload_type', 1),
                time(),
                1,
                1,
                basename($res['url'])
            );
        } catch (\Throwable $e) {
            // 素材库写入失败不影响主流程
        }
        return app('json')->success('上传成功', ['url' => $res['url']]);
    }
}
