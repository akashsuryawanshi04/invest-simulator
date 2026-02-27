# ============================================================
# Backend Dockerfile — Spring Boot
# Multi-stage build for minimal production image
# ============================================================

# Stage 1: Build with Maven
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

# Copy Maven files first (cache dependencies layer)
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN ./mvnw clean package -DskipTests -q

# Stage 2: Minimal runtime image
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

# Security: don't run as root
RUN addgroup -S investapp && adduser -S investapp -G investapp

# Copy built JAR
COPY --from=builder /build/target/invest-simulator-*.jar app.jar

# Set ownership
RUN chown investapp:investapp app.jar
USER investapp

# Expose port
EXPOSE 8080

# JVM tuning for containers
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
