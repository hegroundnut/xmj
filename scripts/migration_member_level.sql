-- 课程表新增会员等级字段（1=普通会员可看 2=超级会员可看）
ALTER TABLE `eb_course` ADD COLUMN `member_level` tinyint(1) NOT NULL DEFAULT 1 COMMENT '可看会员等级 1=普通会员 2=超级会员' AFTER `is_free_for_member`;

-- 将已有课程的 price 置为 0（价格已废弃）
UPDATE `eb_course` SET `price` = 0;
