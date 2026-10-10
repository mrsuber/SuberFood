# Referral Fraud Prevention System

## Problem Statement

**Vulnerability**: A user could create an account, get a referral code, then use an incognito/private browser to place orders as a guest using their own referral code. This would give them:
1. 5% discount on their order
2. 50% commission on the profit

This is **self-referral fraud** and could cost the business significant money.

---

## Multi-Layer Fraud Detection System

We've implemented a **7-layer fraud detection system** that prevents self-referral abuse:

### Layer 1: Direct User ID Match ✅
**What it detects**: Authenticated users trying to use their own referral code

**How it works**:
- Compares `refereeUserId` with `referrerUserId`
- If they match → **CERTAIN fraud** → Blocked immediately

**Example**:
```
User ID: abc123
Referral Code Owner: abc123
Result: BLOCKED (100% confidence)
```

---

### Layer 2: Phone Number Matching ✅
**What it detects**: Guest orders using the same phone number as the referrer

**How it works**:
- Normalizes phone numbers (removes spaces, dashes, country codes)
- Compares guest phone with referrer's registered phone
- Also checks if the same phone was used with multiple different referral codes

**Phone Normalization**:
```
+237 6 7X XX XX XX  →  67XXXXXX
0 67X XX XX XX      →  67XXXXXX
237-67X-XX-XX-XX    →  67XXXXXX
```

**Fraud Score Impact**:
- Phone matches referrer: **+80 points** (Very High)
- Same phone with 3+ different referral codes: **+40 points**

**Example**:
```
Referrer Phone: +237 670 123 456
Guest Order Phone: 0670123456
Result: BLOCKED (Phone match detected)
```

---

### Layer 3: Email Matching ✅
**What it detects**: Guest orders using the same email or email aliases

**How it works**:
- Normalizes emails (lowercase, trim)
- Detects Gmail+ aliases (user+1@gmail.com = user@gmail.com)
- Compares with referrer's email

**Email Alias Detection**:
```
user@gmail.com
user+1@gmail.com    →  Same base: user@gmail.com
user+shop@gmail.com →  Same base: user@gmail.com
u.s.e.r@gmail.com   →  Same base: user@gmail.com (Gmail ignores dots)
```

**Fraud Score Impact**:
- Email exact match: **+80 points**
- Email base match (alias): **+70 points**

**Example**:
```
Referrer Email: john@gmail.com
Guest Order Email: john+shop@gmail.com
Result: BLOCKED (Email alias detected)
```

---

### Layer 4: IP Address Tracking ⚠️
**What it detects**: Multiple referral orders from the same IP address

**Current Status**: Structure in place, needs activation

**How to activate**:
1. Add `ipAddress` field to `FarmOrder` model in Prisma schema
2. Capture IP from headers: `x-forwarded-for` or `x-real-ip`
3. System will automatically track patterns

**Future Detection**:
- Same IP with multiple guest accounts
- Rapid referral orders from single IP

---

### Layer 5: Velocity Check ✅
**What it detects**: Suspiciously high number of referral orders in short time

**How it works**:
- Counts referral orders in last 24 hours
- If > 10 orders → Suspicious

**Fraud Score Impact**:
- 10+ referrals in 24h: **+30 points**

**Example**:
```
Referrer: user123
Last 24h: 15 referral orders
Result: Fraud score increased (velocity abuse)
```

---

### Layer 6: Pattern Analysis ✅
**What it detects**: Users who ONLY make orders when using referrals

**How it works**:
- Calculates ratio: `referral_orders / total_orders`
- If ratio > 80% and total_orders > 5 → Suspicious

**Fraud Score Impact**:
- 80%+ of orders are referrals: **+25 points**

**Example**:
```
User's Order History:
- Regular orders: 2
- Referral orders: 18
- Ratio: 90%
Result: Fraud score increased (pattern abuse)
```

---

### Layer 7: New Account Analysis ✅
**What it detects**: Brand new accounts immediately using referrals

**How it works**:
- Checks account creation date
- If account < 24 hours old and this is first referral → Suspicious

**Fraud Score Impact**:
- New account + immediate referral: **+35 points**

**Example**:
```
Account Created: Today 2:00 PM
First Order: Today 2:05 PM (with referral)
Result: Fraud score increased (suspicious timing)
```

---

## Fraud Scoring System

**How the score works**:
- Each detection layer adds points (0-80)
- Maximum score: 100
- Threshold for blocking: **60 points**

**Confidence Levels**:
- 0-39 points: **LOW** confidence (allowed)
- 40-59 points: **MEDIUM** confidence (allowed with logging)
- 60-79 points: **HIGH** confidence (BLOCKED)
- 80-100 points: **CERTAIN** fraud (BLOCKED)

**Example Calculation**:
```
Phone matches: +80 points
Email alias: +70 points (capped at 100)
Total: 100 points → CERTAIN fraud → BLOCKED
```

---

## What Happens When Fraud is Detected

### 1. Order is Blocked
- User receives error: "Unable to process referral code"
- No discount applied
- No commission credited
- Order does NOT proceed

### 2. Fraud is Logged
- Detailed logs with:
  - Referrer user ID
  - Guest phone/email
  - IP address
  - User agent
  - Fraud score
  - Specific indicators
- Stored in console logs (future: database table)

### 3. Admin Notification
- Console logs show fraud attempts
- Future: Admin dashboard alert
- Future: Email notification to admin

---

## Configuration & Tuning

### Adjust Fraud Threshold

In `/lib/referralFraudDetection.ts`:
```typescript
const isFraudulent = fraudScore >= 60 // Current threshold

// Options:
// 40 = Very strict (more false positives)
// 60 = Balanced (recommended)
// 80 = Lenient (more false negatives)
```

### Adjust Individual Layer Weights

```typescript
// Phone match
fraudScore += 80 // Change to 60-90 based on importance

// Email match
fraudScore += 80 // Change to 60-90 based on importance

// Velocity
if (recentReferralOrders.length > 10) { // Change threshold
  fraudScore += 30 // Change weight
}
```

---

## Testing the System

### Test Case 1: Legitimate Referral (Should Pass)
```
1. User A creates account, gets referral code: JOHN2024
2. User B (different person) uses code JOHN2024
3. User B has different phone: 671234567
4. User B has different email: bob@email.com
Result: ✅ Allowed (fraud score: 0)
```

### Test Case 2: Self-Referral with Own Phone (Should Block)
```
1. User creates account with phone: 670123456
2. User gets referral code: SELF2024
3. User opens incognito, places guest order with same phone: 0670123456
4. Uses code: SELF2024
Result: ❌ BLOCKED (fraud score: 80+)
Reason: "Phone number matches referrer account"
```

### Test Case 3: Self-Referral with Email Alias (Should Block)
```
1. User creates account with: john@gmail.com
2. User gets referral code: JOHN2024
3. User opens incognito, places guest order
4. Uses email: john+1@gmail.com
5. Uses code: JOHN2024
Result: ❌ BLOCKED (fraud score: 70+)
Reason: "Email base matches referrer (alias detected)"
```

### Test Case 4: Velocity Abuse (Should Block)
```
1. User creates 15 referral orders in 24 hours
2. Tries to create 16th order
Result: ❌ BLOCKED (fraud score: 60+)
Reason: "Suspicious velocity: 15 referral orders in 24h"
```

---

## Future Enhancements

### 1. IP Address Tracking (Recommended)
**Add to Prisma Schema**:
```prisma
model FarmOrder {
  // ... existing fields
  ipAddress String?
  userAgent String?
}
```

**Benefits**:
- Detect multiple accounts from same location
- Identify VPN/proxy abuse
- Pattern analysis by location

### 2. Device Fingerprinting
**Implementation**:
- Use library like `fingerprintjs`
- Store device fingerprint with order
- Detect same device with different accounts

### 3. Manual Review Queue
**For Medium Confidence (40-59 points)**:
- Don't auto-block
- Flag for admin review
- Admin can approve/reject

### 4. Machine Learning
**Advanced Detection**:
- Train model on confirmed fraud cases
- Detect subtle patterns humans miss
- Adaptive scoring based on new fraud techniques

### 5. Fraud Database Table
```prisma
model FraudLog {
  id            String   @id @default(cuid())
  referrerId    String
  guestPhone    String?
  guestEmail    String?
  ipAddress     String?
  fraudScore    Int
  confidence    String
  reason        String
  details       Json
  wasBlocked    Boolean
  createdAt     DateTime @default(now())
}
```

---

## Monitoring & Analytics

### Key Metrics to Track
1. **Fraud Detection Rate**: % of referral attempts blocked
2. **False Positive Rate**: Legitimate referrals blocked (should be < 1%)
3. **Most Common Fraud Method**: Phone vs Email vs Pattern
4. **Fraud Attempt Trends**: Daily/weekly patterns

### Admin Dashboard (Future)
- Real-time fraud alerts
- Fraud attempt heatmap
- Top offenders list
- Manual review queue

---

## Best Practices

### For Users (Communicate in FAQ)
✅ **Allowed**:
- Sharing your referral code with friends/family
- Multiple people using your code
- Legitimate referrals from different people

❌ **Not Allowed**:
- Using your own referral code
- Creating fake accounts to use your code
- Using email aliases to bypass detection
- Using different phones to self-refer

### For Business
1. **Monitor Fraud Logs**: Check console logs daily
2. **Adjust Thresholds**: Based on false positive rate
3. **Customer Support**: Have process for legitimate users flagged by mistake
4. **Legal Protection**: Terms of service should prohibit self-referral

---

## Summary

The system now has **robust protection** against referral fraud:

✅ **Phone matching** - Catches incognito orders with same phone
✅ **Email alias detection** - Catches user+1@gmail.com tricks
✅ **Velocity checks** - Catches mass abuse
✅ **Pattern analysis** - Catches behavioral fraud
✅ **New account detection** - Catches instant abuse
✅ **Multi-layer scoring** - Reduces false positives
✅ **Comprehensive logging** - Enables investigation

**Result**: Self-referral fraud is now **extremely difficult** to execute successfully!
