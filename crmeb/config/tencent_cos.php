<?php
// +----------------------------------------------------------------------
// | 腾讯云 COS 视频存储配置（仅用于教学课程视频上传/播放，不涉及 CDN）
// +----------------------------------------------------------------------
// | 在 crmeb/.env 中填写以下配置即可启用：
// |   [COS]
// |   SECRET_ID   = 腾讯云 API 密钥 SecretId
// |   SECRET_KEY  = 腾讯云 API 密钥 SecretKey
// |   APPID       = 存储桶 APPID（纯数字，如 1250000000）
// |   BUCKET      = 存储桶名称，格式：名称-APPID（如 xmj-video-1250000000）
// |   REGION      = 存储桶所在地域（如 ap-shanghai）
// |   DOMAIN      = 存储桶访问域名（如 https://xmj-video-1250000000.cos.ap-shanghai.myqcloud.com）
// +----------------------------------------------------------------------

return [
    // 密钥 SecretId
    'secret_id' => env('COS.SECRET_ID', ''),
    // 密钥 SecretKey
    'secret_key' => env('COS.SECRET_KEY', ''),
    // 存储桶 APPID
    'appid' => env('COS.APPID', ''),
    // 存储桶名称（名称-APPID）
    'bucket' => env('COS.BUCKET', ''),
    // 存储桶地域
    'region' => env('COS.REGION', 'ap-shanghai'),
    // 存储桶访问域名（不配置 CDN，直接使用 COS 默认域名）
    'domain' => env('COS.DOMAIN', ''),
    // 视频存放路径前缀
    'video_prefix' => 'teaching/video',
];
