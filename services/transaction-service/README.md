# Transaction Service

The Transaction Service processes payments, transfers, and transaction histories using Spring Boot.

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

## Environment Variables

Configuration is loaded from `.env` or the environment:

| Variable | Description | Default |
| --- | --- | --- |
| `SPRING_APPLICATION_NAME` | Service identifier | `transaction-service` |
| `SERVER_PORT` | HTTP port | `8002` |
| `SPRING_DATASOURCE_URL` | JDBC connection string | `jdbc:postgresql://localhost:5432/transaction_service_dev` |
| `SPRING_DATASOURCE_USERNAME` | Database user | `developer` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `dev_password_2024!` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Hibernate schema strategy | `update` |
| `SPRING_JPA_SHOW_SQL` | Log SQL statements | `true` |

## Running Locally

```bash
./mvnw clean package
java -jar target/transaction-service-0.0.1-SNAPSHOT.jar
```

During development you can use:

```bash
./mvnw spring-boot:run
```

The health endpoint is exposed at `http://localhost:8002/actuator/health`.

## Testing

```bash
./mvnw test
```

## Notes

- Update the datasource URL if you run PostgreSQL in Docker.
- Use production credentials and SSL settings before deploying to production environments.
