# Stage 1: Build JAR with Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
# Download dependencies
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime Container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Directory for file uploads
RUN mkdir -p /app/uploads/bills && chown -R appuser:appgroup /app

COPY --from=builder /app/target/legal-case-management-*.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080 \
    APP_SEED_ENABLED=false

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
