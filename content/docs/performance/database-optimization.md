# Database Optimization Guide

## Overview
This document provides comprehensive guidelines for optimizing database performance in the Minisource platform.

## Table of Contents
1. [Indexing Strategy](#indexing-strategy)
2. [Connection Pooling](#connection-pooling)
3. [Query Optimization](#query-optimization)
4. [Monitoring & Maintenance](#monitoring--maintenance)
5. [Caching Strategy](#caching-strategy)

## Indexing Strategy

### Migration 000004_optimize_database
We've implemented a comprehensive indexing strategy across both auth and notifier services.

### Auth Service Indexes (28 indexes)

#### Users Table
```sql
-- Login optimization (most common query)
idx_users_tenant_email_active ON users(tenant_id, email) 
WHERE deleted_at IS NULL AND is_active = true

-- Email verification
idx_users_verification_token ON users(email_verification_token) 
WHERE email_verified = false

-- Password reset
idx_users_reset_token ON users(password_reset_token, password_reset_expires)

-- Full-text search (trigram indexes)
idx_users_email_trgm ON users USING gin(email gin_trgm_ops)
idx_users_name_trgm ON users USING gin(name gin_trgm_ops)
```

#### Sessions Table
```sql
-- Session validation
idx_sessions_tenant_user_valid ON sessions(tenant_id, user_id, expires_at)
WHERE expires_at > CURRENT_TIMESTAMP

-- Token lookup
idx_sessions_token_hash ON sessions(token)

-- Cleanup expired sessions
idx_sessions_expired ON sessions(expires_at)
WHERE expires_at <= CURRENT_TIMESTAMP
```

#### Login Logs Table
```sql
-- User login history
idx_login_logs_tenant_user_time ON login_logs(tenant_id, user_id, login_time DESC)

-- Failed login monitoring
idx_login_logs_failed ON login_logs(tenant_id, ip_address, login_time DESC)
WHERE was_successful = false

-- Rate limiting by IP
idx_login_logs_ip_recent ON login_logs(ip_address, login_time DESC)
WHERE login_time > CURRENT_TIMESTAMP - INTERVAL '1 hour'
```

### Notifier Service Indexes (20 indexes)

#### Notifications Table
```sql
-- User notification queries
idx_notifications_tenant_user_status ON notifications(tenant_id, user_id, status, created_at DESC)

-- Pending queue processing
idx_notifications_pending ON notifications(tenant_id, status, scheduled_at)
WHERE status IN ('PENDING', 'SCHEDULED')

-- Retry failed notifications
idx_notifications_retry ON notifications(status, retry_count, next_retry_at)
WHERE status = 'FAILED' AND retry_count < 3

-- Content search
idx_notifications_content_trgm ON notifications USING gin(content gin_trgm_ops)
```

### Index Best Practices

#### 1. Use CONCURRENTLY for Production
```sql
CREATE INDEX CONCURRENTLY idx_name ON table(column);
```
This prevents table locks during index creation.

#### 2. Partial Indexes for Filtered Queries
```sql
CREATE INDEX idx_active_users ON users(tenant_id, email)
WHERE deleted_at IS NULL AND is_active = true;
```
Reduces index size and improves performance for filtered queries.

#### 3. Composite Indexes Order
Put most selective columns first:
```sql
-- Good: tenant_id is more selective than status
CREATE INDEX idx ON table(tenant_id, status, created_at);

-- Bad: status has few distinct values
CREATE INDEX idx ON table(status, tenant_id, created_at);
```

#### 4. Covering Indexes
Include all columns needed by query:
```sql
CREATE INDEX idx ON table(id) INCLUDE (name, email);
-- Query can use index-only scan
SELECT name, email FROM table WHERE id = 123;
```

## Connection Pooling

### GORM Configuration

Current configuration in `internal/database/database.go`:

```go
sqlDB, err := db.DB()
if err != nil {
    return nil, err
}

// Connection pool settings
sqlDB.SetMaxIdleConns(10)
sqlDB.SetMaxOpenConns(100)
sqlDB.SetConnMaxLifetime(time.Hour)
sqlDB.SetConnMaxIdleTime(10 * time.Minute)
```

### Recommended Settings by Environment

#### Development
```go
sqlDB.SetMaxIdleConns(5)
sqlDB.SetMaxOpenConns(20)
sqlDB.SetConnMaxLifetime(30 * time.Minute)
```

#### Production
```go
sqlDB.SetMaxIdleConns(25)
sqlDB.SetMaxOpenConns(100)
sqlDB.SetConnMaxLifetime(time.Hour)
```

#### High-Traffic Production
```go
sqlDB.SetMaxIdleConns(50)
sqlDB.SetMaxOpenConns(200)
sqlDB.SetConnMaxLifetime(time.Hour)
```

### Calculation Formula
```
Max Connections = (Available DB Connections) / (Number of Service Instances)

Example:
- PostgreSQL max_connections = 200
- Auth service instances = 2
- Notifier service instances = 2
- Per-service max connections = 200 / 4 = 50
```

### Monitoring Connection Pool
```go
stats := sqlDB.Stats()
log.Info("DB Stats",
    "OpenConnections", stats.OpenConnections,
    "InUse", stats.InUse,
    "Idle", stats.Idle,
    "WaitCount", stats.WaitCount,
    "WaitDuration", stats.WaitDuration,
)
```

## Query Optimization

### 1. Use Prepared Statements
GORM automatically uses prepared statements for all queries.

### 2. Avoid N+1 Queries
```go
// Bad: N+1 query
users, _ := userRepo.GetAll(ctx)
for _, user := range users {
    roles, _ := roleRepo.GetByUserID(ctx, user.ID) // N queries
}

// Good: Preload relationships
db.Preload("Roles").Find(&users)
```

### 3. Select Only Required Columns
```go
// Bad: Fetch all columns
db.Find(&users)

// Good: Select specific columns
db.Select("id", "name", "email").Find(&users)
```

### 4. Use Pagination
```go
// Limit results
db.Limit(100).Offset(page * 100).Find(&users)

// Or use cursor-based pagination
db.Where("id > ?", lastID).Limit(100).Find(&users)
```

### 5. Batch Operations
```go
// Bad: Individual inserts
for _, user := range users {
    db.Create(&user)
}

// Good: Batch insert
db.CreateInBatches(users, 100)
```

### 6. Use Exists Instead of Count
```go
// Bad: Expensive count
var count int64
db.Model(&User{}).Where("email = ?", email).Count(&count)
if count > 0 { ... }

// Good: Cheaper exists check
var exists bool
db.Model(&User{}).
    Select("count(*) > 0").
    Where("email = ?", email).
    Find(&exists)
```

## Monitoring & Maintenance

### Enable pg_stat_statements
Already enabled in migration 000004:
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### Query Performance Monitoring
```sql
-- Top 10 slowest queries
SELECT 
    calls,
    mean_exec_time,
    total_exec_time,
    query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Most called queries
SELECT 
    calls,
    mean_exec_time,
    query
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;
```

### Index Usage Statistics
```sql
-- Unused indexes
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Most used indexes
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC
LIMIT 20;
```

### Table Statistics
```sql
-- Table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                   pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Bloat detection
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_table_size(schemaname||'.'||tablename)) AS size,
    n_dead_tup,
    n_live_tup,
    round(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_ratio DESC;
```

### Autovacuum Configuration
Already configured in migration 000004 for high-activity tables:
```sql
ALTER TABLE sessions SET (
    autovacuum_vacuum_scale_factor = 0.05,  -- Vacuum when 5% dead tuples
    autovacuum_analyze_scale_factor = 0.02  -- Analyze when 2% changes
);
```

### Manual Maintenance
```bash
# Vacuum analyze (during low-traffic periods)
VACUUM ANALYZE;

# Vacuum full (requires table lock - use cautiously)
VACUUM FULL notifications;

# Reindex (if index bloat detected)
REINDEX TABLE users;
```

## Caching Strategy

### Redis Caching Layers

#### 1. Session Cache
```go
// Cache sessions in Redis
key := fmt.Sprintf("session:%s", token)
ttl := cfg.JWT.AccessTokenDuration

// Set session in Redis
rdb.Set(ctx, key, sessionJSON, ttl)

// Get from cache first
cached, err := rdb.Get(ctx, key).Result()
if err == nil {
    // Cache hit
    json.Unmarshal([]byte(cached), &session)
    return session, nil
}

// Cache miss - query database
```

#### 2. User Data Cache
```go
// Cache user profiles
key := fmt.Sprintf("user:%s:%s", tenantID, userID)
rdb.Set(ctx, key, userJSON, 5*time.Minute)

// Invalidate on update
rdb.Del(ctx, fmt.Sprintf("user:%s:%s", tenantID, userID))
```

#### 3. Settings Cache
Already implemented in `SettingsService`:
```go
// Cache settings per tenant
key := fmt.Sprintf("settings:%s", tenantID)
rdb.HSet(ctx, key, settingKey, value)
```

#### 4. Query Result Cache
```go
// Cache expensive query results
key := "dashboard:stats:" + tenantID
stats, err := rdb.Get(ctx, key).Result()
if err == nil {
    return stats, nil
}

// Compute and cache
stats := computeStats()
rdb.Set(ctx, key, stats, 1*time.Minute)
```

### Cache Invalidation Strategies

#### 1. TTL-Based (Time to Live)
```go
rdb.Set(ctx, key, value, 5*time.Minute)
```

#### 2. Event-Based
```go
// Invalidate on user update
func (s *UserService) UpdateUser(ctx context.Context, user *User) error {
    err := s.repo.Update(ctx, user)
    if err != nil {
        return err
    }
    
    // Invalidate cache
    s.cache.Del(ctx, "user:"+user.ID.String())
    return nil
}
```

#### 3. Cache-Aside Pattern
```go
// Read-through cache
func (s *Service) Get(ctx context.Context, id string) (*Entity, error) {
    // Try cache first
    if cached, err := s.cache.Get(ctx, id); err == nil {
        return cached, nil
    }
    
    // Cache miss - read from DB
    entity, err := s.repo.Get(ctx, id)
    if err != nil {
        return nil, err
    }
    
    // Store in cache
    s.cache.Set(ctx, id, entity, ttl)
    return entity, nil
}
```

## Performance Testing

### Load Testing with k6
See `scripts/load-test/` for existing k6 scripts.

### Database Benchmarking
```bash
# pgbench - built-in PostgreSQL benchmark
pgbench -i -s 50 minisource  # Initialize with scale factor 50
pgbench -c 10 -j 2 -t 1000 minisource  # 10 clients, 1000 transactions each
```

### Query Profiling
```sql
-- Enable timing
\timing on

-- Explain analyze
EXPLAIN ANALYZE
SELECT u.* FROM users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.tenant_id = 'xxx' AND u.deleted_at IS NULL;
```

## Troubleshooting

### Slow Queries
1. Check `pg_stat_statements` for slow queries
2. Run `EXPLAIN ANALYZE` on slow queries
3. Verify indexes are being used
4. Check for table bloat

### High CPU Usage
1. Check for missing indexes
2. Look for sequential scans in slow queries
3. Verify autovacuum is running
4. Check connection pool settings

### Out of Connections
1. Check `max_connections` in postgresql.conf
2. Review connection pool settings
3. Look for connection leaks (unclosed connections)
4. Monitor `pg_stat_activity`

### Lock Contention
```sql
-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Check blocking queries
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocking_locks.pid AS blocking_pid,
    blocked_activity.query AS blocked_query,
    blocking_activity.query AS blocking_query
FROM pg_locks blocked_locks
JOIN pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

## Best Practices Summary

### DO ✅
- Use indexes for frequently queried columns
- Implement connection pooling
- Cache expensive queries
- Use pagination for large result sets
- Monitor query performance
- Run ANALYZE regularly
- Use partial indexes for filtered queries
- Preload associations to avoid N+1

### DON'T ❌
- Create indexes on every column
- Use `SELECT *` unnecessarily
- Forget to close connections
- Run expensive queries in loops
- Skip query profiling
- Ignore slow query logs
- Use OFFSET for deep pagination
- Create duplicate/redundant indexes

## References
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [GORM Performance](https://gorm.io/docs/performance.html)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Database Indexing Strategies](https://use-the-index-luke.com/)

## Next Steps
1. Run migration 000004 on dev/staging
2. Monitor index usage for 1 week
3. Remove unused indexes
4. Add application-level caching where needed
5. Implement query result caching
6. Set up slow query alerts
