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

namespace app\adminapi\middleware;


use app\Request;
use app\services\system\admin\AdminAuthServices;
use crmeb\interfaces\MiddlewareInterface;
use think\facade\Config;
use crmeb\services\CacheService;

/**
 * 后台登陆验证中间件
 * Class AdminAuthTokenMiddleware
 * @package app\adminapi\middleware
 */
class AdminAuthTokenMiddleware implements MiddlewareInterface
{
    /**
     * @param Request $request
     * @param \Closure $next
     * @return mixed
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @author 吴汐
     * @email 442384644@qq.com
     * @date 2023/04/07
     */
    public function handle(Request $request, \Closure $next)
    {
        $raw = trim($request->header(Config::get('cookie.token_name', 'Authori-zation')));
        // 安全剥离 Bearer 前缀（不用 ltrim 字符集方式，避免 JWT 头部的 e 被误删）
        $token = preg_replace('#^Bearer\s+#i', '', $raw);
        if (!$token) {
            $token = trim((string)$request->get('token'));
        }
        // 兜底：部分代理在 multipart 文件上传时丢弃自定义 Header，
        // 允许通过 POST body 或 query 参数 token 传递
        if (!$token) {
            $raw = trim((string)$request->param('token'));
            $token = preg_replace('#^Bearer\s+#i', '', $raw);
        }
        /** @var AdminAuthServices $service */
        $service = app()->make(AdminAuthServices::class);
        $adminInfo = $service->parseToken($token);
        $request->macro('isAdminLogin', function () use (&$adminInfo) {
            return !is_null($adminInfo);
        });
        $request->macro('adminId', function () use (&$adminInfo) {
            return $adminInfo['id'];
        });

        $request->macro('adminInfo', function () use (&$adminInfo) {
            return $adminInfo;
        });

        return $next($request);
    }
}
