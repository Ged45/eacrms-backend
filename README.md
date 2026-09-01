# EACRMS Backend

REST API for the Ethiopian Athletics Club Registration & Management System (EACRMS). The service manages users, athletes, coaches, clubs, events, federation policies, Fayda identity verification, payments, news, audit history, and event QR check-ins.

## Contents

- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Run Locally](#run-locally)
- [Database](#database)
- [Docker](#docker)
- [API](#api)
- [Authentication and Authorization](#authentication-and-authorization)
- [Uploads](#uploads)
- [Testing and Validation](#testing-and-validation)
- [CI/CD](#cicd)
- [Production Notes](#production-notes)

## Technology Stack

- Node.js 22 and TypeScript
- Express 5
- PostgreSQL 17
- Prisma 7 with the PostgreSQL adapter
- JWT access tokens and bcrypt password hashing
- Zod request validation
- Redis via `ioredis` for runtime caching or rate-limit support
- Swagger UI and OpenAPI 3 documentation
- Docker Compose for local and production deployments
- Brevo/Postmark-compatible email integration and Africa's Talking SMS integration

## Features

- User registration, login, current-user lookup, and logout
- Email and phone verification flows
- Fayda verification flows for self-registration, athletes, and coaches
- Athlete self-registration, club-admin registration, profiles, applications, personal bests, training logs, and weight logs
- Club and coach registration, approval, rejection, activation, suspension, and administration
- Event creation, approval workflows, policy enforcement, athlete registration, and status history
- QR token generation and event attendee check-in
- Mock Telebirr payment registration, webhook processing, payment status, and history
- Federation policy creation, assignment, audit history, and relevant-policy lookup
- Public and administrative news management
- Role/permission-based access control and audit logging
- Image uploads for athlete profile photos and news articles

## Project Structure

```text
.
├── .github/workflows/       # CI and container deployment workflows
├── prisma/
│   ├── migrations/          # PostgreSQL migration history
│   ├── schema.prisma        # Database models and enums
│   └── seed.ts              # Roles, permissions, admin, and sample news
├── src/
│   ├── app.ts               # Express app, middleware, Swagger, and global errors
│   ├── server.ts            # HTTP server entry point
│   ├── docs/                # OpenAPI fragments and Swagger configuration
│   ├── errors/              # Application error types
│   ├── lib/                 # Prisma, Redis, email, and upload integrations
│   ├── middleware/          # Auth, authorization, validation, rate limiting
│   ├── modules/             # Feature modules and route handlers
│   ├── routes/              # Versioned route composition
│   └── utils/               # JWT, phone, and authentication helpers
├── tests/                   # Node test-suite files
├── Dockerfile               # Multi-stage production image
├── docker-compose.yml       # Local PostgreSQL and application stack
└── docker-compose.prod.yml  # Image-based production stack
```

## Prerequisites

- Node.js 22 or later
- npm
- PostgreSQL 17, or Docker Desktop
- A `DATABASE_URL` pointing to a PostgreSQL database
- Git (for migrations and source control)

Redis is supported by the application and defaults to `redis://localhost:6379`, but Redis is not declared in the current Compose files. Run it separately when a feature requires it, or provide an externally managed `REDIS_URL`.

## Configuration

Copy the example configuration and replace every placeholder:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

### Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. Use `postgres` as the host inside Compose. |
| `PORT` | No | HTTP port; defaults to `5000`. |
| `NODE_ENV` | No | `development`, `test`, or `production`. |
| `JWT_ACCESS_SECRET` | Yes | Secret used to sign access tokens. |
| `JWT_REFRESH_SECRET` | Yes | Secret reserved for refresh-token signing. |
| `JWT_ACCESS_EXPIRES_IN` | No | Access-token lifetime; defaults to `15m`. |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh-token lifetime; defaults to `7d`. |
| `REDIS_URL` | No | Redis connection string; defaults to `redis://localhost:6379`. |
| `BREVO_API_KEY` | Email | Brevo API key for verification email delivery. |
| `BREVO_SENDER_EMAIL` | Email | Brevo sender email address. |
| `BREVO_SENDER_NAME` | No | Sender display name; defaults to `EACRMS`. |
| `POSTMARK_API_TOKEN` | Email alternative | Postmark token when using the Postmark helper. |
| `POSTMARK_SENDER` | No | Postmark sender; defaults to `onboarding@postmarkapp.com`. |
| `AT_USERNAME` | SMS | Africa's Talking username; `sandbox` is suitable for sandbox testing. |
| `AT_API_KEY` | SMS | Africa's Talking API key. |
| `AT_SENDER_ID` | No | SMS sender ID; defaults to `EACRMS`. |
| `EXPOSE_OTP` | No | Exposes Fayda OTP responses when set to `true`; keep disabled in production. |
| `MOCK_PAYMENT_WEBHOOK_SECRET` | Payments | Secret for the mock payment webhook. |
| `UPLOAD_BASE_URL` | No | Public base URL used to build uploaded-file URLs. |

The committed `.env.example` contains provider-specific notes and safe placeholders. Never commit `.env`, API keys, JWT secrets, or production database credentials.

## Run Locally

Install dependencies:

```bash
npm ci
```

Start PostgreSQL and create the database, then configure `.env` with a local connection string such as:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eacrms
```

Generate the Prisma client, apply migrations, and seed development data:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Start the development server with file watching:

```bash
npm run dev
```

The server listens on `http://localhost:5000` by default. Override the port with `PORT`.

Available npm scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Run `src/server.ts` with `tsx` watch mode. |
| `npm run build` | Compile TypeScript from `src/` to `dist/`. |
| `npm start` | Run the compiled server from `dist/server.js`. |

## Database

The Prisma schema models users and RBAC (`User`, `Role`, `Permission`), sports, athletes, coaches, clubs, verification records, events, event attendees, QR tokens, registrations, payments, policies, audit logs, and news.

Useful Prisma commands:

```bash
# Validate schema and generate the client
npx prisma validate
npx prisma generate

# Apply existing migrations
npx prisma migrate deploy

# Create a migration during development
npx prisma migrate dev --name describe_change

# Seed roles, permissions, the development super admin, and sample news
npx prisma db seed

# Inspect the database in Prisma Studio
npx prisma studio
```

The seed creates a development super administrator:

```text
Email:    admin@eacrms.local
Password: ChangeMe123!
```

Change or remove this account before using a deployed environment. The seed also creates roles, permissions, their assignments, and sample news articles.

## Docker

### Local Compose

The local Compose file starts PostgreSQL and builds the application image:

```bash
docker compose up --build
```

The API is exposed at `http://localhost:5000`. PostgreSQL is exposed at port `5432`, and the app container also publishes port `5555` for Prisma tooling. The application container waits for PostgreSQL health before starting and runs migrations and the seed command as part of its startup command.

Stop the stack while retaining database data:

```bash
docker compose down
```

Remove the database volume as well (destructive):

```bash
docker compose down -v
```

### Production Compose

`docker-compose.prod.yml` runs the image identified by `IMAGE_NAME:IMAGE_TAG`, persists PostgreSQL in a named volume, and maps `HOST_PORT` to container port `5000`:

```bash
IMAGE_NAME=ghcr.io/your-owner/eacrms-backend IMAGE_TAG=latest \
	docker compose -f docker-compose.prod.yml up -d
```

For production, provide secrets through the server environment or an untracked `.env` file. Do not use the development defaults for passwords, JWT secrets, or webhook authentication.

## API

All application routes are versioned under `/api/v1`.

| Area | Route prefix | Notes |
| --- | --- | --- |
| Health | `/health` | Basic service status. |
| Authentication | `/auth` | Register, login, refresh placeholder, logout, and current user. |
| Verification | `/auth/verify` | Email, phone, resend, and verification status. |
| Fayda | `/fayda` | Stateless and authenticated identity verification flows. |
| Athletes | `/athletes` | Public directory, registration, profiles, administration, and athlete records. |
| Clubs | `/clubs` | Registration, verified directory, and administrative workflows. |
| Coaches | `/coaches` | Registration, profile, and administrative workflows. |
| Events | `/events` | Published events, event management, registration, policy checks, and check-in. |
| Payments | `/payments` | Mock webhook, payment status, and payment history. |
| Policies | `/policies` | Federation policies, assignments, and audit logs. |
| Users | `/users` | Administrative user activation, deactivation, listing, and deletion. |
| Metadata | `/meta/registration-options` | Public registration options such as sports and clubs. |
| News | `/news` | Public news plus authenticated administrative management. |

Interactive API documentation is available at:

- Swagger UI: `http://localhost:5000/api-docs`
- OpenAPI JSON: `http://localhost:5000/api-docs.json`
- Service status: `http://localhost:5000/`
- Health status: `http://localhost:5000/api/v1/health`

The OpenAPI source is assembled in `src/docs/swagger.ts` and its YAML fragments. Use Swagger UI for request schemas, response examples, and the complete endpoint list.

## Authentication and Authorization

Protected endpoints expect a bearer access token:

```http
Authorization: Bearer <access-token>
```

Authentication is handled by JWT middleware. Authorization is permission-based; examples include `athlete:view`, `event:approve`, `event:checkin`, `policy:update`, and `news:create`. Roles and their initial permission assignments are created by `prisma/seed.ts`.

Registration and verification endpoints are validated with Zod. Validation failures use a structured response containing `success`, `message`, and field-level `errors`. Application errors use the global Express error handler.

## Uploads

Uploaded files are served from `/uploads`. Supported upload routes include:

- `POST /api/v1/athletes/profile/photo` with multipart field `file` for the authenticated athlete's photo.
- `POST /api/v1/news/upload/image` with multipart field `file` for an authorized news image.
- `POST /api/v1/news/upload/images` with multipart field `files` for up to 10 news images.

Upload handlers enforce rate limits and a 5 MB file-size limit. Configure `UPLOAD_BASE_URL` when the API is accessed through a public hostname or reverse proxy.

## Testing and Validation

The repository currently contains Node's built-in test runner tests and the CI workflow validates the main build path:

```bash
npx prisma generate
npx prisma validate
npm run build
node --test
```

The checked-in test suite includes authentication-contract and audit behavior checks. The current `package.json` does not define an npm `test` script, so invoke the test runner directly as shown above.

## CI/CD

### Continuous Integration

`.github/workflows/ci.yml` runs on pushes to `main`, pull requests, and reusable workflow calls. It:

1. Starts PostgreSQL 17 as a GitHub Actions service.
2. Installs dependencies with `npm ci`.
3. Generates the Prisma client.
4. Validates the Prisma schema.
5. Compiles TypeScript with `npm run build`.

### Container Deployment

`.github/workflows/deploy.yml` runs on pushes to `main` or manually through `workflow_dispatch`. It builds the multi-stage Docker image, pushes both the commit SHA tag and `latest` to GHCR, then connects to the deployment server over SSH and runs the production Compose file.

The deployment requires these GitHub secrets:

| Secret | Purpose |
| --- | --- |
| `DEPLOY_HOST` | SSH host. |
| `DEPLOY_USER` | SSH user. |
| `DEPLOY_PORT` | Optional SSH port. |
| `SSH_PRIVATE_KEY` | Private key for the deployment user. |
| `GHCR_USERNAME` | GHCR login username on the server. |
| `GHCR_TOKEN` | GHCR token on the server. |

The target server must contain Docker Compose, the production Compose file, and an untracked environment file with database and application secrets. See [DEPLOYMENT.md](DEPLOYMENT.md) for server preparation, backups, monitoring, and rollback guidance.

## Production Notes

- The Docker entrypoint runs `prisma migrate deploy` and `prisma db seed` before starting the server. Review this behavior and backup the database before production migrations.
- `POST /api/v1/auth/refresh` currently returns HTTP `501` and is not implemented; clients should not rely on refresh-token rotation yet.
- Fayda OTPs and verification codes are exposed in non-production responses. Keep `EXPOSE_OTP` unset or `false` in production.
- Payment integration is intentionally a mock provider (`MOCK_TELEBIRR`). It is not a live Telebirr gateway.
- Place TLS, authentication policy, request logging, and rate-limit monitoring at the deployment boundary as appropriate for your environment.
- Verify the deploy workflow and server environment together before enabling automatic production deployment: the workflow exports `EACRMS_IMAGE`, while `docker-compose.prod.yml` resolves its image from `IMAGE_NAME` and `IMAGE_TAG`. Align those variables in the deployment setup so the intended image is pulled.

## Related Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - detailed production server and operations guide
- [README-deploy.md](README-deploy.md) - concise production deployment checklist
- [Postman collections](postman/collections/) - API request collections
- [Prisma schema](prisma/schema.prisma) - database source of truth
