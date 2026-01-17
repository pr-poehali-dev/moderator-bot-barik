CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'warned', 'muted', 'banned')),
    violations_count INT DEFAULT 0,
    warnings_count INT DEFAULT 0,
    muted_until TIMESTAMP,
    banned_at TIMESTAMP,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS violations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    violation_type VARCHAR(50) NOT NULL CHECK (violation_type IN ('spam', 'flood', 'caps', 'link', 'toxic', 'manual')),
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('warn', 'mute', 'ban', 'kick')),
    reason TEXT,
    moderator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mod_actions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    moderator_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('warn', 'mute', 'unmute', 'ban', 'unban', 'kick')),
    reason TEXT,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auto_mod_settings (
    id SERIAL PRIMARY KEY,
    setting_name VARCHAR(100) UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT true,
    config JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO auto_mod_settings (setting_name, enabled, config) VALUES 
    ('spam_filter', true, '{"max_messages": 5, "time_window": 10}'::jsonb),
    ('link_filter', false, '{"whitelist": []}'::jsonb),
    ('caps_filter', true, '{"min_length": 10, "caps_percentage": 70}'::jsonb),
    ('flood_protection', true, '{"max_messages": 3, "time_window": 5}'::jsonb),
    ('warn_limit', true, '{"max_warnings": 3}'::jsonb)
ON CONFLICT (setting_name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_violations_user_id ON violations(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_created_at ON violations(created_at);
CREATE INDEX IF NOT EXISTS idx_mod_actions_user_id ON mod_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_mod_actions_created_at ON mod_actions(created_at);