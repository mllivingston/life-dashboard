-- Error Logging System for Life Dashboard
-- Migration: 001_error_logs
-- Purpose: Track application errors for debugging and monitoring

-- ============================================
-- 1. CREATE ERROR_LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS error_logs (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- User context
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  session_id TEXT,
  
  -- Error classification
  level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
  service TEXT NOT NULL, -- 'google-calendar', 'outlook', 'todos', 'groceries', 'auth', 'system'
  error_type TEXT, -- 'TOKEN_REFRESH_FAILED', 'API_TIMEOUT', 'RATE_LIMIT', etc.
  
  -- Error details
  message TEXT NOT NULL,
  stack_trace TEXT,
  error_code TEXT,
  
  -- Request context (JSONB for flexibility)
  request_context JSONB DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "endpoint": "/api/calendar",
  --   "method": "GET",
  --   "statusCode": 500,
  --   "userAgent": "Mozilla/5.0...",
  --   "url": "https://...",
  --   "requestId": "uuid"
  -- }
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "tokenExpiry": "2024-01-01T00:00:00Z",
  --   "retryAttempt": 2,
  --   "calendarProvider": "google",
  --   "environment": "production"
  -- }
  
  -- Resolution tracking
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users ON DELETE SET NULL,
  resolution_notes TEXT
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Most common queries: recent errors by user
CREATE INDEX IF NOT EXISTS idx_error_logs_user_created 
  ON error_logs(user_id, created_at DESC);

-- Query by service and level
CREATE INDEX IF NOT EXISTS idx_error_logs_service_level 
  ON error_logs(service, level, created_at DESC);

-- Query unresolved errors
CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved 
  ON error_logs(resolved, created_at DESC) 
  WHERE resolved = FALSE;

-- Query by error type
CREATE INDEX IF NOT EXISTS idx_error_logs_type 
  ON error_logs(error_type, created_at DESC);

-- Full text search on messages
CREATE INDEX IF NOT EXISTS idx_error_logs_message_search 
  ON error_logs USING gin(to_tsvector('english', message));

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Policy: Users can view their own error logs
CREATE POLICY "Users can view their own error logs" 
  ON error_logs
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: System can insert error logs for any user
-- (This allows server-side logging)
CREATE POLICY "Service role can insert error logs" 
  ON error_logs
  FOR INSERT 
  WITH CHECK (true);

-- Policy: Users can mark their own errors as resolved
CREATE POLICY "Users can resolve their own errors" 
  ON error_logs
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Admins can view all errors (optional - for future admin dashboard)
-- Uncomment if you want to add admin functionality
-- CREATE POLICY "Admins can view all errors" 
--   ON error_logs
--   FOR SELECT 
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles 
--       WHERE user_id = auth.uid() 
--       AND role = 'admin'
--     )
--   );

-- ============================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================

-- Function: Clean up old error logs (run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM error_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
  AND resolved = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get error statistics
CREATE OR REPLACE FUNCTION get_error_stats(
  time_window INTERVAL DEFAULT '24 hours'::INTERVAL
)
RETURNS TABLE (
  service TEXT,
  error_count BIGINT,
  unresolved_count BIGINT,
  avg_errors_per_hour NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.service,
    COUNT(*) as error_count,
    COUNT(*) FILTER (WHERE e.resolved = FALSE) as unresolved_count,
    ROUND(COUNT(*)::NUMERIC / EXTRACT(EPOCH FROM time_window) * 3600, 2) as avg_errors_per_hour
  FROM error_logs e
  WHERE e.created_at >= NOW() - time_window
  GROUP BY e.service
  ORDER BY error_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. CREATE VIEW FOR COMMON QUERIES
-- ============================================

-- View: Recent critical errors (last 24 hours)
CREATE OR REPLACE VIEW recent_critical_errors AS
SELECT 
  id,
  created_at,
  user_id,
  service,
  error_type,
  message,
  resolved
FROM error_logs
WHERE 
  created_at >= NOW() - INTERVAL '24 hours'
  AND level = 'error'
  AND resolved = FALSE
ORDER BY created_at DESC;

-- ============================================
-- 7. INSERT SAMPLE DATA (for testing)
-- ============================================

-- Sample error log entry
-- DELETE THIS AFTER TESTING
INSERT INTO error_logs (
  level,
  service,
  error_type,
  message,
  stack_trace,
  request_context,
  metadata
) VALUES (
  'error',
  'system',
  'INITIALIZATION',
  'Error logging system initialized successfully',
  'No stack trace - this is a test entry',
  '{"endpoint": "/api/test", "method": "POST"}'::jsonb,
  '{"environment": "development", "version": "1.0.0"}'::jsonb
);

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================

-- Verify table was created
-- SELECT COUNT(*) FROM error_logs;

-- Verify indexes exist
-- SELECT indexname FROM pg_indexes WHERE tablename = 'error_logs';

-- Test error stats function
-- SELECT * FROM get_error_stats('1 day'::INTERVAL);

-- View recent errors
-- SELECT * FROM recent_critical_errors;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Error logging system installed successfully!';
  RAISE NOTICE 'Tables: error_logs';
  RAISE NOTICE 'Indexes: 5 created';
  RAISE NOTICE 'Functions: cleanup_old_error_logs, get_error_stats';
  RAISE NOTICE 'Views: recent_critical_errors';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify: SELECT * FROM error_logs LIMIT 1;';
  RAISE NOTICE '2. Test stats: SELECT * FROM get_error_stats();';
  RAISE NOTICE '3. Remove sample data when ready';
END $$;
