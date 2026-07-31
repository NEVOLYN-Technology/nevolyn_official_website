# ==============================================================================
# Stage 1: Build the Spring Boot fat JAR on a full JDK
# ==============================================================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy the wrapper and pom first, on their own layer. Docker reuses this layer
# — and the resolved dependencies below — on every rebuild where pom.xml has not
# changed, which is what keeps source-only rebuilds fast.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -ntp dependency:go-offline

# Source changes invalidate from here down only.
COPY src ./src
RUN ./mvnw -B -ntp clean package -DskipTests

# Normalise the artifact name so the runtime stage does not hard-code a version
# that has to be edited in lockstep with pom.xml.
RUN cp target/*.jar /app/app.jar

# ==============================================================================
# Stage 2: Minimal JRE runtime
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create the unprivileged runtime user, and prepare every path it needs to
# write to WHILE STILL ROOT. Doing the mkdir after USER fails outright:
# /app is root-owned, so the non-root user cannot create anything inside it.
RUN addgroup -S saturn \
    && adduser -S saturn -G saturn \
    && mkdir -p /app/uploads/resumes \
    && chown -R saturn:saturn /app

COPY --from=builder --chown=saturn:saturn /app/app.jar app.jar

# Set default active profile to prod for Docker containers
ENV SPRING_PROFILES_ACTIVE=prod

# Drop privileges for everything that follows.
USER saturn:saturn

# Documentation only; Render routes public traffic to $PORT, which
# application-prod.yml binds via server.port.
EXPOSE 8080

# NOTE: uploads/ lives on the container's ephemeral filesystem. On Render's free
# tier it is wiped on every redeploy and cold start. Attach a Render Disk or move
# to object storage before treating stored CVs as durable.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-Duser.timezone=UTC", "-jar", "app.jar"]
