# Saturn Textiles R&D — Backend Developer Handbook

> Complete technical architecture, package breakdown, API specs, database setup, file storage logic, and frontend integration guide for the **Spring Boot 3 (Java 21)** REST API backend service (`backend/`).

---

## 🎯 1. Architecture & Technology Stack

The backend is built as a production-ready RESTful service using enterprise Java patterns:

- **Framework**: [Spring Boot 3.4.2](https://spring.io/projects/spring-boot)
- **Language**: [Java 21 LTS](https://adoptium.net/) (OpenJDK 21)
- **Persistence**: Spring Data JPA & Hibernate
- **Database**: H2 In-Memory Database (for zero-setup dev) / PostgreSQL (for production)
- **Validation**: Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`)
- **Boilerplate Reduction**: Project Lombok (`@Data`, `@Builder`, `@RequiredArgsConstructor`)
- **Build Tool**: Apache Maven (via portable Maven Wrapper `mvnw.cmd` / `./mvnw`)

---

## 🗂️ 2. Package Structure & Architectural Layers

All Java source files are organized cleanly inside `backend/src/main/java/com/saturn/rnd/`:

```text
backend/
├── pom.xml                                  # Maven dependencies & Java 21 configuration
├── .mvn/wrapper/maven-wrapper.properties   # Maven Wrapper settings
├── src/main/resources/
│   └── application.yml                      # Port 8080, DB connection, multipart file limits
└── src/main/java/com/saturn/rnd/
    ├── SaturnRndApplication.java            # Main Spring Boot application entry point
    ├── config/                              # Configuration Beans & Startup Initializers
    │   ├── CorsConfig.java                  # CORS policy permitting Next.js frontend origins
    │   └── DataSeeder.java                  # Populates sample team members on dev startup
    ├── controller/                          # REST Controllers (HTTP Requests -> Responses)
    │   ├── ContactController.java           # POST /api/v1/contact
    │   ├── ApplicationController.java       # POST /api/v1/applications (multipart CV upload)
    │   └── TeamController.java              # GET /api/v1/team/members
    ├── dto/                                 # Data Transfer Objects & JSON Envelopes
    │   ├── ApiResponse.java                 # Standard JSON response envelope wrapper <T>
    │   ├── FieldErrorDto.java               # Validation error detail DTO
    │   ├── ContactRequest.java              # Contact form incoming payload (JSR-380 validated)
    │   ├── ContactResponse.java             # Contact success response (inquiryId)
    │   ├── ApplicationResponse.java         # Job application success response (applicationId)
    │   └── TeamMemberDto.java               # Dynamic engineering staff response DTO
    ├── model/                               # JPA Entities (Database Tables)
    │   ├── ContactInquiry.java              # Table: contact_inquiries
    │   ├── JobApplication.java              # Table: job_applications
    │   └── TeamMemberEntity.java            # Table: team_members
    ├── repository/                          # Spring Data JPA Repositories
    │   ├── ContactInquiryRepository.java    # DB interface for ContactInquiry
    │   ├── JobApplicationRepository.java    # DB interface for JobApplication
    │   └── TeamMemberRepository.java        # DB interface for TeamMemberEntity
    ├── service/                             # Business Logic & Storage Services
    │   ├── ContactService.java              # Inquiry processing & unique ID generation
    │   ├── ApplicationService.java          # Job application & file storage orchestration
    │   ├── TeamService.java                 # Staff query & DTO conversion logic
    │   └── FileStorageService.java          # Resume file validation & local file persistence
    └── exception/                           # Exception Handlers & Interceptors
        ├── GlobalExceptionHandler.java      # @RestControllerAdvice transforming errors into ApiResponse
        ├── FileStorageException.java        # Custom file operation exception
        └── ResourceNotFoundException.java   # Custom 404 entity exception
```

---

## 📦 3. Global Standard Response Format (`ApiResponse<T>`)

Every API endpoint returns a uniform JSON envelope format (`com.saturn.rnd.dto.ApiResponse`):

### Success Response Envelope (`HTTP 200 / 201`)
```json
{
  "status": "success",
  "code": 201,
  "message": "Thank you for reaching out. The Saturn R&D team has received your message.",
  "data": {
    "inquiryId": "INQ-2026-8419"
  },
  "timestamp": "2026-07-24T14:00:00Z"
}
```

### Error Response Envelope (`HTTP 400 / 404 / 500`)
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed for request payload.",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address format."
    }
  ],
  "timestamp": "2026-07-24T14:00:00Z"
}
```

---

## 📡 4. REST API Endpoint Specifications

### 1. `POST /api/v1/contact`
Processes visitor inquiries submitted from the website contact section.

- **Content-Type**: `application/json`
- **Request Body** (`ContactRequest`):
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "FABINS Defect Inspection",
    "message": "We would like to request a demonstration."
  }
  ```
- **Validation Constraints**:
  - `name`: Required, max 100 characters.
  - `email`: Required, valid email format.
  - `subject`: Required, max 200 characters.
  - `message`: Required, max 2000 characters.

---

### 2. `POST /api/v1/applications`
Receives candidate job application forms + uploaded resume files from `/join_us`.

- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `name` (String, Required) — Full applicant name
  - `email` (String, Required) — Contact email
  - `phone` (String, Required) — Contact phone number
  - `address` (String, Required) — Residential address
  - `reason` (String, Required) — Motivation statement (max 1500 chars)
  - `linkedin` (String, Optional) — LinkedIn URL
  - `github` (String, Optional) — GitHub URL
  - `website` (String, Optional) — Personal website URL
  - `resume` (Binary File, Required) — Uploaded resume (`.pdf`, `.doc`, `.docx`, max 10MB)

---

### 3. `GET /api/v1/team/members`
Retrieves active R&D engineering staff ordered by `displayOrder`.

- **Query Parameters**: `department` (Optional filter)
- **Response Data**: List of `TeamMemberDto` objects.

---

## ⚙️ 5. Database & Storage Configuration

### Development Mode (H2 In-Memory DB)
By default, `backend/src/main/resources/application.yml` uses H2:
- **H2 Console**: Accessible at `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:saturn_rnd_db`
- **User**: `sa` (no password)

### Production Mode (PostgreSQL)
To switch to PostgreSQL, set environment variables or edit `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME:saturn_rnd_db}
    username: ${DB_USER:postgres}
    password: ${DB_PASS:secret}
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
```

### Resume File Upload Storage
Uploaded files are handled by `FileStorageService.java`:
- Files are saved locally to `./uploads/resumes/`.
- File extensions are sanitized and restricted to `.pdf`, `.doc`, `.docx`.
- File names are sanitized and assigned unique application IDs (e.g. `APP-2026-9281_john_doe.pdf`).

---

## 🛠️ 6. How to Extend the Backend (Developer How-To)

### How to Add a New REST Endpoint
1. **Define DTOs**: Create request/response record or class in `com.saturn.rnd.dto`.
2. **Define Entity & Repository**: Create JPA entity in `model/` and interface in `repository/`.
3. **Add Business Logic**: Add transactional service method in `service/`.
4. **Expose REST Endpoint**: Create controller method in `controller/` returning `ResponseEntity<ApiResponse<T>>`.

---

## 🚀 7. Developer Commands

Run commands inside `backend/`:

```bash
cd backend

# Run Spring Boot application locally (http://localhost:8080)
./mvnw spring-boot:run

# Compile Java source code
./mvnw clean compile

# Run tests
./mvnw test

# Package JAR file for deployment
./mvnw clean package
```
