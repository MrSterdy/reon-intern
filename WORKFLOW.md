# Рабочий процесс

## Переменные окружения

| Переменная                        | Тип      | Описание                                                    |
|-----------------------------------|----------|-------------------------------------------------------------|
| `PORT`                            | `number` | Порт HTTP-сервера. По умолчанию `3000`.                     |
| `NODE_ENV`                        | `string` | Окружение запуска: `development`, `production` или `test`.  |
| `POSTGRES_HOST`                   | `string` | Хост PostgreSQL.                                            |
| `POSTGRES_PORT`                   | `number` | Порт PostgreSQL.                                            |
| `POSTGRES_USERNAME`               | `string` | Пользователь PostgreSQL.                                    |
| `POSTGRES_PASSWORD`               | `string` | Пароль пользователя PostgreSQL.                             |
| `POSTGRES_DATABASE`               | `string` | Имя базы данных PostgreSQL.                                 |
| `ENCRYPTION_KEY`                  | `string` | Ключ шифрования чувствительных колонок. Минимум 32 символа. |
| `AMO_CLIENT_ID`                   | `string` | ID OAuth-интеграции amoCRM.                                 |
| `AMO_CLIENT_SECRET`               | `string` | Секретный ключ OAuth-интеграции amoCRM.                     |
| `AMO_INTEGRATION_BASE_URL`        | `string` | Базовый URL интеграции amoCRM.                              |
| `AMO_ERROR_TASK_TYPE_ID`          | `number` | ID типа задачи amoCRM для ошибок проверки сделки.           |
| `AMO_CHECK_TASK_TYPE_ID`          | `number` | ID типа задачи amoCRM для проверки стоимости услуг.         |

## База данных

TypeORM настраивается через Nest `ConfigModule`.
Data source для CLI находится в `src/data-source.ts`.

Для локального запуска через Docker используется PostgreSQL 18. Volume монтируется в `/var/lib/postgresql`, потому что в официальном образе PostgreSQL 18 `PGDATA` расположен внутри версионированного каталога `/var/lib/postgresql/18/docker`.

## Конфигурация

Конфигурация приложения вынесена в `src/config/config.module.ts`.
Валидация переменных окружения выполняется через Joi в `src/config/config.schema.ts`.

## Локальный запуск через Docker

1. Скопировать пример переменных окружения:

```bash
cp .env.example .env
```

2. Заполнить в `.env` реальные значения amoCRM:

- `AMO_CLIENT_ID`
- `AMO_CLIENT_SECRET`
- `AMO_INTEGRATION_BASE_URL`
- `AMO_ERROR_TASK_TYPE_ID`
- `AMO_CHECK_TASK_TYPE_ID`

3. Запустить приложение и PostgreSQL:

```bash
docker compose -f docker-compose/docker-compose.dev.yml up --build
```

Dev-стек собирает backend через `Dockerfile.dev` и запускает приложение командой `npm run start:dev`.

Backend внутри Docker подключается к PostgreSQL по хосту `postgres`. Для запуска приложения или миграций с хоста используется значение `POSTGRES_HOST=localhost`.

4. Запустить production-стек:

```bash
docker compose --env-file .env.production -f docker-compose/docker-compose.prod.yml up --build -d
```

Production-стек собирает backend через `Dockerfile.prod`, запускает приложение командой `npm run start:prod` и использует отдельный named volume `postgres-reon-practice-prod-data`. Файл `.env.production` передается только через `--env-file`, не подключается через `env_file` и не должен попадать в Git. PostgreSQL в production не публикуется на хост и доступен только внутри Docker-сети.

5. Остановить dev-контейнеры:

```bash
docker compose -f docker-compose/docker-compose.dev.yml down
```

6. Остановить production-контейнеры:

```bash
docker compose --env-file .env.production -f docker-compose/docker-compose.prod.yml down
```

Данные PostgreSQL сохраняются в volume `postgres-reon-practice-data` для dev-стека и `postgres-reon-practice-prod-data` для production-стека.

## Миграции

Перед запуском миграций убедиться, что PostgreSQL запущен и `.env` заполнен.

```bash
npm run migration:run
```
