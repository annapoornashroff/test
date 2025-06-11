-- Create relationships table
CREATE TABLE relationships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    related_user_id INTEGER NOT NULL REFERENCES users(id),
    relationship_type VARCHAR(50) NOT NULL,
    relationship_name VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    privacy_level VARCHAR(20) DEFAULT 'private',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_relationships_user_id ON relationships(user_id);
CREATE INDEX idx_relationships_related_user_id ON relationships(related_user_id);
CREATE INDEX idx_relationships_status ON relationships(status);
CREATE INDEX idx_relationships_expires ON relationships(expires_at);

-- Add constraint for valid status values
ALTER TABLE relationships
ADD CONSTRAINT valid_relationship_status 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Add constraint for expiration logic
ALTER TABLE relationships
ADD CONSTRAINT valid_expiration 
CHECK (
  (status = 'pending' AND expires_at IS NOT NULL) OR
  (status != 'pending' AND expires_at IS NULL)
);

-- Add constraint for response timing
ALTER TABLE relationships
ADD CONSTRAINT valid_response_timing
CHECK (
  (status = 'pending' AND responded_at IS NULL) OR
  (status != 'pending' AND responded_at IS NOT NULL)
);

-- Add constraint to prevent self-relationships
ALTER TABLE relationships
ADD CONSTRAINT no_self_relationships
CHECK (user_id != related_user_id);

-- Add constraint for unique relationships
ALTER TABLE relationships
ADD CONSTRAINT unique_relationship
UNIQUE (user_id, related_user_id, relationship_type);

-- Add comment to table
COMMENT ON TABLE relationships IS 'Stores user relationships with status tracking and expiration';

-- Update existing relationships to accepted status
UPDATE relationships
SET status = 'accepted',
    responded_at = CURRENT_TIMESTAMP
WHERE status = 'pending'
AND created_at < CURRENT_TIMESTAMP - INTERVAL '7 days'; 