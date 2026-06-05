# E2E API Testing Guide

تست‌های End-to-End با تگ `e2e` علیه سرویس‌های در حال اجرا نوشته شده‌اند.

## پیش‌نیاز

```powershell
cd C:\ActiveProjects\MiniSource\infra
docker compose -f docker-compose.dev.yml up -d

cd C:\ActiveProjects\MiniSource\dev-mocks
go run main.go   # پورت 9191

# هر سرویس را بالا بیاورید (auth, notifier, log, ...)
```

**Admin:** `admin@example.com` / `AdminPass123!`

## اجرای همه تست‌ها

```powershell
powershell -File C:\ActiveProjects\MiniSource\scripts\run-e2e-tests.ps1
```

## اجرای تکی

```powershell
cd auth
go test -tags=e2e ./tests/e2e/... -v -count=1
```

## ساختار

| مسیر | توضیح |
|------|--------|
| `go-common/testing/e2e` | کلاینت HTTP مشترک |
| `{service}/tests/e2e/*_api_test.go` | تست API هر سرویس |
| `dev-mocks/main_test.go` | تست mock Google/Kavenegar |
| `notifier/.../mock_provider_test.go` | تست SMS mock |

## متغیرهای محیط (اختیاری)

- `AUTH_BASE_URL` (پیش‌فرض `http://127.0.0.1:9001`)
- `NOTIFIER_BASE_URL`, `LOG_BASE_URL`, `SCHEDULER_BASE_URL`, ...
- `MOCK_BASE_URL` (`http://127.0.0.1:9191`)

اگر سرویس down باشد، تست‌ها با `t.Skip` رد می‌شوند.

## تست بین‌سرویسی

`auth/tests/e2e/cross_service_test.go`:

- `TestCrossService_TokenValidate_UserAndService` — `GET /api/v1/tokens/validate`
- `TestCrossService_GatewayProxies` — Gateway → Auth/Notifier
- `TestCrossService_CommentWithUserJWT` — Auth JWT روی Comment
- `TestCrossService_AuthNotifier_OTP` — Auth → Notifier (SMS/OTP)

هر سرویس: `Test*_SwaggerRouteSmoke` — تمام مسیرهای **GET** از `docs/swagger.json`

**پس از تغییر Auth یا go-sdk:** سرویس‌های وابسته (auth, comment, ticket, feedback, notifier) را restart کنید.

## تست‌های integration قدیمی

فایل‌های `tests/integration/*` با تگ `integration` هنوز mock محلی Fiber دارند.
برای تست واقعی API از `tests/e2e` استفاده کنید.
