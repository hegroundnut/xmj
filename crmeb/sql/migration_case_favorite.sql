CREATE TABLE IF NOT EXISTS `eb_case_favorite` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `case_id` int(11) NOT NULL DEFAULT 0 COMMENT '案例ID',
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '用户ID',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_case_uid` (`case_id`, `uid`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案例收藏';
