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
            errors: { type: "object", additionalProperties: { type: "array", items: { type: "string" } } },
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
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful." },
            data: {
              type: "object",
              properties: {
                user:         { $ref: "#/components/schemas/UserPublic" },
                accessToken:  { type: "string", example: "eyJhbGci..." },
                refreshToken: { type: "string", example: "eyJhbGci..." },
              },
            },
          },
        },

        // Athlete
        AthleteRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password", "dateOfBirth", "gender", "nationality"],
          properties: {
            firstName:    { type: "string", example: "Abebe" },
            lastName:     { type: "string", example: "Bikila" },
            email:        { type: "string", format: "email", example: "abebe@example.com" },
            password:     { type: "string", minLength: 8, example: "Password123" },
            phoneNumber:  { type: "string", example: "0911000002" },
            dateOfBirth:  { type: "string", format: "date", example: "1995-06-15" },
            gender:       { type: "string", enum: ["MALE", "FEMALE"] },
            nationality:  { type: "string", example: "Ethiopian" },
            sportId:      { type: "string", example: "clxyz..." },
            clubId:       { type: "string", example: "clxyz..." },
            position:     { type: "string", example: "Forward" },
            height:       { type: "number", example: 175 },
            weight:       { type: "number", example: 68 },
            dominantHand: { type: "string", enum: ["LEFT", "RIGHT", "AMBIDEXTROUS"] },
            dominantFoot: { type: "string", enum: ["LEFT", "RIGHT", "BOTH"] },
            bloodType:    { type: "string", enum: ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"] },
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
          required: ["nin"],
          properties: {
            nin: { type: "string", example: "ETH-19950810-001", description: "Fayda National ID Number" },
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
      },
    },

    // ─── Global security (override per-route with security: [] for public) ────
    security: [{ bearerAuth: [] }],

    // ─── All paths inlined ────────────────────────────────────────────────────
    paths: {
      // ── Health ──────────────────────────────────────────────────────────────
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          security: [],
          responses: {
            200: { description: "Server is healthy", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "OK" } } } } } },
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
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } } },
          responses: {
            201: { description: "Registered successfully", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" }, data: { $ref: "#/components/schemas/UserPublic" } } } } } },
            400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            409: { description: "Email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          description: "Returns access + refresh tokens. Account must be ACTIVE.",
          security: [],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } } },
          responses: {
            200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
            400: { description: "Invalid credentials or account not active", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          description: "Returns the authenticated user's profile, roles, and permissions.",
          responses: {
            200: { description: "Current user", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { allOf: [{ $ref: "#/components/schemas/UserPublic" }, { type: "object", properties: { roles: { type: "array", items: { type: "string" }, example: ["SUPER_ADMIN"] }, permissions: { type: "array", items: { type: "string" }, example: ["athlete:view"] } } }] } } } } } },
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
            200: { description: "Logged out", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "Logged out successfully." } } } } } },
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
              description: "Email verified. accountActive=true means you can now log in.",
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
          description: "Sends a 6-digit OTP to the phone number on the account. Email must be verified first. Requires a valid token (even though the account is not yet ACTIVE — the token from the login attempt is not available yet, so use the token from a future partial-auth flow, or use userId via a temporary token issued at registration).",
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
              description: "Phone verified. If email was already verified, account becomes ACTIVE.",
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
          description: "Resend the email code or phone OTP. Previous codes are invalidated.",
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
          description: "Sets `AthleteStatus` to `APPROVED` and `UserStatus` to `ACTIVE` so the athlete can log in. Requires `athlete:update` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Approved", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string", example: "Athlete approved. Account is now active." }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            400: { description: "Already approved or rejected", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/{id}/reject": {
        patch: {
          tags: ["Athletes"],
          summary: "Reject athlete",
          description: "Sets `AthleteStatus` to `REJECTED`. User remains `PENDING` and cannot log in. Requires `athlete:update` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string", example: "Incomplete documentation submitted." } } } } } },
          responses: {
            200: { description: "Rejected", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string", example: "Athlete rejected." }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            400: { description: "Already rejected", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/{id}/activate": {
        patch: {
          tags: ["Athletes"],
          summary: "Set athlete to ACTIVE",
          description: "Athlete must be `APPROVED` first. Sets `AthleteStatus` to `ACTIVE` (fully active member). Requires `athlete:update` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Activated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string", example: "Athlete is now ACTIVE." }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
            400: { description: "Not yet approved", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/{id}/suspend": {
        patch: {
          tags: ["Athletes"],
          summary: "Suspend athlete",
          description: "Sets `AthleteStatus` to `SUSPENDED` and `UserStatus` to `PENDING`, blocking login. Requires `athlete:update` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string", example: "Violation of conduct policy." } } } } } },
          responses: {
            200: { description: "Suspended", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string", example: "Athlete suspended." }, data: { $ref: "#/components/schemas/AthleteProfile" } } } } } },
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
          description: "Requires `coach:create` permission. Status starts as PENDING.",
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
          description: "Sets `CoachStatus` to `APPROVED` and `UserStatus` to `ACTIVE` so the coach can log in. Requires `coach:update` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Approved", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string", example: "Coach approved. Account is now active." }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            400: { description: "Already approved or rejected", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/{id}/reject": {
        patch: {
          tags: ["Coaches"],
          summary: "Reject coach",
          description: "Sets coach status to `REJECTED`. User remains `PENDING`. Requires `coach:update` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string", example: "Incomplete documentation submitted." } } } } } },
          responses: {
            200: { description: "Rejected", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string", example: "Coach rejected." }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            400: { description: "Already rejected", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/{id}/activate": {
        patch: {
          tags: ["Coaches"],
          summary: "Set coach to ACTIVE",
          description: "Coach must be `APPROVED` first. Sets status to `ACTIVE`. Requires `coach:update` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Activated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string", example: "Coach is now ACTIVE." }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
            400: { description: "Not yet approved", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/coaches/{id}/suspend": {
        patch: {
          tags: ["Coaches"],
          summary: "Suspend coach",
          description: "Sets status to `SUSPENDED` and blocks login. Requires `coach:update` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string", example: "Violation of conduct policy." } } } } } },
          responses: {
            200: { description: "Suspended", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string", example: "Coach suspended." }, data: { $ref: "#/components/schemas/CoachProfile" } } } } } },
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
          description: "Returns all users with their roles. Requires `user:view` permission.",
          responses: {
            200: { description: "Users list", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { allOf: [{ $ref: "#/components/schemas/UserPublic" }, { type: "object", properties: { roles: { type: "array", items: { type: "string" }, example: ["ATHLETE"] } } }] } } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/{id}/activate": {
        patch: {
          tags: ["Users"],
          summary: "Activate user account",
          description: "Directly sets `UserStatus` to `ACTIVE`, allowing the user to log in. Use this when you need to grant access independently of the athlete/coach approval flow. Requires `user:update` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Account activated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string", example: "User account activated." }, data: { $ref: "#/components/schemas/UserPublic" } } } } } },
            400: { description: "Already active", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/{id}": {
        delete: {
          tags: ["Users"],
          summary: "Permanently delete a user",
          description: "Deletes the user and all related data (athlete/coach profile, audit logs, verifications) via database CASCADE. Cannot delete your own account. Requires `user:delete` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "User deleted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "User abebe@example.com has been permanently deleted." } } } } } },
            400: { description: "Cannot delete own account", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/users/{id}/deactivate": {
        patch: {
          tags: ["Users"],
          summary: "Deactivate user account",
          description: "Sets `UserStatus` to `SUSPENDED`, blocking login immediately. Requires `user:update` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: { description: "Account deactivated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string", example: "User account deactivated." }, data: { $ref: "#/components/schemas/UserPublic" } } } } } },
            400: { description: "Not active", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ── Clubs ────────────────────────────────────────────────────────────────
      "/clubs/register": {
        post: {
          tags: ["Clubs"],
          summary: "Register a new club",
          description: "Public. verificationStatus starts as PENDING.",
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
          description: "Requires `club:approve` permission.",
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
          description: "Requires `club:delete` permission.",
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
          description: "Requires `club:approve` permission. Sets verificationStatus to VERIFIED.",
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
          description: "Requires `club:approve` permission.",
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
          description: "Requires `club:approve` permission.",
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
          description: "Submits the athlete's NIN. An OTP is sent to their registered phone. The OTP is returned in the response outside production. Requires `fayda:verify` permission.",
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
          description: "Requires `fayda:verify` permission.",
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
          description: "Submits the coach's NIN. OTP sent to their registered phone. Requires `fayda:verify` permission.",
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
          description: "Requires `fayda:verify` permission.",
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
          description: "Submits the 6-digit OTP. On success sets faydaVerified=true and advances status to FAYDA_VERIFIED. Max 5 attempts, expires in 10 minutes.",
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
                          message:       { type: "string", example: "Fayda verification successful. Athlete status updated to FAYDA_VERIFIED." },
                          demographicData: {
                            type: "object",
                            properties: {
                              nin:         { type: "string", example: "ETH-19950810-001" },
                              firstName:   { type: "string", example: "Fayda" },
                              lastName:    { type: "string", example: "Verified" },
                              dateOfBirth: { type: "string", example: "1995-01-01" },
                              gender:      { type: "string", example: "MALE" },
                              phoneNumber: { type: "string", example: "+251911000000" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Wrong OTP / expired / max attempts", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Verification not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Already confirmed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
    },
  },
  // No external files needed — all paths are inlined above
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
