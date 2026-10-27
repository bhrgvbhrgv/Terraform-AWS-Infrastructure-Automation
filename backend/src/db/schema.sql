-- Schema for CloudOps Status Dashboard

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('operational', 'degraded', 'offline')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_history (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('operational', 'degraded', 'offline')),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_status_history_service_id ON status_history(service_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON status_history(changed_at DESC);

