# 🏆 SportLog — SRM Student Achievement Portal

Full-stack Node.js application for logging, viewing, and celebrating sports achievements at SRMIST.

---

## Project Structure

```
sportlog/
├── public/                     # ── Frontend (served by Express) ──
│   ├── index.html              #    Main SPA shell
│   ├── css/
│   │   └── styles.css          #    All styles & responsive layout
│   └── js/
│       └── app.js              #    Client-side logic (calls real API)
│
├── src/                        # ── Backend ──
│   ├── server.js               #    Express entry point
│   ├── db.js                   #    SQLite schema & connection
│   ├── config/
│   │   └── index.js            #    Centralised env config
│   ├── middleware/
│   │   ├── auth.js             #    JWT sign / verify / authRequired
│   │   └── errorHandler.js     #    404 + global error handler
│   └── routes/
│       ├── auth.js             #    POST /auth/signup, login, GET /me
│       ├── achievements.js     #    CRUD /achievements
│       ├── stats.js            #    GET /stats
│       └── health.js           #    GET /health
│
├── scripts/                    # ── Utilities ──
│   ├── seed.js                 #    Insert demo user + sample data
│   └── reset-db.js             #    Wipe & recreate database
│
├── data/                       #    SQLite DB lives here (auto-created)
│
├── .env.example                #    Environment variable template
├── .gitignore
├── .dockerignore
├── package.json
├── Procfile                    #    Heroku / Railway / Render
├── render.yaml                 #    Render one-click blueprint
├── docker-compose.yml          #    Docker one-command launch
└── Dockerfile                  #    Production container image
```

---

## Quick Start (Local)

```bash
# 1  Clone & enter the project
cd sportlog

# 2  Copy environment config
cp .env.example .env
#    → Edit .env and set a strong JWT_SECRET

# 3  Install dependencies
npm install

# 4  (Optional) Seed demo data
npm run seed
#    → Creates demo user: RA2111003010001 / Demo@1234

# 5  Start the server
npm run dev        # development (auto-reload)
# or
npm start          # production
```

Open **http://localhost:3000**

---

## API Endpoints

| Method   | Path                 | Auth | Description                    |
|----------|----------------------|------|--------------------------------|
| `GET`    | `/health`            | —    | Server health check            |
| `POST`   | `/auth/signup`       | —    | Create account                 |
| `POST`   | `/auth/login`        | —    | Sign in → JWT token            |
| `GET`    | `/auth/me`           | ✔    | Current user profile           |
| `GET`    | `/achievements`      | —    | List all (with query filters)  |
| `GET`    | `/achievements/:id`  | —    | Single achievement             |
| `POST`   | `/achievements`      | ✔    | Create achievement             |
| `PUT`    | `/achievements/:id`  | ✔    | Update achievement             |
| `DELETE` | `/achievements/:id`  | ✔    | Delete achievement             |
| `GET`    | `/stats`             | —    | Aggregated stats & leaderboard |

**Query filters** for `GET /achievements`: `student_name`, `sport`, `level`, `class`

**Auth header**: `Authorization: Bearer <token>`

---

## Deploy with Docker

```bash
# One command
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

The SQLite database is persisted in a Docker volume (`sportlog-data`).

---

## Deploy to Render

1. Push to a GitHub repo
2. Go to [Render Dashboard](https://dashboard.render.com)
3. **New → Blueprint** → connect repo → it reads `render.yaml` automatically
4. Deploy — Render provisions a persistent disk for the SQLite DB

---

## Deploy to Railway / Heroku

Both platforms detect the `Procfile` automatically.

```bash
# Railway
railway up

# Heroku
heroku create sportlog
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
git push heroku main
```

> **Note**: Heroku's ephemeral filesystem means the SQLite DB resets on each deploy. For persistent Heroku hosting, swap SQLite for PostgreSQL.

---

## Environment Variables

| Variable               | Default                  | Description                       |
|------------------------|--------------------------|-----------------------------------|
| `PORT`                 | `3000`                   | Server port                       |
| `NODE_ENV`             | `development`            | `development` or `production`     |
| `JWT_SECRET`           | *(fallback for dev)*     | **Change in production!**         |
| `JWT_EXPIRES_IN`       | `7d`                     | Token expiry                      |
| `DB_PATH`              | `./data/sportlog.db`     | SQLite file location              |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min)       | Rate limit window                 |
| `RATE_LIMIT_MAX`       | `100`                    | Max requests per window           |
| `CORS_ORIGINS`         | *(empty = allow all)*    | Comma-separated allowed origins   |

---

## Scripts

| Command            | Description                          |
|--------------------|--------------------------------------|
| `npm start`        | Start in production mode             |
| `npm run dev`      | Start with nodemon (auto-reload)     |
| `npm run seed`     | Insert demo user + sample data       |
| `npm run reset-db` | Wipe database and recreate schema    |

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | Vanilla HTML / CSS / JS (single-page app)     |
| Backend    | Node.js, Express 4                            |
| Database   | SQLite via better-sqlite3                     |
| Auth       | JWT (jsonwebtoken) + bcrypt                   |
| Security   | helmet, cors, express-rate-limit, compression |
| Container  | Docker + Docker Compose                       |
