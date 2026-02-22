### How to run the frontend

1. `cd frontend`
2. `npm run dev`

### How to connect to the DB in Docker

1. `cd backend`
2. `docker compose up db`
3. Go to the DB tab in VSCode and connect with these credentials:

- Port: 5435
- Host: localhost
- Username: see `.env` file
- Password: see `.env` file
- Database: see `.env` file

### How to run a DB migration

(apply changes that you made in `schema.prisma`, representing changes to the DB tables):

1. `cd backend`
2. `npx prisma migrate dev --name init`
3. `npx prisma generate`
