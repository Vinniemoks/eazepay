# Biometric Service

The Biometric Service handles enrollment and verification of biometric templates using FastAPI. It exposes REST endpoints that the Identity Service consumes.

## Prerequisites

- Python 3.9+
- pip
- PostgreSQL 14+

## Environment Variables

The service loads configuration from `.env`:

| Variable | Description | Default |
| --- | --- | --- |
| `PYTHON_ENV` | Runtime environment | `development` |
| `PORT` | HTTP port for FastAPI/uvicorn | `8001` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database username | `developer` |
| `DB_PASS` | Database password | `dev_password_2024!` |
| `DB_NAME` | Database name for biometric templates | `biometric_service_dev` |
| `ENCRYPTION_KEY` | 32-character key for template encryption | `0123456789abcdef0123456789abcdef` |
| `CONTAINER_ENV` | Set to `local` to enable console logging | `local` |

## Running Locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

The health endpoint is available at `http://localhost:8001/health`.

## Testing

```bash
pytest
```

## Notes

- Update `ENCRYPTION_KEY` with a secure secret in production.
- The service maintains its own PostgreSQL schema via the async `DatabaseService` class.
- Install `opencv-python-headless` (or a compatible OpenCV build) alongside a NumPy version your platform supports to enable the biometric processing endpoints. When OpenCV is unavailable the API responds with `503 Service Unavailable` and logs the import failure so the rest of the application can keep starting.
