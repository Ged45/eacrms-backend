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
        url: "https://eacrms-backend-2.onrender.com/api/v1",
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
            schedule: { type: "array", minItems: 1, items: { type: "object", required: ["title", "startsAt", "endsAt"], properties: { title: { type: "string", example: "Opening ceremony" }, startsAt: { type: "string", format: "date-time", example: "2026-10-10T07:00:00.000Z" }, endsAt: { type: "string", format: "date-time", example: "2026-10-10T08:00:00.000Z" }, description: { type: "string" } } } },
            venue: { type: "string", example: "Addis Ababa Stadium" },
            organizerName: { type: "string", example: "Ethiopian Athletics Federation" },
            organizerEmail: { type: "string", format: "email", example: "events@example.com" },
            organizerPhone: { type: "string", example: "+251911000000" },
            disciplines: { type: "array", items: { type: "string" }, example: ["100m Sprint", "5,000m", "10,000m"], description: "List of race/discipline names for this event" },
            bannerUrl: { type: "string", format: "uri", example: "https://example.com/banner.jpg", description: "Event banner or cover image URL" },
            registrationDeadline: { type: "string", format: "date-time", example: "2026-09-30T23:59:59.000Z", description: "Last date/time to register for this event" },
          },
        },
        Event: {
          allOf: [
            { $ref: "#/components/schemas/EventRequest" },
            { type: "object", properties: { id: { type: "string" }, status: { type: "string", enum: ["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED", "CANCELLED"] }, createdById: { type: "string" }, approvedById: { type: "string", nullable: true }, approvedAt: { type: "string", format: "date-time", nullable: true }, publishedAt: { type: "string", format: "date-time", nullable: true }, rejectionReason: { type: "string", nullable: true }, enrolledClubsCount: { type: "number", description: "Computed count of registered clubs" }, totalAthletesEnrolled: { type: "number", description: "Computed count of registered athletes" }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
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
            rules: { type: "object", example: { minimumAge: 14, maximumAge: 18, requiredPermissions: ["athlete:view"] }, additionalProperties: true },
          },
        },
        Policy: {
          allOf: [
            { $ref: "#/components/schemas/PolicyRequest" },
            { type: "object", properties: { id: { type: "string" }, createdById: { type: "string" }, updatedById: { type: "string" }, assignments: { type: "array", items: { type: "object" } }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
          ],
        },

        // Athlete — Self-registration (mobile/web)
        AthleteRequest: {
          type: "object",
          description: "Self-registration payload. faydaVerificationToken is required; firstName, lastName, dateOfBirth, gender are extracted server-side from the token.",
          required: ["email", "password", "faydaVerificationToken"],
          properties: {
            email:                  { type: "string", format: "email", example: "abebe@example.com" },
            password:               { type: "string", minLength: 8, example: "Password123" },
            phoneNumber:            { type: "string", example: "+251911000002" },
            faydaVerificationToken: { type: "string", example: "eyJhbGciOi...", description: "Required — returned by POST /fayda/verify/confirm" },
            fanNumber:              { type: "string", nullable: true, example: "1456-1245-7895-9557" },
            sportIds:               { type: "array", items: { type: "string" }, example: ["sp_123", "sp_456"], description: "Array of sport/discipline UUIDs (select all that apply)" },
            sportId:                { type: "string", example: "sp_123", description: "Legacy single sport — prefer sportIds" },
            clubId:                 { type: "string", nullable: true, example: "clxyz..." },
            clubName:               { type: "string", nullable: true, example: "Addis Ababa Athletics Club" },
            region:                 { type: "string", example: "Addis Ababa" },
            height:                 { type: "number", example: 175, description: "Height in cm" },
            weight:                 { type: "number", example: 68, description: "Weight in kg" },
            emergencyContactPhone:  { type: "string", example: "+251911000000" },
            position:               { type: "string", example: "Forward" },
            dominantHand:           { type: "string", enum: ["LEFT", "RIGHT", "AMBIDEXTROUS"] },
            dominantFoot:           { type: "string", enum: ["LEFT", "RIGHT", "BOTH"] },
            bloodType:              { type: "string", enum: ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"] },
            // These are accepted but ignored — extracted from the Fayda token server-side:
            firstName:              { type: "string", example: "Abebe", description: "Ignored — extracted from Fayda token" },
            lastName:               { type: "string", example: "Bikila", description: "Ignored — extracted from Fayda token" },
            dateOfBirth:            { type: "string", format: "date", example: "1995-06-15", description: "Ignored — extracted from Fayda token" },
            gender:                 { type: "string", enum: ["MALE", "FEMALE"], description: "Ignored — extracted from Fayda token" },
            nationality:            { type: "string", example: "Ethiopian", description: "Optional — defaults to Ethiopian" },
          },
        },
        // Response shape for POST /athletes/register (self-registration mobile contract)
        AthleteRegistrationResponse: {
          type: "object",
          properties: {
            id:        { type: "string", example: "clxyz123" },
            status:    { type: "string", enum: ["DRAFT", "PENDING"], example: "DRAFT" },
            createdAt: { type: "string", format: "date-time" },
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

        AthleteDashboardProfile: {
          type: "object",
          description: "Shared dashboard profile response for GET /athletes/profile",
          properties: {
            id:             { type: "string" },
            user:           { type: "object", properties: { id: { type: "string" }, firstName: { type: "string" }, lastName: { type: "string" }, status: { type: "string" } } },
            name:           { type: "string", example: "Abebe Bikila" },
            amharicName:    { type: "string", nullable: true },
            fanNumber:      { type: "string", example: "1456-1245-7895-9557" },
            photoUrl:       { type: "string", nullable: true },
            faydaVerified:  { type: "boolean" },
            faydaVerifiedAt:{ type: "string", format: "date-time", nullable: true },
            primaryEvent:   { type: "string", example: "Marathon" },
            clubId:         { type: "string", nullable: true },
            clubName:       { type: "string", example: "Addis Ababa Athletics Club" },
            region:         { type: "string", nullable: true },
            ageTier:        { type: "string", enum: ["Senior", "U20", "Junior", "Youth"] },
            gender:         { type: "string", enum: ["MALE", "FEMALE"] },
            dateOfBirth:    { type: "string", format: "date" },
            nationality:    { type: "string" },
            contact:        { type: "object", properties: { phoneNumber: { type: "string", nullable: true }, email: { type: "string", nullable: true } } },
            fitnessStats:   { type: "object", properties: { heightCm: { type: "number", nullable: true }, weightKg: { type: "number", nullable: true }, ageYears: { type: "number" } } },
            careerRecords:  { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" } } } },
            personalBests:  { type: "object", properties: { allTime: { type: "array", items: { $ref: "#/components/schemas/PersonalBestRecord" } }, season: { type: "array", items: { $ref: "#/components/schemas/PersonalBestRecord" } } } },
            summaryCounts:  { type: "object", properties: { trainingSessions: { type: "number" }, weightEntries: { type: "number" }, appliedCompetitions: { type: "number" } } },
          },
        },
        PersonalBestRecord: {
          type: "object",
          properties: {
            id:    { type: "string" },
            event: { type: "string", example: "100m" },
            mark:  { type: "string", example: "9.63s" },
            date:  { type: "string", format: "date", nullable: true },
            venue: { type: "string", nullable: true },
          },
        },
        TrainingLogEntry: {
          type: "object",
          properties: {
            id:              { type: "string" },
            date:            { type: "string", format: "date" },
            type:            { type: "string", example: "Long Run" },
            distanceKm:      { type: "number" },
            durationMinutes: { type: "number" },
            notes:           { type: "string", nullable: true },
          },
        },
        WeightLogEntry: {
          type: "object",
          properties: {
            id:        { type: "string" },
            date:      { type: "string", format: "date" },
            weightKg:  { type: "number" },
            changeKg:  { type: "number" },
          },
        },
        ApplicationEntry: {
          type: "object",
          properties: {
            id:          { type: "string" },
            eventId:     { type: "string" },
            title:       { type: "string" },
            disciplines: { type: "array", items: { type: "string" } },
            appliedAt:   { type: "string", format: "date-time" },
            statusLabel: { type: "string" },
            organizer:   { type: "string" },
            location:    { type: "string", nullable: true },
            imageUrl:    { type: "string", nullable: true },
            clubName:    { type: "string", nullable: true },
          },
        },

        PublicAthlete: {
          type: "object",
          description: "Sanitized athlete data for public fan browsing.",
          properties: {
            id:             { type: "string" },
            user:           { type: "object", properties: { id: { type: "string" }, firstName: { type: "string" }, lastName: { type: "string" }, status: { type: "string" } } },
            name:           { type: "string", example: "Abebe Bikila" },
            amharicName:    { type: "string", nullable: true },
            photoUrl:       { type: "string", nullable: true },
            achievement:    { type: "string", nullable: true },
            primaryEvent:   { type: "string", example: "Marathon" },
            clubId:         { type: "string", nullable: true },
            clubName:       { type: "string" },
            faydaVerified:  { type: "boolean" },
            personalBest:   { type: "string", nullable: true },
            ageTier:        { type: "string", enum: ["Senior", "U20", "Junior", "Youth"] },
            gender:         { type: "string", enum: ["MALE", "FEMALE"] },
            quote:          { type: "string", nullable: true },
          },
        },
        PublicAthleteDetail: {
          type: "object",
          description: "Full public athlete profile for detail modal.",
          properties: {
            id:             { type: "string" },
            name:           { type: "string" },
            amharicName:    { type: "string", nullable: true },
            photoUrl:       { type: "string", nullable: true },
            faydaFin:       { type: "string", nullable: true },
            faydaVerified:  { type: "boolean" },
            faydaVerifiedAt:{ type: "string", format: "date-time", nullable: true },
            primaryEvent:   { type: "string" },
            clubId:         { type: "string", nullable: true },
            clubName:       { type: "string" },
            region:         { type: "string", nullable: true },
            ageTier:        { type: "string", enum: ["Senior", "U20", "Junior", "Youth"] },
            gender:         { type: "string", enum: ["MALE", "FEMALE"] },
            dateOfBirth:    { type: "string", format: "date" },
            nationality:    { type: "string" },
            pb:             { type: "string" },
            personalBests:  { type: "array", items: { type: "object", properties: { event: { type: "string" }, mark: { type: "string" }, date: { type: "string", format: "date", nullable: true }, venue: { type: "string", nullable: true } } } },
            achievement:    { type: "string", nullable: true },
            achievements:   { type: "array", items: { type: "string" } },
            quote:          { type: "string", nullable: true },
            status:         { type: "string" },
          },
        },
        NewsArticle: {
          type: "object",
          description: "Public news article list item.",
          properties: {
            id:               { type: "string" },
            title:            { type: "string" },
            date:             { type: "string", format: "date-time" },
            category:         { type: "string" },
            shortDescription: { type: "string" },
            imageUrl:         { type: "string", nullable: true },
            author:           { type: "string" },
            isFeatured:       { type: "boolean" },
          },
        },
        NewsArticleDetail: {
          type: "object",
          description: "Full news article content.",
          properties: {
            id:               { type: "string" },
            title:            { type: "string" },
            date:             { type: "string", format: "date-time" },
            category:         { type: "string" },
            shortDescription: { type: "string" },
            content:          { type: "string" },
            imageUrl:         { type: "string", nullable: true },
            insideImages:     { type: "array", items: { type: "string" } },
            author:           { type: "string" },
            isFeatured:       { type: "boolean" },
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
          description: "Returns the mobile-friendly auth payload expected by the app: token, userRole, refreshToken, club metadata and user profile. Account must be ACTIVE.",
          security: [],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } } },
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
      "/fayda/verify/{verificationId}": {
        get: {
          tags: ["Fayda Verification"],
          summary: "Get verification result (secure)",
          description: "Publicly accessible endpoint to fetch a verification record by id. Requires the short-lived verification token either as query `?token=` or header `x-fayda-token`.",
          security: [],
          parameters: [
            { in: "path", name: "verificationId", required: true, schema: { type: "string" }, description: "The verificationId returned from the initiate endpoint" },
            { in: "query", name: "token", required: false, schema: { type: "string" }, description: "Fayda verification token returned on OTP confirmation" },
            { in: "header", name: "x-fayda-token", required: false, schema: { type: "string" }, description: "Fayda verification token (alternative to query)" },
          ],
          responses: {
            200: { description: "Verification record", content: { "application/json": { schema: { $ref: "#/components/schemas/FaydaVerificationRecord" } } } },
            400: { description: "Missing or invalid token / verification not confirmed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Invalid or expired token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Verification record not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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

      // ── Meta ────────────────────────────────────────────────────────────────
      "/meta/registration-options": {
        get: {
          tags: ["Meta"],
          summary: "Registration dropdown options",
          description: "Public endpoint returning disciplines, verified clubs, and regions for the athlete self-registration form.",
          security: [],
          responses: {
            200: {
              description: "Registration options",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          disciplines: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id:          { type: "string", example: "sp_123" },
                                name:        { type: "string", example: "Marathon" },
                                description: { type: "string", nullable: true },
                              },
                            },
                          },
                          clubs: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id:     { type: "string", example: "cl_xyz" },
                                name:   { type: "string", example: "Addis Ababa Athletics Club" },
                                region: { type: "string", nullable: true, example: "Addis Ababa" },
                                city:   { type: "string", nullable: true, example: "Addis Ababa" },
                              },
                            },
                          },
                          regions: {
                            type: "array",
                            items: { type: "string" },
                            example: ["Addis Ababa", "Oromia", "Amhara"],
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
      },

      // ── Athletes ─────────────────────────────────────────────────────────────
      "/athletes/register": {
        post: {
          tags: ["Athletes"],
          summary: "Self-register as an athlete",
          description: "Public endpoint. Requires a Fayda verification token. Status starts as DRAFT. Returns a lightweight confirmation (id, status, createdAt) — the user must wait for federation approval before logging in.",
          security: [],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AthleteRequest" } } } },
          responses: {
            201: {
              description: "Registration submitted for review",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Your registration is under review. You will receive an email once approved." },
                      data: { $ref: "#/components/schemas/AthleteRegistrationResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation failed or invalid Fayda token", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
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
          description: "Returns the full dashboard profile with personal bests, training/weight summary counts.",
          responses: {
            200: { description: "Dashboard profile", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/AthleteDashboardProfile" } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        patch: {
          tags: ["Athletes"],
          summary: "Update athlete profile",
          description: "Updates editable profile fields from the profile data screen.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    phoneNumber:  { type: "string" },
                    email:        { type: "string", format: "email" },
                    primaryEvent: { type: "string" },
                    region:       { type: "string" },
                    clubName:     { type: "string" },
                    clubId:       { type: "string" },
                    height:       { type: "number" },
                    weight:       { type: "number" },
                    photoUrl:     { type: "string", format: "uri" },
                    amharicName:  { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Profile updated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "object", properties: { id: { type: "string" }, updatedFields: { type: "array", items: { type: "string" } } } } } } } } },
            400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } },
            404: { description: "Athlete not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/profile/fayda": {
        get: {
          tags: ["Athletes", "Fayda Verification"],
          summary: "Get Fayda verification data for the logged-in athlete",
          description: "Returns the latest Fayda verification record (id, status, demographic data) for the authenticated athlete.",
          responses: {
            200: { description: "Fayda verification data", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "object", properties: { verificationId: { type: "string" }, status: { type: "string" }, demographicData: { type: "object", nullable: true } } } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "No verification record found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/athletes/profile/personal-bests": {
        get: {
          tags: ["Athletes"],
          summary: "Get personal bests",
          description: "Returns all-time and season personal best records.",
          responses: {
            200: {
              description: "Personal bests",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          allTime: { type: "array", items: { $ref: "#/components/schemas/PersonalBestRecord" } },
                          season: { type: "array", items: { $ref: "#/components/schemas/PersonalBestRecord" } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Athletes"],
          summary: "Add a personal best",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["event", "mark"],
                  properties: {
                    event: { type: "string" },
                    mark: { type: "string" },
                    date: { type: "string", format: "date" },
                    venue: { type: "string" },
                    scope: { type: "string", enum: ["ALL_TIME", "SEASON"] },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Personal best added",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/PersonalBestRecord" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/athletes/profile/training-logs": {
        get: {
          tags: ["Athletes"],
          summary: "Get training logs",
          description: "Returns the athlete training history.",
          responses: {
            200: {
              description: "Training logs",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/TrainingLogEntry" } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Athletes"],
          summary: "Log a training session",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["date", "type", "distanceKm", "durationMinutes"],
                  properties: {
                    date: { type: "string", format: "date" },
                    type: { type: "string" },
                    distanceKm: { type: "number" },
                    durationMinutes: { type: "number" },
                    notes: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Training session logged",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/TrainingLogEntry" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/athletes/profile/weight-logs": {
        get: {
          tags: ["Athletes"],
          summary: "Get weight logs",
          description: "Returns the athlete weight history with change deltas.",
          responses: {
            200: {
              description: "Weight logs",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/WeightLogEntry" } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Athletes"],
          summary: "Log weight entry",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["date", "weightKg"],
                  properties: {
                    date: { type: "string", format: "date" },
                    weightKg: { type: "number" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Weight entry logged",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/WeightLogEntry" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/athletes/applications": {
        get: {
          tags: ["Athletes"],
          summary: "Get applied competitions",
          description: "Returns the athlete competition applications.",
          responses: {
            200: {
              description: "Applications",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/ApplicationEntry" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // ── Public Fan-Facing Athlete Endpoints ─────────────────────────────────
      "/athletes/public": {
        get: {
          tags: ["Athletes", "Public"],
          summary: "List athletes (public)",
          description: "Public endpoint for fan browsing. Returns sanitized active athlete data for the spotlight carousel and athlete directory. No authentication required.",
          parameters: [
            { name: "featured", in: "query", schema: { type: "boolean" }, description: "Filter only spotlight/featured athletes" },
            { name: "status", in: "query", schema: { type: "string" }, description: "Filter by status (default: ACTIVE)" },
            { name: "search", in: "query", schema: { type: "string" }, description: "Search by name, event, or club" },
            { name: "club", in: "query", schema: { type: "string" }, description: "Filter by club name" },
            { name: "region", in: "query", schema: { type: "string" }, description: "Filter by region" },
            { name: "page", in: "query", schema: { type: "integer" }, description: "Page number (default: 1)" },
            { name: "limit", in: "query", schema: { type: "integer" }, description: "Page size (default: 8)" },
          ],
          responses: {
            200: {
              description: "Public athlete list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/PublicAthlete" } },
                      meta: { type: "object", properties: { total: { type: "integer" }, limit: { type: "integer" }, page: { type: "integer" } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/athletes/public/{id}": {
        get: {
          tags: ["Athletes", "Public"],
          summary: "Get athlete detail (public)",
          description: "Public endpoint for athlete detail modal and profile screen. Returns full public profile with personal bests. No authentication required.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Unique athlete ID" },
          ],
          responses: {
            200: {
              description: "Public athlete detail",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { $ref: "#/components/schemas/PublicAthleteDetail" },
                    },
                  },
                },
              },
            },
            404: { description: "Athlete not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      // ── Public News Endpoints ─────────────────────────────────────────────────
      "/news": {
        get: {
          tags: ["News", "Public"],
          summary: "List news articles",
          description: "Public endpoint for the news feed. No authentication required.",
          parameters: [
            { name: "search", in: "query", schema: { type: "string" }, description: "Search across title and description" },
            { name: "category", in: "query", schema: { type: "string", enum: ["CHAMPIONSHIP", "TRAINING", "ANNOUNCEMENT", "COMMUNITY", "RECOGNITION", "GENERAL"] }, description: "Filter by category" },
            { name: "featured", in: "query", schema: { type: "boolean" }, description: "Filter featured articles" },
            { name: "page", in: "query", schema: { type: "integer" }, description: "Page number (default: 1)" },
            { name: "limit", in: "query", schema: { type: "integer" }, description: "Page size (default: 10)" },
            { name: "sort", in: "query", schema: { type: "string", enum: ["date_desc", "date_asc"] }, description: "Sort order (default: date_desc)" },
          ],
          responses: {
            200: {
              description: "News article list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/NewsArticle" } },
                      meta: { type: "object", properties: { total: { type: "integer" }, page: { type: "integer" }, limit: { type: "integer" } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/news/{id}": {
        get: {
          tags: ["News", "Public"],
          summary: "Get news article detail",
          description: "Public endpoint for full article view. No authentication required.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Unique news article ID" },
          ],
          responses: {
            200: {
              description: "News article detail",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { $ref: "#/components/schemas/NewsArticleDetail" },
                    },
                  },
                },
              },
            },
            404: { description: "News article not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      // ── Payments ───────────────────────────────────────────────────────────
      "/payments/mock/webhook": {
        post: {
          tags: ["Payments"],
          summary: "Process a mock payment webhook",
          description: "Internal/testing endpoint for mock payment provider callbacks. Accepts `reference`, `status` (PAID|FAILED) and `transactionId`. Uses a shared header `x-mock-payment-secret` for verification.",
          security: [],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/MockWebhookRequest" } } } },
          responses: {
            200: { description: "Webhook processed", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/Payment" } } } } } },
            400: { description: "Invalid payload or payment already finalized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Invalid webhook secret", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Payment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/payments/history": {
        get: {
          tags: ["Payments"],
          summary: "Get payment history for current user",
          description: "Returns the authenticated user's payments ordered by createdAt desc.",
          responses: {
            200: { description: "Payment history", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Payment" } } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Payment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/events/{eventId}/registrations": {
        post: {
          tags: ["Payments"],
          summary: "Create an event registration and associated payment",
          description: "Registers an athlete for an event and creates a payment record. Returns a `mockCheckout` object for test providers.",
          parameters: [{ in: "path", name: "eventId", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateEventRegistration" } } } },
          responses: {
            201: { description: "Registration created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "object", properties: { registration: { type: "object" }, payment: { $ref: "#/components/schemas/Payment" }, mockCheckout: { $ref: "#/components/schemas/MockCheckout" } } } } } } } },
            400: { description: "Validation failed or event not published", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Event or athlete not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
      "/events/{eventId}/qr-tokens": {
        post: {
          tags: ["Event QR Check-in"],
          summary: "Generate an attendee QR token",
          description: "Requires `event:checkin`. The event must be published. The response's `qrData` is the value to encode in a QR image.",
          parameters: [{ in: "path", name: "eventId", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["attendeeType", "attendeeId"], properties: { attendeeType: { type: "string", enum: ["ATHLETE", "CLUB"] }, attendeeId: { type: "string" }, expiresInMinutes: { type: "integer", default: 1440, maximum: 10080 } } } } } },
          responses: { 201: { description: "QR token generated" }, 400: { description: "Event is not published or attendee already checked in" }, 404: { description: "Event or attendee not found" } },
        },
      },
      "/events/{eventId}/check-ins/scan": {
        post: {
          tags: ["Event QR Check-in"],
          summary: "Validate a QR token and check in an attendee",
          description: "Requires `event:checkin`. Tokens are one-time; invalid, expired, reused, or cross-event tokens are rejected.",
          parameters: [{ in: "path", name: "eventId", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["token"], properties: { token: { type: "string" } } } } } },
          responses: { 200: { description: "Checked in" }, 400: { description: "Invalid, expired, or used QR token" } },
        },
      },
      "/events/{eventId}/check-ins": {
        get: {
          tags: ["Event QR Check-in"],
          summary: "List event check-ins",
          description: "Requires `event:view` permission.",
          parameters: [{ in: "path", name: "eventId", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Check-ins" } },
        },
      },

      "/policies": {
        get: {
          tags: ["Federation Policies"],
          summary: "List all policies",
          description: "Requires `policy:view` permission.",
          responses: { 200: { description: "Policies", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Policy" } } } } } } } },
        },
        post: {
          tags: ["Federation Policies"],
          summary: "Create a policy",
          description: "Requires `policy:create` permission.",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PolicyRequest" } } } },
          responses: { 201: { description: "Created" }, 400: { description: "Validation failed" } },
        },
      },
      "/policies/relevant": {
        get: {
          tags: ["Federation Policies"],
          summary: "Get policies relevant to the current user",
          description: "Returns active policies assigned to the caller's club or created events. It does not expose unrelated policy rules.",
          responses: { 200: { description: "Relevant policies" } },
        },
      },
      "/policies/{id}": {
        patch: {
          tags: ["Federation Policies"],
          summary: "Update a policy",
          description: "Requires `policy:update`; each update is recorded in the policy audit log.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PolicyRequest" } } } },
          responses: { 200: { description: "Updated" } },
        },
      },
      "/policies/{id}/assignments": {
        post: {
          tags: ["Federation Policies"],
          summary: "Assign a policy to a club or event",
          description: "Requires `policy:update`. Exactly one target is required.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { clubId: { type: "string" }, eventId: { type: "string" } } } } } },
          responses: { 201: { description: "Assigned" } },
        },
      },
      "/policies/{id}/audit": {
        get: {
          tags: ["Federation Policies"],
          summary: "Get policy change history",
          description: "Requires `policy:view` permission.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Audit history" } },
        },
      },

      "/events": {
        get: {
          tags: ["Events"],
          summary: "List all events",
          description: "Requires `event:view` permission.",
          responses: { 200: { description: "Events", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Event" } } } } } } } },
        },
        post: {
          tags: ["Events"],
          summary: "Create an event draft",
          description: "Creates an event in `DRAFT`. Requires `event:create` permission; it cannot be published until federation approval.",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventRequest" } } } },
          responses: { 201: { description: "Draft created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Event" } } } } } } },
        },
      },
      "/events/published": {
        get: {
          tags: ["Events"],
          summary: "List published events",
          description: "Public endpoint for the home page competition section. Returns published events with disciplines, banner image, enrollment counts, and registration deadline.",
          security: [],
          responses: { 200: { description: "Published events", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Event" } } } } } } } },
        },
      },
      "/events/{id}/detail": {
        get: {
          tags: ["Events"],
          summary: "Event detail (mobile-optimized)",
          description: "Public endpoint returning full event info with enrollment stats, schedule breakdown, and a derived lifecycleStatus (REGISTRATION_OPEN | UPCOMING | LIVE | COMPLETED | CANCELLED).",
          security: [],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, example: "clxyz123" }],
          responses: {
            200: {
              description: "Event detail",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        allOf: [
                          { $ref: "#/components/schemas/Event" },
                          {
                            type: "object",
                            properties: {
                              lifecycleStatus: { type: "string", enum: ["REGISTRATION_OPEN", "UPCOMING", "LIVE", "COMPLETED", "CANCELLED"], example: "REGISTRATION_OPEN", description: "Frontend-ready status derived from schedule dates" },
                              enrolledClubsCount: { type: "number", example: 12 },
                              totalAthletesEnrolled: { type: "number", example: 85 },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            404: { description: "Event not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/events/{id}/submit": {
        patch: {
          tags: ["Events"],
          summary: "Submit a draft for federation approval",
          description: "The event creator only. Transitions `DRAFT` to `PENDING_APPROVAL`.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Submitted" }, 400: { description: "Invalid status", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }, 403: { description: "Not the creator" } },
        },
      },
      "/events/{id}/approve": {
        patch: {
          tags: ["Events"],
          summary: "Approve and publish an event",
          description: "Federation only (`event:approve`). Transitions `PENDING_APPROVAL` to `PUBLISHED` and records the approver.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Approved and published" }, 400: { description: "Invalid status" }, 403: { description: "Forbidden" } },
        },
      },
      "/events/{id}/reject": {
        patch: {
          tags: ["Events"],
          summary: "Reject a submitted event",
          description: "Federation only (`event:approve`).",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["reason"], properties: { reason: { type: "string", example: "Schedule details are incomplete." } } } } } },
          responses: { 200: { description: "Rejected" } },
        },
      },
      "/events/{id}/status": {
        patch: {
          tags: ["Events"],
          summary: "Override an event status",
          description: "Administrative override. Requires `event:override`; every override is written to event history and the audit log.",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["status", "reason"], properties: { status: { type: "string", enum: ["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED", "CANCELLED"] }, reason: { type: "string" } } } } } },
          responses: { 200: { description: "Overridden" } },
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
