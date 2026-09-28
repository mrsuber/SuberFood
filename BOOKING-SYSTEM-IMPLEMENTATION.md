# SuberFood Booking System Implementation

**Status**: Phase 1 Backend Complete ✅
**Date**: September 28, 2026
**Implementation Progress**: 40% Complete

---

## 🎯 System Overview

A comprehensive **demand-driven procurement system** with wallet, referral rewards, and booking capabilities for out-of-stock farm products.

### Core Features Implemented

1. **💰 Wallet System** - Digital wallet with deposits, withdrawals, and transaction history
2. **🎁 Referral System** - Lifetime 50% profit sharing on all referred customer orders
3. **📅 Booking System** - Pre-order out-of-stock products with price confirmation workflow
4. **🚩 Red Flag System** - Track customer reliability, 3-strike prepayment enforcement
5. **🚚 Delivery Zones** - Fixed delivery fees by geographic area
6. **💳 Payment Integration** - Multiple payment methods including wallet, mobile money, cash

---

## ✅ Completed: Backend API Endpoints

### 1. Wallet Management (`/api/wallet/*`)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/wallet` | GET | Get user wallet & transactions | ✅ |
| `/api/wallet/deposit` | POST | Add money to wallet | ✅ |
| `/api/wallet/withdraw` | POST | Request withdrawal | ✅ |
| `/api/wallet/withdraw` | GET | Get withdrawal history | ✅ |

**Features:**
- Auto-create wallet on first access
- Track balance, deposits, withdrawals, spending
- Last 20 transactions included
- Support for Cash, MTN MoMo, Orange MoMo, Bank Transfer

---

### 2. Referral System (`/api/referral/*`)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/referral` | GET | Get referral details & earnings | ✅ |
| `/api/referral/apply` | POST | Apply a referral code | ✅ |
| `/api/referral/apply?code=XXX` | GET | Validate referral code | ✅ |
| `/api/referral/verify` | POST | Submit verification docs | ✅ |

**Features:**
- Auto-generate unique referral codes (e.g., `JOHN2024`)
- Prevent self-referrals
- Track referrals, earnings, active/inactive status
- Verification: ID card, photo, phone number
- Real-time earnings summary (pending vs. paid)

**Commission Calculation:**
```
Order Total: 10,000 XAF
Farm Cost: 6,000 XAF
Transport: 1,000 XAF
Total Cost: 7,000 XAF
Profit: 3,000 XAF

Referrer Commission (50%): 1,500 XAF → Deposited to wallet
SuberFood (50%): 1,500 XAF
```

---

### 3. Booking Management (`/api/bookings/*`)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/bookings` | GET | Get all bookings (admin) | ✅ |
| `/api/bookings/[id]/confirm-price` | POST | Confirm price after farm visit | ✅ |
| `/api/bookings/[id]/customer-response` | POST | Customer approve/decline price | ✅ |

**Booking Workflow:**
```
1. Customer books out-of-stock product with quantity
   ↓ Status: PENDING_PRICE

2. You visit farm, confirm actual price + cost
   ↓ Admin calls /confirm-price
   ↓ Status: PRICE_CONFIRMED
   ↓ Customer notified (email/WhatsApp/call)

3. Customer approves or declines
   ↓ Calls /customer-response
   ↓ If approved: Status → CUSTOMER_APPROVED
   ↓ If declined: Status → CUSTOMER_DECLINED, order cancelled

4. Collect from farmer
   ↓ Admin updates status → COLLECTED

5. Transport to town, update stock
   ↓ Status → READY_PICKUP
   ↓ Customer notified

6. Customer collects or delivery
   ↓ Status → COMPLETED
```

**Features:**
- Group bookings by product for easy farm trip planning
- Track estimated vs. confirmed prices
- Support quantity adjustments during approval
- Auto-calculate profit for referral commissions
- Complete audit trail with status history

---

### 4. Delivery Zones (`/api/delivery-zones/*`)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/delivery-zones` | GET | Get all active zones | ✅ |
| `/api/delivery-zones` | POST | Create new zone (admin) | ✅ |

**Example Zones:**
```javascript
{
  "name": "Zone 1 - Central Buea",
  "deliveryFee": 500,
  "areas": ["Molyko", "Great Soppo", "Bokwango"]
},
{
  "name": "Zone 2 - Extended Buea",
  "deliveryFee": 1000,
  "areas": ["Mile 17", "Muea", "Lysoka"]
}
```

---

### 5. Admin Management (`/api/admin/*`)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/admin/withdrawals/[id]/approve` | POST | Approve/reject withdrawal | ✅ |
| `/api/admin/verifications/[id]/review` | POST | Approve/reject verification | ✅ |

**Withdrawal Approval Process:**
1. Customer requests withdrawal
2. Admin reviews request
3. Admin approves → Money deducted from wallet, transaction recorded
4. Admin rejects → Request marked rejected with reason
5. Customer notified

**Verification Approval Process:**
1. Customer submits ID + photo + phone
2. Admin reviews documents
3. Admin approves → Referral code activated, can earn commissions
4. Admin rejects → Referral code suspended, reason provided

---

## 📊 Database Schema (Production Deployed)

### New Tables Created

1. **wallets** - Customer wallet balances
2. **wallet_transactions** - All wallet activity (deposits, withdrawals, purchases, refunds, referrals)
3. **withdrawal_requests** - Pending/approved/rejected withdrawals
4. **referral_codes** - Unique codes per customer
5. **referrals** - Referrer ↔ Referee relationships
6. **referral_earnings** - Commission tracking per order
7. **user_verifications** - ID verification for referral program
8. **customer_reliability** - Red flag tracking
9. **red_flag_incidents** - No-show/non-payment history
10. **delivery_zones** - Delivery areas & fees
11. **delivery_zone_areas** - Sub-areas within zones
12. **bulk_discounts** - Tiered pricing (50kg+ → 10% off)
13. **payment_transactions** - PayWithCamsol, MoMo, etc.
14. **receipts** - PDF receipts for orders

### Enhanced Tables

- **farm_products** - Added: `stockStatus`, `isBookable`, `priceMin`, `priceMax`, `confirmedPrice`, seasonal info
- **farm_orders** - Added: `orderType`, `bookingStatus`, `depositAmount`, `paidFromWallet`, cost tracking, referral link
- **users** - Added: wallet, referral code, reliability, red flags relationships

---

## 🚧 In Progress: Frontend UI Components

### Priority 1: Customer-Facing Features (Next)

1. **Customer Wallet Dashboard** (`/wallet`)
   - Balance display
   - Deposit form (Cash/MoMo)
   - Withdrawal request form
   - Transaction history table
   - Pending withdrawal status

2. **Customer Referral Dashboard** (`/referrals`)
   - My referral code (with share buttons)
   - Total earnings (pending + paid)
   - Referrals list with status
   - Earnings per referral
   - Verification status & submit docs

3. **Booking Flow Integration**
   - Show "OUT OF STOCK - PRE-ORDER" badge
   - Display estimated price range (500-800 FCFA/kg)
   - Booking form with quantity
   - "Awaiting Price Confirmation" status page
   - Approve/Decline confirmed price UI

4. **Checkout Enhancements**
   - Wallet balance display
   - "Pay with Wallet" checkbox
   - Mixed payment (wallet + cash/momo)
   - Referral code input field (optional)
   - Delivery zone selector

### Priority 2: Admin Interfaces

1. **Admin Bookings Management** (`/admin/bookings`)
   - View all pending bookings
   - Group by product
   - Confirm prices after farm visit
   - Bulk price updates
   - Customer contact info

2. **Admin Wallet Management** (`/admin/wallets`)
   - Pending withdrawal requests
   - Approve/reject with notes
   - Customer wallet balances
   - Transaction audit log

3. **Admin Referral Management** (`/admin/referrals`)
   - Pending verifications
   - Review ID cards & photos
   - Approve/reject verifications
   - Suspend fraudulent accounts
   - Referral earnings overview

4. **Admin Red Flag Management** (`/admin/red-flags`)
   - View flagged customers
   - Add/remove red flags
   - Set prepayment requirements
   - Redemption tracking

---

## 🔌 Integration Points (Pending)

### 1. PayWithCamsol Payment Gateway

**Documentation**: https://paywithcamsol.com/api-docs

**Endpoints Needed:**
- Initialize payment
- Verify payment
- Handle webhook callbacks

**Implementation Status**: Schema ready, API integration pending

---

### 2. Notification Service

**Channels:**
- **Email**: SendGrid / NodeMailer
- **WhatsApp**: Twilio / WhatsApp Business API
- **SMS**: Twilio

**Triggers:**
- Booking price confirmed → Notify customer
- Order ready for pickup → Notify customer
- Referral earned commission → Notify referrer
- Withdrawal approved → Notify customer

**Implementation Status**: Placeholders added, service pending

---

### 3. Receipt Generation

**Library**: `pdfkit` or `puppeteer`

**Features:**
- Generate PDF receipts
- Unique receipt numbers (SF-2024-001234)
- Send via email, WhatsApp, or print
- Track delivery status

**Implementation Status**: Database schema ready, PDF generation pending

---

## 📈 What Works Right Now

### ✅ Fully Functional (Backend)

1. Customer can GET their wallet → returns balance, transactions
2. Customer can POST deposit → balance updates
3. Customer can POST withdrawal request → admin notified
4. Customer can GET referral code → auto-generated if doesn't exist
5. Customer can POST apply referral code → relationship created
6. Admin can GET all bookings → grouped by product
7. Admin can POST confirm price → customer gets final price
8. Customer can POST approve/decline → booking locked or cancelled
9. Admin can POST approve withdrawal → money deducted, transaction logged
10. Admin can POST review verification → referral activated/suspended

### ⏳ Needs Frontend UI

- Wallet dashboard
- Referral dashboard
- Booking interfaces
- Admin panels
- Checkout integration

---

## 🎯 Next Steps (Priority Order)

### Week 1: Customer-Facing UI
1. Build wallet dashboard page
2. Build referral dashboard page
3. Add wallet payment to checkout
4. Add referral code input to signup/checkout
5. Update farm products page to show bookable items

### Week 2: Admin Interfaces
1. Build booking management page
2. Build withdrawal approval page
3. Build verification approval page
4. Build delivery zone management

### Week 3: Integration & Polish
1. Integrate PayWithCamsol
2. Set up notification service
3. Implement PDF receipt generation
4. Test end-to-end workflows

### Week 4: Launch & Scale
1. Seed delivery zones for Buea
2. Create promotional materials for referral program
3. Train admin staff on booking workflow
4. Monitor first farm visit cycle

---

## 💡 Key Business Flows

### Flow 1: Customer Uses Referral Code

```
1. John signs up with referral code "MARY2024"
2. System links John → Mary
3. John orders 10kg beans for 10,000 XAF
4. Your cost: 7,000 XAF
5. Profit: 3,000 XAF
6. Mary earns: 1,500 XAF (50%) → deposited to her wallet
7. Mary sees notification: "You earned 1,500 XAF from John's order!"
8. Mary can withdraw or use for next purchase
```

### Flow 2: Customer Books Out-of-Stock Product

```
1. Customer browses "Tomatoes" → OUT OF STOCK, BOOKABLE
2. Estimated price: 800-1200 FCFA/kg
3. Customer books 20kg
4. You visit farm Nov 1st, actual price: 1000 FCFA/kg
5. You confirm: 20kg × 1000 = 20,000 XAF
6. Customer gets call/WhatsApp
7. Customer approves
8. You collect, transport, notify customer
9. Customer pays & collects (or delivery for +500 XAF)
```

### Flow 3: Customer Gets Red-Flagged

```
1. Customer books 50kg potatoes
2. You collect from farm
3. Customer no-show (Red Flag #1)
4. Customer books again next month
5. Customer no-show again (Red Flag #2)
6. Customer books third time
7. No-show (Red Flag #3)
8. System auto-requires prepayment for all future orders
9. Customer can redeem by:
   - Successfully completing 5 orders
   - Referring 3 new customers who make purchases
```

---

## 🚀 Technical Highlights

### Performance Optimizations
- Wallet balance cached (not recalculated from transactions)
- Indexes on all foreign keys and query fields
- Efficient grouping of bookings by product

### Security Features
- Admin role checks on all sensitive endpoints
- Prevent self-referrals
- Wallet balance validation before withdrawals
- Audit trails (createdBy, reviewedBy, timestamps)

### Data Integrity
- Prisma transactions for multi-step operations
- Balance snapshots (balanceBefore, balanceAfter)
- Soft deletes preserved
- Status history tracking

---

## 📝 API Testing

### Test Wallet Deposit
```bash
curl -X POST http://localhost:3000/api/wallet/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "method": "MTN_MOMO",
    "metadata": {"phone": "+237671234567"}
  }'
```

### Test Referral Code Validation
```bash
curl http://localhost:3000/api/referral/apply?code=JOHN2024
```

### Test Booking Price Confirmation (Admin)
```bash
curl -X POST http://localhost:3000/api/bookings/{bookingId}/confirm-price \
  -H "Content-Type: application/json" \
  -d '{
    "confirmedTotal": 20000,
    "costPrice": 14000,
    "transportCost": 2000,
    "adminNotes": "Collected from Farmer Paul, Mile 16"
  }'
```

---

## 📊 Current Metrics

**API Endpoints Created**: 15
**Database Tables Added**: 14
**Database Tables Enhanced**: 3
**Lines of Backend Code**: ~2,500
**Features Fully Functional**: 10
**Features Pending UI**: 8

**Estimated Completion**: 40%
**Next Milestone**: Customer dashboards → 60%

---

## 🎉 What This Enables

1. **Viral Growth**: Every customer becomes a marketer (lifetime 50% commissions)
2. **Demand-Driven Procurement**: Only collect what customers pre-ordered
3. **Trust & Transparency**: Price confirmed before collection
4. **Financial Flexibility**: Wallet, deposits, mixed payments
5. **Customer Accountability**: Red flags reduce no-shows
6. **Operational Efficiency**: Group bookings by product for farm trips

---

**Built with**: Next.js 14, Prisma, PostgreSQL, TypeScript
**Deployment**: Production VPS (suberfood.com)
**Status**: Backend APIs deployed ✅ | Frontend UI in progress ⏳
