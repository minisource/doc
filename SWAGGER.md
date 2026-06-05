# Swagger UI — MiniSource Services

همه سرویس‌های API اصلی Swagger دارند. UI معمولاً در مسیر زیر است:

`http://127.0.0.1:<PORT>/swagger/index.html`

| سرویس | پورت | Swagger UI | doc.json |
|--------|------|------------|----------|
| Auth | 9001 | http://127.0.0.1:9001/swagger/index.html | `/swagger/doc.json` |
| Notifier | 9002 | http://127.0.0.1:9002/swagger/index.html | `/swagger/doc.json` |
| Gateway | 8080 | http://127.0.0.1:8080/swagger/index.html | `/swagger/doc.json` |
| Log | 5002 | http://127.0.0.1:5002/swagger/index.html | `/swagger/doc.json` |
| Scheduler | 5003 | http://127.0.0.1:5003/swagger/index.html | `/swagger/doc.json` |
| Storage | 5004 | http://127.0.0.1:5004/swagger/index.html | `/swagger/doc.json` |
| Comment | 5010 | http://127.0.0.1:5010/swagger/index.html | `/swagger/doc.json` |
| Ticket | 5011 | http://127.0.0.1:5011/swagger/index.html | `/swagger/doc.json` |
| Feedback | 5012 | http://127.0.0.1:5012/swagger/index.html | `/swagger/doc.json` |
| Payment (.NET) | 4005 | http://127.0.0.1:4005/swagger/index.html | `/swagger/v1/swagger.json` |

## تولید مجدد docs (Go)

```bash
cd auth && make swagger
cd notifier && make swagger   # یا swag init -g cmd/server/main.go -o docs
cd gateway && make swagger
# مشابه: log, scheduler, storage, comment, ticket, feedback
```

## تست خودکار

```powershell
powershell -File C:\ActiveProjects\MiniSource\scripts\test-swagger.ps1

cd auth
go test -tags=e2e ./tests/e2e/... -run TestSwagger -v
```

## یادداشت‌ها

- **Gateway**: مسیر `/swagger` بدون JWT در دسترس است (skip در middleware).
- **CMS (Strapi)**: پنل ادمین جدا است؛ Swagger استاندارد ندارد.
- **Payment**: Swagger در `Program.cs` فعال است؛ spec در `/swagger/v1/swagger.json` (نه `doc.json`). سرویس روی پورت **4005**.
- **پروکسی SOCKS**: اگر `all_proxy` تنظیم شده، `test-swagger.ps1` برای localhost پروکسی را غیرفعال می‌کند؛ در مرورگر معمولاً مشکلی نیست.

### اجرای Payment برای تست Swagger

```powershell
$env:PORT = "4005"
$env:ASPNETCORE_URLS = "http://127.0.0.1:4005"
$env:ConnectionStrings__DefaultConnection = "Host=127.0.0.1;Port=5432;Database=payment;Username=postgres;Password=postgres"
$env:ConnectionStrings__Redis = "127.0.0.1:6379"
cd C:\ActiveProjects\MiniSource\payment\payment
dotnet run
```
