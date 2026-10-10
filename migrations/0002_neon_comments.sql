CREATE TABLE IF NOT EXISTS comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(70) NOT NULL,
    role VARCHAR(60) NOT NULL,
    comment VARCHAR(1000) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_name CHECK (length(trim(name)) BETWEEN 2 AND 70),
    CONSTRAINT valid_comment CHECK (length(trim(comment)) BETWEEN 8 AND 1000)
);

CREATE INDEX IF NOT EXISTS idx_comments_status_created
ON comments (status, created_at DESC);
