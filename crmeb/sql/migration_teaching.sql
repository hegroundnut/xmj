-- 洗眉机小程序数据库迁移脚本
-- 执行: mysql -u root -p <database> < migration_teaching.sql

-- 1. 产品信息表
CREATE TABLE IF NOT EXISTS `eb_product_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `banner` text COMMENT '轮播图JSON',
  `title` varchar(255) DEFAULT '' COMMENT '产品标题',
  `desc` text COMMENT '产品描述',
  `detail` longtext COMMENT '图文详情HTML',
  `specs` text COMMENT '参数规格JSON',
  `video_url` varchar(500) DEFAULT '' COMMENT '产品视频链接',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(11) NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机产品信息';

-- 2. 案例表
CREATE TABLE IF NOT EXISTS `eb_case` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '' COMMENT '案例标题',
  `type` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=图片 2=视频',
  `cover` varchar(500) DEFAULT '' COMMENT '封面图',
  `media_url` varchar(500) DEFAULT '' COMMENT '图片或视频URL',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=显示 0=隐藏',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_status_sort` (`status`, `sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机案例';

-- 3. 教学课程表
CREATE TABLE IF NOT EXISTS `eb_course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '' COMMENT '课程标题',
  `cover` varchar(500) DEFAULT '' COMMENT '封面图',
  `desc` text COMMENT '课程简介',
  `video_url` varchar(500) DEFAULT '' COMMENT '课程视频',
  `price` decimal(8,2) NOT NULL DEFAULT 9.90 COMMENT '试听价格',
  `is_free_for_member` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=会员免费',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=上架 0=下架',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_status_sort` (`status`, `sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机教学课程';

-- 4. 课程订单表
CREATE TABLE IF NOT EXISTS `eb_course_order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '用户ID',
  `course_id` int(11) NOT NULL DEFAULT 0 COMMENT '课程ID',
  `order_sn` varchar(32) NOT NULL DEFAULT '' COMMENT '订单号',
  `price` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT '支付金额',
  `pay_type` varchar(20) DEFAULT 'wechat' COMMENT '支付方式',
  `pay_time` int(11) NOT NULL DEFAULT 0 COMMENT '支付时间',
  `paid` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=未支付 1=已支付',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_sn` (`order_sn`),
  KEY `idx_uid` (`uid`),
  KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机课程订单';

-- 5. 线下课程排期表
CREATE TABLE IF NOT EXISTS `eb_offline_class` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '' COMMENT '课程名称',
  `cover` varchar(500) DEFAULT '' COMMENT '封面图',
  `class_date` date NOT NULL COMMENT '开课日期',
  `start_time` time NOT NULL COMMENT '开始时间',
  `end_time` time NOT NULL COMMENT '结束时间',
  `address` varchar(500) DEFAULT '' COMMENT '上课地点',
  `max_people` int(11) NOT NULL DEFAULT 0 COMMENT '人数限额 0=不限',
  `qrcode` varchar(500) DEFAULT '' COMMENT '店主微信二维码',
  `desc` text COMMENT '课程详情',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_date_status` (`class_date`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机线下课程排期';

-- 6. 线下预约记录表
CREATE TABLE IF NOT EXISTS `eb_offline_booking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '用户ID',
  `class_id` int(11) NOT NULL DEFAULT 0 COMMENT '排期ID',
  `name` varchar(50) DEFAULT '' COMMENT '联系人姓名',
  `phone` varchar(20) DEFAULT '' COMMENT '联系人手机号',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=已预约 1=已取消',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_class_id` (`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机线下预约记录';

-- 7. 案例评论表
CREATE TABLE IF NOT EXISTS `eb_case_comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `case_id` int(11) NOT NULL DEFAULT 0 COMMENT '案例ID',
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '用户ID',
  `nickname` varchar(100) DEFAULT '' COMMENT '用户昵称',
  `avatar` varchar(500) DEFAULT '' COMMENT '用户头像',
  `content` text COMMENT '评论内容',
  `pid` int(11) NOT NULL DEFAULT 0 COMMENT '父评论ID(0=顶级评论)',
  `reply_uid` int(11) NOT NULL DEFAULT 0 COMMENT '回复用户ID',
  `reply_nickname` varchar(100) DEFAULT '' COMMENT '回复用户昵称',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=显示 0=隐藏',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_case_id` (`case_id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_pid` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机案例评论';

-- 8. 首页配置表
CREATE TABLE IF NOT EXISTS `eb_teaching_home_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '配置键名',
  `value` longtext COMMENT '配置值(JSON)',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(11) NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机首页配置';

-- 9. 用户表新增教学会员字段（仅当 eb_user 表存在时执行）
SET @tbl_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user');
SET @col_exists = IF(@tbl_exists > 0, (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eb_user' AND COLUMN_NAME = 'is_teaching_member'), 1);
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `eb_user` ADD COLUMN `is_teaching_member` tinyint(1) NOT NULL DEFAULT 0 COMMENT ''教学会员:0=否 1=是''', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;