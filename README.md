### How to run the frontend

1. `cd frontend`
2. `npm run dev`

### How to connect to the DB in Docker

1. `cd backend`
2. `docker compose up db backend`
3. Go to the DB tab in VSCode and connect with these credentials:

- Port: 5435
- Host: localhost
- Username: see `.env` file
- Password: see `.env` file
- Database: see `.env` file

### How to run a DB migration

(apply changes that you made in `schema.prisma`, representing changes to the DB tables):

Locally:

1. `cd backend`
2. `docker compose exec backend sh`
3. `npx prisma migrate dev --name name_of_migration`
4. `npx prisma generate`

In Supabase:

1. `cd backend`
2. `docker compose exec backend sh`
3. `DATABASE_URL="<DIRECT_URL_FOR_SUPABASE from backend/.env>" npx prisma migrate deploy`

### How to remove all data from local database

1. `cd backend`
2. `docker compose exec backend sh`
3. `echo 'TRUNCATE "Translation", "ExampleSentence", "Word", "PartOfSpeech", "Language", "Session", "User" RESTART IDENTITY CASCADE;' | npx prisma db execute --stdin`

### Rollback a failed migration in Supabase

1. `DATABASE_URL="<DIRECT_URL_FOR_SUPABASE from backend/.env>" npx prisma migrate resolve --rolled-back "<name-of-migration"` https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing#failed-migration
