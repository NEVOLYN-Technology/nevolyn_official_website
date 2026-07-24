# ==============================================================================
# Stage 1: Build Java 21 Spring Boot JAR
# ==============================================================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper & pom.xml first for dependency caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy Java source code and build executable package JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ==============================================================================
# Stage 2: Production JRE Runtime Container
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root system user for security
RUN addgroup -S saturn && adduser -S saturn -G saturn
USER saturn:saturn

# Create uploads directory for candidate resume files
RUN mkdir -p /app/uploads/resumes

# Copy built executable JAR from builder stage
COPY --from=builder /app/target/saturn-rnd-backend-0.1.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Duser.timezone=UTC", "app.jar"]
