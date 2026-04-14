# Context-First German Learning App

A work-in-progress German-learning web app built around learning through real context instead of isolated memorization. I am building it both as a product I would personally use and as a hands-on project for growing from frontend development into full-stack development including database design and devops.

## Quick Links

- Live demo: https://language-learning-iota.vercel.app/
- API docs: https://language-learning-krm7.onrender.com/api/docs
- Note: the backend is on Render's free tier right now, so the first request can take around 15-20 seconds after a period of inactivity.

## Tech Stack

- Frontend: React, TypeScript, Vite,
  - Libraries: React Router, Material UI, Zod, Vercel
- Backend: Node.js, PostgreSQL, Docker, Swagger/OpenAPI, Render, Supabase
  - Libraries: Express.js, Prisma ORM, Zod
- Testing: Vitest
- Developement tools: ESLint, Husky

## What Exists Today

- React + TypeScript frontend with routing and account flows for registration, login, profile editing, and logout.
- Node.js + Express backend with documented REST endpoints and request validation.
- PostgreSQL database and Prisma ORM, and Supabase hosting the deployed database.
- Docker containers for the backend and the DB when working locally
- A German-English dictionary from a dataset of the 5000 most-frequently-used (schriftlich) German words.
- Dictionary endpoints for browsing words and looking up details from either German or English input.
- Automated tests across the frontend API helpers, auth/session utilities, route behavior, and data-import logic.

## Roadmap

### Engineering Maturity

- Add monitoring and health checks.
- Add another deployment environment.
- Increase control and gain better parity between local and production environments by deploying the same Docker image used in local development to production.
- Strengthen security of the authentication flows with email verification and password-reset flows.
- Add authorization and user-specific data boundaries for features such as personal dictionaries and learning history.
- And more as I think of it!

### Product Evolution

- Provide each user a personal dictionary built on top of the base 5,000-word dataset.
- Add agentic workflows so the app can use AI to best answer a learner's question.
- Generate practice paragraphs from target learning vocabulary and track which words a user gets right or wrong.
- Add mistake analysis, spaced repetition of the target learning words, and personalized cheat sheets for things like grammar and word-stems.
- And more as I think of it!

## Word Data

- The vocabulary data in this project is based on a frequency dictionary imported from an Anki deck.
  - Anki deck: https://ankiweb.net/shared/info/1431033948
  - Source reference for the deck: https://www.amazon.com/Frequency-Dictionary-German-Vocabulary-Dictionaries/dp/1138659789

## Technical Info

### How to run the frontend

1. `cd frontend`
2. `npm run dev`

### API docs

- Swagger Docs are available at (locally) `http://localhost:3000/api/docs` and the `<RENDER_URL>/api/docs`

### How to connect to the DB in Docker

1. `cd backend`
2. `docker compose up db backend`
3. Go to the PostgreSQL Extension DB tab in VSCode and connect with these credentials:

- Port: 5435
- Host: localhost
- Username: see `backend/.env` file
- Password: see `backend/.env` file
- Database: see `backend/.env` file

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
2. `DATABASE_URL="<DIRECT_URL_FOR_SUPABASE from backend/.env>" npx prisma migrate deploy`

### Mark a migration as resolved in Supabase (for ex: if you manually updated a table to align it with the dev DB)

1. `DATABASE_URL="<DIRECT_URL_FOR_SUPABASE from backend/.env>" npx prisma migrate resolve --rolled-back "<name-of-migration"` https://www.prisma.io/docs/cli/migrate/resolve#mark-a-migration-as-applied

### Apply data to Supabase database

1. `cd backend`
2. Change `DATABASE_URL` in `backend/.env` to the Supabase Direct connection string
3. Run `npx tsx <path-to-seeding-script>` to append only new import data
4. Run `npx tsx <path-to-seeding-script> --clear-first` to delete existing import tables first and then reseed them
