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

use app\Request;
use app\services\other\UploadService;
use app\services\system\attachment\SystemAttachmentServices;
use crmeb\services\CacheService;

/**
 * 小程序上传控制器（图片由服务器本地存储，上传后自动压缩）
 */
class UploadController
{
    /**
     * 图片上传（朋友圈、头像等）
     * 图片统一存本地，Local 存储驱动会自动压缩
     * @param Request $request
     * @param SystemAttachmentServices $services
     * @return mixed
     */
    public function image(Request $request, SystemAttachmentServices $services)
    {
        $data = $request->postMore([
            ['filename', 'file'],
        ]);
        if (!$data['filename']) {
            return app('json')->fail('参数错误');
        }
        // 防刷：单用户单日上传上限
        $cacheKey = 'v2_uploads_' . $request->uid();
        if (CacheService::has($cacheKey) && CacheService::get($cacheKey) >= 200) {
            return app('json')->fail('上传过于频繁，请稍后再试');
        }
        // 图片强制走本地存储（图像由服务器自身解决）
        $upload = UploadService::init(1);
        $info = $upload->to('store/comment')->validate()->move($data['filename']);
        if ($info === false) {
            return app('json')->fail($upload->getError());
        }
        $res = $upload->getUploadInfo();
        $services->attachmentAdd($res['name'], $res['size'], $res['type'], $res['dir'], $res['thumb_path'], 1, 1, $res['time'], 3);
        $count = CacheService::has($cacheKey) ? (int)CacheService::get($cacheKey) : 0;
        CacheService::set($cacheKey, $count + 1, 86400);
        $url = path_to_url($res['dir']);
        if (strpos($url, 'http') === false) {
            $url = $request->domain() . $url;
        }
        return app('json')->success('上传成功', ['name' => $res['name'], 'url' => $url]);
    }
}
