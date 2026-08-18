import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EACRMS API",
      version: "1.0.0",
      description:
        "Ethiopian Athletics Club Registration & Management System — REST API",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local development server",
      },
      {
        url: "https://eacrms-backend-2.onrender.com/api/v1",
        description: "Production / Staging server",
      },
    ],

    // ─── Reusable components ──────────────────────────────────────────────────
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the accessToken from POST /auth/login",
        },
      },
      schemas: {
        // Primitives
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong." },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed." },
            errors: {
              type: "object",
              additionalProperties: { type: "array", items: { type: "string" } },
            },
          },
        },

        // User
        UserPublic: {
          type: "object",
          properties: {
            id:          { type: "string", example: "clxyz123" },
            email:       { type: "string", example: "user@example.com" },
            firstName:   { type: "string", example: "Abebe" },
            lastName:    { type: "string", example: "Bikila" },
            phoneNumber: { type: "string", example: "0911000001", nullable: true },
            status:      { type: "string", enum: ["ACTIVE", "PENDING", "SUSPENDED", "DELETED"] },
            createdAt:   { type: "string", format: "date-time" },
          },
        },
        UserWithRoles: {
          allOf: [
            { $ref: "#/components/schemas/UserPublic" },
            {
              type: "object",
              properties: {
                roles: { type: "array", items: { type: "string" }, example: ["ATHLETE"] },
                permissions: { type: "array", items: { type: "string" }, example: ["athlete:view"] },
              },
            },
          ],
        },

        // Auth
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "firstName", "lastName"],
          properties: {
            email:       { type: "string", format: "email", example: "user@example.com" },
            password:    { type: "string", minLength: 8, example: "Password123" },
            firstName:   { type: "string", example: "Abebe" },
            lastName:    { type: "string", example: "Bikila" },
            phoneNumber: { type: "string", example: "0911000001" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email:    { type: "string", format: "email", example: "admin@eacrms.local" },
            password: { type: "string", example: "ChangeMe123!" },
          },
        },
        LoginResponse: {
          type: "object",
          description: "Mobile/login contract returned directly by POST /auth/login.",
          properties: {
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            userId: { type: "string", example: "clxyz123" },
            userRole: { type: "string", example: "athlete" },
            userName: { type: "string", example: "Abebe Bikila" },
            fanNumber: { type: "string", nullable: true, example: "ET-19950810-001" },
            clubId: { type: "string", nullable: true, example: "club_456" },
            clubName: { type: "string", nullable: true, example: "Addis Ababa Athletics Club" },
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            status: { type: "string", example: "ACTIVE" },
            user: {
              type: "object",
              properties: {
                id: { type: "string", example: "clxyz123" },
                email: { type: "string", example: "user@example.com" },
                firstName: { type: "string", example: "Abebe" },
                lastName: { type: "string", example: "Bikila" },
                status: { type: "string", example: "ACTIVE" },
                roles: { type: "array", items: { type: "string" }, example: ["ATHLETE"] },
              },
            },
          },
        },

        // Events
        EventRequest: {
          type: "object",
          required: ["title", "category", "rules", "schedule", "organizerName"],
          properties: {
            title: { type: "string", example: "National Athletics Championship" },
            description: { type: "string", example: "Annual national track and field championship." },
            category: { type: "string", example: "TRACK_AND_FIELD" },
            rules: { type: "string", example: "World Athletics rules apply." },
            schedule: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["title", "startsAt", "endsAt"],
                properties: {
                  title: { type: "string", example: "Opening ceremony" },
                  startsAt: { type: "string", format: "date-time", example: "2026-10-10T07:00:00.000Z" },
                  endsAt: { type: "string", format: "date-time", example: "2026-10-10T08:00:00.000Z" },
                  description: { type: "string" },
                },
              },
            },
            venue: { type: "string", example: "Addis Ababa Stadium" },
            organizerName: { type: "string", example: "Ethiopian Athletics Federation" },
            organizerEmail: { type: "string", format: "email", example: "events@example.com" },
            organizerPhone: { type: "string", example: "+251911000000" },
          },
        },
        Event: {
          allOf: [
            { $ref: "#/components/schemas/EventRequest" },
            {
              type: "object",
              properties: {
                id: { type: "string" },
                status: { type: "string", enum: ["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED", "CANCELLED"] },
                createdById: { type: "string" },
                approvedById: { type: "string", nullable: true },
                approvedAt: { type: "string", format: "date-time", nullable: true },
                publishedAt: { type: "string", format: "date-time", nullable: true },
                rejectionReason: { type: "string", nullable: true },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          ],
        },

        // Federation policies
        PolicyRequest: {
          type: "object",
          required: ["code", "title", "scope", "rules"],
          properties: {
            code: { type: "string", example: "EVENT_AGE_LIMITS" },
            title: { type: "string", example: "Youth event age limits" },
            description: { type: "string" },
            scope: { type: "string", enum: ["CLUB", "EVENT", "ATHLETE_PARTICIPATION"] },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
            rules: {
              type: "object",
              example: { minimumAge: 14, maximumAge: 18, requiredPermissions: ["athlete:view"] },
              additionalProperties: true,
            },
          },
        },
        PolicyUpdateRequest: {
          type: "object",
          properties: {
            code: { type: "string", example: "EVENT_AGE_LIMITS" },
            title: { type: "string", example: "Youth event age limits" },
            description: { type: "string" },
            scope: { type: "string", enum: ["CLUB", "EVENT", "ATHLETE_PARTICIPATION"] },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
            rules: { type: "object", additionalProperties: true },
          },
        },
        PolicyAssignment: {
          type: "object",
          properties: {
            id: { type: "string" },
            policyId: { type: "string" },
            clubId: { type: "string", nullable: true },
            eventId: { type: "string", nullable: true },
            assignedAt: { type: "string", format: "date-time" },
          },
        },
        PolicyAuditLog: {
          type: "object",
          properties: {
            id: { type: "string" },
            policyId: { type: "string" },
            changedById: { type: "string" },
            action: { type: "string", example: "UPDATE" },
            changes: { type: "object" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Policy: {
          allOf: [
            { $ref: "#/components/schemas/PolicyRequest" },
            {
              type: "object",
              properties: {
                id: { type: "string" },
                createdById: { type: "string" },
                updatedById: { type: "string" },
                assignments: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PolicyAssignment" },
                },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          ],
        },

        // Athlete
        AthleteRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password", "dateOfBirth", "gender", "nationality"],
          properties: {
            firstName:              { type: "string", example: "Abebe" },
            lastName:               { type: "string", example: "Bikila" },
            email:                  { type: "string", format: "email", example: "abebe@example.com" },
            password:               { type: "string", minLength: 8, example: "Password123" },
            phoneNumber:            { type: "string", example: "0911000002" },
            faydaVerificationToken: { type: "string", nullable: true, example: "eyJhbGciOi..." },
            fanNumber:              { type: "string", nullable: true, example: "ET-19950810-001" },
            dateOfBirth:            { type: "string", format: "date", example: "1995-06-15" },
            gender:                 { type: "string", enum: ["MALE", "FEMALE"] },
            nationality:            { type: "string", example: "Ethiopian" },
            sportIds:               { type: "array", items: { type: "string" }, example: ["sp_123", "sp_456"] },
            sportId:                { type: "string", example: "clxyz..." },
            clubId:                 { type: "string", example: "clxyz..." },
            clubName:               { type: "string", example: "Addis Ababa Athletics Club" },
            region:                 { type: "string", example: "Addis Ababa" },
            emergencyContactPhone:  { type: "string", example: "+251911000000" },
            position:               { type: "string", example: "Forward" },
            height:                 { type: "number", example: 175 },
            weight:                 { type: "number", example: 68 },
            dominantHand:           { type: "string", enum: ["LEFT", "RIGHT", "AMBIDEXTROUS"] },
            dominantFoot:           { type: "string", enum: ["LEFT", "RIGHT", "BOTH"] },
            bloodType:              { type: "string", enum: ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"] },
          },
        },
        AthleteProfile: {
          type: "object",
          properties: {
            id:                 { type: "string" },
            status:             { type: "string", enum: ["DRAFT", "PENDING", "FAYDA_VERIFIED", "APPROVED", "ACTIVE", "SUSPENDED", "REJECTED"] },
            registrationSource: { type: "string", enum: ["SELF", "CLUB_ADMIN"] },
            faydaVerified:      { type: "boolean" },
            faydaNin:           { type: "string", nullable: true },
            faydaVerifiedAt:    { type: "string", format: "date-time", nullable: true },
            gender:             { type: "string" },
            nationality:        { type: "string" },
            dateOfBirth:        { type: "string", format: "date-time" },
            user:               { $ref: "#/components/schemas/UserPublic" },
            createdAt:          { type: "string", format: "date-time" },
          },
        },

        // Coach
        CoachRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName:         { type: "string", example: "Haile" },
            lastName:          { type: "string", example: "Gebrselassie" },
            email:             { type: "string", format: "email", example: "haile@example.com" },
            password:          { type: "string", minLength: 8, example: "Password123" },
            phoneNumber:       { type: "string", example: "0922000001" },
            sportId:           { type: "string", example: "clxyz..." },
            clubId:            { type: "string", example: "clxyz..." },
            licenseNumber:     { type: "string", example: "ETH-COACH-001" },
            specialization:    { type: "string", example: "Sprint" },
            yearsOfExperience: { type: "integer", example: 10 },
          },
        },
        CoachProfile: {
          type: "object",
          properties: {
            id:                 { type: "string" },
            status:             { type: "string", enum: ["DRAFT", "PENDING", "FAYDA_VERIFIED", "APPROVED", "ACTIVE", "SUSPENDED", "REJECTED"] },
            registrationSource: { type: "string", enum: ["SELF", "CLUB_ADMIN"] },
            faydaVerified:      { type: "boolean" },
            faydaNin:           { type: "string", nullable: true },
            licenseNumber:      { type: "string", nullable: true },
            specialization:     { type: "string", nullable: true },
            yearsOfExperience:  { type: "integer", nullable: true },
            user:               { $ref: "#/components/schemas/UserPublic" },
            createdAt:          { type: "string", format: "date-time" },
          },
        },

        // Club
        ClubRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name:          { type: "string", example: "Addis Ababa FC" },
            shortName:     { type: "string", example: "AAFC" },
            email:         { type: "string", format: "email", example: "info@aafc.et" },
            phone:         { type: "string", example: "0111234567" },
            address:       { type: "string", example: "Bole Road" },
            city:          { type: "string", example: "Addis Ababa" },
            region:        { type: "string", example: "Addis Ababa" },
            licenseNumber: { type: "string", example: "ETH-CLUB-001" },
            logoUrl:       { type: "string", format: "uri", example: "https://example.com/logo.png" },
          },
        },
        ClubProfile: {
          type: "object",
          properties: {
            id:                 { type: "string" },
            name:               { type: "string" },
            shortName:          { type: "string", nullable: true },
            email:              { type: "string", nullable: true },
            verificationStatus: { type: "string", enum: ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"] },
            city:               { type: "string", nullable: true },
            region:             { type: "string", nullable: true },
            createdAt:          { type: "string", format: "date-time" },
          },
        },

        // Fayda
        FaydaInitiateRequest: {
          type: "object",
          description: "Public self-registration Fayda initiation. Either nin or FAN is accepted.",
          properties: {
            nin: { type: "string", example: "ETH-19950810-001", description: "Fayda National ID Number" },
            FAN: { type: "string", example: "ETH-19950810-001", description: "Legacy/alternate identifier accepted by the backend" },
          },
        },
        FaydaInitiateResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                verificationId: { type: "string", example: "clxyz..." },
                message:        { type: "string", example: "OTP sent. Expires in 10 minutes." },
                otp:            { type: "string", example: "483921", description: "Only shown outside production" },
              },
            },
          },
        },
        FaydaConfirmRequest: {
          type: "object",
          required: ["otp"],
          properties: {
            verificationId: { type: "string", example: "clxyz123", description: "Required for the stateless flow before account creation." },
            otp: { type: "string", minLength: 6, maxLength: 6, example: "483921" },
          },
        },
        FaydaVerificationRecord: {
          type: "object",
          properties: {
            id:           { type: "string" },
            athleteId:    { type: "string", nullable: true },
            coachId:      { type: "string", nullable: true },
            nin:          { type: "string" },
            status:       { type: "string", enum: ["PENDING", "OTP_SENT", "CONFIRMED", "FAILED", "EXPIRED"] },
            attempts:     { type: "integer" },
            otpExpiresAt: { type: "string", format: "date-time" },
            verifiedData: { type: "object", nullable: true },
            createdAt:    { type: "string", format: "date-time" },
          },
        },

        // Payments
        CreateEventRegistration: {
          type: "object",
          required: ["athleteId", "amount"],
          properties: {
            athleteId: { type: "string", example: "clxyz123" },
            amount: { type: "number", example: 250.00 },
            currency: { type: "string", example: "ETB", default: "ETB" },
          },
        },
        MockWebhookRequest: {
          type: "object",
          required: ["reference", "status", "transactionId"],
          properties: {
            reference: { type: "string", example: "EACRMS-1634234234-AB12CD" },
            status: { type: "string", enum: ["PAID", "FAILED"] },
            transactionId: { type: "string", example: "tx_123456" },
          },
        },
        MockCheckout: {
          type: "object",
          properties: {
            reference: { type: "string" },
            callbackEndpoint: { type: "string" },
            instructions: { type: "string" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "string" },
            reference: { type: "string" },
            status: { type: "string", enum: ["PENDING", "PAID", "FAILED", "EXPIRED", "REFUNDED"] },
            amount: { type: "number" },
            currency: { type: "string" },
            userId: { type: "string" },
            eventId: { type: "string", nullable: true },
            athleteId: { type: "string", nullable: true },
            registrationId: { type: "string", nullable: true },
            externalTransactionId: { type: "string", nullable: true },
            paidAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // Event QR Check-in
        EventQRTokenRequest: {
          type: "object",
          required: ["attendeeType", "attendeeId"],
          properties: {
            attendeeType: { type: "string", enum: ["ATHLETE", "CLUB"] },
            attendeeId: { type: "string" },
            expiresInMinutes: { type: "integer", default: 1440, maximum: 10080 },
          },
        },
        EventQRTokenResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                qrData: { type: "string", example: "EACRMS-QR-XYZ987" },
                expiresAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
        EventCheckInScanRequest: {
          type: "object",
          required: ["token"],
          properties: {
            token: { type: "string" },
          },
        },
      },
    },

    // ─── Global security ──────────────────────────────────────────────────────
    security: [{ bearerAuth: [] }],

    // ─── All paths ────────────────────────────────────────────────────────────
    paths: {
      // ── Health ──────────────────────────────────────────────────────────────
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          security: [],
          responses: {
            200: {
              description: "Server is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { status: { type: "string", example: "OK" } },
                  },
                },
              },
            },
          },
        },
      },

      // ── Auth ────────────────────────────────────────────────────────────────
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          description: "Creates a user with ATHLETE role. Status starts as PENDING.",
          security: [],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
          },
          responses: {
            201: {
              description: "Registered successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/UserPublic" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            409: { description: "Email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          description: "Returns the mobile-friendly auth payload expected by the app: token, userRole, refreshToken, club metadata and user profile. Account must be ACTIVE.",
          security: [],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
          },
          responses: {
            200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
            400: { description: "Invalid credentials or account not active", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/fayda/initiate": {
        post: {
          tags: ["Fayda Verification"],
          summary: "Initiate stateless Fayda verification",
          description: "Public self-registration step used before an athlete account exists. Accepts nin or FAN, then sends an OTP to the registered phone and returns a verificationId.",
          security: [],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FaydaInitiateRequest" } } } },
          responses: {
            200: { description: "OTP sent", content: { "application/json": { schema: { $ref: "#/components/schemas/FaydaInitiateResponse" } } } },
            400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/fayda/verify/confirm": {
        post: {
          tags: ["Fayda Verification"],
          summary: "Confirm stateless Fayda OTP",
          description: "Public verification step for self-registration. The response includes the verified demographic data and a verificationToken that can be used in the athlete registration payload.",
          security: [],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FaydaConfirmRequest" } } } },
          responses: {
            200: {
              description: "Verification successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          message: { type: "string", example: "Fayda verification successful." },
                          demographicData: {
                            type: "object",
                            properties: {
                              nin: { type: "string", example: "ETH-19950810-001" },
                              firstName: { type: "string", example: "Fayda" },
                              lastName: { type: "string", example: "Verified" },
                              dateOfBirth: { type: "string", example: "1995-01-01" },
                              gender: { type: "string", example: "MALE" },
                              phoneNumber: { type: "string", example: "+251911000000" },
                            },
                          },
                          verificationToken: { type: "string", example: "eyJhbGciOi..." },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Wrong OTP / expired / max attempts", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Verification record not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Already confirmed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          description: "Returns the authenticated user's profile, roles, and permissions.",
          responses: {
            200: {
              description: "Current user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/UserWithRoles" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          description: "Stateless — client should discard the token.",
          security: [],
          responses: {
            200: {
              description: "Logged out",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Logged out successfully." },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh token",
          description: "Not yet implemented.",
          security: [],
          responses: {
            501: { description: "Not implemented", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── Verification ────────────────────────────────────────────────────────
      "/auth/verify/email": {
        post: {
          tags: ["Verification"],
          summary: "Verify email address",
          description: "Submit the 6-digit code sent to your email after registration. Public endpoint — no token needed.",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "code"],
                  properties: {
                    email: { type: "string", format: "email", example: "abebe@example.com" },
                    code:  { type: "string", minLength: 6, maxLength: 6, example: "483921" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Email verified.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          message:       { type: "string", example: "Email verified successfully." },
                          accountActive: { type: "boolean", example: true },
                          note:          { type: "string", example: "Your account is now active. You can log in." },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid or expired code", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Already verified", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/verify/phone/request": {
        post: {
          tags: ["Verification"],
          summary: "Request phone OTP",
          description: "Sends a 6-digit OTP to the phone number on the account. Email must be verified first.",
          responses: {
            200: {
              description: "OTP sent",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          message: { type: "string", example: "OTP sent to 0911000001. Valid for 10 minutes." },
                          otp:     { type: "string", example: "391847", description: "Only shown outside production" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "No phone number or email not verified yet", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Phone already verified", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/verify/phone": {
        post: {
          tags: ["Verification"],
          summary: "Verify phone number",
          description: "Submit the 6-digit OTP received on your phone.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["otp"],
                  properties: {
                    otp: { type: "string", minLength: 6, maxLength: 6, example: "391847" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Phone verified.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          message:       { type: "string", example: "Phone number verified successfully." },
                          accountActive: { type: "boolean", example: true },
                          note:          { type: "string", example: "Your account is now active. You can log in." },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid or expired OTP", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Already verified", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/verify/resend": {
        post: {
          tags: ["Verification"],
          summary: "Resend verification code",
          description: "Resend the email code or phone OTP.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["type"],
                  properties: {
                    type: { type: "string", enum: ["EMAIL", "PHONE"], example: "EMAIL" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Code resent", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "object" } } } } } },
            409: { description: "Already verified", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/verify/status": {
        get: {
          tags: ["Verification"],
          summary: "Get verification status",
          description: "Returns email/phone verification status and whether the account is active.",
          responses: {
            200: {
              description: "Verification status",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          email:           { type: "string", example: "abebe@example.com" },
                          emailVerified:   { type: "boolean", example: false },
                          emailVerifiedAt: { type: "string", format: "date-time", nullable: true },
                          hasPhone:        { type: "boolean", example: true },
                          phoneVerified:   { type: "boolean", example: false },
                          phoneVerifiedAt: { type: "string", format: "date-time", nullable: true },
                          accountStatus:   { type: "string", enum: ["PENDING", "ACTIVE", "SUSPENDED", "DELETED"] },
                          canLogin:        { type: "boolean", example: false },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ── Athletes ─────────────────────────────────────────────────────────────
      "/athletes/register": {
        post: {
          tags: ["Athletes"],
          summary: "Self-register as an athlete",
          description: "Public. Status starts as DRAFT.",
          security: [],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AthleteRequest" } } } },
          responses: {
            201: { description: "Registered", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            409: { description: "Email exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/register/by-admin": {
        post: {
          tags: ["Athletes"],
          summary: "Club admin registers an athlete",
          description: "Requires `athlete:create` permission. Status starts as PENDING.",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AthleteRequest" } } } },
          responses: {
            201: { description: "Registered by admin", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/profile": {
        get: {
          tags: ["Athletes"],
          summary: "Get my athlete profile",
          responses: {
            200: { description: "Profile", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes": {
        get: {
          tags: ["Athletes"],
          summary: "List all athletes",
          description: "Requires `athlete:view` permission.",
          responses: {
            200: { description: "Athletes list", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/AthleteProfile" } } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/search": {
        get: {
          tags: ["Athletes"],
          summary: "Search athletes",
          description: "Search by name or email. Requires `athlete:view` permission.",
          parameters: [{ in: "query", name: "search", schema: { type: "string" }, example: "Abebe" }],
          responses: {
            200: { description: "Results", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/AthleteProfile" } } } } } } },
          },
        },
      },
      "/athletes/status/{status}": {
        get: {
          tags: ["Athletes"],
          summary: "Get athletes by status",
          description: "Requires `athlete:view` permission.",
          parameters: [{ in: "path", name: "status", required: true, schema: { type: "string", enum: ["DRAFT", "PENDING", "FAYDA_VERIFIED", "APPROVED", "ACTIVE", "SUSPENDED", "REJECTED"] }, example: "PENDING" }],
          responses: {
            200: { description: "Athletes", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/AthleteProfile" } } } } } } },
          },
        },
      },
      "/athletes/{id}": {
        get: {
          tags: ["Athletes"],
          summary: "Get athlete by ID",
          description: "Requires `athlete:view` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Athlete", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Athletes"],
          summary: "Delete athlete",
          description: "Requires `athlete:delete` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Deleted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/{id}/approve": {
        patch: {
          tags: ["Athletes"],
          summary: "Approve athlete",
          description: "Sets AthleteStatus to APPROVED and UserStatus to ACTIVE.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Approved", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            400: { description: "Already approved or rejected", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/{id}/reject": {
        patch: {
          tags: ["Athletes"],
          summary: "Reject athlete",
          description: "Sets AthleteStatus to REJECTED.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string" } } } } } },
          responses: {
            200: { description: "Rejected", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            400: { description: "Already rejected", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/{id}/activate": {
        patch: {
          tags: ["Athletes"],
          summary: "Set athlete to ACTIVE",
          description: "Athlete must be APPROVED first.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Activated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            400: { description: "Not yet approved", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/{id}/suspend": {
        patch: {
          tags: ["Athletes"],
          summary: "Suspend athlete",
          description: "Sets AthleteStatus to SUSPENDED and UserStatus to PENDING.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string" } } } } } },
          responses: {
            200: { description: "Suspended", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            400: { description: "Already suspended", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── Coaches ──────────────────────────────────────────────────────────────
      "/coaches/register": {
        post: {
          tags: ["Coaches"],
          summary: "Self-register as a coach",
          description: "Public. Status starts as DRAFT.",
          security: [],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CoachRequest" } } } },
          responses: {
            201: { description: "Registered", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            409: { description: "Email exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/register/by-admin": {
        post: {
          tags: ["Coaches"],
          summary: "Club admin registers a coach",
          description: "Requires `coach:create` permission.",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CoachRequest" } } } },
          responses: {
            201: { description: "Registered by admin", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/profile": {
        get: {
          tags: ["Coaches"],
          summary: "Get my coach profile",
          responses: {
            200: { description: "Profile", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches": {
        get: {
          tags: ["Coaches"],
          summary: "List all coaches",
          description: "Requires `coach:view` permission.",
          responses: {
            200: { description: "Coaches list", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/CoachProfile" } } } } } } },
          },
        },
      },
      "/coaches/status/{status}": {
        get: {
          tags: ["Coaches"],
          summary: "Get coaches by status",
          description: "Requires `coach:view` permission.",
          parameters: [{ in: "path", name: "status", required: true, schema: { type: "string", enum: ["DRAFT", "PENDING", "FAYDA_VERIFIED", "APPROVED", "ACTIVE", "SUSPENDED", "REJECTED"] }, example: "PENDING" }],
          responses: {
            200: { description: "Coaches", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/CoachProfile" } } } } } } },
          },
        },
      },
      "/coaches/club/{clubId}": {
        get: {
          tags: ["Coaches"],
          summary: "Get coaches by club",
          description: "Requires `coach:view` permission.",
          parameters: [{ in: "path", name: "clubId", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Coaches in club", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/CoachProfile" } } } } } } },
          },
        },
      },
      "/coaches/{id}": {
        get: {
          tags: ["Coaches"],
          summary: "Get coach by ID",
          description: "Requires `coach:view` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Coach", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Coaches"],
          summary: "Delete coach",
          description: "Requires `coach:delete` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Deleted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/{id}/approve": {
        patch: {
          tags: ["Coaches"],
          summary: "Approve coach",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Approved", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            400: { description: "Already approved or rejected", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/{id}/reject": {
        patch: {
          tags: ["Coaches"],
          summary: "Reject coach",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string" } } } } } },
          responses: {
            200: { description: "Rejected", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            400: { description: "Already rejected", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/{id}/activate": {
        patch: {
          tags: ["Coaches"],
          summary: "Set coach to ACTIVE",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Activated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            400: { description: "Not yet approved", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/{id}/suspend": {
        patch: {
          tags: ["Coaches"],
          summary: "Suspend coach",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string" } } } } } },
          responses: {
            200: { description: "Suspended", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            400: { description: "Already suspended", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── Users ────────────────────────────────────────────────────────────────
      "/users": {
        get: {
          tags: ["Users"],
          summary: "List all users",
          description: "Requires `user:view` permission.",
          responses: {
            200: {
              description: "Users list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/UserWithRoles" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/{id}/activate": {
        patch: {
          tags: ["Users"],
          summary: "Activate user account",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Account activated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/UserPublic" } } } } } },
            400: { description: "Already active", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/{id}/deactivate": {
        patch: {
          tags: ["Users"],
          summary: "Deactivate user account",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Account deactivated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/UserPublic" } } } } } },
            400: { description: "Not active", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/{id}": {
        delete: {
          tags: ["Users"],
          summary: "Permanently delete a user",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "User deleted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" } } } } } },
            400: { description: "Cannot delete own account", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── Clubs ────────────────────────────────────────────────────────────────
      "/clubs/register": {
        post: {
          tags: ["Clubs"],
          summary: "Register a new club",
          security: [],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ClubRequest" } } } },
          responses: {
            201: { description: "Submitted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/ClubProfile" } } } } } },
            400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
          },
        },
      },
      "/clubs": {
        get: {
          tags: ["Clubs"],
          summary: "List all clubs",
          responses: {
            200: { description: "All clubs", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, count: { type: "integer" }, data: { type: "array", items: { $ref: "#/components/schemas/ClubProfile" } } } } } } },
          },
        },
      },
      "/clubs/verified": {
        get: {
          tags: ["Clubs"],
          summary: "List verified clubs",
          responses: {
            200: { description: "Verified clubs", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, count: { type: "integer" }, data: { type: "array", items: { $ref: "#/components/schemas/ClubProfile" } } } } } } },
          },
        },
      },
      "/clubs/pending": {
        get: {
          tags: ["Clubs"],
          summary: "List pending clubs",
          responses: {
            200: { description: "Pending clubs", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, count: { type: "integer" }, data: { type: "array", items: { $ref: "#/components/schemas/ClubProfile" } } } } } } },
            403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/clubs/{id}": {
        get: {
          tags: ["Clubs"],
          summary: "Get club by ID",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Club", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/ClubProfile" } } } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Clubs"],
          summary: "Delete club",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Deleted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } } } } },
          },
        },
      },
      "/clubs/{id}/approve": {
        patch: {
          tags: ["Clubs"],
          summary: "Approve a club",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Approved", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/ClubProfile" } } } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/clubs/{id}/reject": {
        patch: {
          tags: ["Clubs"],
          summary: "Reject a club",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["reason"], properties: { reason: { type: "string", minLength: 5, example: "Incomplete documentation." } } } } } },
          responses: {
            200: { description: "Rejected", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/ClubProfile" } } } } } },
          },
        },
      },
      "/clubs/{id}/suspend": {
        patch: {
          tags: ["Clubs"],
          summary: "Suspend a club",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Suspended", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/ClubProfile" } } } } } },
          },
        },
      },

      // ── Fayda Verification ───────────────────────────────────────────────────
      "/athletes/{athleteId}/fayda/initiate": {
        post: {
          tags: ["Fayda Verification"],
          summary: "Initiate Fayda verification for an athlete",
          parameters: [{ in: "path", name: "athleteId", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FaydaInitiateRequest" } } } },
          responses: {
            200: { description: "OTP sent", content: { "application/json": { schema: { $ref: "#/components/schemas/FaydaInitiateResponse" } } } },
            404: { description: "Athlete not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Already verified or in progress", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/{athleteId}/fayda/status": {
        get: {
          tags: ["Fayda Verification"],
          summary: "Get Fayda verification status for an athlete",
          parameters: [{ in: "path", name: "athleteId", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Verification record", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/FaydaVerificationRecord" } } } } } },
            404: { description: "No record found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/{coachId}/fayda/initiate": {
        post: {
          tags: ["Fayda Verification"],
          summary: "Initiate Fayda verification for a coach",
          parameters: [{ in: "path", name: "coachId", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FaydaInitiateRequest" } } } },
          responses: {
            200: { description: "OTP sent", content: { "application/json": { schema: { $ref: "#/components/schemas/FaydaInitiateResponse" } } } },
            404: { description: "Coach not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Already verified or in progress", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/{coachId}/fayda/status": {
        get: {
          tags: ["Fayda Verification"],
          summary: "Get Fayda verification status for a coach",
          parameters: [{ in: "path", name: "coachId", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Verification record", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/FaydaVerificationRecord" } } } } } },
            404: { description: "No record found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/fayda/verify/{verificationId}/confirm": {
        post: {
          tags: ["Fayda Verification"],
          summary: "Confirm OTP",
          parameters: [{ in: "path", name: "verificationId", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FaydaConfirmRequest" } } } },
          responses: {
            200: {
              description: "Verification successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          message: { type: "string", example: "Fayda verification successful." },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Wrong OTP / expired", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Verification not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── Event QR Check-in ──────────────────────────────────────────────────
      "/events/{eventId}/qr-tokens": {
        post: {
          tags: ["Event QR Check-in"],
          summary: "Generate an attendee QR token",
          parameters: [{ in: "path", name: "eventId", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventQRTokenRequest" } } } },
          responses: {
            201: { description: "QR token generated", content: { "application/json": { schema: { $ref: "#/components/schemas/EventQRTokenResponse" } } } },
            400: { description: "Event not published or already checked in", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Event or attendee not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/events/{eventId}/check-ins/scan": {
        post: {
          tags: ["Event QR Check-in"],
          summary: "Validate a QR token and check in an attendee",
          parameters: [{ in: "path", name: "eventId", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventCheckInScanRequest" } } } },
          responses: {
            200: { description: "Checked in", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "Attendee checked in successfully." } } } } } },
            400: { description: "Invalid or expired QR token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/events/{eventId}/check-ins": {
        get: {
          tags: ["Event QR Check-in"],
          summary: "List event check-ins",
          parameters: [{ in: "path", name: "eventId", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Check-ins",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ── Federation Policies ────────────────────────────────────────────────
      "/policies": {
        get: {
          tags: ["Federation Policies"],
          summary: "List all policies",
          responses: {
            200: {
              description: "Policies",
              content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Policy" } } } } } },
            },
          },
        },
        post: {
          tags: ["Federation Policies"],
          summary: "Create a policy",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PolicyRequest" } } } },
          responses: {
            201: { description: "Created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Policy" } } } } } },
            400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
          },
        },
      },
      "/policies/relevant": {
        get: {
          tags: ["Federation Policies"],
          summary: "Get policies relevant to the current user",
          responses: {
            200: {
              description: "Relevant policies",
              content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Policy" } } } } } },
            },
          },
        },
      },
      "/policies/{id}": {
        patch: {
          tags: ["Federation Policies"],
          summary: "Update a policy",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PolicyUpdateRequest" } } } },
          responses: {
            200: { description: "Updated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Policy" } } } } } },
          },
        },
      },
      "/policies/{id}/assignments": {
        post: {
          tags: ["Federation Policies"],
          summary: "Assign a policy to a club or event",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { clubId: { type: "string" }, eventId: { type: "string" } } } } } },
          responses: {
            201: { description: "Assigned", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/PolicyAssignment" } } } } } },
          },
        },
      },
      "/policies/{id}/audit": {
        get: {
          tags: ["Federation Policies"],
          summary: "Get policy change history",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Audit history",
              content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/PolicyAuditLog" } } } } } },
            },
          },
        },
      },

      // ── Events ─────────────────────────────────────────────────────────────
      "/events": {
        get: {
          tags: ["Events"],
          summary: "List all events",
          responses: { 200: { description: "Events", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Event" } } } } } } } },
        },
        post: {
          tags: ["Events"],
          summary: "Create an event draft",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventRequest" } } } },
          responses: { 201: { description: "Draft created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Event" } } } } } } },
        },
      },
      "/events/published": {
        get: {
          tags: ["Events"],
          summary: "List published events",
          security: [],
          responses: { 200: { description: "Published events", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Event" } } } } } } } },
        },
      },
      "/events/{id}/submit": {
        patch: {
          tags: ["Events"],
          summary: "Submit a draft for federation approval",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Submitted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Event" } } } } } },
            400: { description: "Invalid status", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/events/{id}/approve": {
        patch: {
          tags: ["Events"],
          summary: "Approve and publish an event",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Approved and published", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Event" } } } } } },
            400: { description: "Invalid status", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/events/{id}/reject": {
        patch: {
          tags: ["Events"],
          summary: "Reject a submitted event",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["reason"], properties: { reason: { type: "string" } } } } } },
          responses: {
            200: { description: "Rejected", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Event" } } } } } },
          },
        },
      },
      "/events/{id}/status": {
        patch: {
          tags: ["Events"],
          summary: "Override an event status",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["status", "reason"], properties: { status: { type: "string", enum: ["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED", "CANCELLED"] }, reason: { type: "string" } } } } } },
          responses: {
            200: { description: "Overridden", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Event" } } } } } },
          },
        },
      },

      // ── Payments ───────────────────────────────────────────────────────────
      "/payments/mock/webhook": {
        post: {
          tags: ["Payments"],
          summary: "Process a mock payment webhook",
          security: [],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/MockWebhookRequest" } } } },
          responses: {
            200: { description: "Webhook processed", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Payment" } } } } } },
            400: { description: "Invalid payload", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/payments/history": {
        get: {
          tags: ["Payments"],
          summary: "Get payment history for current user",
          responses: {
            200: { description: "Payment history", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Payment" } } } } } } },
          },
        },
      },
      "/payments/{paymentId}/status": {
        get: {
          tags: ["Payments"],
          summary: "Get payment status",
          parameters: [{ in: "path", name: "paymentId", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Payment status", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Payment" } } } } } },
          },
        },
      },
      "/events/{eventId}/registrations": {
        post: {
          tags: ["Payments"],
          summary: "Create an event registration and associated payment",
          parameters: [{ in: "path", name: "eventId", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateEventRegistration" } } } },
          responses: {
            201: { description: "Registration created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "object", properties: { registration: { type: "object" }, payment: { $ref: "#/components/schemas/Payment" }, mockCheckout: { $ref: "#/components/schemas/MockCheckout" } } } } } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);