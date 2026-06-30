-- 案例表新增精选字段
ALTER TABLE `eb_case` ADD COLUMN `is_home` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否精选 1=是 0=否' AFTER `status`;
