-- 朋友圈社区功能数据库迁移脚本
-- 执行: mysql -u root -p <database> < migration_moment.sql

-- 1. 帖子表
CREATE TABLE IF NOT EXISTS `eb_moment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '发布者用户ID',
  `content` text COMMENT '文字内容',
  `images` text COMMENT '图片列表JSON',
  `video_url` varchar(500) DEFAULT '' COMMENT '视频URL',
  `like_count` int(11) NOT NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` int(11) NOT NULL DEFAULT 0 COMMENT '评论数',
  `share_count` int(11) NOT NULL DEFAULT 0 COMMENT '分享次数',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=正常 0=已删除',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '发布时间',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_status_time` (`status`, `add_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='朋友圈帖子';

-- 2. 评论表
CREATE TABLE IF NOT EXISTS `eb_moment_comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `moment_id` int(11) NOT NULL DEFAULT 0 COMMENT '帖子ID',
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '评论者用户ID',
  `parent_id` int(11) NOT NULL DEFAULT 0 COMMENT '父评论ID 0=一级评论',
  `reply_uid` int(11) NOT NULL DEFAULT 0 COMMENT '被回复用户ID',
  `content` varchar(500) NOT NULL DEFAULT '' COMMENT '评论内容',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=正常 0=已删除',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '评论时间',
  PRIMARY KEY (`id`),
  KEY `idx_moment_id` (`moment_id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='朋友圈评论';

-- 3. 点赞表
CREATE TABLE IF NOT EXISTS `eb_moment_like` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `moment_id` int(11) NOT NULL DEFAULT 0 COMMENT '帖子ID',
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '点赞用户ID',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '点赞时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_moment_uid` (`moment_id`, `uid`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='朋友圈点赞';

-- 4. 收藏表
CREATE TABLE IF NOT EXISTS `eb_moment_favorite` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `moment_id` int(11) NOT NULL DEFAULT 0 COMMENT '帖子ID',
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '收藏用户ID',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_moment_uid` (`moment_id`, `uid`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='朋友圈收藏';
