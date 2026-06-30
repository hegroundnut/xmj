-- 洗眉机小程序 — 分类系统迁移脚本
-- 执行: docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb < migration_category_product.sql
-- 放置位置: crmeb/sql/migration_category_product.sql
-- 说明: 新增教学分类表、产品分类表，并为案例/课程/产品表增加 category_id 字段

-- 1. 教学分类表（案例和课程共用）
CREATE TABLE IF NOT EXISTS `eb_teaching_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '分类名称',
  `type` tinyint(1) NOT NULL DEFAULT 3 COMMENT '适用类型: 1=案例 2=课程 3=通用',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教学分类';

-- 2. 产品分类表
CREATE TABLE IF NOT EXISTS `eb_product_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '分类名称',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类';

-- 3. 案例表新增分类字段
ALTER TABLE `eb_case` ADD COLUMN IF NOT EXISTS `category_id` int(11) NOT NULL DEFAULT 0 COMMENT '分类ID:关联eb_teaching_category';

-- 4. 课程表新增分类字段
ALTER TABLE `eb_course` ADD COLUMN IF NOT EXISTS `category_id` int(11) NOT NULL DEFAULT 0 COMMENT '分类ID:关联eb_teaching_category';

-- 5. 产品表新增分类字段和首页显示字段
ALTER TABLE `eb_product_info` ADD COLUMN IF NOT EXISTS `category_id` int(11) NOT NULL DEFAULT 0 COMMENT '分类ID:关联eb_product_category';
ALTER TABLE `eb_product_info` ADD COLUMN IF NOT EXISTS `is_home` tinyint(1) NOT NULL DEFAULT 0 COMMENT '首页展示:1=展示 0=不展示';

-- 6. 案例表新增索引
ALTER TABLE `eb_case` ADD INDEX `idx_category` (`category_id`);

-- 7. 课程表新增索引
ALTER TABLE `eb_course` ADD INDEX `idx_category` (`category_id`);

-- 8. 产品表新增索引
ALTER TABLE `eb_product_info` ADD INDEX `idx_category_home` (`category_id`, `is_home`);

-- 9. 教学分类种子数据（8个分类，案例和课程共用）
INSERT INTO `eb_teaching_category` (`name`, `type`, `sort`, `status`, `add_time`) VALUES
('眉部', 3, 1, 1, UNIX_TIMESTAMP()),
('眼部', 3, 2, 1, UNIX_TIMESTAMP()),
('唇部', 3, 3, 1, UNIX_TIMESTAMP()),
('祛斑', 3, 4, 1, UNIX_TIMESTAMP()),
('纹身', 3, 5, 1, UNIX_TIMESTAMP()),
('乳晕', 3, 6, 1, UNIX_TIMESTAMP()),
('私密', 3, 7, 1, UNIX_TIMESTAMP()),
('其他', 3, 8, 1, UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE `name`=`name`;

-- 10. 产品分类种子数据（5个分类）
INSERT INTO `eb_product_category` (`name`, `sort`, `status`, `add_time`) VALUES
('无创洗眉机', 1, 1, UNIX_TIMESTAMP()),
('二氧化碳点阵', 2, 1, UNIX_TIMESTAMP()),
('超皮秒', 3, 1, UNIX_TIMESTAMP()),
('脱毛仪', 4, 1, UNIX_TIMESTAMP()),
('其他产品', 5, 1, UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE `name`=`name`;
