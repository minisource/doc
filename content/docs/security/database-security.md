# Database Security Hardening

## Overview
This document outlines the database security features implemented in the Minisource Auth and Notifier services.

## Features Implemented

### 1. Row-Level Security (RLS)
PostgreSQL Row-Level Security policies enforce tenant isolation at the database level.

**Enabled Tables:**
- Auth Service: `users`, `roles`, `permissions`, `sessions`, `audit_logs`
- Notifier Service: `notifications`, `notification_templates`, `notification_preferences`, `audit_logs`

**Policy:**
```sql
CREATE POLICY tenant_isolation_users ON users
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Usage:**
Before executing queries, set the tenant context:
```sql
SET app.current_tenant_id = '<tenant_uuid>';
```

This ensures users can only access data from their own tenant.

### 2. Audit Logging
Comprehensive audit trail for all sensitive operations.

**Audit Log Fields:**
- `id`: Unique identifier
- `tenant_id`: Tenant context
- `user_id`: User who performed the action
- `action`: Type of action (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW, EXPORT)
- `entity_type`: Type of entity affected (USER, ROLE, PERMISSION, etc.)
- `entity_id`: ID of the affected entity
- `old_values`: Previous state (JSON)
- `new_values`: New state (JSON)
- `ip_address`: Client IP address
- `user_agent`: Client user agent
- `metadata`: Additional context (JSON)
- `created_at`: Timestamp

**Usage Example:**
```go
// Log a user creation action
auditLogger.LogAction(
    ctx,
    tenantID,
    userID,
    audit.ActionCreate,
    audit.EntityUser,
    &newUserID,
    map[string]interface{}{
        "email": user.Email,
        "role": user.Role,
    },
)
```

**Query Audit Logs:**
```go
filter := &audit.Filter{
    TenantID: tenantID,
    UserID: &userID,
    Action: audit.ActionLogin,
    StartDate: &startDate,
    EndDate: &endDate,
    Limit: 100,
}
logs, err := auditService.Query(ctx, filter)
```

### 3. Audit Columns
Added tracking columns to sensitive tables:

**Columns:**
- `created_by`: User who created the record
- `updated_by`: User who last updated the record
- `deleted_at`: Soft delete timestamp (users table)
- `deleted_by`: User who deleted the record

### 4. Automatic Triggers
Database triggers automatically maintain `updated_at` timestamps:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. Performance Indexes
Optimized indexes for audit queries and tenant isolation:

**Auth Service Indexes:**
```sql
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_tenant_active ON users(tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_tenant_user ON sessions(tenant_id, user_id, expires_at);
CREATE INDEX idx_login_logs_tenant_user ON login_logs(tenant_id, user_id, login_time DESC);
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

**Notifier Service Indexes:**
```sql
CREATE INDEX idx_notifications_tenant_user ON notifications(tenant_id, user_id, created_at DESC);
CREATE INDEX idx_notifications_tenant_status ON notifications(tenant_id, status, created_at DESC);
CREATE INDEX idx_templates_tenant_type ON notification_templates(tenant_id, type, is_active);
```

### 6. Middleware Integration
Audit logging is automatically enabled via HTTP middleware:

**Middleware Configuration:**
```go
// In router setup
if services.Audit != nil {
    app.Use(commonMiddleware.AuditLogger(commonMiddleware.DefaultAuditConfig(services.Audit)))
}
```

**Audit Middleware Features:**
- Skips health checks, metrics, and swagger endpoints
- Only audits sensitive paths (auth, users, roles, permissions)
- Captures HTTP method, path, status code
- Automatically extracts tenant ID and user ID from context
- Maps HTTP methods to audit actions (POST→CREATE, PUT→UPDATE, etc.)
- Extracts entity type from URL path

**Sensitive Paths (Auto-audited):**
- `/api/v1/auth/login`
- `/api/v1/auth/logout`
- `/api/v1/users/*`
- `/api/v1/roles/*`
- `/api/v1/permissions/*`

## Migration Instructions

### Running Migrations

**Auth Service:**
```bash
cd auth
make migrate-up
```

**Notifier Service:**
```bash
cd notifier
make migrate-up
```

### Rollback (if needed)
```bash
# Auth
cd auth
make migrate-down

# Notifier
cd notifier
make migrate-down
```

## Security Best Practices

### 1. Always Use Tenant Context
```go
// Set tenant context for all database operations
db = db.Exec("SET app.current_tenant_id = ?", tenantID)
```

### 2. Enable RLS in Production
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### 3. Regular Audit Log Review
Schedule regular reviews of audit logs to detect:
- Unusual access patterns
- Failed login attempts
- Unauthorized access attempts
- Bulk data operations

### 4. Audit Log Retention
Implement a retention policy:
```sql
-- Delete audit logs older than 1 year
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
```

Consider archiving to cold storage before deletion.

### 5. Monitor Sensitive Operations
Set up alerts for:
- Multiple failed login attempts
- Admin privilege escalations
- Bulk user deletions
- Access from unusual IP addresses

### 6. Secure Audit Logs
Audit logs table should have restricted access:
```sql
-- Only specific roles can access audit logs
REVOKE ALL ON audit_logs FROM PUBLIC;
GRANT SELECT ON audit_logs TO audit_reader_role;
```

## Testing

### Test RLS Policies
```sql
-- Test as tenant A
SET app.current_tenant_id = 'tenant_a_uuid';
SELECT * FROM users; -- Should only see tenant A users

-- Test as tenant B
SET app.current_tenant_id = 'tenant_b_uuid';
SELECT * FROM users; -- Should only see tenant B users
```

### Test Audit Logging
```bash
# Make API calls
curl -X POST http://localhost:9001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: <tenant_uuid>" \
  -d '{"email":"user@example.com","password":"password"}'

# Check audit logs
SELECT * FROM audit_logs 
WHERE tenant_id = '<tenant_uuid>' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Monitoring

### Key Metrics to Track
1. Audit log write rate
2. Failed authentication attempts
3. RLS policy violations (should be zero)
4. Audit log storage growth

### Grafana Dashboard Queries
```promql
# Failed login attempts in last hour
rate(auth_login_failures_total[1h])

# Audit logs created per minute
rate(audit_logs_created_total[1m])
```

## Future Enhancements

### Planned Features
1. **Column-Level Encryption** - Encrypt sensitive fields (PII) using pgcrypto
2. **Audit Log Signing** - Cryptographic signing to prevent tampering
3. **Real-time Alerts** - Webhooks for critical security events
4. **SIEM Integration** - Export audit logs to SIEM systems
5. **Compliance Reports** - Automated GDPR/SOC2 compliance reporting

### Encryption Setup (Future)
```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive columns
ALTER TABLE users ADD COLUMN encrypted_ssn BYTEA;
UPDATE users SET encrypted_ssn = pgp_sym_encrypt(ssn, 'encryption_key');
```

## Compliance

### GDPR Compliance
- Audit logs track all access to personal data (Article 30)
- Soft deletes support right to erasure (Article 17)
- Audit trail provides accountability (Article 5)

### SOC 2 Compliance
- Audit logs provide evidence of access controls
- RLS enforces logical access controls
- Triggers ensure data integrity

### HIPAA Compliance
- Audit logs track all PHI access
- Access controls via RLS
- Encryption ready (future enhancement)

## Troubleshooting

### RLS Not Working
```sql
-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'users';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### Audit Logs Not Being Created
1. Check middleware is enabled in router
2. Verify audit service is initialized
3. Check database permissions
4. Review application logs for errors

### Performance Issues
1. Ensure indexes are created
2. Review slow query log
3. Consider partitioning audit_logs table by date
4. Archive old audit logs

## References

- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Database Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html)
- [NIST Database Security Guidelines](https://csrc.nist.gov/publications/detail/sp/800-123/final)

## Support

For questions or issues, contact the security team or open an issue in the repository.
