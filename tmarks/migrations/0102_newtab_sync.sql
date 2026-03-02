CREATE TABLE IF NOT EXISTS newtab_shortcuts_v2 (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  favicon_url TEXT,
  click_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  device_id TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_newtab_shortcuts_v2_user ON newtab_shortcuts_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_newtab_shortcuts_v2_deleted ON newtab_shortcuts_v2(deleted_at);
CREATE INDEX IF NOT EXISTS idx_newtab_shortcuts_v2_updated ON newtab_shortcuts_v2(user_id, updated_at);

CREATE TABLE IF NOT EXISTS newtab_groups_v2 (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  bookmark_folder_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  device_id TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_newtab_groups_v2_user ON newtab_groups_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_newtab_groups_v2_deleted ON newtab_groups_v2(deleted_at);
CREATE INDEX IF NOT EXISTS idx_newtab_groups_v2_updated ON newtab_groups_v2(user_id, updated_at);

CREATE TABLE IF NOT EXISTS newtab_operations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  data TEXT,
  timestamp INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_newtab_operations_user_time ON newtab_operations(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_newtab_operations_target ON newtab_operations(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_newtab_operations_device ON newtab_operations(user_id, device_id, timestamp);

CREATE TABLE IF NOT EXISTS newtab_sync_state (
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  last_sync_at INTEGER NOT NULL,
  last_operation_id TEXT,
  sync_version INTEGER DEFAULT 1,
  PRIMARY KEY (user_id, device_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_newtab_sync_state_user ON newtab_sync_state(user_id);

INSERT OR IGNORE INTO newtab_groups_v2 (
  id, user_id, name, icon, position,
  created_at, updated_at, deleted_at, device_id, version
)
SELECT 
  id,
  user_id,
  name,
  COALESCE(icon, ''),
  COALESCE(position, 0),
  CAST(strftime('%s', created_at) * 1000 AS INTEGER),
  CAST(strftime('%s', updated_at) * 1000 AS INTEGER),
  NULL,
  'migration',
  1
FROM newtab_groups
WHERE EXISTS (SELECT 1 FROM newtab_groups);

INSERT OR IGNORE INTO newtab_shortcuts_v2 (
  id, user_id, group_id, title, url, position,
  favicon_url, click_count,
  created_at, updated_at, deleted_at, device_id, version
)
SELECT 
  id,
  user_id,
  group_id,
  title,
  url,
  COALESCE(position, 0),
  favicon,
  0,
  CAST(strftime('%s', created_at) * 1000 AS INTEGER),
  CAST(strftime('%s', updated_at) * 1000 AS INTEGER),
  NULL,
  'migration',
  1
FROM newtab_shortcuts
WHERE EXISTS (SELECT 1 FROM newtab_shortcuts);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0102');
