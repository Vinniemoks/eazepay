# Web Portal

The Eazepay Web Portal delivers a static administrative dashboard distributed via Nginx.

## Structure

- `public/` contains the pre-built static assets (HTML, CSS, JS).
- `nginx.conf` defines how the assets are served in production containers.

## Environment Variables

A `.env` file is provided to document the front-end configuration options used during build time for reactive frameworks. If you rebuild the portal from source, ensure the following keys are set:

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_APP_NAME` | Portal display name | `Eazepay Web Portal` |
| `VITE_API_GATEWAY_URL` | Base URL for API gateway calls | `http://localhost:8080` |
| `VITE_IDENTITY_SERVICE_URL` | Identity Service endpoint | `http://localhost:8000` |
| `VITE_WALLET_SERVICE_URL` | Wallet Service endpoint | `http://localhost:8003` |

These variables are consumed at build time; adjust them before compiling the front-end bundle.

## Running with Docker

```bash
docker build -t eazepay/web-portal .
docker run -p 8080:80 eazepay/web-portal
```

Then open `http://localhost:8080` in your browser.

## Local Development

If you have the source for the front-end framework (e.g., Vite/React), install dependencies and run the development server from that project, exporting the same variables prefixed with `VITE_`.

## Deployment Notes

- Configure HTTPS termination at the reverse proxy layer.
- Adjust caching headers in `nginx.conf` for production requirements.
