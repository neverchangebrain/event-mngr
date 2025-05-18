# Event Manager API

<p align="center">
  REST API для управления событиями и участниками на NestJS, Prisma и PostgreSQL.
</p>

## Технологии

- **NestJS** v11
- **TypeScript** v5
- **PostgreSQL** + **Prisma ORM**
- **JWT** (аутентификация)
- **Swagger** (документация)
- **Jest** (тесты)
- **pnpm** (пакетный менеджер)

## Быстрый старт

```bash
pnpm install
cp .env.example .env
# настройте .env
pnpm prisma migrate dev
pnpm dev
```

## Тесты

```bash
pnpm test
```

## Документация API

Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)

## Docker

```bash
docker-compose up -d
```
