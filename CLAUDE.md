# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CRMEB is a full-stack open-source e-commerce system (PHP edition v6.0.0). It is a multi-tenant-capable mall platform with admin backend, mobile (H5/WeChat Mini Program/APP), PC, and customer-service interfaces, all sharing one PHP backend.

## Repository Structure

```
CRMEB/
├── crmeb/                # PHP backend (ThinkPHP 6 framework)
│   ├── app/              # Application code
│   │   ├── adminapi/     # Admin backend API module (controllers, middleware, routes, validators)
│   │   ├── api/          # Frontend/mobile API module
│   │   ├── outapi/       # External/third-party API module (callbacks, webhooks)
│   │   ├── kefuapi/      # Customer-service API module
│   │   ├── model/        # Eloquent/ThinkPHP models (one model per DB table)
│   │   ├── dao/          # Data Access Object layer — wraps model queries with search scopes
│   │   ├── services/     # Business logic layer — composes DAO calls, handles transactions
│   │   ├── jobs/         # Queue job classes consumed by `php think queue:listen`
│   │   ├── listener/     # Event listeners for system-wide events
│   │   ├── http/         # HTTP middleware (CORS, base initialization)
│   │   └── lang/         # Multi-language packs
│   ├── crmeb/            # Core framework library
│   │   ├── basic/        # Base classes: BaseController, BaseModel, BaseManager, BaseJobs, BaseStorage
│   │   ├── services/     # Cross-cutting services: cache, file, pay, sms, upload, express, etc.
│   │   ├── traits/       # Model traits (JwtAuth, Queue)
│   │   ├── utils/        # Utility classes: Json, JwtAuth, Str, Arr, Canvas, Captcha, etc.
│   │   ├── exceptions/   # Exception classes: AdminException, ApiException, AuthException, PayException, etc.
│   │   ├── interfaces/   # Interfaces: JobInterface, ListenerInterface, MiddlewareInterface, ProviderInterface
│   │   └── command/      # Custom commands: Timer, Workerman, Npm, Util
│   ├── config/           # Framework configs: app, database, cache, queue, pay, sms, upload, etc.
│   ├── route/            # Global route definitions (root-level route.php for fallback SPA views)
│   └── public/           # Web root: index.php entry point, admin SPA, H5 SPA, PC SPA (home/)
├── template/
│   ├── admin/            # Admin SPA — Vue 2 + Element UI + Vuex + Vue Router
│   └── uni-app/          # Mobile app — UniApp (Vue 2), builds to H5, WeChat Mini Program, native APP
├── help/                 # Docker files, dev docs, resource images
└── docker-compose files (in help/docker/)
```

## Architecture: Request Lifecycle

```
HTTP Request
  → public/index.php (ThinkPHP 6 entry)
  → Route resolution (route/route.php → app/{module}/route/*.php)
  → Middleware chain (app/middleware.php → module-specific middleware)
  → Controller (app/{module}/controller/)
      → Validate (app/{module}/validate/)
      → Services (app/services/) — business logic, transaction management
          → DAO (app/dao/) — query building, search scopes
              → Model (app/model/) — think\Model ORM
      → Response via crmeb\utils\Json (wraps success()/fail() helpers)
```

### Multi-Module Architecture

CRMEB uses ThinkPHP 6's auto-multi-app mode (`auto_multi_app: true` in `config/app.php`). Each module (`adminapi`, `api`, `outapi`, `kefuapi`) is an independent app with its own controllers, routes, middleware, config, and validators. They share common `model/`, `dao/`, `services/`, `jobs/`, and `listener/` layers.

### Layered Architecture Pattern

All database access follows a strict layering:

1. **Model** (`app/model/`) — extends `crmeb\basic\BaseModel` (which extends `think\Model`). Defines table relationships, search scopes (`searchXxxAttr` methods), and simple accessors/mutators. Models should NOT contain business logic.
2. **DAO** (`app/dao/`) — extends `app\dao\BaseDao`. Each DAO wraps a single model. Provides `search()`, `get()`, `getOne()`, `count()`, `update()`, `save()`, `delete()`, `value()`, `getColumn()`, `bcInc()`/`bcDec()`, `decStockIncSales()`/`incStockDecSales()`, etc. The `search()` method dynamically discovers `searchXxxAttr` scopes on the underlying model via reflection.
3. **Services** (`app/services/`) — extends `app\services\BaseServices`. Injects a DAO via `$this->dao` and delegates simple CRUD calls to it via `__call()`. Contains business logic, transaction coordination (`$this->transaction()`), token creation, and pagination config via `$this->getPageValue()`.
4. **Controller** — calls Services, never DAO directly. Uses `$request->getMore()` for validated input.

## Key Patterns and Conventions

### Request Input: `$request->getMore()`

Always use `app\Request::getMore()` instead of raw `$_POST`/`$_GET`:

```php
// Returns named keys with defaults
$arr = $request->getMore([
    ['name', '123'],        // field 'name' with default '123'
    ['nickname', '0'],
]);

// Returns indexed array with defaults
[$name, $nickname] = $request->getMore([
    ['name', '123'],
    ['nickname', '0'],
], true);
```

### Response Helpers

```php
// Success response
return success('message_key', $data, $replace);
// Error response
return fail('message_key', $data, $replace);
```

These go through `getLang()` for automatic multi-language translation. Return message keys that exist in the language packs.

### Error Handling

Throw exceptions instead of returning error codes in business logic:

```php
throw new AuthException('错误信息', 400);
throw new AdminException('操作失败');
throw new ApiException('您已被禁止登录');
```

Exception classes are defined in `crmeb/exceptions/` and handled by `app/ExceptionHandle.php`.

### System Config

Read system configuration values (stored in DB, managed via admin UI) with:

```php
sys_config('site_url');           // single config value
sys_config('site_url', 'default');
sys_data('group_name', $limit);   // grouped config data
```

### Form Builder

Quickly generate form definitions for admin CRUD pages using the `xaboy/form-builder` library:

```php
$form = create_form('标题', $fields, $url, 'POST');
```

### Code Generation: CRUD

Generate admin CRUD pages via the think command:

```bash
php think crud
```

This auto-generates: model, dao, services, controller, validate, routes, and Vue frontend pages (in `template/admin/src/`). Configured in `config/app.php` (`admin_template_path`, `crud_make`).

## Build and Run Commands

### PHP Backend (`crmeb/`)

```bash
# Install dependencies
cd crmeb && composer install

# Artisan CLI (ThinkPHP console)
php think                    # list all commands

# Queue worker (for async jobs)
php think queue:listen --queue

# Timer/scheduler (auto-receive orders, stock alerts, etc.)
php think timer start --d    # start as daemon
php think timer stop
php think timer restart

# WebSocket server (chat, admin notifications)
php think workerman start --d
php think workerman stop
php think workerman restart

# Code generation
php think crud               # generate CRUD code (interactive)

# Create a service class
php make:services api@user/User
```

### Admin Frontend (`template/admin/`)

```bash
cd template/admin
npm install
npm run dev                  # development with hot reload
npm run build                # production build → dist/
npm run eslint               # lint and fix JS/Vue files
```

### Mobile Frontend (`template/uni-app/`)

```bash
cd template/uni-app
npm install
# Development and building use HBuilderX IDE:
# - Run → choose platform (H5, WeChat Mini Program, APP)
# - Build/Release → choose platform
```

### Docker (Quick Start)

```bash
docker run -d --name crmeb \
  -p 8080:80 -p 3306:3306 -p 6379:6379 \
  ccr.ccs.tencentyun.com/crmebky_php/crmebky:latest
# Admin: http://localhost:8080/admin (admin / crmeb.com)
```

## Environment Configuration

Copy `.env.example` to `.env` in the `crmeb/` directory. Key settings:

- `DATABASE.*` — MySQL connection (prefix: `eb_`)
- `REDIS.*` — Redis connection
- `CACHE.DRIVER` — `redis` or `file`
- `QUEUE.QUEUE_NAME` — queue name prefix
- `APP_DEBUG` — debug mode

Database prefix for all CRMEB tables is `eb_`. The install wizard (`/public/install/`) handles initial setup and imports `crmeb.sql`.

## Critical Runtime Dependencies

- **PHP 7.1–7.4** (NOT PHP 8.x)
- **MySQL 5.7–8.0** (InnoDB engine)
- **Redis** (recommended; falls back to file cache)
- **Supervisor** (for managing queue workers)
- Required PHP extensions: `json`, `curl`, `bcmath`, `mbstring`, `zip`, `simplexml`
- Disabled functions: `proc_open`, `pcntl_signal`, `pcntl_signal_dispatch`, `pcntl_fork`, `pcntl_wait`, `pcntl_alarm`

## PSR-2 / CRMEB Coding Standards

- **Directories and non-class files**: lowercase with underscores (`adminapi/`, `common.php`)
- **Classes/Interfaces/Traits**: PascalCase (`AuthController`, `BaseModel`)
- **Methods/Functions**: camelCase (lowercase first, `getUserName`)
- **Controller methods**: lowercase with underscores (`get_client_ip`)
- **Constants**: UPPER_SNAKE_CASE
- **Config parameters**: lowercase with underscores
- **DB tables and columns**: lowercase with underscores, no leading underscore
- Models must use model classes (NEVER `Db::table()`)
- Complex logic goes in Services, not in Models or Controllers
- All data validation goes in module `validate/` directories
- Use `$request->getMore()` for form input; use dependency injection (`app\Request`) in controller methods
- Error codes and messages should be centralized for multi-language support
- Always add docblocks with `@param` and `@return` for public methods

## Event System

The system has 30+ event anchors defined in `app/event.php`. Key events:

- `OrderCreateAfterListener` — after order creation
- `OrderPaySuccessListener` — after payment success
- `OrderDeliveryListener` — after order shipping
- `OrderTakeListener` — after order receipt confirmation
- `UserRegisterListener` — after user registration
- `UserLevelListener` — user level upgrade
- `CustomNoticeListener` — custom message notifications
- `CustomEventListener` — custom business events

Custom events can be configured through the admin UI. Trigger events with `event('EventName', $data)`.

## Key Third-Party Integrations

- **WeChat**: `overtrue/wechat` (EasyWeChat) — Official Account, Mini Program, Payment
- **Cloud Storage**: Alibaba OSS, Tencent COS, Qiniu, JD Cloud, AWS S3
- **Payment**: WeChat Pay, Alipay, integrated via `crmeb/easypay`
- **CAPTCHA**: `fastknife/ajcaptcha` — slider and click-word puzzles
- **Spreadsheets**: `phpoffice/phpspreadsheet` — Excel import/export
- **Form Builder**: `xaboy/form-builder` — programmatic form generation
- **JWT**: `firebase/php-jwt` — API token authentication
- **Workerman**: `workerman/workerman` — WebSocket server for chat & notifications
- **Queue**: `topthink/think-queue` — async job processing
- **QR Codes**: `dh2y/think-qrcode`

## Notes

- The install wizard at `/public/install/` generates `.env` and imports the database. After installation, delete the `install/` directory or create `install.lock`.
- Admin panel URL path is configurable via `app.admin_prefix` (default: `admin`).
- PC frontend is served from `public/home/index.html` (Nuxt.js SPA).
- Mobile H5 frontend is served from `public/index.html` (UniApp H5 build).
- The `crmeb/crmeb/` directory is the project's core library — it extends ThinkPHP 6 with CRMEB-specific abstractions (BaseManager for driver-based services, BaseStorage for cloud storage adapters, BaseJobs for queue jobs).
- The project uses `topthink/think-multi-app` for the multi-module architecture and auto-discovers modules via directory convention.
