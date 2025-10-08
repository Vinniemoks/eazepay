# Infrastructure Configuration Assets

The Docker Compose definition wires up a comprehensive development environment. This repository now includes the
configuration assets that the stack expects so you can boot it locally without volume-mount errors.

## API Gateway (NGINX)
- The primary gateway configuration lives at `infrastructure/docker/nginx/nginx.conf`. It defines upstreams for each service,
  enforces basic security headers, exposes a `/health` endpoint, and includes the per-route files under `conf.d`.
- Self-signed development TLS assets reside in `infrastructure/docker/nginx/ssl`. Replace `certificate.crt` and `private.key`
  with environment-specific certificates before deploying outside of local development.
- Additional server snippets continue to live under `infrastructure/docker/nginx/conf.d`, including
  `default.conf` for health/status endpoints.

## RabbitMQ
- RabbitMQ now loads `infrastructure/docker/rabbitmq/rabbitmq.conf`, which configures the default admin credentials, virtual
  host, logging, Prometheus metrics listener, and basic resource limits expected by the docker-compose stack.
- Exchange, queue, and permission bootstrapping remains managed by `infrastructure/docker/rabbitmq/definitions.json`. You can
  customise this file to provision additional messaging topology.

Use the provided files as sane defaults for local development, and adjust the values as needed for staging or production
deployments.
