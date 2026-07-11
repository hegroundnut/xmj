CREATE TABLE IF NOT EXISTS `eb_course_favorite` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL DEFAULT 0 COMMENT '课程ID',
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '用户ID',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_uid` (`course_id`, `uid`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程收藏';
