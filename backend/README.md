# Eazepay Backend Monorepo

This folder contains a complete, portable backend scaffold for Eazepay, designed to be moved to a separate GitHub repository. It includes an API Gateway, multiple services across different stacks, local development with Docker Compose, and minimal example endpoints.

Contents
- gateway/api-gateway: Node.js (TypeScript) reverse proxy and aggregation layer
- services/identity-service: Node.js (TypeScript) auth and identity skeleton
- services/transaction-service-java: Spring Boot transaction skeleton
- services/wallet-service-go: Go HTTP service skeleton
- services/biometric-service-python: FastAPI biometric verification skeleton
- docker-compose.yml: Orchestrates services for local development
- scripts: Helper scripts for running and transferring the backend folder

Quick start
1. Install Docker Desktop
2. Create `.env` from `.env.example`
3. Run `docker compose up --build`
4. Open `http://localhost:8080` (API Gateway health) and service health endpoints:
   - Identity: `http://localhost:8000/health`
   - Transaction (Java): `http://localhost:8002/health`
   - Wallet (Go): `http://localhost:8003/health`
   - Biometric (Python): `http://localhost:8001/health`

Transfer this folder to a dedicated GitHub repo
- Use the provided PowerShell command in this README or run `scripts/transfer-backend.ps1` after editing the `REPO_URL`.

Structure overview
```
backend/
  README.md
  .gitignore
  .env.example
  docker-compose.yml
  gateway/
    api-gateway/
      package.json
      tsconfig.json
      src/
        index.ts
        config.ts
        routes/
          proxy.ts
      Dockerfile
  services/
    identity-service/
      package.json
      tsconfig.json
      src/
        index.ts
        routes/
          auth.ts
      Dockerfile
    transaction-service-java/
      pom.xml
      src/main/java/com/eazepay/transactionservice/
        Application.java
        controller/HealthController.java
        controller/TransactionController.java
        dto/TransactionDTO.java
      Dockerfile
    wallet-service-go/
      go.mod
      main.go
      Dockerfile
    biometric-service-python/
      requirements.txt
      app.py
      Dockerfile
  scripts/
    transfer-backend.ps1
```

PowerShell command to push only `backend/` to a new repo
Replace `<NEW_REMOTE_URL>` (e.g., `https://github.com/youruser/eazepay-backend.git`). Run from the repo root.
```
# Create a split branch containing only backend/
git subtree split --prefix backend -b backend-split

# Add the new remote and push the split branch as main
git remote add backend-origin <NEW_REMOTE_URL>
git push backend-origin backend-split:main
```

Notes
- These services are intentionally minimal and safe to extend. Replace demo endpoints with real implementations.
- Keep environment values in `.env` and inject via Docker Compose.

Database
- Postgres is provisioned via `docker-compose` and initialized from `database/init/01_schema.sql`.
- Identity Service reads `DATABASE_URL` (set in compose) and exposes simple user registration and login backed by Postgres.
- Transaction Service uses Spring JDBC; connection is configured by `SPRING_DATASOURCE_*` env vars in compose.

CI/CD
- GitHub Actions under `.github/workflows`:
  - `ci.yml` builds Node (gateway, identity), Java (transaction), Go (wallet), and Python (biometric).
  - `publish.yml` pushes Docker images to GHCR under `ghcr.io/<owner>/eazepay-backend-*` on pushes to `main`.
- Ensure repository has `packages: write` permission enabled and uses the default `GITHUB_TOKEN` for GHCR.