# ─────────────────────────────────────────────────────────────
# Backend Dockerfile — Multi-stage build for Spring Boot 3 + Java 21
# ─────────────────────────────────────────────────────────────

# ── Stage 1: Build ───────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Gradle wrapper and build files first (layer cache for dependencies)
COPY gradle/ gradle/
COPY gradlew settings.gradle build.gradle ./

# Make gradlew executable, ensure wrapper permissions, and download dependencies
RUN chmod +x gradlew && \
    chmod -R 755 gradle && \
    ./gradlew dependencies --no-daemon --quiet

# Copy source and build the JAR
COPY src/ src/
RUN ./gradlew bootJar --no-daemon -x test

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Add non-root user for security
RUN addgroup -g 1001 nevolyn && adduser -u 1001 -G nevolyn -s /bin/sh -D nevolyn
USER nevolyn

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy the built JAR from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

# JVM tuning for container environment
ENV JAVA_OPTS="\
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:+UseG1GC \
  -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
