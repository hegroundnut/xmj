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
use app\services\system\attachment\SystemAttachmentServices;
use think\facade\App;

/**
 * 素材管理控制器
 * Class MaterialController
 * @package app\adminapi\controller\v1\teaching
 */
class MaterialController extends AuthController
{
    /**
     * @var SystemAttachmentServices
     */
    protected $service;

    /**
     * @param App $app
     * @param SystemAttachmentServices $service
     */
    public function __construct(App $app, SystemAttachmentServices $service)
    {
        parent::__construct($app);
        $this->service = $service;
    }

    /**
     * 图片素材列表
     * @return mixed
     */
    public function imageList()
    {
        $where = $this->request->getMore([
            ['pid', 0],
            ['real_name', ''],
        ]);
        $where['att_type'] = 'image/'; // 按MIME类型过滤图片
        return app('json')->success($this->service->getImageList($where));
    }

    /**
     * 上传图片
     * @return mixed
     */
    public function uploadImage()
    {
        [$pid, $file] = $this->request->postMore([
            ['pid', 0],
            ['file', 'file'],
        ], true);
        $res = $this->service->upload((int)$pid, $file, 0, 0, '');
        return app('json')->success('上传成功', ['src' => $res]);
    }

    /**
     * 删除图片
     * @return mixed
     */
    public function deleteImage()
    {
        [$ids] = $this->request->postMore([
            ['ids', []]
        ], true);
        // 兼容前端双重嵌套 {ids: {ids: [...]}} 的入参
        $ids = $this->normalizeIds($ids);
        if (empty($ids)) {
            return app('json')->fail('请选择要删除的图片');
        }
        $this->service->del(is_array($ids) ? implode(',', $ids) : $ids);
        return app('json')->success('删除成功');
    }

    /**
     * 重命名图片
     * @param $id
     * @return mixed
     */
    public function renameImage($id)
    {
        $realName = $this->request->put('real_name', '');
        if (!$realName) {
            return app('json')->fail('文件名称不能为空');
        }
        $this->service->update($id, ['real_name' => $realName]);
        return app('json')->success('修改成功');
    }

    /**
     * 移动图片分类
     * @return mixed
     */
    public function moveImage()
    {
        $data = $this->request->putMore([
            ['pid', 0],
            ['images', '']
        ]);
        $this->service->move($data);
        return app('json')->success('移动成功');
    }

    /**
     * 视频素材列表
     * @return mixed
     */
    public function videoList()
    {
        $where = $this->request->getMore([
            ['pid', 0],
            ['real_name', ''],
        ]);
        $where['att_type'] = 'video/'; // 按MIME类型过滤视频
        return app('json')->success($this->service->getImageList($where));
    }

    /**
     * 上传视频（分片上传）
     * @return mixed
     */
    public function uploadVideo()
    {
        $data = $this->request->postMore([
            ['chunkNumber', 0],
            ['currentChunkSize', 0],
            ['chunkSize', 0],
            ['totalChunks', 0],
            ['file', 'file'],
            ['md5', ''],
            ['filename', ''],
        ]);
        $res = $this->service->videoUpload($data, $_FILES['file']);
        return app('json')->success($res);
    }

    /**
     * 保存云存储视频数据
     * @return mixed
     */
    public function saveCloudVideo()
    {
        $data = $this->request->postMore([
            ['pid', 0],
            ['video_name', ''],
            ['video_path', '']
        ]);
        $this->service->attachmentAdd(
            $data['video_name'],
            0,
            'video/mp4',
            $data['video_path'],
            $data['video_path'],
            $data['pid'],
            (int)sys_config('upload_type', 1),
            time(),
            1,
            1,
            $data['video_name']
        );
        return app('json')->success('上传成功');
    }

    /**
     * 删除视频
     * @return mixed
     */
    public function deleteVideo()
    {
        [$ids] = $this->request->postMore([
            ['ids', []]
        ], true);
        // 兼容前端双重嵌套 {ids: {ids: [...]}} 的入参
        $ids = $this->normalizeIds($ids);
        if (empty($ids)) {
            return app('json')->fail('请选择要删除的视频');
        }
        $this->service->del(is_array($ids) ? implode(',', $ids) : $ids);
        return app('json')->success('删除成功');
    }

    /**
     * 重命名视频
     * @param $id
     * @return mixed
     */
    public function renameVideo($id)
    {
        $realName = $this->request->put('real_name', '');
        if (!$realName) {
            return app('json')->fail('文件名称不能为空');
        }
        $this->service->update($id, ['real_name' => $realName]);
        return app('json')->success('修改成功');
    }

    /**
     * 归一化 IDs 入参：兼容前端双重嵌套 {ids: {ids: [...]}} 与正常 {ids: [...]} 两种格式
     * @param mixed $ids
     * @return array
     */
    protected function normalizeIds($ids): array
    {
        // 已经是数字索引数组（正常格式）
        if (is_array($ids) && !empty($ids) && isset($ids[0])) {
            return $ids;
        }
        // 双重嵌套：{ids: {ids: [...]}}
        if (is_array($ids) && isset($ids['ids'])) {
            return $this->normalizeIds($ids['ids']);
        }
        // 关联数组形式 ['0' => 1, '1' => 2, ...]
        if (is_array($ids) && !empty($ids)) {
            return array_values($ids);
        }
        // 单个 ID 字符串
        if (is_string($ids) && $ids !== '') {
            return [$ids];
        }
        return [];
    }
}
