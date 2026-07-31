# Spring Boot 3 REST API Master Specification & Integration Guide

> **Official REST API Documentation & Backend Integration Handbook** for the **Saturn Textiles Limited R&D Department** backend platform.  
> Built with **Spring Boot 3 (Java 21)**, **Spring Data JPA**, **PostgreSQL / H2**, and **Spring Validation**.

---

## 🎯 1. Architecture & Data Responsibilities

To ensure 0ms initial page load latency and maximum security, system data responsibilities are strictly divided:

### Static Content (`frontend/lib/data/` in Monorepo)
Managed directly in frontend code for zero database latency:
- **R&D Innovations / Projects**: [`frontend/lib/data/innovations.ts`](../frontend/lib/data/innovations.ts)
- **Executive Leaders**: [`frontend/lib/data/leaders.ts`](../frontend/lib/data/leaders.ts)
- **News & Milestones**: [`frontend/lib/data/latest-news.ts`](../frontend/lib/data/latest-news.ts)

### Dynamic Backend APIs (Spring Boot REST Service)
Handles dynamic database operations, visitor inquiries, and job candidate resume file uploads:
1. `POST /api/v1/contact` ── Saves visitor contact form submissions & generates inquiry IDs.
2. `GET /api/v1/contact/verify?token=` ── Confirms the sender, then notifies the R&D team.
3. `POST /api/v1/applications` ── Saves candidate job applications + CV PDF/DOCX uploads.
4. `GET /api/v1/applications/verify?token=` ── Confirms the candidate, emails the CV to the team.

Plus `GET /actuator/health`, a liveness probe for the hosting platform that is
not part of the public API.

> **Site content is not served by the API.** The team roster, innovations,
> milestones and news are static files under `frontend/lib/data/`, bundled at
> build time — see Endpoint 3 and Integration 3 below.

---

## 🧭 2. The 5-Layer Architecture Map

Every request sent from the Next.js frontend (`http://localhost:3000`) to the Spring Boot backend (`http://localhost:8080`) flows through **5 distinct layers**:

```text
Next.js Frontend (JSON Request)
       │
       ▼
 1. DTO (Data Transfer Object)  ──> Input Validation (@NotBlank, @Email)
       │                            [backend/src/main/java/com/saturn/rnd/dto/]
       ▼
 2. Controller                  ──> Web Doorway (@RestController, @PostMapping)
       │                            [backend/src/main/java/com/saturn/rnd/controller/]
       ▼
 3. Service                     ──> Business Rules & Logic Processing
       │                            [backend/src/main/java/com/saturn/rnd/service/]
       ▼
 4. Repository & Entity         ──> Database Operations (Spring Data JPA / SQL)
       │                            [backend/src/main/java/com/saturn/rnd/repository/]
       │                            [backend/src/main/java/com/saturn/rnd/model/]
       ▼
 5. ApiResponse Envelope        ──> Standard JSON Envelope Output (HTTP 200/201/400)
                                    [backend/src/main/java/com/saturn/rnd/dto/ApiResponse.java]
```

---

## 📦 3. Global Standard Response Format (`ApiResponse<T>`)

All REST API endpoints return a standardized JSON envelope (`com.saturn.rnd.dto.ApiResponse`):

### Success Response Envelope (`HTTP 200 / 201`)
```json
{
  "status": "success",
  "code": 201,
  "message": "Thank you for reaching out. The Saturn R&D team has received your message.",
  "data": {
    "inquiryId": "INQ-2026-8419"
  },
  "timestamp": "2026-07-24T14:20:00Z"
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
  "timestamp": "2026-07-24T14:20:00Z"
}
```

---

## 🔬 4. Endpoints Catalog & 5-Layer Code Traces

---

### Endpoint 1: `POST /api/v1/contact` (Visitor Contact Inquiries)

Processes website visitor contact inquiries.

- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Public

#### Field Constraints
| Field Name | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | Yes | Max 100 chars | Visitor's full name |
| `email` | String | Yes | Valid Email format | Visitor's email address |
| `subject` | String | Yes | Max 200 chars | Inquiry subject line |
| `message` | String | Yes | Max 2000 chars | Main inquiry message |

#### 5-Layer Code Flow
1. **DTO Validation (`ContactRequest.java`)**: Validates `@NotBlank` and `@Email`.
2. **Controller (`ContactController.java`)**: Intercepts `POST /api/v1/contact`.
3. **Service (`ContactService.java`)**: Generates unique `INQ-2026-XXXX` ID.
4. **Repository (`ContactInquiryRepository.java`)**: Executes SQL `INSERT INTO contact_inquiries`.
5. **Response (`ApiResponse<ContactResponse>`)**: Returns HTTP 201 Created.

#### cURL Example
```bash
curl -X POST "http://localhost:8080/api/v1/contact" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john.doe@example.com",
       "subject": "FABINS Automation Inquiry",
       "message": "Interested in defect inspection."
     }'
```

---

### Endpoint 2: `POST /api/v1/applications` (Job Applications & CV Upload)

Receives candidate job applications and resume document uploads.

- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Public

#### Multipart Form Parameters
| Parameter | Type | Required | Constraint | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | Yes | Max 100 chars | Full candidate name |
| `email` | String | Yes | Valid Email | Primary contact email |
| `phone` | String | Yes | Max 30 chars | Phone number |
| `address` | String | Yes | Max 250 chars | Residential address |
| `reason` | String | Yes | Max 1500 chars | Motivation statement |
| `linkedin` | String | No | URL | Optional LinkedIn link |
| `github` | String | No | URL | Optional GitHub link |
| `website` | String | No | URL | Optional website link |
| `resume` | Binary File | Yes | Max 10MB (.pdf, .doc, .docx) | Uploaded resume file |

#### 5-Layer Code Flow
1. **Controller (`ApplicationController.java`)**: Receives `multipart/form-data`.
2. **File Storage (`FileStorageService.java`)**: Validates MIME type and writes to `./uploads/resumes/`.
3. **Service (`ApplicationService.java`)**: Generates `APP-2026-XXXX` reference ID.
4. **Repository (`JobApplicationRepository.java`)**: Saves entity record in DB table `job_applications`.
5. **Response (`ApiResponse<ApplicationResponse>`)**: Returns HTTP 201 Created with saved file details.

---

### Endpoint 3: `GET /actuator/health` (Platform Liveness Probe)

Consumed by Render, not by the frontend.

- **Method**: `GET`
- **Authentication**: Public
- **Response**: `{"status":"UP"}`, or `DOWN` when the datasource is unreachable

Actuator is configured to expose this endpoint only, with `show-details: never` —
the detailed form names the database, driver and validation query, which a health
probe has no reason to disclose.

#### There is no team-roster endpoint

The R&D team roster is static content, not application data. It lives in
`frontend/lib/data/team.ts` and ships with the frontend build — see Integration 3
below. The API persists only what visitors submit.

---

## 🔒 5. Spring Boot CORS Configuration (`CorsConfig.java`)

Add a WebMvcConfigurer bean to permit Next.js origins (`http://localhost:3000`):

```java
package com.saturn.rnd.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/v1/**")
                        .allowedOrigins("http://localhost:3000", "https://saturn-rnd.vercel.app")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

---

## 🛠️ 6. Tutorial: How to Add a New API Endpoint (Step-by-Step)

Suppose you want to add a new **Visitor Feedback API** (`POST /api/v1/feedback`). Follow these 5 steps:

### Step 1: Create the DTOs (`backend/src/main/java/com/saturn/rnd/dto/`)
Create `FeedbackRequest.java` and `FeedbackResponse.java`:

```java
// dto/FeedbackRequest.java
package com.saturn.rnd.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FeedbackRequest {
    @NotBlank(message = "Feedback text is required.")
    private String text;
    private int rating;
}
```

### Step 2: Create the Entity (`backend/src/main/java/com/saturn/rnd/model/`)
Create `Feedback.java` (defines database table columns):

```java
// model/Feedback.java
package com.saturn.rnd.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feedbacks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String feedbackId;
    private String text;
    private int rating;
}
```

### Step 3: Create the Repository (`backend/src/main/java/com/saturn/rnd/repository/`)
Create `FeedbackRepository.java`:

```java
// repository/FeedbackRepository.java
package com.saturn.rnd.repository;

import com.saturn.rnd.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // Spring Data JPA automatically provides save(), findAll(), findById(), deleteById()!
}
```

### Step 4: Create the Service (`backend/src/main/java/com/saturn/rnd/service/`)
Create `FeedbackService.java` to handle business logic:

```java
// service/FeedbackService.java
package com.saturn.rnd.service;

import com.saturn.rnd.dto.FeedbackRequest;
import com.saturn.rnd.dto.FeedbackResponse;
import com.saturn.rnd.model.Feedback;
import com.saturn.rnd.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackRepository repository;

    public FeedbackResponse processFeedback(FeedbackRequest request) {
        String feedbackId = "FB-" + new Random().nextInt(10000);

        Feedback entity = Feedback.builder()
                .feedbackId(feedbackId)
                .text(request.getText())
                .rating(request.getRating())
                .build();

        repository.save(entity);

        return new FeedbackResponse(feedbackId);
    }
}
```

### Step 5: Create the Controller (`backend/src/main/java/com/saturn/rnd/controller/`)
Create `FeedbackController.java` to expose the URL:

```java
// controller/FeedbackController.java
package com.saturn.rnd.controller;

import com.saturn.rnd.dto.ApiResponse;
import com.saturn.rnd.dto.FeedbackRequest;
import com.saturn.rnd.dto.FeedbackResponse;
import com.saturn.rnd.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(
            @Valid @RequestBody FeedbackRequest request
    ) {
        FeedbackResponse data = feedbackService.processFeedback(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Feedback submitted successfully.", data));
    }
}
```

---

## 🔌 7. Frontend-to-Backend Complete Integration Code Handbook

This section provides complete, production-ready React component code snippets for connecting each of the 3 backend endpoints to your Next.js 16 frontend.

---

### Integration 1: Contact Form Submission (`POST /api/v1/contact`)

**Component File**: `frontend/components/sections/ContactSection.tsx`

```tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function ContactSection() {
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [inquiryId, setInquiryId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatusMessage(null)

    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${baseUrl}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await response.json()

      if (response.ok && json.status === 'success') {
        setInquiryId(json.data.inquiryId)
        setStatusMessage(json.message)
        ;(e.target as HTMLFormElement).reset()
      } else {
        setStatusMessage(json.message || 'Failed to submit inquiry.')
      }
    } catch (err) {
      setStatusMessage('Network error. Is the Spring Boot backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="text" name="name" required placeholder="Full Name" className="w-full p-3 rounded" />
        <input type="email" name="email" required placeholder="Email Address" className="w-full p-3 rounded" />
        <input type="text" name="subject" required placeholder="Subject" className="w-full p-3 rounded" />
        <textarea name="message" rows={5} required placeholder="Message" className="w-full p-3 rounded" />

        {statusMessage && (
          <div className="p-4 rounded bg-blue-900/50 text-blue-200 text-sm">
            {statusMessage} {inquiryId && <strong>Ref ID: {inquiryId}</strong>}
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full py-3 bg-orange-500 text-white font-bold rounded">
          {loading ? 'Submitting...' : 'Send Message'}
        </button>
      </form>
    </section>
  )
}
```

---

### Integration 2: Job Application & CV Upload (`POST /api/v1/applications`)

**Component File**: `frontend/app/join_us/page.tsx`

```tsx
'use client'

import { useState } from 'react'

export default function JoinPage() {
  const [loading, setLoading] = useState(false)
  const [applicationRef, setApplicationRef] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget) // Contains text fields + binary 'resume' file

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${baseUrl}/api/v1/applications`, {
        method: 'POST',
        body: formData, // Do NOT set Content-Type header — browser automatically sets multipart boundary!
      })

      const json = await response.json()

      if (response.ok && json.status === 'success') {
        setApplicationRef(json.data.applicationId)
        alert(`Application Submitted! Ref ID: ${json.data.applicationId}`)
        ;(e.target as HTMLFormElement).reset()
      } else {
        alert(json.message || 'Submission failed.')
      }
    } catch (err) {
      alert('Network error communicating with backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="text" name="name" required placeholder="Full Name" />
      <input type="email" name="email" required placeholder="Email" />
      <input type="tel" name="phone" required placeholder="Phone" />
      <input type="text" name="address" required placeholder="Address" />
      <textarea name="reason" required placeholder="Why join us?" />
      <input type="file" name="resume" required accept=".pdf,.doc,.docx" />
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading Resume...' : 'Submit Application'}
      </button>
    </form>
  )
}
```

---

### Integration 3: Team roster — static, not fetched

**Data files**: `frontend/lib/data/leaders.ts`, `frontend/lib/data/team.ts`
**Component file**: `frontend/components/sections/LeadersSection.tsx`

The roster is plain TypeScript, bundled at build time. There is no fetch, no
loading state and no error state, because the data is already present when the
component renders:

```tsx
'use client'

import { teamDepartments } from '@/lib/data/leaders'   // leadership profiles
import { engineeringTeamMembers } from '@/lib/data/team' // engineering roster

export function LeadersSection() {
  const leaders = teamDepartments[0].members

  // No fetch, no useEffect, no loading state, no error state — the data is
  // already in the bundle by the time the component renders.
  return (
    <section id="leaders">
      {leaders.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}

      {/* Expandable subsection; the toggle hides itself when the array is empty. */}
      {engineeringTeamMembers.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </section>
  )
}
```

**To update the roster**, edit `frontend/lib/data/team.ts` (engineers) or
`frontend/lib/data/leaders.ts` (leadership) and redeploy the frontend. No backend
change, no migration, no database access. See each file's header comment for the
entry template and field reference.

**Keep it static.** Serving this over the network buys nothing — it is identical
for every visitor — and introduces two failure modes the static version does not
have: a loading flash on every visit, and an empty team section whenever the
free-tier backend is cold starting. The same reasoning applies to the other files
in `frontend/lib/data/` (innovations, milestones, news).
