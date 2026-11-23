# MotoGear Backend

Node.js + Express authentication API for the MotoGear showcase website.

## Folder structure

```text
backend/
├── config/
│   └── db.js
├── controllers/
│   └── authController.js
├── routes/
│   └── authRoutes.js
├── middleware/
│   └── authMiddleware.js
├── database/
│   └── schema.sql
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Requirements

- Node.js LTS and npm
- A PostgreSQL database (we will configure Neon in the database phase)

## Setup

1. Copy this `backend` folder into your existing `MotoGear` project.
2. Open a terminal in the `MotoGear/backend` folder.
3. Install packages:

   ```bash
   npm install
   ```

4. Create a file named `.env` by copying `.env.example`.
5. Add your real PostgreSQL connection string and a strong random JWT secret to `.env`.
6. In your PostgreSQL SQL editor, run `database/schema.sql`.
7. Start the API:

   ```bash
   npm run dev
   ```

The API listens on `http://localhost:5000` by default.

## Endpoints

- `GET /` - API status
- `GET /health` - API and database health
- `POST /api/auth/register` - create an account
- `POST /api/auth/login` - authenticate an account

Example registration body:

```json
{
  "email": "rider@example.com",
  "password": "a-strong-password"
}
```

Example login body:

```json
{
  "email": "rider@example.com",
  "password": "a-strong-password"
}
```

## Security notes

- Passwords are stored as bcrypt hashes in `password_hash`; plaintext passwords are never stored.
- Keep `.env` private and never commit it to Git.
- Use HTTPS in production.
- The JWT token is currently returned in the login response; the frontend integration phase must store and send it carefully.
- This backend expects the PostgreSQL table defined in `database/schema.sql`.
- The frontend demo in Phase 1 is not connected to these APIs yet. We will connect it in the integration step.
