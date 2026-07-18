-- 线下课 + 课程功能增强迁移
-- 执行: mysql -u root -p <database> < migration_offline_course_enhance.sql

-- 1. 线下课表：class_date → start_date，新增 end_date、photos
ALTER TABLE `eb_offline_class`
  CHANGE COLUMN `class_date` `start_date` date NOT NULL COMMENT '开始日期',
  ADD COLUMN `end_date` date NOT NULL COMMENT '结束日期' AFTER `start_date`,
  ADD COLUMN `photos` text COMMENT '课程照片JSON数组' AFTER `cover`;

-- 2. 将现有 start_date 值同步到 end_date
UPDATE `eb_offline_class` SET `end_date` = `start_date` WHERE `end_date` IS NULL OR `end_date` = '0000-00-00';

-- 3. 课程表：新增 type、images
ALTER TABLE `eb_course`
  ADD COLUMN `type` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=视频 2=图片' AFTER `desc`,
  ADD COLUMN `images` text COMMENT '图片URLs JSON数组' AFTER `video_url`;
