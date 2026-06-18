-- 隐藏 CRMEB 商城原有菜单，仅保留洗眉机所需
-- is_show=0 表示隐藏，不删除

-- 1. 隐藏商城业务菜单（顶层）
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 1 AND `pid` = 0;   -- 商品
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 4 AND `pid` = 0;   -- 订单
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 7 AND `pid` = 0;   -- 主页（不需要DIY首页）
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 26 AND `pid` = 0;  -- 分销
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 27 AND `pid` = 0;  -- 营销
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 35 AND `pid` = 0;  -- 财务
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 43 AND `pid` = 0;  -- 内容
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 165 AND `pid` = 0; -- 客服
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 656 AND `pid` = 0; -- 装修

-- 2. 隐藏子菜单（跟着父菜单隐藏）
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `pid` = 1;    -- 商品子项
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `pid` = 4;    -- 订单子项
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `pid` = 7;    -- 主页子项
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `pid` = 26;   -- 分销子项
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `pid` = 27;   -- 营销子项
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `pid` = 35;   -- 财务子项
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `pid` = 43;   -- 内容子项
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `pid` = 165;  -- 客服子项
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `pid` = 656;  -- 装修子项

-- 3. 隐藏应用模块中的 PC/APP/公众号，保留小程序
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 1008;  -- PC端
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 1009;  -- APP
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 69;    -- 公众号

-- 4. 隐藏开发工具中的部分不需要的项
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 1695;  -- 开发工具
UPDATE `eb_system_menus` SET `is_show` = 0 WHERE `id` = 1064;  -- 对外接口

-- 5. 添加洗眉机教学菜单
-- 先删旧的（防止重复执行报错）
DELETE FROM `eb_system_menus` WHERE `id` >= 4000 AND `id` <= 4006;
-- 顶级菜单
INSERT INTO `eb_system_menus` (`id`, `pid`, `menu_name`, `module`, `controller`, `action`, `api_url`, `methods`, `params`, `sort`, `is_show`, `is_show_path`, `access`, `menu_path`, `path`, `auth_type`, `header`, `is_header`, `unique_auth`, `is_del`, `mark`) VALUES
(4000, 0, '洗眉机', 'admin', 'teaching', 'index', '', 'GET', '[]', 8, 1, 0, 1, '/teaching', '/teaching', 0, 'teaching', 0, '', 0, ''),
(4001, 4000, '产品管理', 'admin', 'teaching.product_info', 'index', '', 'GET', '[]', 1, 1, 0, 1, '/teaching/product_info', '/teaching/product_info', 0, '', 0, 'admin-teaching-product-info', 0, ''),
(4002, 4000, '案例管理', 'admin', 'teaching.case_list', 'index', '', 'GET', '[]', 2, 1, 0, 1, '/teaching/case_list', '/teaching/case_list', 0, '', 0, 'admin-teaching-case-list', 0, ''),
(4003, 4000, '课程管理', 'admin', 'teaching.course_list', 'index', '', 'GET', '[]', 3, 1, 0, 1, '/teaching/course_list', '/teaching/course_list', 0, '', 0, 'admin-teaching-course-list', 0, ''),
(4004, 4000, '线下排期', 'admin', 'teaching.offline_class', 'index', '', 'GET', '[]', 4, 1, 0, 1, '/teaching/offline_class', '/teaching/offline_class', 0, '', 0, 'admin-teaching-offline-class', 0, ''),
(4005, 4000, '预约记录', 'admin', 'teaching.booking_list', 'index', '', 'GET', '[]', 5, 1, 0, 1, '/teaching/booking_list', '/teaching/booking_list', 0, '', 0, 'admin-teaching-booking-list', 0, '');

-- 结果：后台侧边栏显示 设置 / 应用(小程序) / 用户 / 维护 / 洗眉机(5子项)
