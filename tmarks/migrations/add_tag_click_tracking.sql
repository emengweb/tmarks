-- 添加标签点击统计字段
-- 执行日期: 2025-01-13
-- 说明: 为tags表添加click_count和last_clicked_at字段,用于记录标签点击统计

-- 1. 添加click_count字段
ALTER TABLE tags ADD COLUMN click_count INTEGER NOT NULL DEFAULT 0;

-- 2. 添加last_clicked_at字段
ALTER TABLE tags ADD COLUMN last_clicked_at TEXT;

-- 3. 创建索引以支持按点击次数排序
CREATE INDEX IF NOT EXISTS idx_tags_click_count ON tags(user_id, click_count DESC);

-- 4. 创建索引以支持按最后点击时间排序
CREATE INDEX IF NOT EXISTS idx_tags_last_clicked ON tags(user_id, last_clicked_at DESC);

-- 验证
-- SELECT name, type FROM pragma_table_info('tags') WHERE name IN ('click_count', 'last_clicked_at');
-- SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='tags' AND name LIKE '%click%';

