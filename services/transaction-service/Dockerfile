FROM openjdk:17-jdk-slim
WORKDIR /app
COPY . .
RUN ./mvnw package
EXPOSE 8002
CMD ["java", "-jar", "target/transaction-service.jar"]
