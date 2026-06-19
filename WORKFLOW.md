# Рабочий процесс

## Переменные окружения

| Переменная                  | Тип      | Описание                                                    |
|-----------------------------|----------|-------------------------------------------------------------|
| `PORT`                      | `number` | Порт HTTP-сервера. По умолчанию `3000`.                     |
| `NODE_ENV`                  | `string` | Окружение запуска: `development`, `production` или `test`.  |
| `POSTGRES_HOST`             | `string` | Хост PostgreSQL.                                            |
| `POSTGRES_PORT`             | `number` | Порт PostgreSQL.                                            |
| `POSTGRES_USERNAME`         | `string` | Пользователь PostgreSQL.                                    |
| `POSTGRES_PASSWORD`         | `string` | Пароль пользователя PostgreSQL.                             |
| `POSTGRES_DATABASE`         | `string` | Имя базы данных PostgreSQL.                                 |
| `ENCRYPTION_KEY`            | `string` | Ключ шифрования чувствительных колонок. Минимум 32 символа. |
| `AMO_CLIENT_ID`             | `string` | ID OAuth-интеграции amoCRM.                                 |
| `AMO_CLIENT_SECRET`         | `string` | Секретный ключ OAuth-интеграции amoCRM.                     |
| `AMO_REDIRECT_URI`          | `string` | Redirect URI OAuth-интеграции amoCRM.                       |
| `AMO_INTEGRATION_BASE_URL`  | `string` | Базовый URL интеграции amoCRM.                              |
| `AMO_UNINSTALL_WEBHOOK_URL` | `string` | URL хука отключения интеграции amoCRM.                      |

## База данных

TypeORM настраивается через Nest `ConfigModule`.
Data source для CLI находится в `src/data-source.ts`.

## Конфигурация

Конфигурация приложения вынесена в `src/config/config.module.ts`.
Валидация переменных окружения выполняется через Joi в `src/config/config.schema.ts`.
