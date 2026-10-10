# 3-Strike Referral Fraud System + Phone-Based Account Creation

## Overview

This document describes the enhanced referral fraud prevention system that implements:
1. **3-Strike Auto-Ban System**: Referral codes are automatically banned after 3 fraud attempts
2. **Phone-Based Account Creation**: Guest orders with payment automatically create user accounts
3. **Comprehensive Fraud Logging**: All fraud attempts are logged to database for investigation

---

## Problem Solved

### Original Vulnerability
Users could:
1. Create an account and get a referral code
2. Use incognito browser to place guest orders
3. Use their own referral code to get BOTH:
   - 5% discount on order
   - 50% commission on profit

### Additional Enhancement Request
Need to:
- Use **phone number as unique identifier**
- Automatically create accounts when guests pay
- Track fraud attempts with **silent 3-strike system**
- Permanently ban referral codes after 3 strikes
- No warnings (silent blocking)

---

## System Architecture

### 1. Phone-Based Account Creation

**When**: Automatically triggered when guest order payment is successful

**File**: `/lib/phoneAccountCreation.ts`

**Flow**:
```typescript
Guest places order → Payment successful → Auto-create account with phone
```

**Account Properties**:
- `phone`: Unique identifier (normalized: removed spaces, country codes)
- `phoneVerified`: true (verified by payment)
- `email`: Optional (can be null)
- `password`: null (account incomplete)
- `isAccountComplete`: false (needs email verification + password)

**Benefits**:
- Phone numbers harder to fake than emails
- Creates accountability even for "guest" orders
- Enables fraud tracking across multiple orders
- User can complete account later (set password, add email)

---

### 2. 3-Strike Auto-Ban System

**How It Works**:

```
Strike 1: Fraud detected → Order blocked → Strike logged
Strike 2: Fraud detected → Order blocked → Strike logged
Strike 3: Fraud detected → Order blocked → REFERRAL CODE PERMANENTLY BANNED
```

**Silent Operation**:
- ❌ No warnings sent to user
- ❌ No email notifications
- ✅ Silent logging to database
- ✅ Automatic ban on 3rd strike
- ✅ Admin can review fraud logs

**Database Tracking**:
```typescript
ReferralCode {
  fraudAttempts: 0 → 1 → 2 → 3
  lastFraudAttemptAt: timestamp
  autoBannedAt: timestamp (when banned)
  autoBanReason: string
  isSuspended: true (after 3 strikes)
  isActive: false (after 3 strikes)
}
```

---

## Database Schema Changes

### 1. Updated `User` Model

```prisma
model User {
  email         String?  @unique  // Now optional (phone-only accounts)
  phone         String?  @unique  // Now unique (primary identifier)
  password      String?           // Optional (incomplete accounts)
  phoneVerified Boolean  @default(false)
  isAccountComplete Boolean @default(false)
  // ... other fields
}
```

**Key Changes**:
- `email` is now optional (allows phone-only accounts)
- `phone` is now unique (enables phone-based login)
- `phoneVerified` tracks if phone was verified
- `isAccountComplete` tracks if user set password + verified email

---

### 2. Updated `ReferralCode` Model

```prisma
model ReferralCode {
  // ... existing fields

  // NEW: 3-Strike System
  fraudAttempts      Int       @default(0)
  lastFraudAttemptAt DateTime?
  autoBannedAt       DateTime?
  autoBanReason      String?

  // Relationships
  fraudLogs FraudLog[]
}
```

**Fraud Tracking**:
- `fraudAttempts`: Counter (0 → 3)
- `lastFraudAttemptAt`: Timestamp of most recent fraud
- `autoBannedAt`: When code was auto-banned
- `autoBanReason`: Detailed reason for ban

---

### 3. NEW `FraudLog` Model

Complete audit trail of all fraud attempts:

```prisma
model FraudLog {
  id                  String

  // Who attempted fraud
  referrerUserId      String
  referralCodeId      String

  // Attempted order details
  guestPhone          String?
  guestEmail          String?
  refereeUserId       String?

  // Technical tracking
  ipAddress           String?
  userAgent           String?

  // Fraud detection results
  fraudScore          Int              // 0-100
  confidence          FraudConfidence  // LOW, MEDIUM, HIGH, CERTAIN
  reason              String
  details             Json             // Array of indicators

  // Action taken
  wasBlocked          Boolean
  strikeNumber        Int?             // 1, 2, or 3
  causedAutoBan       Boolean          // True if this was strike 3

  // Investigation data
  orderAttemptData    Json?            // Full order snapshot

  createdAt           DateTime
}
```

**Benefits**:
- Complete audit trail
- Admin can review all fraud attempts
- Exportable for analysis
- Supports future ML training

---

## Code Implementation

### 1. Fraud Detection Layer 0: Check for Banned Codes

**File**: `/lib/referralFraudDetection.ts`

```typescript
// LAYER 0: Check if referral code is already banned
const referralCode = await prisma.referralCode.findFirst({
  where: { userId: referrerUserId }
})

if (referralCode?.isSuspended || !referralCode?.isActive) {
  return {
    isFraudulent: true,
    reason: 'Referral code is suspended or inactive',
    confidence: 'CERTAIN',
    details: ['Code auto-banned after 3 fraud attempts']
  }
}
```

**Result**: Blocks ALL orders from banned referral codes immediately

---

### 2. Fraud Logging with Strike Counter

**File**: `/lib/referralFraudDetection.ts`

```typescript
export async function logFraudAttempt(params) {
  // Get current strike count
  const referralCode = await prisma.referralCode.findFirst(...)
  const newFraudAttempts = referralCode.fraudAttempts + 1
  const isThirdStrike = newFraudAttempts >= 3

  // Transaction: Log fraud + Update strike count
  await prisma.$transaction(async (tx) => {
    // Create fraud log
    await tx.fraudLog.create({
      data: {
        referrerUserId,
        fraudScore,
        strikeNumber: newFraudAttempts,
        causedAutoBan: isThirdStrike,
        // ... other fields
      }
    })

    // Update referral code
    await tx.referralCode.update({
      where: { id: referralCode.id },
      data: {
        fraudAttempts: newFraudAttempts,
        lastFraudAttemptAt: new Date(),
        // Auto-ban on 3rd strike
        ...(isThirdStrike ? {
          isSuspended: true,
          isActive: false,
          autoBannedAt: new Date(),
          autoBanReason: 'Automatically banned after 3 fraud attempts'
        } : {})
      }
    })
  })

  // Return strike info
  return {
    strikeNumber: newFraudAttempts,
    autoBanned: isThirdStrike
  }
}
```

**Key Features**:
- Atomic transaction (both operations succeed or fail together)
- Silent operation (no user warnings)
- Automatic ban on 3rd strike
- Returns ban status to calling code

---

### 3. Phone-Based Account Creation

**File**: `/lib/phoneAccountCreation.ts`

```typescript
export async function createOrGetPhoneAccount(params) {
  const { phone, fullName, email } = params
  const normalizedPhone = normalizePhoneNumber(phone)

  // Check if account exists
  const existingUser = await prisma.user.findUnique({
    where: { phone: normalizedPhone }
  })

  if (existingUser) {
    return { userId: existingUser.id, isNewAccount: false }
  }

  // Create new account
  const newUser = await prisma.user.create({
    data: {
      phone: normalizedPhone,
      phoneVerified: true,        // Verified by payment
      email: email || null,
      name: fullName,
      password: null,             // Incomplete account
      isAccountComplete: false,   // Needs completion
      role: 'CUSTOMER',
      status: 'ACTIVE'
    }
  })

  return { userId: newUser.id, isNewAccount: true }
}
```

---

### 4. Integration in Payment Callback

**File**: `/app/api/farm-products/payment/callback/route.ts`

```typescript
if (paymentStatus === 'COMPLETED') {
  // AUTOMATIC PHONE-BASED ACCOUNT CREATION
  if (order.isGuest && order.guestPhone && order.guestName) {
    const phoneAccountResult = await createOrGetPhoneAccount({
      phone: order.guestPhone,
      fullName: order.guestName,
      email: order.guestEmail || null
    })

    // Link order to account
    await prisma.farmOrder.update({
      where: { id: order.id },
      data: {
        userId: phoneAccountResult.userId,
        isGuest: false
      }
    })
  }
}
```

**Flow**:
```
Payment successful → Create/get phone account → Link order to account
```

---

## Fraud Detection Flow

### Complete Flow with 3-Strike System

```
1. User attempts to use referral code
   ↓
2. Check if code is already banned (Layer 0)
   ↓ (if not banned)
3. Run 7-layer fraud detection
   ↓
4. If fraud detected (score >= 60):
   a. Block the order
   b. Log fraud attempt to FraudLog table
   c. Increment strike counter
   d. If strike == 3:
      - Set isSuspended = true
      - Set isActive = false
      - Set autoBannedAt = now
      - Set autoBanReason = details
   e. Return error to user
   ↓
5. Future attempts from same code:
   → Blocked immediately at Layer 0
```

---

## User Experience

### For Legitimate Users

**Scenario**: Friend shares referral code

```
1. User places order with referral code JOHN2024
2. Phone: 670123456, different from referrer
3. Email: bob@email.com, different from referrer
4. Fraud detection runs → Score: 0 points
5. Result: ✅ Order proceeds normally
6. User gets 5% discount
7. Referrer gets 50% commission
8. Payment succeeds → Account created with phone 670123456
```

---

### For Fraudsters

**Scenario**: User tries to self-refer

**Attempt 1**:
```
1. User creates account, gets code FRAUD2024
2. Opens incognito, places guest order
3. Uses same phone: 670123456
4. Uses code: FRAUD2024
5. Fraud detection runs → Phone matches (80 points)
6. Result: ❌ Order blocked
7. Strike 1 logged to database
8. Error: "Unable to process referral code"
```

**Attempt 2**:
```
1. User tries again with email alias: user+1@gmail.com
2. Uses code: FRAUD2024
3. Fraud detection → Email alias detected (70 points)
4. Result: ❌ Order blocked
5. Strike 2 logged to database
```

**Attempt 3**:
```
1. User tries different phone: 671111111
2. Uses code: FRAUD2024
3. Fraud detection → Multiple indicators (60+ points)
4. Result: ❌ Order blocked
5. Strike 3 logged to database
6. 🔴 REFERRAL CODE AUTO-BANNED
```

**Attempt 4+**:
```
1. User tries to use code: FRAUD2024
2. Layer 0 check → Code is banned
3. Result: ❌ Blocked immediately
4. Error: "Referral code is suspended"
```

---

## Admin Tools & Monitoring

### View Fraud Logs

```sql
-- All fraud attempts for a user
SELECT * FROM fraud_logs
WHERE referrer_user_id = 'user_123'
ORDER BY created_at DESC;

-- Recent fraud attempts (last 24h)
SELECT
  fl.*,
  rc.code as referral_code,
  u.email as referrer_email
FROM fraud_logs fl
JOIN referral_codes rc ON fl.referral_code_id = rc.id
JOIN users u ON fl.referrer_user_id = u.id
WHERE fl.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY fl.created_at DESC;

-- Auto-banned codes
SELECT
  code,
  fraud_attempts,
  auto_banned_at,
  auto_ban_reason
FROM referral_codes
WHERE is_suspended = true AND auto_banned_at IS NOT NULL
ORDER BY auto_banned_at DESC;
```

### View Phone-Based Accounts

```sql
-- Incomplete accounts (need password/email)
SELECT
  id,
  phone,
  name,
  email,
  is_account_complete,
  created_at
FROM users
WHERE is_account_complete = false
ORDER BY created_at DESC;

-- Phone-only accounts (no email)
SELECT * FROM users
WHERE email IS NULL AND phone IS NOT NULL;
```

---

## Configuration & Tuning

### Adjust Strike Threshold

**Current**: 3 strikes = ban

**To Change**:
```typescript
// In /lib/referralFraudDetection.ts
const isThirdStrike = newFraudAttempts >= 3  // Change to 2, 4, 5, etc.
```

### Adjust Fraud Score Threshold

**Current**: 60+ points = blocked

**To Change**:
```typescript
// In /lib/referralFraudDetection.ts
const isFraudulent = fraudScore >= 60  // Change to 50, 70, 80, etc.
```

---

## Testing the System

### Test Case 1: Legitimate Referral (Should Pass)
```
Referrer: +237 670 123 456, email: john@gmail.com
Referee: +237 671 111 111, email: bob@gmail.com
Code: JOHN2024

Expected: ✅ Allowed, no strikes
```

### Test Case 2: Self-Referral Phone Match (Should Block)
```
Referrer: +237 670 123 456
Guest Order: 0670123456 (same number normalized)
Code: FRAUD2024

Expected: ❌ Blocked, Strike 1
```

### Test Case 3: Email Alias Fraud (Should Block)
```
Referrer: john@gmail.com
Guest Order: john+shop@gmail.com
Code: FRAUD2024

Expected: ❌ Blocked, Strike 2
```

### Test Case 4: Third Attempt (Should Auto-Ban)
```
Any fraud attempt on code FRAUD2024

Expected: ❌ Blocked, Strike 3, CODE BANNED
```

### Test Case 5: Attempt After Ban (Should Block Immediately)
```
Try to use code FRAUD2024

Expected: ❌ Blocked at Layer 0 (code is banned)
```

---

## Migration Checklist

- [x] Update Prisma schema
  - [x] Add fraud fields to ReferralCode
  - [x] Create FraudLog model
  - [x] Update User model (phone unique, email optional)
- [x] Update fraud detection library
  - [x] Add Layer 0 (check banned codes)
  - [x] Implement 3-strike logging
  - [x] Export normalizePhoneNumber
- [x] Create phone account creation library
- [x] Update payment callback
  - [x] Auto-create phone accounts
  - [x] Link orders to accounts
- [ ] Run database migration: `npx prisma db push`
- [ ] Deploy to production
- [ ] Test fraud detection flow
- [ ] Monitor fraud logs

---

## Future Enhancements

### 1. Account Completion Flow
- Send SMS/email when account created
- Provide link to set password
- Email verification flow
- Once complete: `isAccountComplete = true`

### 2. Admin Dashboard
- View all fraud logs
- Review banned referral codes
- Manually unban codes (redemption)
- Export fraud data for analysis

### 3. Strike Redemption
- Allow users to "redeem" after ban
- Require X successful orders without fraud
- Gradually restore referral privileges

### 4. Advanced Detection
- IP address tracking
- Device fingerprinting
- Machine learning patterns
- Geographic analysis

---

## Summary

The 3-strike system provides:

✅ **Silent Protection**: No warnings, fraud prevention happens silently
✅ **Phone-Based Identity**: Harder to fake than email
✅ **Automatic Enforcement**: No manual intervention needed
✅ **Complete Audit Trail**: Every fraud attempt logged
✅ **Permanent Banning**: 3 strikes = permanent ban
✅ **Account Creation**: All paying customers get accounts automatically
✅ **Fraud Prevention**: Self-referral is now extremely difficult

**Result**: Referral fraud is now virtually impossible while maintaining a smooth experience for legitimate users.
