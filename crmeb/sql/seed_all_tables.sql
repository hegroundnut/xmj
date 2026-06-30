-- ============================================================
-- CRMEB 洗眉机小程序 - 全表示例数据 (Docker 实际版本)
-- 执行: docker exec -i crmeb_mysql mysql -u crmeb -p123456 crmeb
-- 使用 INSERT IGNORE 避免重复执行报错
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+08:00';

-- ============================================================
-- 第一部分：洗眉机教学模块
-- ============================================================

-- 产品信息
INSERT IGNORE INTO `eb_product_info` (`id`, `banner`, `title`, `desc`, `detail`, `specs`, `video_url`, `status`, `category_id`, `is_home`, `add_time`, `update_time`) VALUES
(1, '["/statics/teaching/banner1.png","/statics/teaching/banner2.png"]', '智能洗眉机 XM-2000', '专业洗眉设备，安全高效', '<p>XM-2000智能洗眉机采用最新激光技术，精准去除纹眉。</p>', '[{"name":"型号","value":"XM-2000"},{"name":"功率","value":"500W"}]', '', 1, 21, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(2, '["/statics/teaching/banner3.png"]', '便携洗眉笔 XM-Mini', '随身携带，随时随地轻松洗眉', '<p>便携式洗眉笔，适合外出使用。</p>', '[{"name":"型号","value":"XM-Mini"},{"name":"重量","value":"0.5kg"}]', '', 1, 24, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 案例
INSERT IGNORE INTO `eb_case` (`id`, `title`, `type`, `category_id`, `cover`, `media_url`, `sort`, `status`, `add_time`) VALUES
(1, '纹眉淡化前后对比 - 案例一', 1, 1, '/statics/teaching/case1.png', '/statics/teaching/case1.png', 1, 1, UNIX_TIMESTAMP()),
(2, '老式纹眉清洗效果', 1, 1, '/statics/teaching/case2.png', '/statics/teaching/case2.png', 2, 1, UNIX_TIMESTAMP()),
(3, '红色纹眉去除案例', 1, 2, '/statics/teaching/case3.png', '/statics/teaching/case3.png', 3, 1, UNIX_TIMESTAMP()),
(4, '洗眉过程全记录', 2, 1, '/statics/teaching/case4.png', '/statics/teaching/case_video1.mp4', 4, 1, UNIX_TIMESTAMP()),
(5, '眉毛修复后效果', 1, 3, '/statics/teaching/case5.png', '/statics/teaching/case5.png', 5, 1, UNIX_TIMESTAMP()),
(6, '蓝眉清洗案例对比', 1, 2, '/statics/teaching/case6.png', '/statics/teaching/case6.png', 6, 1, UNIX_TIMESTAMP());

-- 教学课程
INSERT IGNORE INTO `eb_course` (`id`, `title`, `category_id`, `cover`, `desc`, `video_url`, `price`, `is_free_for_member`, `sort`, `status`, `add_time`) VALUES
(1, '洗眉机基础操作教程', 13, '/statics/teaching/c1.png', '从零开始学习洗眉机操作流程', '/statics/teaching/v1.mp4', 9.90, 1, 1, 1, UNIX_TIMESTAMP()),
(2, '色素识别与参数调整', 12, '/statics/teaching/c2.png', '不同色素类型的识别与参数调整技巧', '/statics/teaching/v2.mp4', 19.90, 1, 2, 1, UNIX_TIMESTAMP()),
(3, '洗眉后护理与修复', 14, '/statics/teaching/c3.png', '洗眉后皮肤护理与并发症预防', '/statics/teaching/v3.mp4', 9.90, 1, 3, 1, UNIX_TIMESTAMP()),
(4, '高级洗眉技术进阶', 12, '/statics/teaching/c4.png', '复杂纹眉、多层纹眉处理方案', '/statics/teaching/v4.mp4', 29.90, 0, 4, 1, UNIX_TIMESTAMP()),
(5, '洗眉店经营管理', 15, '/statics/teaching/c5.png', '选址、定价、客户获取等经营知识', '/statics/teaching/v5.mp4', 39.90, 0, 5, 1, UNIX_TIMESTAMP()),
(6, '激光安全操作规范', 14, '/statics/teaching/c6.png', '激光设备安全操作标准与法规要求', '/statics/teaching/v6.mp4', 0.00, 1, 6, 1, UNIX_TIMESTAMP());

-- 课程订单
INSERT IGNORE INTO `eb_course_order` (`id`, `uid`, `course_id`, `order_sn`, `price`, `pay_type`, `pay_time`, `paid`, `add_time`) VALUES
(1, 2, 4, 'CO20250101001', 29.90, 'wechat', UNIX_TIMESTAMP(), 1, UNIX_TIMESTAMP()),
(2, 2, 5, 'CO20250101002', 39.90, 'wechat', UNIX_TIMESTAMP(), 1, UNIX_TIMESTAMP()),
(3, 3, 4, 'CO20250101003', 29.90, 'wechat', UNIX_TIMESTAMP() - 86400, 1, UNIX_TIMESTAMP() - 86400);

-- 线下课程排期
INSERT IGNORE INTO `eb_offline_class` (`id`, `title`, `cover`, `class_date`, `start_time`, `end_time`, `address`, `max_people`, `qrcode`, `desc`, `status`, `add_time`) VALUES
(1, '洗眉技术实操培训班（初级）', '/statics/teaching/off1.png', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '09:00:00', '17:00:00', '广州市天河区体育西路123号创展中心8楼', 30, '/statics/teaching/qr_kf.png', '<p>初级培训班，含基础操作+真人实操</p>', 1, UNIX_TIMESTAMP()),
(2, '洗眉技术实操培训班（中级）', '/statics/teaching/off2.png', DATE_ADD(CURDATE(), INTERVAL 14 DAY), '09:00:00', '18:00:00', '广州市天河区体育西路123号创展中心8楼', 20, '/statics/teaching/qr_kf.png', '<p>中级培训班，复杂色素处理+疑难案例</p>', 1, UNIX_TIMESTAMP()),
(3, '线上直播公开课 - 洗眉创业指南', '/statics/teaching/off3.png', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', '16:00:00', '线上直播（报名后获取链接）', 0, '/statics/teaching/qr_kf.png', '<p>免费公开课</p>', 1, UNIX_TIMESTAMP());

-- 线下预约
INSERT IGNORE INTO `eb_offline_booking` (`id`, `uid`, `class_id`, `name`, `phone`, `status`, `add_time`) VALUES
(1, 2, 1, '李明明', '13800138001', 0, UNIX_TIMESTAMP()),
(2, 3, 1, '王小红', '13900139002', 0, UNIX_TIMESTAMP()),
(3, 2, 3, '李明明', '13800138001', 0, UNIX_TIMESTAMP());

-- 案例评论
INSERT IGNORE INTO `eb_case_comment` (`id`, `case_id`, `uid`, `nickname`, `avatar`, `content`, `pid`, `reply_uid`, `reply_nickname`, `status`, `add_time`) VALUES
(1, 1, 2, '李明明', '/statics/avatar/d.png', '效果太好了！洗完完全看不出来', 0, 0, '', 1, UNIX_TIMESTAMP()),
(2, 1, 3, '王小红', '/statics/avatar/d.png', '请问洗了几次达到的效果？', 1, 2, '李明明', 1, UNIX_TIMESTAMP()),
(3, 1, 2, '李明明', '/statics/avatar/d.png', '一共洗了3次，每次间隔一个月', 1, 3, '王小红', 1, UNIX_TIMESTAMP()),
(4, 2, 4, '张大山', '/statics/avatar/d.png', '老式纹眉真的能洗掉，太神奇了！', 0, 0, '', 1, UNIX_TIMESTAMP());

-- 首页配置
INSERT IGNORE INTO `eb_teaching_home_config` (`id`, `name`, `value`, `add_time`, `update_time`) VALUES
(1, 'banner', '[{"image":"/statics/teaching/hb1.png","link":""}]', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(2, 'notice', '欢迎使用洗眉机教学平台！新用户注册即送教学会员体验。', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(3, 'hot_courses', '[1,2,3]', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(4, 'contact_phone', '400-888-8888', UNIX_TIMESTAMP(), UNIX_TIMESTAMP());


-- ============================================================
-- 第二部分：用户数据
-- ============================================================

INSERT IGNORE INTO `eb_user` (`uid`, `nickname`, `avatar`, `phone`, `account`, `pwd`, `real_name`, `addres`, `mark`, `status`, `level`, `integral`, `now_money`, `user_type`, `is_promoter`, `add_time`, `last_time`, `last_ip`, `is_teaching_member`) VALUES
(2, '李明明', '/statics/avatar/d.png', '13800138001', '13800138001', '$2y$10$placeholder', '李明明', '广东省广州市天河区', '', 1, 0, 200, 0.00, 'wechat', 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), '127.0.0.1', 1),
(3, '王小红', '/statics/avatar/d.png', '13900139002', '13900139002', '$2y$10$placeholder', '王小红', '广东省深圳市南山区', '', 1, 0, 500, 0.00, 'wechat', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), '127.0.0.1', 1),
(4, '张大山', '/statics/avatar/d.png', '13700137003', '13700137003', '$2y$10$placeholder', '张大山', '广东省广州市越秀区', '', 1, 0, 100, 0.00, 'wechat', 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), '127.0.0.1', 0),
(5, '陈晓花', '/statics/avatar/d.png', '13600136004', '13600136004', '$2y$10$placeholder', '陈晓花', '广东省佛山市顺德区', '', 1, 0, 50, 0.00, 'wechat', 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), '127.0.0.1', 1),
(6, '赵小明', '/statics/avatar/d.png', '13500135005', '13500135005', '$2y$10$placeholder', '赵小明', '广东省东莞市', '', 1, 0, 300, 0.00, 'wechat', 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), '127.0.0.1', 0),
(7, '刘美丽', '/statics/avatar/d.png', '13400134006', '13400134006', '$2y$10$placeholder', '刘美丽', '广东省珠海市香洲区', '', 1, 0, 800, 0.00, 'wechat', 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), '127.0.0.1', 1);

-- 用户地址
INSERT IGNORE INTO `eb_user_address` (`id`, `uid`, `real_name`, `phone`, `province`, `city`, `city_id`, `district`, `detail`, `is_default`, `add_time`) VALUES
(1, 2, '李明明', '13800138001', '广东省', '广州市', 440100, '天河区', '体育西路123号创展中心8楼', 1, UNIX_TIMESTAMP()),
(2, 3, '王小红', '13900139002', '广东省', '深圳市', 440300, '南山区', '科技园路88号B栋1201', 1, UNIX_TIMESTAMP()),
(3, 4, '张大山', '13700137003', '广东省', '广州市', 440100, '越秀区', '中山五路66号大院3栋402', 1, UNIX_TIMESTAMP()),
(4, 5, '陈晓花', '13600136004', '广东省', '佛山市', 440600, '顺德区', '大良街道东乐路9号', 1, UNIX_TIMESTAMP());

-- 用户账单
INSERT IGNORE INTO `eb_user_bill` (`id`, `uid`, `link_id`, `pm`, `title`, `category`, `type`, `number`, `balance`, `mark`, `add_time`, `status`) VALUES
(1, 2, '1', 1, '注册赠送积分', 'integral', 'sign', 100.00, 100.00, '新用户注册', UNIX_TIMESTAMP(), 1),
(2, 2, '2', 1, '签到获得积分', 'integral', 'sign', 10.00, 110.00, '每日签到', UNIX_TIMESTAMP() - 86400, 1),
(3, 3, '3', 1, '购买商品获得积分', 'integral', 'gain', 500.00, 500.00, '购物返积分', UNIX_TIMESTAMP() - 172800, 1);

-- 用户标签
INSERT IGNORE INTO `eb_user_label` (`id`, `label_cate`, `label_name`) VALUES
(1, 0, '新用户'),
(2, 0, '活跃用户'),
(3, 0, '高价值用户'),
(4, 0, '教学会员');

-- 用户标签关联
INSERT IGNORE INTO `eb_user_label_relation` (`uid`, `label_id`) VALUES
(2, 1), (2, 4), (3, 2), (3, 4), (4, 1), (5, 4), (7, 4);

-- 用户分组
INSERT IGNORE INTO `eb_user_group` (`id`, `group_name`) VALUES
(1, '默认分组'), (2, 'VIP客户'), (3, '教学会员组'), (4, '经销商');

-- 用户推广
INSERT IGNORE INTO `eb_user_spread` (`id`, `uid`, `spread_uid`, `spread_time`) VALUES
(1, 3, 2, UNIX_TIMESTAMP()),
(2, 5, 3, UNIX_TIMESTAMP());

-- 用户登录
INSERT IGNORE INTO `eb_user_enter` (`id`, `uid`, `province`, `city`, `district`, `address`, `add_time`, `status`) VALUES
(1, 2, '广东省', '广州市', '天河区', '', UNIX_TIMESTAMP(), 1),
(2, 3, '广东省', '深圳市', '南山区', '', UNIX_TIMESTAMP(), 1),
(3, 4, '广东省', '广州市', '越秀区', '', UNIX_TIMESTAMP(), 1);

-- 微信用户
INSERT IGNORE INTO `eb_wechat_user` (`id`, `uid`, `openid`, `nickname`, `headimgurl`, `subscribe`, `subscribe_time`, `add_time`, `user_type`) VALUES
(1, 2, 'o_example_openid_001', '李明明', '/statics/avatar/d.png', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 'routine'),
(2, 3, 'o_example_openid_002', '王小红', '/statics/avatar/d.png', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 'routine'),
(3, 4, 'o_example_openid_003', '张大山', '/statics/avatar/d.png', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 'routine');


-- ============================================================
-- 第三部分：商品数据
-- ============================================================

-- 商品(洗眉机相关) - 已有4条商城默认商品，补充洗眉相关
INSERT IGNORE INTO `eb_store_product` (`id`, `image`, `slider_image`, `store_name`, `store_info`, `keyword`, `cate_id`, `price`, `vip_price`, `ot_price`, `unit_name`, `sort`, `sales`, `stock`, `is_show`, `is_hot`, `is_best`, `is_new`, `give_integral`, `cost`, `add_time`, `temp_id`, `spec_type`, `is_vip`, `is_postage`, `freight`, `logistics`) VALUES
(5, '/statics/product/ximj2000.png', '["/statics/product/ximj2000_1.png"]', 'XM-2000 智能洗眉机', '进口激光器，智能识别色素，安全高效洗眉', '洗眉机,激光洗眉', '24,23', 12800.00, 11800.00, 15800.00, '台', 100, 58, 200, 1, 1, 1, 1, 500, 8800.00, UNIX_TIMESTAMP(), 1, 0, 1, 0, 0, '1,2'),
(6, '/statics/product/ximjmini.png', '["/statics/product/ximjmini_1.png"]', 'XM-Mini 便携洗眉笔', '充电式设计，小巧便携，精准操作', '洗眉笔,便携', '24', 2980.00, 2680.00, 3980.00, '支', 90, 126, 500, 1, 1, 0, 1, 100, 1800.00, UNIX_TIMESTAMP(), 1, 0, 1, 0, 0, '1,2'),
(7, '/statics/product/repair.png', '[]', '洗眉专用修复精华液', '洗眉后修复护理专用，加速皮肤愈合', '修复液,洗眉护理', '23,24', 198.00, 168.00, 258.00, '瓶', 80, 520, 999, 1, 0, 0, 0, 20, 88.00, UNIX_TIMESTAMP(), 1, 0, 1, 0, 0, '1,2');

-- 商品属性
INSERT IGNORE INTO `eb_store_product_attr` (`id`, `product_id`, `attr_name`, `attr_values`, `type`) VALUES
(25, 5, '颜色', '珍珠白,星空黑', 0),
(26, 5, '配置', '标准版,豪华版(含推车)', 0),
(27, 6, '颜色', '白色,粉色,黑色', 0);

-- 商品属性值
INSERT IGNORE INTO `eb_store_product_attr_value` (`id`, `product_id`, `suk`, `stock`, `price`, `image`, `unique`, `cost`, `bar_code`, `weight`, `volume`, `type`) VALUES
(101, 5, '珍珠白,标准版', 100, 12800.00, '/statics/product/ximj_w.png', 'sk001', 8800.00, '6901234567890', 15.00, 0.08, 0),
(102, 5, '珍珠白,豪华版(含推车)', 50, 15800.00, '/statics/product/ximj_wp.png', 'sk002', 10800.00, '6901234567891', 18.00, 0.10, 0),
(103, 5, '星空黑,标准版', 50, 12800.00, '/statics/product/ximj_b.png', 'sk003', 8800.00, '6901234567892', 15.00, 0.08, 0),
(105, 6, '白色', 200, 2980.00, '/statics/product/mini_w.png', 'sk005', 1800.00, '6901234567894', 0.50, 0.002, 0),
(106, 6, '粉色', 150, 2980.00, '/statics/product/mini_p.png', 'sk006', 1800.00, '6901234567895', 0.50, 0.002, 0),
(107, 6, '黑色', 150, 2980.00, '/statics/product/mini_b.png', 'sk007', 1800.00, '6901234567896', 0.50, 0.002, 0);

-- 商品评价
INSERT IGNORE INTO `eb_store_product_reply` (`id`, `uid`, `oid`, `product_id`, `product_score`, `service_score`, `comment`, `pics`, `add_time`, `nickname`, `avatar`, `suk`, `status`) VALUES
(1, 2, 1, 5, 5, 5, '机器很好用，激光能量稳定，客户反馈洗眉效果很好！', '[]', UNIX_TIMESTAMP(), '李明明', '/statics/avatar/d.png', '珍珠白,标准版', 1),
(2, 3, 2, 5, 4, 5, '整体效果不错，推荐购买！', '[]', UNIX_TIMESTAMP(), '王小红', '/statics/avatar/d.png', '珍珠白,豪华版(含推车)', 1),
(3, 4, 3, 6, 5, 5, '便携款很方便，出差也能带上，效果不输大机器。', '[]', UNIX_TIMESTAMP(), '张大山', '/statics/avatar/d.png', '白色', 1);

-- 商品描述
INSERT IGNORE INTO `eb_store_product_description` (`product_id`, `description`, `type`) VALUES
(5, '<h2>XM-2000 智能洗眉机</h2><p>2025年全新旗舰产品，进口激光器，智能色素识别。</p><ul><li>进口Q开关激光器</li><li>触摸屏操作界面</li><li>双冷却系统</li><li>多种治疗头可选</li></ul>', 0),
(6, '<h2>XM-Mini 便携洗眉笔</h2><p>轻巧便携，充电式设计，续航4小时。</p>', 0),
(7, '<h2>洗眉专用修复精华液</h2><p>含EGF表皮生长因子，加速皮肤屏障修复。</p>', 0);

-- 商品收藏
INSERT IGNORE INTO `eb_store_product_relation` (`uid`, `product_id`, `type`, `category`) VALUES
(2, 5, 'collect', 'product'),
(2, 6, 'collect', 'product'),
(3, 5, 'collect', 'product');


-- ============================================================
-- 第四部分：订单数据
-- ============================================================

-- 购物车
INSERT IGNORE INTO `eb_store_cart` (`id`, `uid`, `type`, `product_id`, `product_attr_unique`, `cart_num`, `add_time`) VALUES
(1, 2, 'product', 7, 'sk008', 2, UNIX_TIMESTAMP()),
(2, 3, 'product', 8, '', 1, UNIX_TIMESTAMP());

-- 订单
INSERT IGNORE INTO `eb_store_order` (`id`, `order_id`, `uid`, `real_name`, `user_phone`, `user_address`, `cart_id`, `total_num`, `total_price`, `pay_price`, `paid`, `pay_time`, `pay_type`, `add_time`, `status`, `shipping_type`) VALUES
(1, 'XM202501010001', 2, '李明明', '13800138001', '广州市天河区体育西路123号', '1', 1, 12800.00, 11800.00, 1, UNIX_TIMESTAMP(), 'wechat', UNIX_TIMESTAMP() - 172800, 1, 1),
(2, 'XM202501010002', 3, '王小红', '13900139002', '深圳市南山区科技园路88号', '1', 1, 12800.00, 12800.00, 1, UNIX_TIMESTAMP() - 86400, 'wechat', UNIX_TIMESTAMP() - 172800, 0, 1),
(3, 'XM202501010003', 4, '张大山', '13700137003', '广州市越秀区中山五路66号', '1', 1, 2980.00, 2680.00, 1, UNIX_TIMESTAMP() - 86400, 'wechat', UNIX_TIMESTAMP() - 172800, 2, 1),
(4, 'XM202501010004', 2, '李明明', '13800138001', '广州市天河区体育西路123号', '2', 2, 396.00, 336.00, 1, UNIX_TIMESTAMP(), 'wechat', UNIX_TIMESTAMP() - 86400, 0, 1);

-- 订单购物车详情
INSERT IGNORE INTO `eb_store_order_cart_info` (`id`, `oid`, `uid`, `cart_id`, `product_id`, `cart_num`, `cart_info`, `unique`) VALUES
(1, 1, 2, '101', 5, 1, '{"productInfo":{"store_name":"XM-2000 智能洗眉机","price":"11800.00"}}', ''),
(2, 2, 3, '102', 5, 1, '{"productInfo":{"store_name":"XM-2000 智能洗眉机","price":"12800.00"}}', ''),
(3, 3, 4, '105', 6, 1, '{"productInfo":{"store_name":"XM-Mini 便携洗眉笔","price":"2680.00"}}', ''),
(4, 4, 2, '108', 7, 2, '{"productInfo":{"store_name":"洗眉修复精华液","price":"168.00"}}', '');

-- 订单状态
INSERT IGNORE INTO `eb_store_order_status` (`oid`, `change_type`, `change_message`, `change_time`) VALUES
(1, 'create', '订单创建', UNIX_TIMESTAMP() - 172800),
(1, 'pay_success', '支付成功', UNIX_TIMESTAMP() - 172800),
(1, 'delivery', '已发货', UNIX_TIMESTAMP() - 86400),
(2, 'create', '订单创建', UNIX_TIMESTAMP() - 172800),
(2, 'pay_success', '支付成功', UNIX_TIMESTAMP() - 86400),
(3, 'create', '订单创建', UNIX_TIMESTAMP() - 172800),
(3, 'pay_success', '支付成功', UNIX_TIMESTAMP() - 86400),
(3, 'take', '已收货', UNIX_TIMESTAMP()),
(4, 'create', '订单创建', UNIX_TIMESTAMP() - 86400),
(4, 'pay_success', '支付成功', UNIX_TIMESTAMP());


-- ============================================================
-- 第五部分：营销与活动
-- ============================================================

-- 优惠券
INSERT IGNORE INTO `eb_store_coupon_issue` (`id`, `cid`, `coupon_title`, `start_time`, `end_time`, `total_count`, `remain_count`, `is_permanent`, `status`, `is_del`, `add_time`, `coupon_price`, `use_min_price`, `type`) VALUES
(1, 1, '新人专享券 - 满500减50', UNIX_TIMESTAMP(), UNIX_TIMESTAMP() + 2592000, 1000, 980, 0, 1, 0, UNIX_TIMESTAMP(), 50.00, 500.00, 0),
(2, 2, '洗眉机专属券 - 满5000减500', UNIX_TIMESTAMP(), UNIX_TIMESTAMP() + 2592000, 500, 490, 0, 1, 0, UNIX_TIMESTAMP(), 500.00, 5000.00, 0),
(3, 3, '会员专享券 - 满200减20', UNIX_TIMESTAMP(), UNIX_TIMESTAMP() + 2592000, 2000, 1950, 0, 1, 0, UNIX_TIMESTAMP(), 20.00, 200.00, 0);

-- 秒杀
INSERT IGNORE INTO `eb_store_seckill` (`id`, `product_id`, `image`, `images`, `title`, `price`, `cost`, `ot_price`, `stock`, `sales`, `start_time`, `stop_time`, `status`, `add_time`) VALUES
(1, 6, '/statics/product/ximjmini.png', '[]', 'XM-Mini 便携洗眉笔 限时秒杀', 1999.00, 1800.00, 3980.00, 50, 23, UNIX_TIMESTAMP(), UNIX_TIMESTAMP() + 86400, 1, UNIX_TIMESTAMP());

-- 砍价
INSERT IGNORE INTO `eb_store_bargain` (`id`, `product_id`, `image`, `title`, `price`, `min_price`, `bargain_num`, `stock`, `start_time`, `stop_time`, `status`, `add_time`) VALUES
(1, 6, '/statics/product/ximjmini.png', 'XM-Mini 便携洗眉笔 砍价活动', 2980.00, 1999.00, 10, 30, UNIX_TIMESTAMP(), UNIX_TIMESTAMP() + 604800, 1, UNIX_TIMESTAMP());

-- 拼团
INSERT IGNORE INTO `eb_store_combination` (`id`, `product_id`, `image`, `title`, `price`, `people`, `stock`, `start_time`, `stop_time`, `is_show`, `add_time`) VALUES
(1, 7, '/statics/product/repair.png', '洗眉修复精华液 三人团', 158.00, 3, 100, UNIX_TIMESTAMP(), UNIX_TIMESTAMP() + 604800, 1, UNIX_TIMESTAMP());

-- 积分商城
INSERT IGNORE INTO `eb_store_integral` (`id`, `product_id`, `image`, `title`, `price`, `stock`, `is_show`, `add_time`) VALUES
(1, 8, '/statics/product/goggles.png', '激光防护眼镜 积分兑换', 0, 50, 1, UNIX_TIMESTAMP());

-- 会员卡
INSERT IGNORE INTO `eb_member_ship` (`id`, `type`, `title`, `vip_day`, `price`, `pre_price`, `sort`, `add_time`) VALUES
(1, 'month', '月度教学会员', 30, 99.00, 79.00, 1, UNIX_TIMESTAMP()),
(2, 'quarter', '季度教学会员', 90, 199.00, 149.00, 2, UNIX_TIMESTAMP()),
(3, 'year', '年度教学会员', 365, 599.00, 399.00, 3, UNIX_TIMESTAMP());

-- 会员权益
INSERT IGNORE INTO `eb_member_right` (`id`, `right_type`, `title`, `show_title`, `image`, `explain`, `number`, `sort`, `status`, `add_time`) VALUES
(1, 'course', '全部课程免费学', '免费课程', '/statics/icon/free.png', '所有线上课程免费观看', 1, 1, 1, UNIX_TIMESTAMP()),
(2, 'discount', '产品折扣', '会员折扣', '/statics/icon/discount.png', '购买产品享受会员价', 2, 2, 1, UNIX_TIMESTAMP()),
(3, 'priority', '优先预约线下课', '优先预约', '/statics/icon/priority.png', '线下课程优先预约权', 3, 3, 1, UNIX_TIMESTAMP()),
(4, 'service', '专属客服', '专属客服', '/statics/icon/svip.png', '一对一专属客服服务', 4, 4, 1, UNIX_TIMESTAMP());

-- 系统通知
INSERT IGNORE INTO `eb_system_notice` (`id`, `title`, `type`, `icon`, `url`, `table_title`, `template`, `push_admin`, `status`) VALUES
(1, '课程购买成功通知', 'course_order', '', '', '', '', '', 1),
(2, '订单发货通知', 'order_delivery', '', '', '', '', '', 1),
(3, '预约确认通知', 'booking_confirm', '', '', '', '', '', 1);

-- 签到奖励
INSERT IGNORE INTO `eb_system_sign_reward` (`id`, `type`, `days`, `point`, `exp`) VALUES
(1, 0, 1, 5, 0),
(2, 0, 2, 6, 0),
(3, 0, 3, 7, 0),
(4, 0, 4, 8, 0),
(5, 0, 5, 9, 0),
(6, 0, 6, 10, 0),
(7, 0, 7, 15, 0);


-- ============================================================
-- 第六部分：文章内容
-- ============================================================

INSERT IGNORE INTO `eb_article_category` (`id`, `pid`, `title`, `intr`, `status`, `sort`, `add_time`) VALUES
(1, 0, '行业资讯', '洗眉行业最新动态', 1, 1, UNIX_TIMESTAMP()),
(2, 0, '技术教程', '洗眉技术分享', 1, 2, UNIX_TIMESTAMP()),
(3, 0, '客户案例', '洗眉真实案例', 1, 3, UNIX_TIMESTAMP());

INSERT IGNORE INTO `eb_article` (`id`, `cid`, `title`, `author`, `synopsis`, `visit`, `sort`, `status`, `add_time`, `is_hot`) VALUES
(1, '1', '2025年洗眉行业发展趋势报告', '行业观察', '洗眉行业最新发展趋势，技术革新与市场需求变化', '1520', 1, 1, UNIX_TIMESTAMP(), 1),
(2, '2', '激光洗眉与药水洗眉的区别详解', '技术部', '详细对比两种洗眉方式的优缺点', '980', 2, 1, UNIX_TIMESTAMP(), 1),
(3, '2', '洗眉后护理全攻略', '护理专家', '科学的洗眉后护理方法', '1800', 3, 1, UNIX_TIMESTAMP(), 1),
(4, '3', '红色纹眉清洗全记录', '客户小美', '真实洗眉经历分享，从红眉困扰到成功清洗', '4200', 4, 1, UNIX_TIMESTAMP(), 1);

INSERT IGNORE INTO `eb_article_content` (`nid`, `content`) VALUES
(1, '<h2>2025年洗眉行业发展趋势报告</h2><p>随着人们对美的追求不断提升，洗眉行业迎来了新发展机遇。激光技术不断升级，洗眉效果更好、恢复更快。</p>'),
(2, '<h2>激光洗眉与药水洗眉的区别</h2><p>激光洗眉利用特定波长激光击碎色素，是目前唯一能彻底去除纹眉的方法。药水洗眉使用化学药水腐蚀表皮，容易留下疤痕。</p>');


-- ============================================================
-- 第七部分：财务佣金
-- ============================================================

INSERT IGNORE INTO `eb_capital_flow` (`id`, `flow_id`, `order_id`, `uid`, `nickname`, `phone`, `price`, `trading_type`, `pay_type`, `mark`, `add_time`) VALUES
(1, 'FL001', '1', 2, '李明明', '13800138001', 11800.00, 1, 'wechat', '购买XM-2000', UNIX_TIMESTAMP() - 172800),
(2, 'FL002', '2', 3, '王小红', '13900139002', 12800.00, 1, 'wechat', '购买XM-2000', UNIX_TIMESTAMP() - 172800),
(3, 'FL003', '3', 4, '张大山', '13700137003', 2680.00, 1, 'wechat', '购买XM-Mini', UNIX_TIMESTAMP() - 172800);

INSERT IGNORE INTO `eb_user_brokerage` (`id`, `uid`, `link_id`, `pm`, `title`, `type`, `number`, `balance`, `mark`, `status`, `add_time`) VALUES
(1, 2, '1', 1, '推广佣金', 'order', 100.00, 100.00, '王小红购买商品返佣', 1, UNIX_TIMESTAMP()),
(2, 3, '2', 1, '推广佣金', 'order', 50.00, 50.00, '陈晓花购买商品返佣', 1, UNIX_TIMESTAMP() - 86400);

INSERT IGNORE INTO `eb_user_extract` (`id`, `uid`, `real_name`, `extract_type`, `extract_price`, `balance`, `status`, `add_time`) VALUES
(1, 2, '李明明', 'wechat', 100.00, 0.00, 1, UNIX_TIMESTAMP() - 86400);


-- ============================================================
-- 第八部分：消息与通知
-- ============================================================

INSERT IGNORE INTO `eb_message_system` (`id`, `mark`, `uid`, `title`, `content`, `look`, `type`, `add_time`) VALUES
(1, 'sys_notice', 0, '系统公告', '洗眉机教学平台V2.0即将上线，新增AI智能色素分析功能！', 0, 0, UNIX_TIMESTAMP()),
(2, 'activity', 0, '活动通知', '618年中大促，洗眉机最高立减2000元，课程会员5折！', 0, 0, UNIX_TIMESTAMP());

INSERT IGNORE INTO `eb_user_notice` (`id`, `uid`, `type`, `user`, `title`, `content`, `add_time`, `is_send`) VALUES
(1, 2, 0, '系统', '订单发货通知', '您的订单已发货，快递单号：SF1234567890', UNIX_TIMESTAMP() - 86400, 1),
(2, 3, 0, '系统', '预约确认通知', '您预约的培训班已确认，请按时参加', UNIX_TIMESTAMP(), 1),
(3, 2, 0, '系统', '课程购买成功', '您已成功购买《高级洗眉技术进阶》课程', UNIX_TIMESTAMP(), 1);


-- ============================================================
-- 第九部分：客服数据
-- ============================================================

INSERT IGNORE INTO `eb_store_service` (`id`, `uid`, `nickname`, `avatar`, `phone`, `online`, `status`, `add_time`) VALUES
(1, 0, '客服小美', '/statics/avatar/s1.png', '020-88888888', 1, 1, UNIX_TIMESTAMP()),
(2, 0, '客服小智', '/statics/avatar/s2.png', '020-88888889', 1, 1, UNIX_TIMESTAMP());

INSERT IGNORE INTO `eb_store_service_speechcraft` (`id`, `kefu_id`, `cate_id`, `title`, `message`, `sort`, `add_time`) VALUES
(1, 0, 0, '欢迎语', '您好，欢迎咨询洗眉机教学平台！请问有什么可以帮您？', 1, UNIX_TIMESTAMP()),
(2, 0, 0, '课程咨询', '线上课程试听仅需9.9元，会员免费学习全部课程。', 2, UNIX_TIMESTAMP()),
(3, 0, 0, '产品咨询', 'XM-2000是旗舰洗眉机，采用进口激光器，一年保修。', 3, UNIX_TIMESTAMP()),
(4, 0, 0, '售后咨询', '设备问题请拨打400-888-8888，24小时内处理。', 4, UNIX_TIMESTAMP());

INSERT IGNORE INTO `eb_store_service_log` (`id`, `uid`, `to_uid`, `msn`, `add_time`, `type`) VALUES
(1, 2, 1, '你好，我想咨询洗眉机的使用培训', UNIX_TIMESTAMP() - 86400, 1),
(2, 2, 1, '线下的培训班怎么报名？', UNIX_TIMESTAMP() - 86400, 1);

INSERT IGNORE INTO `eb_store_service_feedback` (`id`, `uid`, `rela_name`, `phone`, `content`, `status`, `add_time`) VALUES
(1, 2, '李明明', '13800138001', '客服回复及时，问题解答得很清楚！', 1, UNIX_TIMESTAMP() - 86400);


-- ============================================================
-- 第十部分：其他业务数据
-- ============================================================

-- 快递
INSERT IGNORE INTO `eb_express` (`id`, `code`, `name`, `is_show`, `status`, `sort`) VALUES
(1, 'SF', '顺丰速运', 1, 1, 1),
(2, 'ZTO', '中通快递', 1, 1, 2),
(3, 'YTO', '圆通速递', 1, 1, 3),
(4, 'STO', '申通快递', 1, 1, 4);

-- 运费模板
INSERT IGNORE INTO `eb_shipping_templates` (`id`, `name`, `type`, `sort`, `add_time`) VALUES
(1, '全国包邮', 0, 1, UNIX_TIMESTAMP()),
(2, '按重量计费', 1, 2, UNIX_TIMESTAMP());

-- 门店
INSERT IGNORE INTO `eb_system_store` (`id`, `name`, `phone`, `address`, `detailed_address`, `day_time`, `add_time`, `is_show`) VALUES
(1, '广州天河旗舰店', '020-88888888', '广东省广州市天河区', '体育西路123号创展中心8楼', '09:00-18:00', UNIX_TIMESTAMP(), 1);

-- 其他订单(会员购买)
INSERT IGNORE INTO `eb_other_order` (`id`, `uid`, `type`, `order_id`, `pay_type`, `paid`, `pay_price`, `pay_time`, `add_time`, `vip_day`) VALUES
(1, 2, 0, 'MO202501010001', 'wechat', 1, 99.00, UNIX_TIMESTAMP() - 86400, UNIX_TIMESTAMP() - 86400, 30),
(2, 7, 0, 'MO202501010002', 'wechat', 1, 399.00, UNIX_TIMESTAMP() - 172800, UNIX_TIMESTAMP() - 172800, 365);

-- APP版本
INSERT IGNORE INTO `eb_app_version` (`id`, `version`, `platform`, `info`, `url`, `is_force`, `is_new`, `add_time`) VALUES
(1, '1.0.0', 1, '初始版本', '', 0, 1, UNIX_TIMESTAMP()),
(2, '1.0.0', 2, '初始版本', '', 0, 1, UNIX_TIMESTAMP());

-- 升级日志
INSERT IGNORE INTO `eb_upgrade_log` (`id`, `title`, `content`, `first_version`, `upgrade_time`) VALUES
(1, 'V1.0发布', '初始版本发布', '1', UNIX_TIMESTAMP());

-- 定时任务
INSERT IGNORE INTO `eb_system_timer` (`id`, `name`, `mark`, `type`, `add_time`, `is_open`) VALUES
(1, '自动确认收货', '检查超过7天已发货订单', 0, UNIX_TIMESTAMP(), 1),
(2, '会员到期提醒', '检查即将到期会员发送提醒', 0, UNIX_TIMESTAMP(), 1);

-- SMS记录
INSERT IGNORE INTO `eb_sms_record` (`id`, `uid`, `phone`, `content`, `add_time`, `resultcode`) VALUES
(1, '', '13800138001', '您的订单已发货，顺丰SF1234567890', UNIX_TIMESTAMP(), 0),
(2, '', '13900139002', '您预约的培训班已确认', UNIX_TIMESTAMP(), 0);

-- 好友关系
INSERT IGNORE INTO `eb_user_friends` (`id`, `uid`, `friends_uid`, `add_time`) VALUES
(1, 2, 3, UNIX_TIMESTAMP());

-- 用户取消记录
INSERT IGNORE INTO `eb_user_cancel` (`id`, `uid`, `name`, `phone`, `status`, `add_time`) VALUES
(1, 6, '赵小明', '13500135005', 0, UNIX_TIMESTAMP());

-- 二维码
INSERT IGNORE INTO `eb_qrcode` (`id`, `third_type`, `third_id`, `ticket`, `status`, `add_time`, `url`, `qrcode_url`) VALUES
(1, 'routine', 1, 'example_ticket', 1, UNIX_TIMESTAMP(), '', '');

-- 微信消息
INSERT IGNORE INTO `eb_wechat_message` (`id`, `openid`, `type`, `result`, `add_time`) VALUES
(1, 'o_example_openid_001', 'order', 'success', UNIX_TIMESTAMP()),
(2, 'o_example_openid_002', 'course', 'success', UNIX_TIMESTAMP());

-- ============================================================
-- 执行完成
-- ============================================================
SELECT '=== 示例数据导入完成 ===' AS result;
SELECT '教学模块:8张表 | 用户:7张表 | 商品:6张表 | 订单:4张表' AS summary;
SELECT '营销:5张表 | 文章:3张表 | 财务:3张表 | 消息:3张表' AS summary2;
SELECT '客服:4张表 | 其他:12张表 | 总计约55张表' AS summary3;
