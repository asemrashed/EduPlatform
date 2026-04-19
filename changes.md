Here is a read-only audit based on verified code under moynamoti-main/src/app/api/, src/models/, and src/lib/, cross-checked with EDUPLATFORM-MASTER-PLAN.md (API contract lock, payment safety rule, governance). No prior audit files were used.

1. API contract consistency
src/app/api/enrollments/route.ts:11 | MEDIUM | GET has no getServerSession / role check; any caller can list/filter enrollments (and populated student/course data) via query params — inconsistent with typical protected “admin/student-scoped” contract and risks data exposure.

src/app/api/auth/register/route.ts:31 | LOW | Errors use { error: '...' } without success: false; other routes often use { success: false, error } — meaningful response-shape inconsistency for clients.

src/app/api/payment/quick-initiate/route.ts:353 | LOW | On some failures, response may include error: errorMessage from caught exceptions (errorMessage from error instanceof Error) while payment/initiate tends to return generic 'Internal server error' — inconsistent error exposure between payment entry points.

2. Authentication & authorization (expected mobile + password + OTP flow)
src/app/api/auth/register/route.ts:88–114 | HIGH | Registration activates the user immediately with isActive: true (:100) — no registration OTP send/verify endpoints; no “pending until OTP verified” state. This does not match the described “registration with mobile + password + OTP verification” flow.

src/lib/auth.ts:43–99 | HIGH | Login is credentials-only (phone + password); no OTP fallback, no “requires OTP” branch, no device/session flags — does not match “login with OTP fallback if required” as described (unless that behavior lives outside audited paths — UNVERIFIED for other files).

src/app/api/auth/forgot-password/send-otp/route.ts:84–112 | INFO | Forgot-password OTP exists: hashed OTP (:85), expiry (:86), cooldown (:71–79), SMS send — password-reset flow only, not registration/login OTP.

src/app/api/auth/forgot-password/verify-otp/route.ts:53–68 | INFO | OTP attempts capped (MAX_VERIFY_ATTEMPTS, :53–58); invalid OTP increments attempts (:62–64).

src/app/api/auth/forgot-password/verify-otp/route.ts:71–77 | LOW | Successful OTP does not invalidate OTP hash / mark used immediately; reuse possible until reset completes (mitigated by resetToken + expiry on reset).

src/app/api/auth/forgot-password/reset/route.ts:96–100 | INFO | Password reset uses bcrypt.hash(password, 12) before storage; PasswordResetOtp doc marked used: true (:99–100).

src/app/api/payment/initiate/route.ts:58 | HIGH | userId = studentId || session.user.id with no check that studentId equals session.user.id for non-admin — IDOR: authenticated user could pass another user’s id to initiate payment/enrollment linkage for them.

3. Payment safety (highest risk)
src/app/api/payment/initiate/route.ts:108–199 | INFO | Payment row upserted with transactionId (:182–199); Enrollment created/updated with pending payment (:130–150) before redirect — aligns with “record before redirect” intent.

src/app/api/payment/validate/route.ts:70–109 | INFO | Access/granting path uses server-side shurjoPayVerify (:70–72) and updates Enrollment + Payment by verification result — aligns with “validation before granting access” when this route is used.

src/models/Payment.ts:66–72 | INFO | transactionId required, unique, indexed — supports idempotency at DB level for transactionId.

src/app/api/payment/success/route.ts:47–59 | HIGH | GET handler logs logPaymentValidation with status: 'SUCCESS' (:53) without calling ShurjoPay verification in this file — misleading logging and can imply success without gateway verification on this path.

src/app/api/payment/success/route.ts:31–44 | MEDIUM | Redirect only requires enrollment existence for paymentId; does not verify payment with gateway here — no paid access granted in this snippet, but return URL is not a substitute for verified payment state (plan: no access without verified payment).

src/lib/shurjopay.ts:139–159 | INFO | Verification uses authenticated API token + order_id — UNVERIFIED whether this satisfies a separate “IPN signature” requirement (plan mentions SSLCommerz IPN; this project uses ShurjoPay); no dedicated src/app/api/**/ipn route found under audited tree — UNVERIFIED for server-side IPN callback parity.

src/app/api/payment/log/route.ts:13–105 | MEDIUM | No authentication; accepts arbitrary event / transactionId / details — not a verified IPN endpoint; cannot replace signed webhook verification.

src/app/api/payment/quick-initiate/route.ts:146–333 | HIGH | Unauthenticated flow creates/finds users and initiates ShurjoPay (:146 onward) — effectively a public checkout + user provisioning path; high abuse risk vs “payment safety” and typical auth-bound enrollment.

src/lib/paymentLogger.ts:71–77 | LOW | Initiate logs may stringify full details including secretPay gateway payloads (payment/initiate passes details: { gateway: 'shurjopay', secretPay } at initiate/route.ts:209) — risk of sensitive gateway response data in logs (plan: no secrets in logs).

4. Data integrity & models
src/models/User.ts:26–39 | INFO | Required fields, enums for role, password minlength; indexes on role, isActive (:100–101).

src/models/Payment.ts:102–107 | INFO | Status enum + default; compound indexes on common query patterns (:211–214).

src/models/PasswordResetOtp.ts:33–67 | INFO | OTP stored hashed, expiry, attempts, used — consistent with reset OTP security.

UNVERIFIED (full cross-file): whether every endpoint’s required fields match types/* across all routes — not exhaustively enumerated here.

5. Security
src/app/api/auth/register/route.ts:110–114 | HIGH | Plaintext password included in SMS body — credential leakage.

src/app/api/payment/quick-initiate/route.ts:125–126 | HIGH | Newly generated random password sent in plaintext SMS — same class of issue.

src/lib/sms-bd.ts:15–20 | INFO | SMS credentials from env only; throws if missing — no hardcoded token in source.

src/lib/auth.ts:123 | INFO | secret: process.env.NEXTAUTH_SECRET — no hardcoded NextAuth secret in file.

src/app/api/upload/avatar/route.ts:6–16 | INFO | Upload requires session; file type/size validated (:29–44).

src/app/api/payment/initiate/route.ts:222–250 | LOW | Catch block may expose gateway config vs generic error (partially gated by isGatewayConfigError) — still mixes internal error detail with client response.

Rate limiting (auth / OTP / payment): not observed in audited src/app/api handlers — LOW unless abused (note only).

6. Architecture alignment (plan: modular, no debug routes, contract lock, no raw errors)
src/app/api/admin/seed-reviews/route.ts:183–199 | MEDIUM | Admin-only seed endpoint exists (POST) — operational route, not “business API”; plan says avoid debug routes in production; gate with env/feature flag is UNVERIFIED in this file.

src/app/api/payment/success/[transactionId]/route.ts:15–100 | LOW | Debug-style console.log and large commented blocks — UNVERIFIED if this is dead code path vs live redirect.

Contract lock vs learning-project (byte-for-byte parity): UNVERIFIED — would require comparing to learning-project handlers; not done in this audit.

If clean
Not applicable — issues found.

Not aligned — issues remain in [API contract & auth boundaries, authentication/OTP registration flow, payment safety & logging, security of credentials in SMS]