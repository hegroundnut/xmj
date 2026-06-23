-- 朋友圈种子数据（洗眉行业相关）
-- 执行: mysql -u root -p <database> < seed_moment.sql
-- 需要至少有一个用户 uid=1 存在

-- 帖子1
INSERT INTO `eb_moment` (`uid`, `content`, `images`, `video_url`, `like_count`, `comment_count`, `status`, `add_time`) VALUES
(1, '今天完成了一个洗眉案例，效果非常好！温柔的光纤洗眉，全程无痛感，客人很满意~', '["/statics/system_images/spread_level_1.png", "/statics/system_images/spread_level_2.png"]', '', 5, 3, 1, UNIX_TIMESTAMP() - 86400),
(1, '洗眉后护理小贴士：\n1. 24小时内不要碰水\n2. 3天内不要化妆\n3. 一周内避免暴晒\n#洗眉护理 #美容知识', '[]', '', 8, 4, 1, UNIX_TIMESTAMP() - 85000),
(1, '新店装修中，期待给大家更好的服务体验！', '["/statics/system_images/spread_level_3.png", "/statics/system_images/spread_level_4.png", "/statics/system_images/spread_level_5.png"]', '', 12, 5, 1, UNIX_TIMESTAMP() - 80000),
(1, '客人反馈：洗眉后眉毛终于可以自由生长了，再也不用每天画眉！这就是我们的价值所在~', '[]', '', 6, 2, 1, UNIX_TIMESTAMP() - 75000),
(1, '今天培训新学员，看着大家认真学习的样子，想起了自己刚开始学洗眉的时候。技术需要传承，行业需要规范。', '["/statics/system_images/spread_level_1.png"]', '', 10, 3, 1, UNIX_TIMESTAMP() - 70000),
(1, '激光洗眉vs光纤洗眉，到底选哪个？\n简单说：激光适合深色眉，光纤适合彩色眉。具体还是要面诊后才能确定哦！', '[]', '', 15, 6, 1, UNIX_TIMESTAMP() - 65000),
(1, '周末加班中~为了下周的客户预约做好准备', '["/statics/system_images/spread_level_2.png", "/statics/system_images/spread_level_1.png"]', '', 3, 1, 1, UNIX_TIMESTAMP() - 60000),
(1, '刚做完的一个修复案例，之前的洗眉没做好留下了红色底色，经过三次修复终于清干净了。选对技术真的很重要！', '["/statics/system_images/spread_level_3.png"]', '', 9, 2, 1, UNIX_TIMESTAMP() - 55000),
(1, '今天天气真好，阳光明媚，适合出来走走。但记得做好防晒哦，尤其是刚做完洗眉的姐妹们！', '[]', '', 4, 0, 1, UNIX_TIMESTAMP() - 50000),
(1, '设备升级完成！最新一代洗眉仪器，能量更精准，对皮肤的损伤更小。客户体验又提升了一个档次~', '["/statics/system_images/spread_level_4.png", "/statics/system_images/spread_level_5.png"]', '', 7, 2, 1, UNIX_TIMESTAMP() - 45000),
(1, '有人问我洗眉疼不疼？其实现在的技术已经很成熟了，加上麻药基本没什么感觉。很多客人做完了都说"就这？"哈哈', '[]', '', 11, 4, 1, UNIX_TIMESTAMP() - 40000),
(1, '本月已预约满，感谢大家的信任和支持！新客户请提前一周预约哦~', '["/statics/system_images/spread_level_1.png"]', '', 2, 1, 1, UNIX_TIMESTAMP() - 35000),
(1, '学习永无止境，今天去参加了行业交流会，收获满满！学到了很多新的洗眉技巧和护理知识。', '["/statics/system_images/spread_level_2.png", "/statics/system_images/spread_level_3.png", "/statics/system_images/spread_level_4.png"]', '', 8, 3, 1, UNIX_TIMESTAMP() - 30000),
(1, '分享一下洗眉前后的对比，客人的变化真的太大了！自信的笑容是最好的回报。', '["/statics/system_images/spread_level_5.png"]', '', 18, 7, 1, UNIX_TIMESTAMP() - 25000),
(1, '年底了，想给想要洗眉的朋友们一些建议：\n1. 不要贪便宜\n2. 选择正规机构\n3. 看实操案例\n4. 问清楚技术类型\n5. 术后护理要到位', '[]', '', 20, 8, 1, UNIX_TIMESTAMP() - 20000),
(1, '工作室新到了几款修复产品，效果一级棒！配合洗眉后使用，恢复速度明显加快。', '["/statics/system_images/spread_level_1.png", "/statics/system_images/spread_level_2.png"]', '', 5, 1, 1, UNIX_TIMESTAMP() - 15000),
(1, '洗眉这个行业需要耐心和细心，每一个客户都是独一无二的，都需要我们用心对待。', '[]', '', 13, 3, 1, UNIX_TIMESTAMP() - 10000),
(1, '今天收到老客户的推荐，又来了两位新客人！口碑真的很重要，做好每一个案例就是最好的广告。', '[]', '', 6, 2, 1, UNIX_TIMESTAMP() - 5000),
(1, '年终总结：今年服务了300+客户，满意度98%。明年目标500+，继续加油！', '["/statics/system_images/spread_level_3.png", "/statics/system_images/spread_level_4.png"]', '', 22, 5, 1, UNIX_TIMESTAMP() - 3000),
(1, '希望大家都能拥有满意的眉形，自信每一天！晚安~', '[]', '', 4, 0, 1, UNIX_TIMESTAMP() - 1000);

-- 为部分帖子添加评论
INSERT INTO `eb_moment_comment` (`moment_id`, `uid`, `parent_id`, `reply_uid`, `content`, `status`, `add_time`) VALUES
-- 帖子1的评论
(1, 1, 0, 0, '效果真的很好，我也想做了！', 1, UNIX_TIMESTAMP() - 80000),
(1, 1, 1, 1, '欢迎来咨询哦~', 1, UNIX_TIMESTAMP() - 79000),
(1, 1, 0, 0, '请问价格大概多少？', 1, UNIX_TIMESTAMP() - 78000),
-- 帖子2的评论
(2, 1, 0, 0, '收藏了，很有用！', 1, UNIX_TIMESTAMP() - 80000),
(2, 1, 4, 1, '谢谢支持！', 1, UNIX_TIMESTAMP() - 79000),
(2, 1, 0, 0, '第三天可以碰水吗？', 1, UNIX_TIMESTAMP() - 77000),
(2, 1, 0, 0, '好详细，学到了', 1, UNIX_TIMESTAMP() - 76000),
-- 帖子3的评论
(3, 1, 0, 0, '新店在哪里呀？', 1, UNIX_TIMESTAMP() - 75000),
(3, 1, 8, 1, '私信告诉你~', 1, UNIX_TIMESTAMP() - 74000),
(3, 1, 0, 0, '期待！', 1, UNIX_TIMESTAMP() - 73000),
(3, 1, 0, 0, '开业有活动吗', 1, UNIX_TIMESTAMP() - 72000),
(3, 1, 0, 0, '装修风格真好看', 1, UNIX_TIMESTAMP() - 71000),
-- 帖子14的评论（最多评论）
(14, 1, 0, 0, '变化太大了，好自然！', 1, UNIX_TIMESTAMP() - 20000),
(14, 1, 0, 0, '这个效果真不错', 1, UNIX_TIMESTAMP() - 19000),
(14, 1, 5, 1, '是的呢，客人超开心', 1, UNIX_TIMESTAMP() - 18000),
(14, 1, 0, 0, '做了多久恢复的', 1, UNIX_TIMESTAMP() - 17000),
(14, 1, 8, 0, '一般一周左右就自然了', 1, UNIX_TIMESTAMP() - 16000),
(14, 1, 0, 0, '多少钱一次', 1, UNIX_TIMESTAMP() - 15000),
(14, 1, 0, 0, '比之前好看太多了', 1, UNIX_TIMESTAMP() - 14000);

-- 模拟点赞（uid=1给自己帖子点赞）
INSERT INTO `eb_moment_like` (`moment_id`, `uid`, `add_time`) VALUES
(1, 1, UNIX_TIMESTAMP() - 70000), (3, 1, UNIX_TIMESTAMP() - 60000),
(2, 1, UNIX_TIMESTAMP() - 50000), (5, 1, UNIX_TIMESTAMP() - 40000),
(6, 1, UNIX_TIMESTAMP() - 30000), (14, 1, UNIX_TIMESTAMP() - 20000),
(15, 1, UNIX_TIMESTAMP() - 10000), (19, 1, UNIX_TIMESTAMP() - 5000),
(10, 1, UNIX_TIMESTAMP() - 4000), (11, 1, UNIX_TIMESTAMP() - 3000);

-- 模拟收藏
INSERT INTO `eb_moment_favorite` (`moment_id`, `uid`, `add_time`) VALUES
(1, 1, UNIX_TIMESTAMP() - 60000), (2, 1, UNIX_TIMESTAMP() - 50000),
(6, 1, UNIX_TIMESTAMP() - 40000), (14, 1, UNIX_TIMESTAMP() - 30000),
(15, 1, UNIX_TIMESTAMP() - 20000), (10, 1, UNIX_TIMESTAMP() - 10000),
(11, 1, UNIX_TIMESTAMP() - 5000), (19, 1, UNIX_TIMESTAMP() - 1000);

-- =============================================================
-- Additional enriched posts (21-25) for more test variety
-- =============================================================

INSERT IGNORE INTO `eb_moment` (`id`, `uid`, `content`, `images`, `video_url`, `like_count`, `comment_count`, `share_count`, `status`, `add_time`) VALUES
(21, 1, '【设备评测】最新款洗眉仪器实测报告，能量稳定性提升40%，操作手感更轻便。详情可以私信咨询~', '["/statics/system_images/spread_level_1.png","/statics/system_images/spread_level_2.png","/statics/system_images/spread_level_3.png"]', '', 15, 4, 3, 1, UNIX_TIMESTAMP() - 2000),
(22, 1, '学员风采：本期培训班圆满结业！恭喜各位学员顺利通过考核，期待大家在洗眉行业大放异彩！', '["/statics/system_images/spread_level_4.png","/statics/system_images/spread_level_5.png"]', '', 25, 6, 5, 1, UNIX_TIMESTAMP() - 1500),
(23, 1, '科普：为什么有的人洗眉一次就能干净，有的人需要多次？\n主要是这几个因素：\n1. 纹眉色料品质（植物色料比化工色料更难去除）\n2. 纹刺深度（越深越难）\n3. 个人代谢能力\n4. 纹眉年限（越久越难）', '[]', '', 18, 7, 2, 1, UNIX_TIMESTAMP() - 1000),
(24, 1, '老客户回馈活动来啦！即日起至月底，介绍新客户到店可享8折优惠，两人同行更有7折惊喜！详情私信~', '["/statics/system_images/spread_level_1.png"]', '', 10, 3, 1, 1, UNIX_TIMESTAMP() - 500),
(25, 1, '今日份科普：洗眉后多久可以重新纹眉？\n一般建议至少等待1-3个月，具体要看个人恢复情况和洗眉效果。要等皮肤完全修复、色素基本代谢后再进行新纹绣，才能保证最佳效果哦！', '[]', '', 12, 4, 2, 1, UNIX_TIMESTAMP());

-- Additional comments for new posts
INSERT IGNORE INTO `eb_moment_comment` (`id`, `moment_id`, `uid`, `parent_id`, `reply_uid`, `content`, `status`, `add_time`) VALUES
(26, 21, 1, 0, 0, '这款设备确实好用，我也在用！', 1, UNIX_TIMESTAMP() - 1500),
(27, 21, 1, 26, 0, '同款！稳定性确实比老款强很多', 1, UNIX_TIMESTAMP() - 1400),
(28, 22, 1, 0, 0, '祝贺各位学员！期待下期培训', 1, UNIX_TIMESTAMP() - 1000),
(29, 23, 1, 0, 0, '干货满满，收藏了！', 1, UNIX_TIMESTAMP() - 800),
(30, 23, 1, 29, 0, '感谢分享专业知识，学习了', 1, UNIX_TIMESTAMP() - 700),
(31, 25, 1, 0, 0, '非常实用的科普，解答了我一直以来的疑惑', 1, UNIX_TIMESTAMP() - 300);

-- Additional likes for new posts
INSERT IGNORE INTO `eb_moment_like` (`moment_id`, `uid`, `add_time`) VALUES
(21, 1, UNIX_TIMESTAMP() - 1500), (22, 1, UNIX_TIMESTAMP() - 1000),
(23, 1, UNIX_TIMESTAMP() - 800), (24, 1, UNIX_TIMESTAMP() - 400),
(25, 1, UNIX_TIMESTAMP() - 200);

-- Additional favorites for new posts
INSERT IGNORE INTO `eb_moment_favorite` (`moment_id`, `uid`, `add_time`) VALUES
(21, 1, UNIX_TIMESTAMP() - 1300), (22, 1, UNIX_TIMESTAMP() - 900),
(23, 1, UNIX_TIMESTAMP() - 600), (25, 1, UNIX_TIMESTAMP() - 100);
