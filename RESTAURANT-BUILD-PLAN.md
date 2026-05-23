# SuberFood Restaurant Platform - Complete Build Plan

> **Comprehensive Development Roadmap for Public Restaurant Website & Admin System**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Architecture & Technology](#architecture--technology)
4. [Database Schema Enhancements](#database-schema-enhancements)
5. [Development Phases](#development-phases)
6. [Phase Details](#phase-details)
7. [API Endpoints](#api-endpoints)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Strategy](#deployment-strategy)

---

## 🎯 Project Overview

### Objective
Build a complete, production-ready restaurant platform with:
- **Public-facing website** with 10+ pages (menu, reservations, ordering, etc.)
- **Comprehensive admin system** with 16+ management modules
- **Full payment integration** (Stripe, PayPal, Apple Pay, Google Pay)
- **Real-time features** (order tracking, table management, live updates)
- **Multi-location support**
- **Mobile-responsive design**

### Key Features Summary

**Public Website (10 Main Sections):**
1. Home - Hero, featured dishes, testimonials
2. About Us - Story, chefs, awards, sustainability
3. Menu - Digital menu with filters, allergens, ratings
4. Locations - Interactive map, location details
5. Reservations - Real-time booking system
6. Order Online - Full e-commerce with customization
7. Gallery - Photos, videos, events
8. Events & Catering - Private events, catering services
9. Contact Us - Forms, live chat, FAQ
10. Careers - Job listings, applications

**Admin System (16 Main Modules):**
1. Dashboard - KPIs, analytics, quick actions
2. Multi-Location Management
3. Menu Management - Dishes, categories, modifiers
4. Inventory Management - Ingredients, suppliers, stock
5. Staff Management - Scheduling, performance, payroll
6. Waiter Review System
7. Asset Management - Equipment, furniture, maintenance
8. Financial Management - Revenue, expenses, reports
9. Order Management - Live queue, KDS, delivery
10. Reservation Management - Floor plan, tables, guests
11. CRM - Customer profiles, segmentation, marketing
12. Loyalty & Rewards Program
13. Marketing & Promotions - Campaigns, discounts, gift cards
14. Reports & Analytics - Sales, operations, custom reports
15. Settings & Configuration
16. Communication Hub - Internal messaging, customer comms

**Payment System:**
- Multiple payment methods (cards, wallets, cash, gift cards)
- Secure checkout with PCI compliance
- Refund/dispute management
- Payment reconciliation
- Fraud detection

---

## 📊 Current Status

### ✅ Already Built (Phase 0 - 35% Complete)

**Infrastructure:**
- ✅ Monorepo setup with Turborepo
- ✅ Next.js 14 frontend (landing-page app)
- ✅ PostgreSQL database with Prisma ORM
- ✅ Docker development environment
- ✅ VPS deployment (PM2 + Nginx + SSL)
- ✅ Design system (Tailwind + custom components)

**Frontend (Basic):**
- ✅ Landing page
- ✅ Restaurant directory (`/distribution/restaurants`)
- ✅ Individual restaurant pages (`/distribution/restaurants/[slug]`)
- ✅ Basic reservation interface
- ✅ Admin dashboard UI (all 7 pages - UI only, no backend)
  - Dashboard overview
  - Restaurants management
  - Menu management
  - Products/inventory
  - Orders
  - Customers
  - Reservations

**Database Schema:**
- ✅ User, Session, Address
- ✅ Restaurant, Table, MenuCategory, MenuItem, Reservation
- ✅ Product, Order, OrderItem, CartItem, Review
- ✅ Farm, ProcessingFacility, ActivityLog

**Backend:**
- 🚧 IAM Service (30% complete - health checks only)
- ⏳ Restaurant Service (not started)
- ⏳ Order Service (not started)
- ⏳ Payment Service (not started)

### 🎯 What We're Building

Everything described in the requirements above, organized into 8 progressive phases.

---

## 🏗️ Architecture & Technology

### Frontend Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.3 + Radix UI
- **State Management:** Zustand (global) + React Query (server state)
- **Forms:** React Hook Form + Zod validation
- **Payment UI:** Stripe Elements, PayPal SDK
- **Maps:** Google Maps API
- **Real-time:** Socket.io client
- **Charts:** Recharts
- **File Upload:** React Dropzone + AWS S3

### Backend Stack
- **Framework:** Express.js (Node.js microservices)
- **Language:** TypeScript
- **Database:** PostgreSQL (Prisma ORM)
- **Cache:** Redis
- **Message Queue:** Kafka (for order events)
- **Authentication:** JWT + bcryptjs
- **Payments:** Stripe API, PayPal SDK
- **Email:** SendGrid
- **SMS:** Twilio
- **Real-time:** Socket.io server
- **File Storage:** AWS S3 / MinIO
- **Search:** Elasticsearch (for menu search)

### New Services to Build
1. **restaurant-service** (Port 4002)
2. **order-service** (Port 4003)
3. **payment-service** (Port 4004)
4. **inventory-service** (Port 4005)
5. **notification-service** (Port 4006)
6. **customer-service** (Port 4007)
7. **analytics-service** (Port 4008)

### API Gateway
- Port 8080
- Routes requests to appropriate microservices
- Rate limiting
- Authentication middleware

---

## 🗄️ Database Schema Enhancements

### New Models to Add

```prisma
// Staff Management
model Staff {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  role              StaffRole
  locationId        String?
  location          Restaurant? @relation(fields: [locationId], references: [id])
  hourlyRate        Decimal?
  salary            Decimal?
  hireDate          DateTime
  emergencyContact  String?
  emergencyPhone    String?
  certifications    String[] // JSON array
  performanceScore  Decimal?
  shifts            Shift[]
  reviews           WaiterReview[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum StaffRole {
  CHEF
  SOUS_CHEF
  LINE_COOK
  WAITER
  WAITRESS
  HOST
  BARTENDER
  MANAGER
  ASSISTANT_MANAGER
  KITCHEN_STAFF
  DISHWASHER
}

model Shift {
  id          String   @id @default(uuid())
  staffId     String
  staff       Staff    @relation(fields: [staffId], references: [id])
  locationId  String
  location    Restaurant @relation(fields: [locationId], references: [id])
  startTime   DateTime
  endTime     DateTime
  clockIn     DateTime?
  clockOut    DateTime?
  breakMinutes Int     @default(0)
  status      ShiftStatus @default(SCHEDULED)
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ShiftStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

model WaiterReview {
  id              String   @id @default(uuid())
  waiterId        String
  waiter          Staff    @relation(fields: [waiterId], references: [id])
  customerId      String?
  customer        User?    @relation(fields: [customerId], references: [id])
  orderId         String?
  order           Order?   @relation(fields: [orderId], references: [id])
  friendliness    Int      // 1-5
  speed           Int      // 1-5
  knowledge       Int      // 1-5
  professionalism Int      // 1-5
  overallRating   Int      // 1-5
  comment         String?
  createdAt       DateTime @default(now())
}

// Inventory Management
model Ingredient {
  id              String   @id @default(uuid())
  name            String
  sku             String   @unique
  category        IngredientCategory
  unit            String   // kg, g, L, ml, pieces
  costPerUnit     Decimal
  reorderPoint    Int
  supplierId      String?
  supplier        Supplier? @relation(fields: [supplierId], references: [id])
  allergen        Boolean  @default(false)
  allergenType    String?  // gluten, dairy, nuts, shellfish, etc.
  stock           IngredientStock[]
  menuItemLinks   MenuItemIngredient[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum IngredientCategory {
  VEGETABLES
  FRUITS
  MEAT
  SEAFOOD
  DAIRY
  GRAINS
  SPICES
  OILS
  BEVERAGES
  CONDIMENTS
  BAKERY
  OTHER
}

model IngredientStock {
  id              String   @id @default(uuid())
  ingredientId    String
  ingredient      Ingredient @relation(fields: [ingredientId], references: [id])
  locationId      String
  location        Restaurant @relation(fields: [locationId], references: [id])
  quantity        Decimal
  expiryDate      DateTime?
  batchNumber     String?
  receivedDate    DateTime
  cost            Decimal
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model MenuItemIngredient {
  id           String   @id @default(uuid())
  menuItemId   String
  menuItem     MenuItem @relation(fields: [menuItemId], references: [id])
  ingredientId String
  ingredient   Ingredient @relation(fields: [ingredientId], references: [id])
  quantity     Decimal  // Amount needed per dish
  unit         String
  createdAt    DateTime @default(now())
}

model Supplier {
  id              String   @id @default(uuid())
  name            String
  contactPerson   String?
  email           String?
  phone           String?
  address         String?
  rating          Decimal? @default(0)
  paymentTerms    String?
  ingredients     Ingredient[]
  purchaseOrders  PurchaseOrder[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model PurchaseOrder {
  id              String   @id @default(uuid())
  orderNumber     String   @unique
  supplierId      String
  supplier        Supplier @relation(fields: [supplierId], references: [id])
  locationId      String
  location        Restaurant @relation(fields: [locationId], references: [id])
  orderDate       DateTime @default(now())
  expectedDate    DateTime?
  receivedDate    DateTime?
  status          POStatus @default(PENDING)
  totalAmount     Decimal
  items           Json     // Array of {ingredientId, quantity, unitPrice}
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum POStatus {
  PENDING
  APPROVED
  ORDERED
  PARTIALLY_RECEIVED
  RECEIVED
  CANCELLED
}

// Asset Management
model Asset {
  id              String   @id @default(uuid())
  name            String
  assetType       AssetType
  category        String
  serialNumber    String?
  purchaseDate    DateTime
  purchaseCost    Decimal
  currentValue    Decimal
  locationId      String?
  location        Restaurant? @relation(fields: [locationId], references: [id])
  condition       AssetCondition @default(GOOD)
  warrantyExpiry  DateTime?
  maintenanceSchedule String?
  maintenanceLogs MaintenanceLog[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum AssetType {
  DINNERWARE
  GLASSWARE
  SILVERWARE
  KITCHEN_EQUIPMENT
  FURNITURE
  DECOR
  POS_SYSTEM
  TECHNOLOGY
  OTHER
}

enum AssetCondition {
  EXCELLENT
  GOOD
  FAIR
  POOR
  BROKEN
}

model MaintenanceLog {
  id              String   @id @default(uuid())
  assetId         String
  asset           Asset    @relation(fields: [assetId], references: [id])
  maintenanceType MaintenanceType
  description     String
  cost            Decimal?
  performedBy     String?
  performedDate   DateTime
  nextScheduled   DateTime?
  createdAt       DateTime @default(now())
}

enum MaintenanceType {
  ROUTINE
  REPAIR
  INSPECTION
  REPLACEMENT
  EMERGENCY
}

// Financial Management
model Expense {
  id              String   @id @default(uuid())
  locationId      String?
  location        Restaurant? @relation(fields: [locationId], references: [id])
  category        ExpenseCategory
  amount          Decimal
  description     String
  vendor          String?
  receiptUrl      String?
  paymentMethod   String?
  expenseDate     DateTime
  approvedBy      String?
  status          ExpenseStatus @default(PENDING)
  isRecurring     Boolean  @default(false)
  recurringFrequency String? // monthly, weekly, yearly
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum ExpenseCategory {
  PAYROLL
  RENT
  UTILITIES
  INGREDIENTS
  SUPPLIES
  EQUIPMENT
  MARKETING
  INSURANCE
  LICENSES
  PROFESSIONAL_SERVICES
  MISCELLANEOUS
}

enum ExpenseStatus {
  PENDING
  APPROVED
  REJECTED
  PAID
}

// Loyalty & Rewards
model LoyaltyProgram {
  id              String   @id @default(uuid())
  name            String
  pointsPerDollar Decimal  @default(1)
  isActive        Boolean  @default(true)
  tiers           LoyaltyTier[]
  rewards         Reward[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model LoyaltyTier {
  id              String   @id @default(uuid())
  programId       String
  program         LoyaltyProgram @relation(fields: [programId], references: [id])
  name            String   // Silver, Gold, Platinum
  minPoints       Int
  multiplier      Decimal  @default(1.0)
  benefits        String[] // JSON array
  createdAt       DateTime @default(now())
}

model Reward {
  id              String   @id @default(uuid())
  programId       String
  program         LoyaltyProgram @relation(fields: [programId], references: [id])
  name            String
  description     String?
  pointsCost      Int
  rewardType      RewardType
  value           Decimal?
  expiryDays      Int?
  isActive        Boolean  @default(true)
  redemptions     RewardRedemption[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum RewardType {
  DISCOUNT_PERCENTAGE
  DISCOUNT_FIXED
  FREE_ITEM
  FREE_DELIVERY
  BIRTHDAY_SPECIAL
}

model CustomerLoyalty {
  id              String   @id @default(uuid())
  customerId      String   @unique
  customer        User     @relation(fields: [customerId], references: [id])
  points          Int      @default(0)
  lifetimePoints  Int      @default(0)
  currentTier     String?
  joinDate        DateTime @default(now())
  redemptions     RewardRedemption[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model RewardRedemption {
  id              String   @id @default(uuid())
  rewardId        String
  reward          Reward   @relation(fields: [rewardId], references: [id])
  loyaltyId       String
  loyalty         CustomerLoyalty @relation(fields: [loyaltyId], references: [id])
  orderId         String?
  order           Order?   @relation(fields: [orderId], references: [id])
  redeemedDate    DateTime @default(now())
  expiryDate      DateTime?
  used            Boolean  @default(false)
  createdAt       DateTime @default(now())
}

// Gift Cards
model GiftCard {
  id              String   @id @default(uuid())
  code            String   @unique
  initialValue    Decimal
  currentBalance  Decimal
  purchasedBy     String?
  purchaser       User?    @relation(name: "GiftCardPurchaser", fields: [purchasedBy], references: [id])
  recipientEmail  String?
  recipientName   String?
  purchaseDate    DateTime @default(now())
  expiryDate      DateTime?
  isActive        Boolean  @default(true)
  transactions    GiftCardTransaction[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model GiftCardTransaction {
  id              String   @id @default(uuid())
  giftCardId      String
  giftCard        GiftCard @relation(fields: [giftCardId], references: [id])
  orderId         String?
  order           Order?   @relation(fields: [orderId], references: [id])
  amount          Decimal
  transactionType GiftCardTxType
  balanceBefore   Decimal
  balanceAfter    Decimal
  createdAt       DateTime @default(now())
}

enum GiftCardTxType {
  PURCHASE
  REDEMPTION
  REFUND
  EXPIRY
}

// Promotions
model Promotion {
  id              String   @id @default(uuid())
  code            String   @unique
  name            String
  description     String?
  discountType    DiscountType
  discountValue   Decimal
  minOrderAmount  Decimal?
  maxDiscount     Decimal?
  startDate       DateTime
  endDate         DateTime
  usageLimit      Int?
  usedCount       Int      @default(0)
  isActive        Boolean  @default(true)
  applicableLocations String[] // location IDs
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_DELIVERY
  BOGO
}

// Events & Catering
model Event {
  id              String   @id @default(uuid())
  locationId      String?
  location        Restaurant? @relation(fields: [locationId], references: [id])
  customerId      String
  customer        User     @relation(fields: [customerId], references: [id])
  eventType       EventType
  eventDate       DateTime
  guestCount      Int
  budget          Decimal?
  menuPackage     String?
  specialRequests String?
  status          EventStatus @default(INQUIRY)
  depositPaid     Decimal?
  totalCost       Decimal?
  assignedStaff   String[] // staff IDs
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum EventType {
  WEDDING
  CORPORATE
  BIRTHDAY
  ANNIVERSARY
  PRIVATE_DINING
  CATERING
  OTHER
}

enum EventStatus {
  INQUIRY
  QUOTE_SENT
  CONFIRMED
  DEPOSIT_PAID
  COMPLETED
  CANCELLED
}

// Blog/News
model BlogPost {
  id              String   @id @default(uuid())
  title           String
  slug            String   @unique
  content         String   // Rich text/markdown
  excerpt         String?
  featuredImage   String?
  authorId        String
  author          User     @relation(fields: [authorId], references: [id])
  category        String?
  tags            String[]
  published       Boolean  @default(false)
  publishedAt     DateTime?
  views           Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Job Listings
model JobListing {
  id              String   @id @default(uuid())
  locationId      String?
  location        Restaurant? @relation(fields: [locationId], references: [id])
  title           String
  department      String
  employmentType  EmploymentType
  description     String
  requirements    String
  salary          String?
  isActive        Boolean  @default(true)
  applications    JobApplication[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERNSHIP
}

model JobApplication {
  id              String   @id @default(uuid())
  jobId           String
  job             JobListing @relation(fields: [jobId], references: [id])
  applicantName   String
  email           String
  phone           String
  resumeUrl       String
  coverLetter     String?
  status          ApplicationStatus @default(NEW)
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum ApplicationStatus {
  NEW
  REVIEWING
  INTERVIEW_SCHEDULED
  REJECTED
  OFFER_MADE
  HIRED
}

// Communication
model Message {
  id              String   @id @default(uuid())
  senderId        String?
  sender          User?    @relation(name: "SentMessages", fields: [senderId], references: [id])
  recipientId     String?
  recipient       User?    @relation(name: "ReceivedMessages", fields: [recipientId], references: [id])
  subject         String?
  content         String
  messageType     MessageType
  isRead          Boolean  @default(false)
  parentId        String?  // For threading
  createdAt       DateTime @default(now())
}

enum MessageType {
  INTERNAL
  CUSTOMER_SUPPORT
  ANNOUNCEMENT
  SYSTEM
}

// Real-time Order Tracking
model OrderStatusHistory {
  id              String   @id @default(uuid())
  orderId         String
  order           Order    @relation(fields: [orderId], references: [id])
  status          OrderStatus
  note            String?
  updatedBy       String?
  timestamp       DateTime @default(now())
}

// Floor Plan for Reservations
model FloorPlan {
  id              String   @id @default(uuid())
  locationId      String   @unique
  location        Restaurant @relation(fields: [locationId], references: [id])
  layout          Json     // Serialized floor plan data
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Schema Modifications to Existing Models

```prisma
// Add to existing MenuItem model
model MenuItem {
  // ... existing fields ...
  ingredients     MenuItemIngredient[]
  calories        Int?
  spiceLevel      Int?      // 0-5
  allergens       String[]  // array of allergen names
  dietaryFlags    String[]  // vegetarian, vegan, keto, halal, kosher
  winePairing     String?
  isChefRecommended Boolean @default(false)
  isSeasonal      Boolean  @default(false)
  isPopular       Boolean  @default(false)
  customizationOptions Json? // JSON object
  averageRating   Decimal?  @default(0)
  reviewCount     Int       @default(0)
}

// Add to existing Order model
model Order {
  // ... existing fields ...
  promoCode       String?
  discount        Decimal   @default(0)
  tip             Decimal   @default(0)
  deliveryFee     Decimal   @default(0)
  serviceFee      Decimal   @default(0)
  subtotal        Decimal
  taxes           Decimal   @default(0)
  estimatedTime   Int?      // minutes
  specialInstructions String?
  deliveryAddress String?
  scheduledFor    DateTime?
  assignedDriverId String?
  statusHistory   OrderStatusHistory[]
  waiterReviews   WaiterReview[]
  giftCardTransactions GiftCardTransaction[]
  loyaltyRedemptions RewardRedemption[]
}

// Add to existing Restaurant model
model Restaurant {
  // ... existing fields ...
  deliveryRadius  Decimal?  // in kilometers
  minOrderAmount  Decimal?
  deliveryFee     Decimal?
  taxRate         Decimal?
  amenities       String[]  // parking, wifi, outdoor seating, etc.
  parkingInfo     String?
  accessibilityFeatures String[]
  privateRooms    Boolean   @default(false)
  outdoorSeating  Boolean   @default(false)
  currentWaitTime Int?      // in minutes
  staff           Staff[]
  shifts          Shift[]
  ingredientStock IngredientStock[]
  purchaseOrders  PurchaseOrder[]
  assets          Asset[]
  expenses        Expense[]
  events          Event[]
  jobListings     JobListing[]
  floorPlan       FloorPlan?
}

// Add to existing User model
model User {
  // ... existing fields ...
  favoriteItems   String[]  // menu item IDs
  savedAddresses  Address[] @relation("UserAddresses")
  savedPaymentMethods Json? // Tokenized payment methods
  dietaryRestrictions String[]
  allergies       String[]
  communicationPrefs Json?
  birthdate       DateTime?
  loyaltyAccount  CustomerLoyalty?
  giftCardsPurchased GiftCard[] @relation("GiftCardPurchaser")
  waiterReviews   WaiterReview[]
  staff           Staff?
  sentMessages    Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  events          Event[]
  blogPosts       BlogPost[]
}

// Add to existing Reservation model
model Reservation {
  // ... existing fields ...
  seatingPreference String? // indoor, outdoor, booth, table
  occasion        String?   // birthday, anniversary, etc.
  depositAmount   Decimal?  @default(0)
  depositPaid     Boolean   @default(false)
  cancellationPolicy String?
  modificationHistory Json? // Track changes
}
```

---

## 🚀 Development Phases

### **Phase 1: Enhanced Menu & Location Pages (2 weeks)**
Build out complete public menu browsing and location information

### **Phase 2: Reservation System (2 weeks)**
Real-time table booking with floor plan management

### **Phase 3: Online Ordering & Cart (3 weeks)**
Full e-commerce flow with dish customization

### **Phase 4: Payment Integration (2 weeks)**
Stripe, PayPal, Apple Pay, Google Pay integration

### **Phase 5: Order Management & Kitchen Display (2 weeks)**
Real-time order tracking, kitchen display system

### **Phase 6: Staff & Inventory Management (3 weeks)**
Staff scheduling, performance, inventory tracking

### **Phase 7: CRM & Loyalty (2 weeks)**
Customer relationship management and rewards program

### **Phase 8: Advanced Admin Features (3 weeks)**
Assets, financials, analytics, marketing tools

---

## 📅 Phase Details

### **PHASE 1: Enhanced Menu & Location Pages**
**Duration:** 2 weeks
**Priority:** High
**Dependencies:** None (builds on existing structure)

#### Features to Build:

**1.1 Public Menu Page (`/distribution/restaurants/menu`)**
- [x] Database schema updates (MenuItem enhancements)
- [ ] Menu browsing UI with categories
- [ ] Dietary filters (vegetarian, vegan, keto, halal, kosher, gluten-free)
- [ ] Allergen indicators and filtering
- [ ] Spice level display
- [ ] Calorie information
- [ ] Wine pairing suggestions
- [ ] Chef's recommendations badge
- [ ] Seasonal/limited-time indicators
- [ ] Customer ratings per dish
- [ ] Dish detail modal with full info
- [ ] High-quality image gallery per dish
- [ ] Search functionality
- [ ] Add to favorites (requires auth)
- [ ] Share dish on social media

**1.2 Location Pages (`/distribution/restaurants/locations`)**
- [ ] Interactive Google Maps integration
- [ ] Location directory with filtering
- [ ] Individual location pages with:
  - Detailed address and directions
  - Operating hours
  - Parking information
  - Accessibility features
  - Private dining room info
  - Outdoor seating availability
  - Location-specific photos
  - Current wait times (live from admin)
  - Location-specific menu variations
  - Contact information (phone, email)

**1.3 About Us Page (`/distribution/restaurants/about`)**
- [ ] Restaurant story/history section
- [ ] Chef profiles with bios and photos
- [ ] Awards & recognition showcase
- [ ] Sustainability practices
- [ ] Farm partnership links
- [ ] Press & media coverage
- [ ] Virtual tour (360° photos integration)

**1.4 Gallery Page (`/distribution/restaurants/gallery`)**
- [ ] Photo galleries by category:
  - Dishes
  - Restaurant ambiance
  - Events
  - Behind-the-scenes
  - Customer moments
- [ ] Video content (YouTube/Vimeo embeds)
- [ ] Lightbox/modal for full-screen viewing
- [ ] Social sharing

**Backend (Phase 1):**
- [ ] Restaurant Service API endpoints:
  - `GET /api/v1/restaurants/menu` - Full menu with filters
  - `GET /api/v1/restaurants/menu/:itemId` - Dish details
  - `GET /api/v1/restaurants/locations` - All locations
  - `GET /api/v1/restaurants/locations/:id` - Location details
  - `GET /api/v1/restaurants/:id/wait-time` - Current wait time
  - `POST /api/v1/users/favorites` - Add favorite dish
  - `DELETE /api/v1/users/favorites/:itemId` - Remove favorite
- [ ] Admin endpoints:
  - `PUT /api/v1/admin/menu/:itemId` - Update menu item
  - `POST /api/v1/admin/menu` - Create menu item
  - `DELETE /api/v1/admin/menu/:itemId` - Delete menu item
  - `PUT /api/v1/admin/locations/:id/wait-time` - Update wait time

**Database Migrations (Phase 1):**
- [ ] Add new fields to MenuItem (calories, spiceLevel, allergens, etc.)
- [ ] Add new fields to Restaurant (amenities, parkingInfo, etc.)
- [ ] Create MenuItemIngredient junction table
- [ ] Create Ingredient table
- [ ] Add favoriteItems to User

**Testing (Phase 1):**
- [ ] Unit tests for menu filtering logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for menu browsing flow
- [ ] Responsive design testing

---

### **PHASE 2: Reservation System**
**Duration:** 2 weeks
**Priority:** High
**Dependencies:** Phase 1 (location data)

#### Features to Build:

**2.1 Public Reservation Flow (`/distribution/restaurants/reservations`)**
- [ ] Multi-step reservation wizard:
  - Location selection
  - Date picker with availability calendar
  - Time slot selection (real-time availability)
  - Party size selector
  - Seating preference (indoor/outdoor, booth/table)
  - Special occasion selection
  - Special requests/dietary restrictions
  - Guest information form
  - Confirmation screen
- [ ] Email/SMS confirmation
- [ ] Guest login to view/modify reservations
- [ ] Waitlist signup when fully booked
- [ ] Cancellation policy display
- [ ] Reservation modification flow
- [ ] Cancel reservation

**2.2 Admin Reservation Management (`/admin/restaurants/reservations`)**
- [ ] Visual floor plan with drag-and-drop table placement
- [ ] Real-time table status (available, occupied, reserved, cleaning)
- [ ] Today's reservations timeline view
- [ ] Calendar view for upcoming reservations
- [ ] Waitlist management interface
- [ ] Walk-in queue
- [ ] Manual reservation creation
- [ ] Reservation modification
- [ ] No-show tracking
- [ ] Guest profile integration
- [ ] SMS/email confirmation sending
- [ ] Table assignment and re-assignment
- [ ] Reservation notes and special requests
- [ ] Blacklist management for repeat no-shows

**2.3 Table Management**
- [ ] Floor plan editor (drag-and-drop)
- [ ] Table configuration (capacity, type, location)
- [ ] Table combining/splitting
- [ ] Table status management
- [ ] Preferred tables for VIPs
- [ ] Table turnover tracking

**Backend (Phase 2):**
- [ ] Restaurant Service API additions:
  - `GET /api/v1/reservations/availability` - Check availability
  - `POST /api/v1/reservations` - Create reservation
  - `GET /api/v1/reservations/:id` - Get reservation details
  - `PUT /api/v1/reservations/:id` - Modify reservation
  - `DELETE /api/v1/reservations/:id` - Cancel reservation
  - `POST /api/v1/reservations/waitlist` - Join waitlist
  - `GET /api/v1/users/:userId/reservations` - User's reservations
- [ ] Admin endpoints:
  - `GET /api/v1/admin/reservations` - All reservations (filtered)
  - `PUT /api/v1/admin/reservations/:id/status` - Update status
  - `POST /api/v1/admin/reservations/:id/assign-table` - Assign table
  - `GET /api/v1/admin/floor-plan/:locationId` - Get floor plan
  - `PUT /api/v1/admin/floor-plan/:locationId` - Update floor plan
  - `GET /api/v1/admin/tables/:locationId` - Get all tables
  - `POST /api/v1/admin/tables` - Create table
  - `PUT /api/v1/admin/tables/:id` - Update table
  - `DELETE /api/v1/admin/tables/:id` - Delete table
- [ ] Notification Service:
  - Email confirmations (SendGrid)
  - SMS confirmations (Twilio)

**Database Migrations (Phase 2):**
- [ ] Add new fields to Reservation (seatingPreference, occasion, depositAmount, etc.)
- [ ] Create FloorPlan table
- [ ] Update Table model with additional fields
- [ ] Create reservation status history tracking

**Real-time Features (Phase 2):**
- [ ] Socket.io for real-time table status updates
- [ ] Live availability updates on public calendar

**Testing (Phase 2):**
- [ ] Unit tests for availability calculation
- [ ] Integration tests for reservation flow
- [ ] E2E tests for complete booking journey
- [ ] Load testing for concurrent reservations

---

### **PHASE 3: Online Ordering & Cart**
**Duration:** 3 weeks
**Priority:** Critical
**Dependencies:** Phase 1 (menu data)

#### Features to Build:

**3.1 Public Order Online Page (`/distribution/restaurants/order`)**
- [ ] Menu browsing by category
- [ ] Search functionality with autocomplete
- [ ] Dish customization modal:
  - Ingredient exclusions (checkboxes)
  - Substitutions (dairy-free, gluten-free)
  - Portion size selection
  - Add-ons and modifiers
  - Special cooking instructions
  - Allergy alerts
  - Price calculation with customizations
- [ ] Add to cart functionality
- [ ] Shopping cart sidebar/page:
  - Order summary
  - Customization details visible
  - Quantity adjustment
  - Remove items
  - Estimated preparation time
  - Promo code field
  - Subtotal, taxes, fees breakdown

**3.2 Checkout Flow (`/distribution/restaurants/checkout`)**
- [ ] Delivery or pickup selection
- [ ] Delivery address form with validation
- [ ] Delivery area validation
- [ ] Scheduled ordering (order for later)
- [ ] Contact information
- [ ] Tip customization (percentage presets + custom)
- [ ] Order notes/special instructions
- [ ] Order review before payment
- [ ] Payment method selection (continue in Phase 4)

**3.3 User Account Features**
- [ ] Customer registration/login
- [ ] User dashboard (`/account/dashboard`)
- [ ] Profile management
- [ ] Order history (`/account/orders`)
- [ ] Order details view
- [ ] Reorder functionality
- [ ] Favorite dishes management
- [ ] Saved addresses management
- [ ] Saved payment methods (tokens only)
- [ ] Dietary preferences and allergies
- [ ] Communication preferences

**Backend (Phase 3):**
- [ ] Order Service (new microservice):
  - `POST /api/v1/cart` - Create cart
  - `GET /api/v1/cart/:cartId` - Get cart
  - `POST /api/v1/cart/:cartId/items` - Add item to cart
  - `PUT /api/v1/cart/:cartId/items/:itemId` - Update cart item
  - `DELETE /api/v1/cart/:cartId/items/:itemId` - Remove from cart
  - `POST /api/v1/cart/:cartId/promo` - Apply promo code
  - `POST /api/v1/orders` - Create order from cart
  - `GET /api/v1/orders/:orderId` - Get order details
  - `GET /api/v1/users/:userId/orders` - User's order history
- [ ] Customer Service (new microservice):
  - `POST /api/v1/users/register` - Register customer
  - `POST /api/v1/users/login` - Login (JWT)
  - `GET /api/v1/users/:userId/profile` - Get profile
  - `PUT /api/v1/users/:userId/profile` - Update profile
  - `POST /api/v1/users/:userId/addresses` - Add address
  - `PUT /api/v1/users/:userId/addresses/:id` - Update address
  - `DELETE /api/v1/users/:userId/addresses/:id` - Delete address

**Database Migrations (Phase 3):**
- [ ] Add customizationOptions to MenuItem
- [ ] Create Promotion table
- [ ] Add discount/promo fields to Order
- [ ] Add delivery fields to Order (deliveryAddress, deliveryFee, etc.)
- [ ] Update User with new fields (favoriteItems, savedAddresses, etc.)

**State Management (Phase 3):**
- [ ] Zustand store for cart state
- [ ] React Query for menu data
- [ ] Optimistic updates for cart operations

**Testing (Phase 3):**
- [ ] Unit tests for cart logic
- [ ] Unit tests for price calculation with customizations
- [ ] Integration tests for order creation
- [ ] E2E tests for complete order flow
- [ ] Cart persistence testing

---

### **PHASE 4: Payment Integration**
**Duration:** 2 weeks
**Priority:** Critical
**Dependencies:** Phase 3 (cart & checkout)

#### Features to Build:

**4.1 Public Payment Methods**
- [ ] Stripe integration:
  - Stripe Elements for card input
  - 3D Secure (SCA) support
  - Save card for future use (tokenization)
  - Apple Pay integration
  - Google Pay integration
- [ ] PayPal integration:
  - PayPal Checkout SDK
  - PayPal button
- [ ] Cash on delivery option
- [ ] Gift card redemption
- [ ] Loyalty points redemption (Phase 7 dependency)
- [ ] Split payment support (card + gift card, etc.)

**4.2 Checkout Completion**
- [ ] Payment processing
- [ ] Payment confirmation screen
- [ ] Digital receipt via email
- [ ] Order tracking page (`/orders/:orderId/track`)
- [ ] Real-time order status updates

**4.3 Admin Payment Management (`/admin/restaurants/payments`)**
- [ ] Payment dashboard
- [ ] Real-time payment authorization
- [ ] Failed payment handling
- [ ] Refund interface (partial and full)
- [ ] Payment dispute management
- [ ] Chargeback tracking
- [ ] Daily settlement reports
- [ ] Payment gateway fee tracking
- [ ] Cash reconciliation for COD/dine-in
- [ ] Tip distribution to staff
- [ ] Bank deposit tracking
- [ ] Payment method analytics
- [ ] Transaction success rates
- [ ] Failed transaction analysis
- [ ] Fraud detection alerts
- [ ] Suspicious transaction flagging
- [ ] Audit logs for all transactions

**Backend (Phase 4):**
- [ ] Payment Service (new microservice):
  - `POST /api/v1/payments/intent` - Create payment intent (Stripe)
  - `POST /api/v1/payments/process` - Process payment
  - `POST /api/v1/payments/confirm` - Confirm payment
  - `GET /api/v1/payments/:paymentId` - Get payment details
  - `POST /api/v1/payments/:paymentId/refund` - Refund payment
  - `POST /api/v1/payments/webhook` - Stripe webhook handler
  - `POST /api/v1/payments/paypal/create` - PayPal order creation
  - `POST /api/v1/payments/paypal/capture` - Capture PayPal payment
  - `POST /api/v1/gift-cards/validate` - Validate gift card
  - `POST /api/v1/gift-cards/redeem` - Redeem gift card
- [ ] Admin endpoints:
  - `GET /api/v1/admin/payments` - All payments (filtered)
  - `GET /api/v1/admin/payments/analytics` - Payment analytics
  - `POST /api/v1/admin/payments/:id/refund` - Process refund
  - `GET /api/v1/admin/payments/settlement` - Settlement report

**Database Migrations (Phase 4):**
- [ ] Create GiftCard table
- [ ] Create GiftCardTransaction table
- [ ] Add payment-related fields to Order (paymentIntentId, paymentMethod, etc.)
- [ ] Create payment transaction log table

**Third-party Integration (Phase 4):**
- [ ] Stripe account setup and API keys
- [ ] PayPal business account and SDK integration
- [ ] PCI compliance review
- [ ] SSL certificate verification
- [ ] Webhook endpoint security

**Testing (Phase 4):**
- [ ] Unit tests for payment processing logic
- [ ] Integration tests with Stripe test mode
- [ ] Integration tests with PayPal sandbox
- [ ] E2E tests for complete payment flows
- [ ] Refund flow testing
- [ ] Webhook handling tests
- [ ] Security penetration testing

---

### **PHASE 5: Order Management & Kitchen Display**
**Duration:** 2 weeks
**Priority:** High
**Dependencies:** Phase 3 (orders), Phase 4 (payments)

#### Features to Build:

**5.1 Admin Order Management (`/admin/restaurants/orders`)**
- [ ] Live order queue dashboard
- [ ] Order status board (Kanban-style):
  - Pending
  - Confirmed
  - Preparing
  - Ready for pickup/delivery
  - Out for delivery
  - Completed
  - Cancelled
- [ ] Order filtering and search:
  - By type (online, dine-in, takeout, delivery, catering)
  - By status
  - By location
  - By date range
  - By customer
- [ ] Priority orders highlighting
- [ ] Order detail view:
  - Customer information
  - Order items with customizations
  - Special instructions highlighted
  - Payment status
  - Delivery/pickup details
  - Order timeline
  - Communication log with customer
- [ ] Order actions:
  - Confirm order
  - Update status
  - Assign driver (for delivery)
  - Cancel order
  - Refund order
  - Print receipt/kitchen ticket
  - Contact customer
- [ ] Order analytics:
  - Average preparation time
  - Order accuracy rate
  - Peak order times heatmap
  - Refund/complaint tracking

**5.2 Kitchen Display System (`/admin/restaurants/kitchen`)**
- [ ] Kitchen dashboard (dedicated view)
- [ ] Order cards with:
  - Order number
  - Table number (dine-in) or customer name
  - Order items grouped by station (grill, fryer, salad, etc.)
  - Customizations and special instructions
  - Allergen warnings highlighted
  - Elapsed time since order placed
  - Priority indicator
- [ ] Order routing to kitchen stations
- [ ] Item completion marking (checkboxes)
- [ ] Bump bar functionality (move to next status)
- [ ] Recall orders (if sent by mistake)
- [ ] Sound alerts for new orders
- [ ] Priority management (rush orders)
- [ ] Preparation time tracking

**5.3 Public Order Tracking (`/orders/:orderId/track`)**
- [ ] Real-time status updates
- [ ] Order timeline visualization
- [ ] Estimated delivery/pickup time
- [ ] Driver tracking (for delivery) - Google Maps integration
- [ ] SMS/email notifications for status changes
- [ ] Contact restaurant button
- [ ] Re-order button

**5.4 Delivery Management**
- [ ] Driver assignment interface
- [ ] Route optimization (Google Maps Directions API)
- [ ] Live driver location tracking
- [ ] Delivery time estimates
- [ ] Driver performance metrics:
  - On-time delivery rate
  - Average delivery time
  - Customer ratings
  - Number of deliveries
- [ ] Cash reconciliation for COD orders
- [ ] Delivery zones management

**Backend (Phase 5):**
- [ ] Order Service additions:
  - `PUT /api/v1/orders/:orderId/status` - Update order status
  - `POST /api/v1/orders/:orderId/cancel` - Cancel order
  - `GET /api/v1/admin/orders/live-queue` - Live order queue
  - `POST /api/v1/orders/:orderId/assign-driver` - Assign driver
  - `GET /api/v1/orders/:orderId/timeline` - Order status history
- [ ] Notification Service additions:
  - `POST /api/v1/notifications/order-status` - Send status update
  - Email templates for each order status
  - SMS templates for key statuses
- [ ] Analytics Service (basic):
  - `GET /api/v1/analytics/orders/prep-time` - Avg prep time
  - `GET /api/v1/analytics/orders/peak-times` - Peak order analysis

**Database Migrations (Phase 5):**
- [ ] Create OrderStatusHistory table
- [ ] Add assignedDriverId to Order
- [ ] Add estimatedTime to Order

**Real-time Features (Phase 5):**
- [ ] Socket.io for live order updates
- [ ] Real-time kitchen display updates
- [ ] Customer order tracking updates
- [ ] Admin dashboard live order count

**Testing (Phase 5):**
- [ ] Unit tests for order status transitions
- [ ] Integration tests for order workflow
- [ ] E2E tests for kitchen display system
- [ ] Real-time update testing
- [ ] Load testing for concurrent orders

---

### **PHASE 6: Staff & Inventory Management**
**Duration:** 3 weeks
**Priority:** Medium
**Dependencies:** None (independent module)

#### Features to Build:

**6.1 Staff Management (`/admin/restaurants/staff`)**
- [ ] Employee directory with search/filter
- [ ] Staff profiles:
  - Personal information
  - Role assignment
  - Location assignment
  - Contact info and emergency contacts
  - Employment start date
  - Profile photo upload
  - Documents storage (ID, certifications, contracts)
  - Hourly rate or salary
- [ ] Role management (chef, waiter, host, manager, etc.)
- [ ] Staff performance tracking:
  - Waiter metrics (tables served, avg bill, ratings, tips)
  - Chef metrics (dishes prepared, prep time, ratings)
  - Attendance record
  - Punctuality tracking
- [ ] Training & development:
  - Training modules assignment
  - Certification tracking
  - Skill assessments
  - Promotion eligibility

**6.2 Staff Scheduling (`/admin/restaurants/scheduling`)**
- [ ] Shift calendar (week/month view)
- [ ] Drag-and-drop shift assignment
- [ ] Auto-scheduling based on:
  - Predicted demand
  - Staff availability
  - Labor budget
- [ ] Shift templates (opening, closing, mid-day)
- [ ] Time-off request management
- [ ] Shift swap requests and approvals
- [ ] Coverage alerts for understaffed shifts
- [ ] Clock in/out system
- [ ] Break tracking
- [ ] Overtime alerts

**6.3 Waiter Review System (`/admin/restaurants/waiter-reviews`)**
- [ ] Customer feedback for waiters
- [ ] Rating breakdown:
  - Friendliness (1-5)
  - Speed (1-5)
  - Knowledge (1-5)
  - Professionalism (1-5)
  - Overall (1-5)
- [ ] Review moderation
- [ ] Response to reviews
- [ ] Performance rankings leaderboard
- [ ] Incentive programs based on ratings
- [ ] Training recommendations from feedback

**6.4 Inventory Management (`/admin/restaurants/inventory`)**
- [ ] Master ingredient list
- [ ] Stock level tracking by location
- [ ] Unit of measurement
- [ ] Reorder point alerts (low stock notifications)
- [ ] Expiration date tracking
- [ ] Batch/lot tracking
- [ ] Storage location assignment
- [ ] Cost per unit
- [ ] Supplier information
- [ ] Stock operations:
  - Receive inventory (from purchase orders)
  - Adjust stock (waste, spoilage, theft)
  - Transfer between locations
  - Stock taking/audit interface
  - Automatic deduction based on orders (recipe costing)

**6.5 Supplier Management (`/admin/restaurants/suppliers`)**
- [ ] Supplier directory
- [ ] Supplier profiles:
  - Contact information
  - Products supplied
  - Pricing
  - Payment terms
  - Performance rating
  - Contract details
- [ ] Purchase order creation
- [ ] PO approval workflow
- [ ] Delivery tracking
- [ ] Price history tracking
- [ ] Supplier performance ratings

**6.6 Inventory Reports**
- [ ] Stock valuation report
- [ ] Usage reports (by ingredient, by period)
- [ ] Waste reports (spoilage, theft)
- [ ] Variance reports (expected vs actual)
- [ ] Inventory turnover analysis
- [ ] Cost of goods sold (COGS)

**Backend (Phase 6):**
- [ ] Inventory Service (new microservice):
  - `GET /api/v1/inventory/ingredients` - List ingredients
  - `POST /api/v1/inventory/ingredients` - Create ingredient
  - `PUT /api/v1/inventory/ingredients/:id` - Update ingredient
  - `GET /api/v1/inventory/stock/:locationId` - Stock by location
  - `POST /api/v1/inventory/stock/receive` - Receive stock
  - `POST /api/v1/inventory/stock/adjust` - Adjust stock
  - `POST /api/v1/inventory/stock/transfer` - Transfer stock
  - `GET /api/v1/inventory/alerts` - Low stock alerts
  - `GET /api/v1/suppliers` - List suppliers
  - `POST /api/v1/suppliers` - Create supplier
  - `POST /api/v1/purchase-orders` - Create PO
  - `PUT /api/v1/purchase-orders/:id/receive` - Mark PO received
- [ ] Staff Service endpoints:
  - `GET /api/v1/staff` - List staff
  - `POST /api/v1/staff` - Create staff profile
  - `PUT /api/v1/staff/:id` - Update staff profile
  - `DELETE /api/v1/staff/:id` - Remove staff
  - `GET /api/v1/staff/:id/performance` - Performance metrics
  - `POST /api/v1/shifts` - Create shift
  - `PUT /api/v1/shifts/:id` - Update shift
  - `POST /api/v1/shifts/:id/clock-in` - Clock in
  - `POST /api/v1/shifts/:id/clock-out` - Clock out
  - `GET /api/v1/waiter-reviews` - List reviews
  - `POST /api/v1/waiter-reviews` - Create review

**Database Migrations (Phase 6):**
- [ ] Create Staff table
- [ ] Create Shift table
- [ ] Create WaiterReview table
- [ ] Create Ingredient table
- [ ] Create IngredientStock table
- [ ] Create MenuItemIngredient junction table
- [ ] Create Supplier table
- [ ] Create PurchaseOrder table

**Testing (Phase 6):**
- [ ] Unit tests for stock calculation
- [ ] Unit tests for scheduling logic
- [ ] Integration tests for inventory operations
- [ ] E2E tests for staff management
- [ ] Recipe costing accuracy tests

---

### **PHASE 7: CRM & Loyalty**
**Duration:** 2 weeks
**Priority:** Medium
**Dependencies:** Phase 3 (customer accounts), Phase 4 (orders)

#### Features to Build:

**7.1 Customer Relationship Management (`/admin/restaurants/customers`)**
- [ ] Customer database with advanced search/filter
- [ ] Customer profiles:
  - Contact information
  - Dining history
  - Order history with details
  - Total lifetime value
  - Average order value
  - Visit frequency
  - Last visit date
  - Preferred location
  - Favorite dishes
  - Dietary restrictions
  - Allergies
  - Special occasions (birthdays, anniversaries)
  - Communication preferences
  - VIP status
  - Customer notes
- [ ] Customer segmentation:
  - VIP customers
  - Regular customers
  - New customers
  - Inactive customers
  - High spenders
  - Custom segments (tags)
- [ ] Communication tools:
  - Send individual email
  - Send SMS
  - Bulk email campaigns to segments
  - Bulk SMS campaigns
- [ ] Customer journey timeline

**7.2 Marketing Tools (`/admin/restaurants/marketing`)**
- [ ] Email campaign builder:
  - Template selection
  - WYSIWYG editor
  - Personalization tokens (name, favorite dish, etc.)
  - Segment targeting
  - A/B testing
  - Schedule sending
  - Campaign analytics (open rate, click rate, conversions)
- [ ] SMS campaign builder
- [ ] Push notification builder (for mobile app - future)
- [ ] Automated campaigns:
  - Welcome email for new customers
  - Birthday/anniversary emails
  - Re-engagement for inactive customers
  - Post-order feedback request
  - Abandoned cart recovery
- [ ] Promotion management:
  - Create discount codes
  - Promotion scheduling (start/end dates)
  - Discount types (%, fixed, free delivery, BOGO)
  - Usage limits (per customer, total uses)
  - Minimum order amount
  - Applicable locations
  - Performance tracking

**7.3 Loyalty & Rewards Program (`/admin/restaurants/loyalty`)**
- [ ] Loyalty program configuration:
  - Program name
  - Points per dollar spent
  - Enable/disable program
- [ ] Tier management:
  - Create tiers (Silver, Gold, Platinum)
  - Set minimum points for each tier
  - Set multiplier for each tier
  - Define benefits for each tier
- [ ] Rewards catalog:
  - Create rewards
  - Set points cost
  - Reward types (% discount, fixed discount, free item, free delivery)
  - Expiry days
  - Activate/deactivate rewards
- [ ] Member management:
  - View all loyalty members
  - Member search/filter
  - Manual points adjustment
  - View redemption history
- [ ] Referral program:
  - Referral tracking
  - Referral rewards configuration
  - Referral leaderboard
- [ ] Loyalty analytics:
  - Total members
  - Active members
  - Points issued vs redeemed
  - Most popular rewards
  - ROI analysis

**7.4 Public Loyalty Features (`/account/loyalty`)**
- [ ] Customer loyalty dashboard:
  - Current points balance
  - Lifetime points earned
  - Current tier and benefits
  - Progress to next tier
  - Rewards catalog
  - Redeem rewards
  - Redemption history
  - Referral link
  - Referral count and rewards earned

**7.5 Gift Cards (`/admin/restaurants/gift-cards`)**
- [ ] Gift card management:
  - Issue gift cards
  - Set initial value
  - Generate unique codes
  - Set expiry dates
  - Activate/deactivate gift cards
  - Check balance
  - Transaction history
  - Bulk gift card creation
  - Corporate gift card programs
- [ ] Public gift card features:
  - Purchase digital gift cards (`/gift-cards/purchase`)
  - Personalize (recipient name, message)
  - Send via email
  - Check balance (`/gift-cards/balance`)
  - Gift card redemption at checkout

**7.6 Feedback Management**
- [ ] Review aggregation (Google, Yelp, internal)
- [ ] Sentiment analysis (positive, neutral, negative)
- [ ] Response management
- [ ] Issue resolution tracking
- [ ] Complaint escalation workflow
- [ ] Review response templates

**Backend (Phase 7):**
- [ ] CRM Service endpoints:
  - `GET /api/v1/customers` - List customers with filters
  - `GET /api/v1/customers/:id` - Customer profile
  - `PUT /api/v1/customers/:id` - Update customer
  - `GET /api/v1/customers/:id/timeline` - Customer journey
  - `POST /api/v1/customers/segments` - Create segment
  - `POST /api/v1/campaigns/email` - Create email campaign
  - `POST /api/v1/campaigns/sms` - Create SMS campaign
  - `GET /api/v1/campaigns/:id/analytics` - Campaign stats
- [ ] Loyalty Service endpoints:
  - `GET /api/v1/loyalty/program` - Get program config
  - `PUT /api/v1/loyalty/program` - Update program config
  - `POST /api/v1/loyalty/tiers` - Create tier
  - `POST /api/v1/loyalty/rewards` - Create reward
  - `GET /api/v1/loyalty/members` - List members
  - `GET /api/v1/loyalty/members/:customerId` - Member details
  - `POST /api/v1/loyalty/points/adjust` - Adjust points
  - `POST /api/v1/loyalty/redeem` - Redeem reward
  - `POST /api/v1/loyalty/referral` - Track referral
- [ ] Gift Card endpoints:
  - `POST /api/v1/gift-cards` - Create gift card
  - `GET /api/v1/gift-cards/:code/balance` - Check balance
  - `POST /api/v1/gift-cards/:code/redeem` - Redeem at checkout
  - `GET /api/v1/gift-cards/:code/transactions` - Transaction history
- [ ] Promotion endpoints:
  - `POST /api/v1/promotions` - Create promotion
  - `GET /api/v1/promotions/:code/validate` - Validate promo code
  - `GET /api/v1/promotions/:id/analytics` - Promo performance

**Database Migrations (Phase 7):**
- [ ] Create LoyaltyProgram table
- [ ] Create LoyaltyTier table
- [ ] Create Reward table
- [ ] Create CustomerLoyalty table
- [ ] Create RewardRedemption table
- [ ] Create GiftCard table (if not in Phase 4)
- [ ] Create GiftCardTransaction table
- [ ] Create Promotion table
- [ ] Add marketing preferences to User

**Third-party Integration (Phase 7):**
- [ ] SendGrid for email campaigns
- [ ] Twilio for SMS campaigns
- [ ] Google Reviews API
- [ ] Yelp API

**Testing (Phase 7):**
- [ ] Unit tests for loyalty points calculation
- [ ] Unit tests for reward redemption logic
- [ ] Integration tests for campaign sending
- [ ] E2E tests for loyalty program flow
- [ ] Email deliverability testing

---

### **PHASE 8: Advanced Admin Features**
**Duration:** 3 weeks
**Priority:** Medium-Low
**Dependencies:** All previous phases

#### Features to Build:

**8.1 Asset Management (`/admin/restaurants/assets`)**
- [ ] Asset register:
  - Asset categories (dinnerware, glassware, silverware, kitchen equipment, furniture, decor, POS, technology)
  - Unique asset IDs
  - Asset name and description
  - Purchase date and cost
  - Current value and depreciation
  - Location assignment
  - Condition status
  - Warranty information
  - Serial numbers
- [ ] Maintenance management:
  - Scheduled maintenance calendar
  - Repair request system
  - Service provider directory
  - Maintenance cost tracking
  - Downtime tracking
  - Maintenance history
- [ ] Procurement:
  - Purchase requisitions
  - Approval workflows
  - Vendor quotes comparison
  - Purchase orders
  - Receiving and quality check

**8.2 Financial Management (`/admin/restaurants/finances`)**
- [ ] Revenue tracking:
  - Daily sales reports
  - Revenue by source (dine-in, online, catering)
  - Revenue by location
  - Payment method breakdown
  - Refunds and voids tracking
  - Discounts and promotions impact
  - Gift card sales and redemptions
- [ ] Expense management:
  - Expense entry form
  - Expense categories (payroll, rent, utilities, ingredients, supplies, equipment, marketing, insurance, licenses, professional services, misc)
  - Receipt upload
  - Recurring expenses setup
  - Approval workflows
  - Vendor payment tracking
  - Budget vs actual comparison
- [ ] Financial reports:
  - Profit & Loss (P&L) statements
  - Balance sheet
  - Cash flow statements
  - Budget reports
  - Tax reports
  - Food cost percentage
  - Labor cost percentage
  - Break-even analysis
  - Custom date range reports
  - Export to Excel/PDF
- [ ] Budgeting:
  - Annual budget creation
  - Budget by category
  - Budget by location
  - Variance alerts
  - Forecasting tools

**8.3 Reports & Analytics (`/admin/restaurants/reports`)**
- [ ] Sales reports:
  - Daily sales summary
  - Sales by location
  - Sales by menu category
  - Sales by time period (hourly, daily, weekly, monthly)
  - Sales by payment method
  - Server sales reports
- [ ] Operational reports:
  - Table turnover rates
  - Average wait times
  - Service time analysis
  - Waste reports
  - Inventory usage
  - Labor cost analysis
  - Staff performance reports
- [ ] Customer reports:
  - Customer acquisition
  - Customer retention/churn
  - Customer demographics
  - Feedback summary
  - Lifetime value analysis
  - Customer cohort analysis
- [ ] Custom report builder:
  - Drag-and-drop report builder
  - Custom metrics selection
  - Custom filters
  - Scheduled reports (email daily/weekly/monthly)
  - Dashboard widget creation
  - Export options (PDF, Excel, CSV)

**8.4 Events & Catering (`/admin/restaurants/events`)**
- [ ] Event management:
  - Event inquiry tracking
  - Quote creation and sending
  - Event confirmation
  - Deposit tracking
  - Custom menu creation for events
  - Event packages (weddings, corporate, parties)
  - Staff assignment to events
  - Event calendar
  - Event completion and billing
- [ ] Catering management:
  - Catering menu management
  - Catering order tracking
  - Delivery logistics
  - Quote system
  - Minimum order requirements
- [ ] Public event pages:
  - Private events page (`/distribution/restaurants/events`)
  - Event inquiry form
  - Photo gallery of past events
  - Event packages display
  - Catering services page
  - Catering menu
  - Catering order form

**8.5 Blog & News (`/admin/restaurants/blog`)**
- [ ] Blog post management:
  - Create/edit/delete posts
  - Rich text editor (WYSIWYG)
  - Featured image upload
  - Post categories and tags
  - Publish/unpublish
  - Schedule publishing
  - SEO metadata (title, description, keywords)
- [ ] Public blog:
  - Blog listing page (`/blog`)
  - Individual blog post pages (`/blog/:slug`)
  - Category filtering
  - Tag filtering
  - Search
  - Related posts
  - Social sharing

**8.6 Careers (`/admin/restaurants/careers`)**
- [ ] Job listing management:
  - Create/edit/delete job listings
  - Job details (title, department, employment type, description, requirements, salary)
  - Location assignment
  - Activate/deactivate listings
- [ ] Application management:
  - View all applications
  - Application details
  - Status tracking (new, reviewing, interview scheduled, rejected, offer made, hired)
  - Add notes
  - Email applicants
- [ ] Public careers page:
  - Job listings page (`/careers`)
  - Job details page (`/careers/:id`)
  - Application form
  - Company culture information
  - Employee benefits display
  - Growth opportunities

**8.7 Communication Hub (`/admin/restaurants/communications`)**
- [ ] Internal messaging:
  - Staff-to-staff messaging
  - Group messaging
  - Announcements to all staff
  - Read receipts
- [ ] Customer communication log:
  - All customer interactions
  - Email threads
  - SMS history
  - Support tickets
- [ ] Templates:
  - Email templates
  - SMS templates
  - Response templates
- [ ] Live chat monitoring (if implemented)

**8.8 Settings & Configuration (`/admin/restaurants/settings`)**
- [ ] General settings:
  - Restaurant information
  - Business hours
  - Timezone
  - Currency
  - Language
  - Tax configuration
  - Contact information
- [ ] Online ordering settings:
  - Enable/disable ordering
  - Delivery radius
  - Minimum order amount
  - Delivery fees
  - Service charges
  - Preparation time estimates
  - Ordering hours (different from business hours)
  - Pause online ordering (temporary)
- [ ] Payment settings:
  - Payment gateway API keys
  - Accepted payment methods
  - Tip presets (15%, 18%, 20%)
  - Refund policies
- [ ] Notification settings:
  - Email notification triggers
  - SMS notification triggers
  - Recipient configuration
  - Template customization
- [ ] User roles & permissions:
  - Role creation (custom roles)
  - Permission assignment (granular)
  - Admin user management
  - Access logs
- [ ] Integration settings:
  - POS system integration
  - Accounting software sync (QuickBooks, Xero)
  - Third-party delivery platforms (Uber Eats, DoorDash)
  - Social media connections
  - Google Analytics

**Backend (Phase 8):**
- [ ] Asset Service endpoints (or extend Inventory Service)
- [ ] Financial Service endpoints (or extend existing services)
- [ ] Analytics Service full implementation
- [ ] Event Service endpoints
- [ ] Blog Service endpoints
- [ ] Careers Service endpoints
- [ ] Communication Service endpoints
- [ ] Settings Service endpoints

**Database Migrations (Phase 8):**
- [ ] Create Asset table
- [ ] Create MaintenanceLog table
- [ ] Create Expense table
- [ ] Create Event table
- [ ] Create BlogPost table
- [ ] Create JobListing table
- [ ] Create JobApplication table
- [ ] Create Message table

**Testing (Phase 8):**
- [ ] Unit tests for financial calculations
- [ ] Integration tests for reporting
- [ ] E2E tests for asset management
- [ ] Performance testing for analytics queries

---

## 🔌 API Endpoints

### Complete API Structure

**Authentication & Users**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/2fa/setup
POST   /api/v1/auth/2fa/verify
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
POST   /api/v1/users/:id/addresses
POST   /api/v1/users/:id/favorites
```

**Restaurants & Locations**
```
GET    /api/v1/restaurants
GET    /api/v1/restaurants/:id
GET    /api/v1/restaurants/locations
GET    /api/v1/restaurants/locations/:id
GET    /api/v1/restaurants/:id/wait-time
PUT    /api/v1/admin/restaurants/:id
PUT    /api/v1/admin/locations/:id/wait-time
```

**Menu**
```
GET    /api/v1/restaurants/menu
GET    /api/v1/restaurants/menu/:itemId
POST   /api/v1/admin/menu
PUT    /api/v1/admin/menu/:id
DELETE /api/v1/admin/menu/:id
```

**Reservations**
```
GET    /api/v1/reservations/availability
POST   /api/v1/reservations
GET    /api/v1/reservations/:id
PUT    /api/v1/reservations/:id
DELETE /api/v1/reservations/:id
POST   /api/v1/reservations/waitlist
GET    /api/v1/admin/reservations
PUT    /api/v1/admin/reservations/:id/status
GET    /api/v1/admin/floor-plan/:locationId
PUT    /api/v1/admin/floor-plan/:locationId
```

**Cart & Orders**
```
POST   /api/v1/cart
GET    /api/v1/cart/:cartId
POST   /api/v1/cart/:cartId/items
PUT    /api/v1/cart/:cartId/items/:itemId
DELETE /api/v1/cart/:cartId/items/:itemId
POST   /api/v1/cart/:cartId/promo
POST   /api/v1/orders
GET    /api/v1/orders/:orderId
GET    /api/v1/users/:userId/orders
PUT    /api/v1/orders/:orderId/status
GET    /api/v1/admin/orders/live-queue
```

**Payments**
```
POST   /api/v1/payments/intent
POST   /api/v1/payments/process
POST   /api/v1/payments/confirm
POST   /api/v1/payments/:paymentId/refund
POST   /api/v1/payments/webhook
POST   /api/v1/gift-cards/validate
POST   /api/v1/gift-cards/redeem
```

**Staff**
```
GET    /api/v1/staff
POST   /api/v1/staff
PUT    /api/v1/staff/:id
GET    /api/v1/staff/:id/performance
POST   /api/v1/shifts
POST   /api/v1/shifts/:id/clock-in
POST   /api/v1/waiter-reviews
```

**Inventory**
```
GET    /api/v1/inventory/ingredients
POST   /api/v1/inventory/ingredients
GET    /api/v1/inventory/stock/:locationId
POST   /api/v1/inventory/stock/receive
POST   /api/v1/inventory/stock/adjust
GET    /api/v1/suppliers
POST   /api/v1/purchase-orders
```

**CRM & Loyalty**
```
GET    /api/v1/customers
GET    /api/v1/customers/:id
POST   /api/v1/campaigns/email
POST   /api/v1/loyalty/program
POST   /api/v1/loyalty/rewards
POST   /api/v1/loyalty/redeem
POST   /api/v1/promotions
GET    /api/v1/promotions/:code/validate
```

---

## 🧪 Testing Strategy

### Unit Testing
- Jest for all JavaScript/TypeScript
- 80%+ code coverage target
- Test files co-located with source (`*.test.ts`)

### Integration Testing
- Supertest for API endpoint testing
- Test database (PostgreSQL test instance)
- Mock external services (Stripe, PayPal, Twilio, SendGrid)

### End-to-End Testing
- Playwright or Cypress
- Critical user journeys:
  - Complete order flow (browse → cart → checkout → payment)
  - Reservation booking flow
  - Admin order management
  - Kitchen display system
- Run on staging environment

### Performance Testing
- Load testing with k6 or Artillery
- Target: 100 concurrent users, <500ms response time
- Database query optimization
- Redis caching effectiveness

### Security Testing
- OWASP Top 10 vulnerability scanning
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting validation
- Authentication/authorization testing

---

## 🚀 Deployment Strategy

### Development Environment
- Local Docker Compose (already set up)
- Hot reload for frontend and backend
- Database seeding scripts

### Staging Environment
- VPS or AWS EC2 instance
- Mimic production setup
- Automated deployments on `develop` branch push
- E2E test suite runs before deployment

### Production Environment
- Current: VPS (148.230.118.19) with PM2 + Nginx
- Future: AWS EKS (Kubernetes) for scalability
- Blue-green deployment strategy
- Automated backups (database, file storage)
- Monitoring: Prometheus + Grafana
- Logging: ELK Stack
- Error tracking: Sentry

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main, develop]

jobs:
  test:
    - Run linting
    - Run unit tests
    - Run integration tests

  build:
    - Build Next.js app
    - Build microservices
    - Build Docker images

  deploy:
    - Deploy to staging (develop branch)
    - Run E2E tests
    - Deploy to production (main branch)
    - Health check
```

### Database Migrations
- Prisma Migrate for schema changes
- Migration scripts in version control
- Automated migration on deployment
- Rollback plan for failed migrations

---

## 📦 Deliverables by Phase

### Phase 1
- [ ] Enhanced menu page
- [ ] Location pages with maps
- [ ] About us page
- [ ] Gallery page
- [ ] API: Menu & location endpoints
- [ ] Database migrations
- [ ] Unit & integration tests

### Phase 2
- [ ] Public reservation flow
- [ ] Admin reservation management
- [ ] Floor plan editor
- [ ] Table management
- [ ] Email/SMS confirmations
- [ ] API: Reservation endpoints
- [ ] Database migrations
- [ ] Real-time availability updates
- [ ] Tests

### Phase 3
- [ ] Order online page
- [ ] Shopping cart
- [ ] Checkout flow (without payment)
- [ ] User account pages
- [ ] Order history
- [ ] API: Cart & order endpoints
- [ ] Customer service API
- [ ] Database migrations
- [ ] State management setup
- [ ] Tests

### Phase 4
- [ ] Payment integration (Stripe, PayPal)
- [ ] Payment confirmation
- [ ] Admin payment management
- [ ] Refund system
- [ ] Gift card system
- [ ] API: Payment endpoints
- [ ] Database migrations
- [ ] PCI compliance review
- [ ] Tests

### Phase 5
- [ ] Admin order dashboard
- [ ] Kitchen display system
- [ ] Order tracking page
- [ ] Delivery management
- [ ] Driver assignment
- [ ] API: Order management endpoints
- [ ] Real-time order updates (Socket.io)
- [ ] Database migrations
- [ ] Tests

### Phase 6
- [ ] Staff management
- [ ] Staff scheduling
- [ ] Waiter review system
- [ ] Inventory management
- [ ] Supplier management
- [ ] Purchase orders
- [ ] API: Staff & inventory endpoints
- [ ] Database migrations
- [ ] Tests

### Phase 7
- [ ] CRM system
- [ ] Marketing tools
- [ ] Loyalty program
- [ ] Gift cards
- [ ] Customer segmentation
- [ ] Email/SMS campaigns
- [ ] API: CRM & loyalty endpoints
- [ ] Database migrations
- [ ] Tests

### Phase 8
- [ ] Asset management
- [ ] Financial management
- [ ] Advanced reports & analytics
- [ ] Events & catering
- [ ] Blog system
- [ ] Careers portal
- [ ] Communication hub
- [ ] Settings & configuration
- [ ] API: All remaining endpoints
- [ ] Database migrations
- [ ] Tests

---

## 📈 Success Metrics

### Performance Metrics
- Page load time < 2 seconds
- API response time < 500ms (p95)
- Database query time < 100ms (p95)
- 99.9% uptime

### Business Metrics
- Online order conversion rate > 5%
- Reservation conversion rate > 15%
- Average order value (AOV)
- Customer lifetime value (CLV)
- Customer retention rate
- Loyalty program adoption rate

### Technical Metrics
- Code coverage > 80%
- Zero critical security vulnerabilities
- Lighthouse score > 90
- Accessibility score > 95

---

## 🔧 Development Guidelines

### Code Standards
- TypeScript strict mode
- ESLint + Prettier for code formatting
- Conventional Commits for commit messages
- Pull request reviews required
- Branch naming: `feature/`, `bugfix/`, `hotfix/`

### Git Workflow
- `main` - production branch
- `develop` - staging branch
- Feature branches from `develop`
- Merge to `develop` → test → merge to `main`

### Documentation
- API documentation (OpenAPI/Swagger)
- Component Storybook for UI components
- Database schema documentation (auto-generated from Prisma)
- README files in each service

---

## 🎉 Next Steps

1. **Review and approve this plan**
2. **Set up project management** (GitHub Projects, Jira, or Linear)
3. **Create tickets for Phase 1**
4. **Begin Phase 1 development**
5. **Weekly progress reviews**
6. **Iterate and adjust as needed**

---

**Estimated Total Timeline:** 19 weeks (~4.5 months)

**Team Size Recommended:** 2-3 developers

**Start Date:** TBD

**Projected Completion:** TBD

---

*This plan is a living document and will be updated as we progress through each phase.*
