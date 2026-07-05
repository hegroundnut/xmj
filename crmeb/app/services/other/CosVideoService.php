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

namespace app\services\other;

use crmeb\services\upload\storage\Cos;
use think\facade\Config;

/**
 * 腾讯云 COS 视频上传服务（仅 COS，不涉及 CDN）
 * 与"管理员添加视频链接"方式对齐：上传成功后返回可直接播放的视频 URL
 * Class CosVideoService
 * @package app\services\other
 */
class CosVideoService
{
    /**
     * 读取 COS 配置
     * @return array
     */
    public static function getConfig(): array
    {
        return Config::get('tencent_cos', []);
    }

    /**
     * COS 是否已配置完整
     * @return bool
     */
    public static function isEnabled(): bool
    {
        $c = self::getConfig();
        return !empty($c['secret_id']) && !empty($c['secret_key'])
            && !empty($c['appid']) && !empty($c['bucket'])
            && !empty($c['region']) && !empty($c['domain']);
    }

    /**
     * 构建 COS 存储实例
     * @return Cos
     */
    protected static function makeStorage(): Cos
    {
        $c = self::getConfig();
        $config = [
            'accessKey' => $c['secret_id'],
            'secretKey' => $c['secret_key'],
            'appid' => $c['appid'],
            'storageName' => $c['bucket'],
            'storageRegion' => $c['region'],
            'uploadUrl' => $c['domain'],
            'cdn' => '', // 不配置 CDN
        ];
        // configFile=upload 使 validate() 可读取允许的后缀/大小/类型
        return new Cos('cos', $config, 'upload');
    }

    /**
     * 上传视频文件到 COS
     * @param string $fileField 表单文件字段名
     * @return array{url:string} 成功返回视频 URL
     * @throws \Exception 上传失败抛出异常
     */
    public static function upload(string $fileField = 'file'): array
    {
        if (!self::isEnabled()) {
            throw new \Exception('COS 未配置，请先在服务器 .env 中填写腾讯云 COS 信息');
        }
        $c = self::getConfig();
        $storage = self::makeStorage();
        $info = $storage->to($c['video_prefix'] ?? 'teaching/video')->validate()->move($fileField);
        if ($info === false) {
            throw new \Exception($storage->getError() ?: 'COS 视频上传失败');
        }
        return ['url' => $info->filePath];
    }
}
