# Рабочий процесс

## Переменные окружения

| Переменная          | Тип      | Описание                                                   |
|---------------------|----------|------------------------------------------------------------|
| `PORT`              | `number` | Порт HTTP-сервера. По умолчанию `3000`.                    |
| `NODE_ENV`          | `string` | Окружение запуска: `development`, `production` или `test`. |
| `POSTGRES_HOST`     | `string` | Хост PostgreSQL.                                           |
| `POSTGRES_PORT`     | `number` | Порт PostgreSQL.                                           |
| `POSTGRES_USERNAME` | `string` | Пользователь PostgreSQL.                                   |
| `POSTGRES_PASSWORD` | `string` | Пароль пользователя PostgreSQL.                            |
| `POSTGRES_DATABASE` | `string` | Имя базы данных PostgreSQL.                                |

## База данных

TypeORM настраивается через Nest `ConfigModule`.
Data source для CLI находится в `src/data-source.ts`.

## Конфигурация

Конфигурация приложения вынесена в `src/config/config.module.ts`.
Валидация переменных окружения выполняется через Joi в `src/config/config.schema.ts`.
