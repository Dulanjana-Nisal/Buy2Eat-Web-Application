<div align="center">

# Buy2Eat Backend ( In development stage )

</dev>

REST API for **Buy2Eat**, a food marketplace connecting customers with home-style sellers. It handles authentication (email + OTP, Google sign-in), customer profiles, and favorites. Shops, foods, menus, orders and reviews have data models ready but no endpoints yet.
and full auth system is already developed.

## What already developed

### Authentication System

A production-style authentication service built with Node.js, Express 5, MongoDB and JWT. It supports email and password sign-up with OTP verification, Google sign-in, session management and password recovery. It is designed around the main ways auth systems fail: token theft, brute force, race conditions and partial writes.

## Tech stack

| Area | Technology |
| --- | --- |
| Runtime / framework | Node.js (CommonJS), Express 5 |
| Database | MongoDB with Mongoose 9 |
| Validation | Zod 4 |
| Auth | JWT (access + refresh), bcryptjs, Google OAuth (`google-auth-library`) |
| Security | Helmet, CORS, `express-rate-limit`, httpOnly cookies |
| Email | Nodemailer (Gmail SMTP) |
| Logging | Morgan ( currently not using ) |

## Getting started

### Prerequisites

- Node.js 22+ and npm
- A MongoDB deployment that supports **transactions** (a replica set, or MongoDB Atlas). Registration, password reset and token refresh use multi-document transactions, so a standalone `mongod` will fail.
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for sending emails
- A Google OAuth client ID and secret (Google Cloud Console)

### Install and run

```bash
cd backend
npm install

# create your local env file (see "Environment variables")
cp .env.development.example .env.development.local

npm run dev     # nodemon, auto-restart on changes
npm start       # plain node, for production
```

The server starts on `http://localhost:5000` by default and checks `GET /` for a health message:

```json
{ "message": "Buy2Eat API is running" }
```

## Environment variables

Config is loaded from `.env.<NODE_ENV>.local` inside `backend/` (defaults to `.env.development.local`) and validated with Zod at startup. **If any required value is missing or invalid, the server prints the problems and exits.**

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | No | Default `5000` |
| `NODE_ENV` | No | `development` (default), `production`, `testing`. Must be set in the shell to pick the right env file |
| `MONGO_URI` | No | MongoDB connection string. If unset, the server logs a warning and starts without a database connection. If set but empty, startup fails validation |
| `AGREEMENT_VERSION` | Yes | Terms/Privacy version stored when a user registers |
| `ACCESS_SECRET` | Yes | Min 32 chars. Signs access tokens |
| `REFRESH_SECRET` | Yes | Min 32 chars. Signs refresh tokens. Use a different value from `ACCESS_SECRET` |
| `ACCESS_EXPIRED` | No | Default `15m` |
| `REFRESH_EXPIRED` | No | Default `7d`. Lifetime for "remember me" refresh tokens |
| `EMAIL_USER` | Yes | Gmail address used as sender |
| `EMAIL_APP_PASSWORD` | Yes | Gmail app password (min 10 chars) |
| `GOOGLE_CLIENT_ID` | Yes | Min 32 chars |
| `GOOGLE_CLIENT_SECRET` | Yes | Min 24 chars |
| `CLIENT_URL` | Yes | Frontend origin. Used for CORS and password-reset links |

\* Practically required for anything useful.

Never commit real `.env.*.local` files. They are git-ignored; only the `.example` templates are tracked.

## API overview

Base URL: `/api/v1/buy2eat`

### Auth, `/auth`

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/register-customer` | Start customer registration, sends OTP email |
| POST | `/register-seller` | Start seller registration, sends OTP email |
| POST | `/verify-otp` | Verify the 6-digit OTP, creates the account and logs in |
| POST | `/resend-otp` | Resend OTP (60s cooldown, max 4 resends) |
| POST | `/login` | Email + password login |
| POST | `/google` | Sign in with a Google authorization code |
| POST | `/google/register` | Finish Google sign-up (role, phone, agreement), then verify OTP |
| POST | `/refresh-token` | Rotate the refresh token, get a new access token |
| POST | `/logout` | Log out |
| POST | `/forgot-password` | Email a reset link (valid 15 min) |
| GET | `/verify-reset-password/:token` | Check a reset token is still valid |
| POST | `/reset-password` | Set a new password using the token |


Protected routes expect `Authorization: Bearer <accessToken>`.

## Authentication flow

1. **Register**: submit details, receive a `verification_id`, and an OTP is emailed (5 min expiry, 5 attempts).
2. **Verify OTP**: the account and profile are created in one transaction. The response contains the `accessToken`; the **refresh token is set as an httpOnly cookie**.
3. **Access token** lives 15 minutes. When it expires, call `/refresh-token`. The cookie is sent automatically, so the frontend must use `credentials: 'include'`.
4. **Refresh token rotation**: every refresh revokes the old token and issues a new one in the same family. If a revoked token is reused, the whole family is revoked (theft detection).
5. **Remember me**: refresh cookie lasts 60 days instead of 1 day.

Roles: `customer`, `seller` (and `admin` in the schema).

## Rate limiting

| Limiter | Limit | Applied to |
| --- | --- | --- |
| Global | 200 requests / 15 min per IP | all `/api` routes |
| Login | 8 failed requests / 15 min | login, register, logout |
| Sensitive | 6 failed requests / 15 min | OTP, refresh, Google, password reset |

Successful requests are not counted for the login and sensitive limiters.

## Error format

All errors share one shape, with a request ID you can use when debugging:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_INVALID_FORMAT",
    "category": "VALIDATION_ERROR",
    "message": "Invalid Input data",
    "details": [{ "field": "email", "issue": "Invalid email address" }],
    "timestamp": "2026-11-05T10:15:30.000Z",
    "path": "/api/v1/buy2eat/auth/login",
    "request_id": "b7e1c2a4-..."
  }
}
```

Error codes and their HTTP statuses live in `src/errors/getErrorCodes.js`. Throw them with `new AppError(ErrorCode.X, { message, details })` inside any controller wrapped by `asyncHandler`.

## Project structure

```
backend/
├── src/
│   ├── server.js            # app setup, middleware, routers, startup
│   ├── config/              # env loading + Zod validation
│   ├── databases/           # Mongoose connection
│   ├── routes/              # all routers application need ( currently auth router )
│   ├── controllers/         # request handlers ( currently auth controller )
│   ├── middleware/          # auth, validation, rate limit, request ID, asyncHandler
│   ├── validations/         # Zod schemas
│   ├── models/              # Mongoose models ( all models application need )
│   ├── services/            # otp and token services
│   ├── errors/              # AppError, error codes, central error handler
│   ├── constants/           # status codes, error codes
│   └── utils/               # tokens/cookies, email sending, pagination, helpers
├── .env.development.example
├── .env.production.example
└── package.json
```

### Data models

`Users`, `CustomerProfile`, `SellerProfile`, `RefreshToken`, `RegistrationOtp`, `ResetPassword`, `GoogleRegister` are in use. `Shops`, `Foods`, `FoodMenu`, `Orders`, `Reviews` are defined and waiting for their endpoints.

Temporary collections (OTPs, reset tokens, Google sign-up sessions, refresh tokens) clean themselves up using MongoDB TTL indexes.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start with nodemon |
| `npm start` | Start with node |
| `npm test` | Placeholder, no tests configured yet, it replace zoon |

## Gitignore

node_modules/
.env
.env.*.local

## Contributing

- Work on a feature branch and open a pull request into `dev/qa`.
- Validate every request body with a Zod schema in `src/validations/` and the `validationMiddleware`.
- Throw `AppError` instead of sending ad-hoc error responses, so clients always get the standard error shape.
- Never commit real secrets. Copy the `.example` file and keep your values in `.env.<env>.local`.