# 🏆 SportLog — SRM Student Achievement Portal

Full-stack Node.js application for logging, viewing, and celebrating sports achievements at SRMIST.

---

## Project Structure

```text
sportlog/
├── public/                     # Frontend served by Express
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── src/                        # Backend
│   ├── server.js
│   ├── db.js
│   ├── config/index.js
│   ├── middleware/
│   └── routes/
├── scripts/                    # Seed/reset utilities
├── test/                       # Automated API tests
├── data/                       # SQLite DB (created automatically)
├── .env.example
├── package.json
├── package-lock.json
├── START-WINDOWS.bat           # Windows one-click launcher
├── Dockerfile
├── docker-compose.yml
└── render.yaml
```

---

## Quick Start — Windows / VS Code

**Prerequisites:** Node.js 18+ installed.

1. Open the **repository root** in VS Code — the folder containing `package.json`.
2. Open a terminal in that folder.
3. Run:

```powershell
npm.cmd install
npm.cmd start
```

4. Open **http://localhost:3000** in your browser.

### Important

- Do **not** double-click `public/index.html`.
- Do **not** use VS Code Live Server for this full-stack app.
- Keep the terminal running while using SportLog.
- If PowerShell blocks `npm.ps1`, use `npm.cmd` as shown above. The project scripts themselves are Windows-compatible.

You can also double-click **`START-WINDOWS.bat`** from the repository root. It installs dependencies when needed and starts the server.

---

## Quick Start — macOS / Linux

```bash
npm install
npm start
```

Open **http://localhost:3000**.

For development with automatic restart:

```bash
npm run dev
```

---

## Optional environment configuration

Copy `.env.example` to `.env` if you want to customize settings. Local development works with the built-in development JWT fallback. For production, always set a strong `JWT_SECRET` of at least 32 characters.

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Server health check |
| `POST` | `/auth/signup` | — | Create account |
| `POST` | `/auth/login` | — | Sign in and receive JWT |
| `GET` | `/auth/me` | ✔ | Current user profile |
| `GET` | `/achievements` | — | List achievements with filters |
| `GET` | `/achievements/:id` | — | Get one achievement |
| `POST` | `/achievements` | ✔ | Create achievement |
| `PUT` | `/achievements/:id` | ✔ | Update achievement |
| `DELETE` | `/achievements/:id` | ✔ | Delete achievement |
| `GET` | `/stats` | — | Aggregated statistics |

Achievement filters: `student_name`, `sport`, `level`, `class`.

Authentication uses `Authorization: Bearer <token>`.

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the production server |
| `npm run dev` | Start with nodemon |
| `npm run check` | Run Node syntax/static checks |
| `npm test` | Run automated API tests |
| `npm run seed` | Insert demo user and sample data |
| `npm run reset-db` | Reset the SQLite database |

---

## Deploy with Docker

```bash
docker compose up -d --build
docker compose logs -f
docker compose down
```

The SQLite database is persisted in the Docker volume configured by the compose file.

---

## Deploy to Render

Connect the repository to Render and use the included `render.yaml` blueprint. Set a strong `JWT_SECRET` in the production environment.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Runtime environment |
| `JWT_SECRET` | development fallback | Required at 32+ characters in production |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry |
| `DB_PATH` | `./data/sportlog.db` | SQLite database path |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate-limit window |
| `RATE_LIMIT_MAX` | `100` | Requests per window |
| `CORS_ORIGINS` | empty | Comma-separated allowed origins |

---

## Tech Stack

- Frontend: Vanilla HTML, CSS and JavaScript
- Backend: Node.js + Express
- Database: SQLite via better-sqlite3
- Authentication: JWT + bcrypt
- Security: Helmet, CORS, rate limiting and compression
- Testing: Node's built-in test runner
- CI: GitHub Actions
