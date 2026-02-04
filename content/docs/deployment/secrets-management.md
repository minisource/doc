# Secrets Management

## Overview
This guide covers secure management of sensitive configuration like API keys, database passwords, and JWT secrets.

## Secret Providers

### 1. Environment Variables (Development)
```bash
export DB_PASSWORD="your-password"
export JWT_SECRET="your-jwt-secret"
export REDIS_PASSWORD="your-redis-password"
```

**Pros:**
- Simple for local development
- No additional infrastructure

**Cons:**
- Not suitable for production
- Can leak in logs/process listings

### 2. Docker Secrets (Production)
```yaml
# docker-compose.yml
services:
  auth:
    secrets:
      - db_password
      - jwt_secret
      - redis_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  redis_password:
    file: ./secrets/redis_password.txt
```

**Access in Code:**
```go
provider := config.NewDockerSecretProvider()
password, err := provider.GetSecret("DB_PASSWORD")
```

**Pros:**
- Native Docker/Kubernetes support
- Encrypted at rest
- Limited to authorized containers

**Cons:**
- Requires Docker Swarm or Kubernetes

### 3. File-Based Secrets (Simple Production)
```json
// secrets.json
{
  "DB_PASSWORD": "your-password",
  "JWT_SECRET": "your-jwt-secret",
  "REDIS_PASSWORD": "your-redis-password"
}
```

**Usage:**
```go
provider, err := config.NewFileSecretProvider("/etc/secrets/secrets.json")
if err != nil {
    log.Fatal(err)
}
config.LoadSecretsFromProvider(cfg, provider)
```

**Security:**
```bash
# Restrict file permissions
chmod 600 /etc/secrets/secrets.json
chown app:app /etc/secrets/secrets.json
```

### 4. Chain Provider (Fallback Strategy)
```go
// Try Docker secrets first, fallback to env vars
provider := config.NewChainSecretProvider(
    config.NewDockerSecretProvider(),
    &config.EnvSecretProvider{},
)

config.LoadSecretsFromProvider(cfg, provider)
```

## Kubernetes Secrets

### Create Secret
```bash
kubectl create secret generic auth-secrets \
  --from-literal=db-password='your-password' \
  --from-literal=jwt-secret='your-jwt-secret' \
  --from-literal=redis-password='your-redis-password'
```

### Mount as Environment Variables
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  template:
    spec:
      containers:
      - name: auth
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: db-password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: jwt-secret
```

### Mount as Files
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  template:
    spec:
      containers:
      - name: auth
        volumeMounts:
        - name: secrets
          mountPath: /run/secrets
          readOnly: true
      volumes:
      - name: secrets
        secret:
          secretName: auth-secrets
```

## AWS Secrets Manager (Enterprise)

### Setup
```bash
# Install AWS CLI
aws secretsmanager create-secret \
    --name minisource/auth/db-password \
    --secret-string "your-password"
```

### Integration (Future)
```go
// Note: Not yet implemented, but planned
type AWSSecretProvider struct {
    client *secretsmanager.Client
    region string
}

func (p *AWSSecretProvider) GetSecret(key string) (string, error) {
    input := &secretsmanager.GetSecretValueInput{
        SecretId: aws.String(fmt.Sprintf("minisource/auth/%s", key)),
    }
    result, err := p.client.GetSecretValue(context.TODO(), input)
    if err != nil {
        return "", err
    }
    return *result.SecretString, nil
}
```

## Azure Key Vault (Enterprise)

### Setup
```bash
# Create Key Vault
az keyvault create --name minisource-vault --resource-group minisource

# Add secrets
az keyvault secret set --vault-name minisource-vault --name db-password --value "your-password"
```

### Integration (Future)
```go
// Note: Not yet implemented, but planned
type AzureKeyVaultProvider struct {
    client *keyvault.Client
    vaultURL string
}
```

## HashiCorp Vault (Enterprise)

### Setup
```bash
# Start Vault
vault server -dev

# Enable KV secrets engine
vault secrets enable -path=minisource kv-v2

# Write secrets
vault kv put minisource/auth db-password="your-password" jwt-secret="your-secret"
```

### Integration (Future)
```go
// Note: Not yet implemented, but planned
type VaultSecretProvider struct {
    client *vault.Client
    path   string
}
```

## Best Practices

### 1. Never Commit Secrets
```gitignore
# .gitignore
.env
*.key
*.pem
secrets/
secrets.json
*password*
*secret*
```

### 2. Rotate Secrets Regularly
```bash
# Example rotation script
#!/bin/bash
NEW_SECRET=$(openssl rand -hex 32)
kubectl set env deployment/auth-service JWT_SECRET=$NEW_SECRET
```

### 3. Use Strong Secrets
```bash
# Generate strong secrets
openssl rand -hex 32  # 256-bit key
openssl rand -base64 48  # 384-bit key
```

### 4. Limit Secret Access
```bash
# Kubernetes RBAC
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get"]
  resourceNames: ["auth-secrets"]
```

### 5. Audit Secret Access
```yaml
# Enable audit logging
apiVersion: v1
kind: Event
type: Warning
reason: SecretAccessed
message: "Secret auth-secrets accessed by pod auth-xyz"
```

## Secret Rotation Strategy

### JWT Secret Rotation
```go
// Support multiple JWT secrets for gradual rotation
type JWTConfig struct {
    Secret    string   // Current secret for signing
    OldSecrets []string // Previous secrets for validation
}

func ValidateToken(token string, cfg *JWTConfig) error {
    // Try current secret
    if err := validate(token, cfg.Secret); err == nil {
        return nil
    }
    
    // Try old secrets
    for _, secret := range cfg.OldSecrets {
        if err := validate(token, secret); err == nil {
            return nil // Valid but needs refresh
        }
    }
    
    return errors.New("invalid token")
}
```

### Database Password Rotation
```bash
# 1. Add new user with new password
CREATE USER auth_new WITH PASSWORD 'new-password';
GRANT ALL PRIVILEGES ON DATABASE auth TO auth_new;

# 2. Update application config
kubectl set env deployment/auth DB_PASSWORD='new-password' DB_USER='auth_new'

# 3. Wait for rollout
kubectl rollout status deployment/auth

# 4. Remove old user
DROP USER auth_old;
```

## Monitoring & Alerts

### Secret Expiration Alerts
```yaml
# Prometheus alert
- alert: SecretExpiringSoon
  expr: secret_expiration_timestamp - time() < 7 * 24 * 3600
  annotations:
    summary: "Secret {{ $labels.secret_name }} expires in < 7 days"
```

### Failed Secret Access
```go
// Log failed secret access
if _, err := provider.GetSecret(key); err != nil {
    logger.Error("Failed to access secret", 
        "key", key,
        "error", err,
        "provider", providerType,
    )
    metrics.IncrementSecretAccessFailure(key)
}
```

## Troubleshooting

### Secret Not Found
```bash
# Check secret exists
kubectl get secret auth-secrets -o yaml

# Verify mount
kubectl exec -it auth-pod -- ls -la /run/secrets/
```

### Permission Denied
```bash
# Check file permissions
ls -l /etc/secrets/secrets.json

# Fix permissions
chmod 600 /etc/secrets/secrets.json
chown 1000:1000 /etc/secrets/secrets.json  # Match container user
```

### Secret Not Loading
```go
// Add debug logging
logger.Info("Loading secrets",
    "provider", providerType,
    "secret_count", len(secretKeys),
)
```

## Migration Guide

### From Environment to Docker Secrets

**Before:**
```yaml
services:
  auth:
    environment:
      - DB_PASSWORD=password123
```

**After:**
```yaml
services:
  auth:
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```

```bash
# Create secret
echo "password123" | docker secret create db_password -
```

### From Files to Kubernetes Secrets

**Before:**
```dockerfile
COPY secrets.json /etc/secrets/
```

**After:**
```yaml
kubectl create secret generic auth-secrets \
  --from-file=secrets.json

# Mount in deployment
volumeMounts:
- name: secrets
  mountPath: /etc/secrets
  readOnly: true
volumes:
- name: secrets
  secret:
    secretName: auth-secrets
```

## Security Checklist

- [ ] No secrets in Git repository
- [ ] Secrets have restrictive file permissions (600)
- [ ] Using encryption at rest
- [ ] Secrets rotation policy defined
- [ ] Audit logging enabled
- [ ] Least privilege access
- [ ] Secrets backed up securely
- [ ] Monitoring and alerts configured
- [ ] Development secrets different from production
- [ ] Secret expiration dates tracked

## References
- [12-Factor App: Config](https://12factor.net/config)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
