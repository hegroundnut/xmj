-- 分类表（案例和课程共用）
CREATE TABLE IF NOT EXISTS `eb_teaching_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL DEFAULT '' COMMENT '分类名称',
  `type` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=案例分类 2=课程分类',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序，越大越靠前',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=禁用',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间戳',
  PRIMARY KEY (`id`),
  KEY `idx_type_status` (`type`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教学分类（案例/课程）';

-- 案例表新增分类字段
ALTER TABLE `eb_case` ADD COLUMN `category_id` int(11) NOT NULL DEFAULT 0 COMMENT '分类ID' AFTER `type`;

-- 课程表新增分类字段
ALTER TABLE `eb_course` ADD COLUMN `category_id` int(11) NOT NULL DEFAULT 0 COMMENT '分类ID' AFTER `title`;

-- 产品表新增首页显示字段，支持多产品
ALTER TABLE `eb_product_info` ADD COLUMN `is_home` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否首页显示 1=是 0=否' AFTER `status`;
