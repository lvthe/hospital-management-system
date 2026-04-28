# Hospital Management System - Architecture Diagrams

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     END USERS                                   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │  Patients   │   Doctors   │   Nurses    │    Admin    │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
└────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────▼──────────────┐
                │   PRESENTATION LAYER       │
                │   (React SPA)              │
                │ ┌─────────────────────┐    │
                │ │ Dashboard           │    │
                │ │ Patient Management  │    │
                │ │ Appointments        │    │
                │ │ Medical Records     │    │
                │ │ Reports             │    │
                │ └─────────────────────┘    │
                └─────────────┬──────────────┘
                              │ HTTPS
                ┌─────────────▼──────────────┐
                │   API GATEWAY / NGINX      │
                │ (Reverse Proxy, Load Bal)  │
                └─────────────┬──────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│  Backend Server 1 │ │  Backend Server 2 │ │  Backend Server 3 │
│  (Node.js Express)│ │  (PM2)            │ │  (PM2)            │
│                   │ │  - Controllers    │ │  - Services       │
│  Port: 3001       │ │  - Routes         │ │  - Middleware     │
│                   │ │  - Business Logic │ │  - Utilities      │
└─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
        ┌───────────┬───────────┼───────────┐
        │           │           │           │
        ▼           ▼           ▼           ▼
    ┌────────┐ ┌──────────┐ ┌──────────┐  │
    │ PostgreSQL│ Redis  │ │ File      │  │
    │ Database  │ Cache  │ │ Storage   │  │
    │ (Primary) │(Session)│ │(Medical   │  │
    │           │        │ │ Records)  │  │
    └────────┘ └──────────┘ └──────────┘  │
        │                                  │
        └──────────────────────────────────┘
              (Storage Layer)
```

## Data Flow Diagram - Appointment Booking

```
┌─────────────────────────────────────────────────────────────┐
│                    PATIENT (Web Browser)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 1. Click "Book Appointment"
                         ▼
                   ┌──────────────────┐
                   │ Appointment Form │
                   │ (React Component)│
                   └────────┬─────────┘
                            │
                            │ 2. Fill form & Submit
                            ▼
                   ┌──────────────────────────────┐
                   │ Frontend Validation          │
                   │ (Email, Date, Doctor)        │
                   └────────┬────────────────────┘
                            │
                            │ 3. POST /api/appointments
                            ▼
                   ┌──────────────────────────────┐
                   │   NGINX (Reverse Proxy)      │
                   │   - SSL/TLS Encryption       │
                   │   - Load Balancing           │
                   └────────┬────────────────────┘
                            │
                            │ 4. Route to available backend
                            ▼
                   ┌──────────────────────────────┐
                   │   Express Controller         │
                   │ appointmentController.js     │
                   └────────┬────────────────────┘
                            │
                            │ 5. Validate input (Joi)
                            ▼
                   ┌──────────────────────────────┐
                   │   Business Logic Layer       │
                   │ appointmentService.js        │
                   │ - Check doctor availability │
                   │ - Verify patient exists     │
                   │ - Create appointment record │
                   └────────┬────────────────────┘
                            │
                            │ 6. Query database
                            ▼
                   ┌──────────────────────────────┐
                   │   PostgreSQL Database        │
                   │   appointments table         │
                   │   doctors table              │
                   │   patients table             │
                   └────────┬────────────────────┘
                            │
                            │ 7. Insert appointment
                            ▼
                   ┌──────────────────────────────┐
                   │   Cache Update (Redis)       │
                   │   - Update doctor slots      │
                   │   - Update availability      │
                   └────────┬────────────────────┘
                            │
                            │ 8. Send email notification
                            ▼
                   ┌──────────────────────────────┐
                   │   Email Service (SendGrid)   │
                   │   - Patient confirmation     │
                   │   - Doctor notification      │
                   └────────┬────────────────────┘
                            │
                            │ 9. Response: 201 Created
                            ▼
                   ┌──────────────────────────────┐
                   │   React Component            │
                   │ - Show success toast         │
                   │ - Redirect to detail page    │
                   └────────┬────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   SUCCESS!   │
                    └──────────────┘
```

## User Role & Permission Matrix

```
┌──────────────────┬──────────┬────────┬────────┬────────┬─────────┐
│ Feature/Action   │  Patient │ Doctor │ Nurse  │ Reception│ Admin  │
├──────────────────┼──────────┼────────┼────────┼────────┼─────────┤
│ View Own Profile │    ✓     │   ✓    │   ✓    │    ✓    │    ✓   │
│ Edit Own Profile │    ✓     │   ✓    │   ✓    │    ✓    │    ✓   │
├──────────────────┼──────────┼────────┼────────┼────────┼─────────┤
│ View Patients    │  Only Own │   All  │   All  │    ✓    │   All  │
│ Create Patient   │    ✗      │   ✗    │   ✗    │    ✓    │    ✓   │
│ Edit Patient     │  Only Own │   ✓    │   ✓    │    ✓    │    ✓   │
│ Delete Patient   │    ✗      │   ✗    │   ✗    │    ✗    │    ✓   │
├──────────────────┼──────────┼────────┼────────┼────────┼─────────┤
│ Book Appointment │    ✓      │   ✗    │   ✗    │    ✓    │    ✓   │
│ View Appointments│ Only Own  │   All  │   All  │   All   │   All  │
│ Cancel Appt      │  Only Own │   ✓    │   ✓    │    ✓    │    ✓   │
├──────────────────┼──────────┼────────┼────────┼────────┼─────────┤
│ View Med Records │  Only Own │   All  │   All  │   All   │   All  │
│ Create Med Record│    ✗      │   ✓    │   ✓    │    ✗    │    ✓   │
│ Edit Med Record  │    ✗      │   ✓    │   ✓    │    ✗    │    ✓   │
├──────────────────┼──────────┼────────┼────────┼────────┼─────────┤
│ View Invoices    │ Only Own  │   ✗    │   ✗    │   All   │   All  │
│ Create Invoice   │    ✗      │   ✗    │   ✗    │    ✓    │    ✓   │
│ Process Payment  │    ✓      │   ✗    │   ✗    │    ✓    │    ✓   │
├──────────────────┼──────────┼────────┼────────┼────────┼─────────┤
│ View Reports     │    ✗      │   Own  │   ✗    │   Own   │   All  │
│ Generate Reports │    ✗      │   ✗    │   ✗    │    ✗    │    ✓   │
├──────────────────┼──────────┼────────┼────────┼────────┼─────────┤
│ Manage Users     │    ✗      │   ✗    │   ✗    │    ✗    │    ✓   │
│ System Settings  │    ✗      │   ✗    │   ✗    │    ✗    │    ✓   │
│ View Audit Logs  │    ✗      │   ✗    │   ✗    │    ✗    │    ✓   │
└──────────────────┴──────────┴────────┴────────┴────────┴─────────┘
```

## Database Relationships Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        DATABASE TABLES                        │
└──────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │     USERS       │
    ├─────────────────┤
    │ id (UUID)  ◄────┼─────────────────────────┐
    │ email      │    │                         │
    │ password   │    │                         │
    │ role       │    │                         │
    │ is_active  │    │                         │
    └─────────────────┘                         │
         ▲ ▲ ▲                                   │
         │ │ │                                   │
    ┌────┴─┴─┴────┐     ┌────────────────┐     │
    │             │     │                │     │
    │        ┌────▼─────▼──┐         ┌───▼──────▼──┐
    │        │  PATIENTS    │         │   DOCTORS   │
    │        ├──────────────┤         ├─────────────┤
    │        │ id (UUID)    │         │ id (UUID)   │
    │        │ user_id (FK) │         │ user_id(FK) │
    │        │ DOB          │         │ specialist  │
    │        │ blood_type   │         │ license_num │
    │        │ allergies    │         │ office_room │
    │        └──────────────┘         └─────────────┘
    │             ▲                        ▲
    │             │                        │
    │        ┌────┴────┐              ┌────┴─────┐
    │        │          │              │          │
    │   ┌────▼──────────┴──────┐  ┌───▼──────────▼───┐
    │   │   APPOINTMENTS       │  │  STAFF/NURSES    │
    │   ├──────────────────────┤  ├──────────────────┤
    │   │ id (UUID)            │  │ id (UUID)        │
    │   │ patient_id (FK)      │  │ user_id (FK)     │
    │   │ doctor_id (FK)       │  │ position         │
    │   │ appointment_date     │  │ hire_date        │
    │   │ appointment_time     │  │ salary           │
    │   │ status               │  └──────────────────┘
    │   │ reason_for_visit     │
    │   └─────┬────────────────┘
    │         │
    │    ┌────▼─────────────────────┐
    │    │   MEDICAL_RECORDS        │
    │    ├──────────────────────────┤
    │    │ id (UUID)                │
    │    │ patient_id (FK)          │
    │    │ doctor_id (FK)           │
    │    │ appointment_id (FK)      │
    │    │ diagnosis                │
    │    │ symptoms                 │
    │    │ vital_signs (JSON)       │
    │    │ treatment_plan           │
    │    │ prescribed_medications(J)│
    │    └──────┬────────────────────┘
    │           │
    │      ┌────▼──────────────────┐
    │      │   PRESCRIPTIONS       │
    │      ├───────────────────────┤
    │      │ id (UUID)             │
    │      │ medical_record_id(FK) │
    │      │ medication_id (FK)    │
    │      │ dosage                │
    │      │ frequency             │
    │      │ duration_days         │
    │      └────┬──────────────────┘
    │           │
    │           ▼
    │      ┌──────────────────┐
    │      │  MEDICATIONS     │
    │      ├──────────────────┤
    │      │ id (UUID)        │
    │      │ name             │
    │      │ dosage           │
    │      │ stock_quantity   │
    │      │ unit_price       │
    │      │ expiry_date      │
    │      └──────────────────┘
    │
    └────────┬──────────────────────────┐
             │                          │
        ┌────▼──────┐             ┌────▼──────────┐
        │ INVOICES  │             │ INVOICE_ITEMS │
        ├───────────┤             ├───────────────┤
        │ id (UUID) │             │ id (UUID)     │
        │ patient_id(FK)          │ invoice_id(FK)│
        │ inv_number │             │ item_type     │
        │ inv_date  │             │ description   │
        │ total_amt │             │ quantity      │
        │ paid_amt  │             │ unit_price    │
        │ status    │             │ total_price   │
        └───────────┘             └───────────────┘

    ┌──────────────────┐
    │ DEPARTMENTS      │
    ├──────────────────┤
    │ id (UUID)        │
    │ name             │
    │ leader_id (FK)   │
    │ location         │
    └──────────────────┘

    ┌──────────────────┐
    │ MEDICAL_EQUIPMENT│
    ├──────────────────┤
    │ id (UUID)        │
    │ name             │
    │ category         │
    │ serial_number    │
    │ location         │
    │ status           │
    └──────────────────┘

    ┌──────────────────┐
    │ AUDIT_LOGS       │
    ├──────────────────┤
    │ id (UUID)        │
    │ user_id (FK)     │
    │ action           │
    │ entity_type      │
    │ entity_id        │
    │ old_values (JSON)│
    │ new_values (JSON)│
    │ timestamp        │
    └──────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                       │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────┐
    │    FIREWALL & NETWORK SECURITY       │
    │           (On-Premises)              │
    └──────────────┬───────────────────────┘
                   │
    ┌──────────────▼───────────────────────┐
    │         REVERSE PROXY (Nginx)        │
    │   - SSL/TLS Termination              │
    │   - Load Balancing                   │
    │   - Static file caching              │
    │   - Rate limiting                    │
    └──────┬────────────────┬──────────────┘
           │                │
    ┌──────▼──┐        ┌────▼─────┐
    │Frontend  │        │Backend    │
    │Server 1  │        │Cluster    │
    │(Nginx +  │        │           │
    │React SPA)│        │┌────────┐ │
    └──────────┘        ││Node.js-1│ │
                        ││(PM2)   │ │
                        │├────────┤ │
                        ││Node.js-2│ │
                        ││(PM2)   │ │
                        │├────────┤ │
                        ││Node.js-3│ │
                        ││(PM2)   │ │
                        │└────────┘ │
                        │  Port:    │
                        │  3001-3003│
                        └────┬──────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
        ┌───▼──┐         ┌───▼─────┐    ┌────▼────┐
        │Postgres││         │Redis    │    │File     │
        │Primary ││         │Cache    │    │Storage  │
        │DB      ││         │(Session)│    │(Medical)│
        │┌──────┐││         │         │    │         │
        ││Data  │││         └─────────┘    └─────────┘
        ││Files ││
        │└──────┘│
        │Backup: │
        │ Daily  │
        │ WAL    │
        └────────┘

    Monitoring & Logging:
    ┌──────────────────────────────────────┐
    │  - Prometheus (metrics)              │
    │  - Grafana (visualization)           │
    │  - ELK Stack (logging)               │
    │  - Sentry (error tracking)           │
    │  - New Relic or DataDog (APM)        │
    └──────────────────────────────────────┘
```

## CI/CD Pipeline

```
Developer Push Code
        │
        ▼
    ┌────────────────────┐
    │  GitHub/GitLab     │
    │  (Repository)      │
    └─────────┬──────────┘
              │
              ▼
    ┌────────────────────────────┐
    │ 1. Run Unit Tests (Jest)   │
    │    Coverage > 80%?         │
    └─────────┬──────────────────┘
              │ PASS
              ▼
    ┌────────────────────────────┐
    │ 2. Code Quality Check      │
    │    - ESLint                │
    │    - SonarQube             │
    │    - Prettier              │
    └─────────┬──────────────────┘
              │ PASS
              ▼
    ┌────────────────────────────┐
    │ 3. Build Frontend          │
    │    - npm run build         │
    │    - Create optimized SPA  │
    └─────────┬──────────────────┘
              │ SUCCESS
              ▼
    ┌────────────────────────────┐
    │ 4. Build Backend           │
    │    - npm install           │
    │    - Transpile ES6         │
    │    - Create bundle         │
    └─────────┬──────────────────┘
              │ SUCCESS
              ▼
    ┌────────────────────────────┐
    │ 5. Deploy to Staging       │
    │    - SSH to staging server │
    │    - Pull latest code      │
    │    - Install dependencies  │
    │    - Run migrations        │
    │    - Restart services      │
    └─────────┬──────────────────┘
              │ SUCCESS
              ▼
    ┌────────────────────────────┐
    │ 6. Run E2E Tests (Cypress) │
    │    - Test critical flows   │
    │    - Verify API responses  │
    └─────────┬──────────────────┘
              │ PASS
              ▼
    ┌────────────────────────────┐
    │ 7. Manual QA Review        │
    │    (if required)           │
    └─────────┬──────────────────┘
              │ APPROVED
              ▼
    ┌────────────────────────────┐
    │ 8. Deploy to Production    │
    │    - Same steps as staging │
    │    - Blue-green deployment │
    │    - Health checks         │
    │    - Smoke tests           │
    └─────────┬──────────────────┘
              │ SUCCESS
              ▼
    ┌────────────────────────────┐
    │ DEPLOYMENT COMPLETE! ✓    │
    │ Monitor metrics & logs     │
    └────────────────────────────┘
```

## Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│               SECURITY LAYERS (Defense in Depth)             │
└──────────────────────────────────────────────────────────────┘

Layer 1: NETWORK SECURITY
├─ Firewall (On-Premises)
├─ VPN for remote access
├─ IP Whitelisting (optional)
├─ DDoS Protection
└─ Intrusion Detection System (IDS)

Layer 2: APPLICATION SECURITY
├─ HTTPS/TLS 1.2+
├─ CORS (whitelist origins)
├─ CSRF tokens
├─ Rate limiting
│  └─ Login: 5 attempts/15 min
│  └─ API: 100 requests/min (normal users)
│  └─ API: 1000 requests/min (admin)
└─ Request validation & sanitization

Layer 3: AUTHENTICATION
├─ JWT-based authentication
│  ├─ Access Token: 15 min expiry
│  ├─ Refresh Token: 7 days expiry
│  └─ Stored: httpOnly cookies (secure)
├─ Multi-factor authentication (optional)
│  ├─ Email verification
│  └─ SMS OTP (for sensitive operations)
├─ Password policy
│  ├─ Min 8 characters
│  ├─ Must include uppercase, lowercase, numbers, symbols
│  ├─ No dictionary words
│  └─ Password history (last 5 passwords)
└─ Session management
   ├─ Session timeout: 30 min inactivity
   └─ Concurrent session limit: 3 per user

Layer 4: AUTHORIZATION (RBAC)
├─ Role-based access control
│  ├─ Admin: Full system access
│  ├─ Doctor: Access to patient data, medical records
│  ├─ Nurse: Limited write access to medical records
│  ├─ Receptionist: Patient management, appointments
│  └─ Patient: Access to own records only
├─ Attribute-based access control (ABAC) - for future
└─ Middleware enforces authorization on every request

Layer 5: DATA PROTECTION
├─ Encryption at rest
│  ├─ Database: PostgreSQL with encryption extension
│  ├─ Files: AES-256 for sensitive files
│  ├─ Backups: Encrypted storage
│  └─ Passwords: bcryptjs (salt rounds: 10)
│
├─ Encryption in transit
│  ├─ HTTPS/TLS 1.2+ (all routes)
│  ├─ API: Certificate pinning (optional)
│  └─ Database: SSL connection pooling
│
└─ Sensitive data handling
   ├─ PII: Never log sensitive data
   ├─ API responses: Remove sensitive fields
   ├─ Frontend: Don't store sensitive data in localStorage
   └─ Database: Use column-level encryption for SSN, etc.

Layer 6: AUDIT & MONITORING
├─ Audit logging
│  ├─ All CRUD operations logged
│  ├─ User login/logout events
│  ├─ Data access (who viewed what, when)
│  └─ Admin actions logged
├─ Real-time monitoring
│  ├─ Failed login attempts
│  ├─ Suspicious API patterns
│  └─ Unusual data access patterns
└─ Alerting
   ├─ Email alerts for critical events
   ├─ Dashboard for real-time monitoring
   └─ Escalation to security team

Layer 7: INPUT VALIDATION
├─ Frontend validation
│  ├─ Format validation (email, phone, date)
│  └─ Required field validation
├─ Backend validation (ALWAYS)
│  ├─ Schema validation (Joi, express-validator)
│  ├─ Type checking
│  ├─ Range validation
│  └─ SQL injection prevention (parameterized queries)
└─ Content Security Policy (CSP)
   └─ Prevent XSS attacks

Layer 8: ERROR HANDLING
├─ Generic error messages (don't expose internals)
├─ Detailed error logging (server-side only)
├─ No stack trace exposure to clients
├─ Proper HTTP status codes
└─ Error tracking (Sentry)

Layer 9: DEPENDENCY MANAGEMENT
├─ Regular security updates
├─ npm audit for vulnerabilities
├─ Dependabot for automated checks
├─ OWASP Top 10 compliance checks
└─ Third-party library vetting

Layer 10: COMPLIANCE & POLICIES
├─ HIPAA compliance (healthcare data)
├─ GDPR compliance (EU user data)
├─ Data retention policies
├─ Incident response plan
├─ Privacy policy & terms of service
└─ Regular security audits & penetration testing
```

---

_Diagrams created: 2026-04-26_
