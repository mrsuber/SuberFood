# SuberFood - Technical Architecture Document

**Version:** 1.0
**Date:** November 16, 2025
**Status:** Draft

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Architecture](#system-architecture)
3. [Microservices Architecture](#microservices-architecture)
4. [Data Architecture](#data-architecture)
5. [Infrastructure Architecture](#infrastructure-architecture)
6. [Security Architecture](#security-architecture)
7. [Integration Architecture](#integration-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Technology Stack](#technology-stack)
10. [Scalability & Performance](#scalability--performance)

---

## 1. Architecture Overview

### 1.1 Architecture Principles

**1. Domain-Driven Design (DDD)**
- System organized around business domains
- Each microservice owns its domain logic and data
- Clear bounded contexts prevent coupling

**2. Event-Driven Architecture**
- Asynchronous communication between services
- Event sourcing for critical audit trails
- Real-time data propagation across the system

**3. API-First Design**
- All functionality exposed via well-documented APIs
- Consistent API contracts across services
- Versioning strategy for backward compatibility

**4. Cloud-Native**
- Containerized applications
- Orchestrated with Kubernetes
- Auto-scaling based on demand
- Multi-region deployment capability

**5. Security by Design**
- Zero-trust security model
- Encryption at rest and in transit
- Fine-grained access control
- Comprehensive audit logging

**6. Observability**
- Comprehensive logging, monitoring, and tracing
- Proactive alerting and anomaly detection
- Performance metrics and dashboards

---

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Web Apps (Next.js)  │  Mobile Apps (React Native)  │  Partner APIs │
│  - Landing Page      │  - Consumer App              │               │
│  - Admin Dashboard   │  - Farm Manager App          │               │
│  - Restaurant POS    │  - Driver App                │               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / LOAD BALANCER                       │
│  - Authentication        - Rate Limiting        - Request Routing    │
│  - SSL Termination       - API Versioning       - Response Caching   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES LAYER                             │
├──────────────────┬──────────────────┬──────────────────┬────────────┤
│  Farm Services   │ Logistics        │ Restaurant       │ Retail     │
│  - Farm Mgmt     │ - Transportation │ - POS            │ - Catalog  │
│  - Livestock     │ - Warehouse      │ - Kitchen        │ - Orders   │
│  - Aquaculture   │ - Inventory      │ - Reservations   │ - B2B      │
│  - Processing    │ - Quality        │                  │            │
├──────────────────┴──────────────────┴──────────────────┴────────────┤
│                    CORE PLATFORM SERVICES                            │
│  - IAM Service   - Payment Service    - Notification Service         │
│  - Customer CRM  - Analytics Service  - Document Service             │
│  - Partner Mgmt  - Audit Service      - Integration Service          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EVENT BUS (Kafka/RabbitMQ)                      │
│  - Order Events    - Inventory Events    - Quality Events            │
│  - Payment Events  - Notification Events - Audit Events              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
├──────────────────┬──────────────────┬──────────────────┬────────────┤
│  PostgreSQL      │  MongoDB         │  Redis           │ InfluxDB   │
│  (Transactional) │  (Documents)     │  (Cache/Session) │ (IoT Data) │
├──────────────────┴──────────────────┴──────────────────┴────────────┤
│                    DATA WAREHOUSE (Snowflake/BigQuery)               │
│  - Analytics     - Business Intelligence     - Reporting             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                             │
│  - Payment Gateways  - SMS/Email Providers  - Shipping Carriers     │
│  - Maps APIs         - Analytics Tools       - Accounting Software   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. System Architecture

### 2.1 Architectural Style: Microservices

**Why Microservices?**

Given the requirements:
- Large-scale (50K+ orders/day)
- Multiple business domains (farm, logistics, restaurant, retail)
- Multi-country deployment
- Team scaling to 40-50 engineers

**Benefits:**
- ✅ **Independent Deployment**: Each service can be deployed independently
- ✅ **Technology Flexibility**: Different services can use optimal tech stacks
- ✅ **Team Scalability**: Teams can own and develop services independently
- ✅ **Fault Isolation**: Failure in one service doesn't crash entire system
- ✅ **Scalability**: Scale individual services based on load

**Challenges & Mitigation:**
- ❌ **Complexity**: Mitigated by comprehensive documentation, service mesh, observability
- ❌ **Data Consistency**: Event-driven patterns, saga pattern for distributed transactions
- ❌ **Testing**: Contract testing, comprehensive integration tests
- ❌ **Operational Overhead**: Kubernetes, automated CI/CD, monitoring

---

### 2.2 Service Communication Patterns

#### 2.2.1 Synchronous Communication (REST/gRPC)

**When to Use:**
- Request-response scenarios requiring immediate feedback
- Read operations
- External API calls from clients

**Protocol:**
- **REST** (JSON over HTTP) for client-facing APIs
- **gRPC** (Protocol Buffers) for internal service-to-service (higher performance)

**Example:**
```
Client → API Gateway → Order Service (REST)
Order Service → Inventory Service (gRPC) → Check stock availability
```

#### 2.2.2 Asynchronous Communication (Events)

**When to Use:**
- Fire-and-forget operations
- Multiple services need to react to an event
- Long-running processes
- Data synchronization across services

**Protocol:** Message Queue (Kafka/RabbitMQ)

**Event Types:**

**Domain Events:**
- `OrderPlaced`, `OrderShipped`, `OrderDelivered`
- `HarvestCompleted`, `ProductProcessed`
- `InventoryUpdated`, `StockLevelLow`
- `PaymentCompleted`, `PaymentFailed`
- `QualityCheckFailed`

**Example Event Flow:**
```
1. Order Service publishes: OrderPlaced event
2. Subscribers react:
   - Inventory Service: Reserve stock
   - Payment Service: Process payment
   - Notification Service: Send confirmation email
   - Analytics Service: Update sales metrics
   - Warehouse Service: Create pick ticket
```

**Event Schema (Example):**
```json
{
  "eventId": "uuid",
  "eventType": "OrderPlaced",
  "timestamp": "2025-11-16T10:30:00Z",
  "version": "1.0",
  "data": {
    "orderId": "ORD-12345",
    "customerId": "CUST-67890",
    "items": [...],
    "totalAmount": 125.50,
    "currency": "USD"
  },
  "metadata": {
    "source": "order-service",
    "correlationId": "trace-abc123"
  }
}
```

---

### 2.3 Data Management Strategy

#### 2.3.1 Database Per Service Pattern

**Principle:** Each microservice owns its database schema

**Benefits:**
- ✅ Loose coupling
- ✅ Independent scaling
- ✅ Technology choice flexibility
- ✅ Clear ownership

**Implementation:**
- Separate PostgreSQL schemas per service (logical separation)
- Separate database instances for critical services (physical separation)
- No direct cross-service database access
- All data access via service APIs or events

#### 2.3.2 Data Consistency Patterns

**Saga Pattern for Distributed Transactions:**

**Example: Order Processing Saga**
```
1. Order Service: Create order (status: PENDING)
2. Inventory Service: Reserve stock
   - Success → Continue
   - Failure → Saga rollback (Cancel order)
3. Payment Service: Process payment
   - Success → Continue
   - Failure → Saga rollback (Release stock, Cancel order)
4. Order Service: Confirm order (status: CONFIRMED)
```

**Implementation:**
- **Orchestration-based Saga**: Central coordinator manages saga steps
- **Choreography-based Saga**: Services react to events (preferred for flexibility)

**Eventual Consistency:**
- Accept that data may be temporarily inconsistent across services
- Use event-driven updates to achieve consistency
- Idempotent event handlers to handle duplicate events

---

## 3. Microservices Architecture

### 3.1 Service Catalog

#### Core Business Services

| Service | Responsibility | Database | Key APIs |
|---------|---------------|----------|----------|
| **farm-service** | Crop, land, and general farm operations | PostgreSQL | `/farms`, `/plots`, `/plantings`, `/harvests` |
| **livestock-service** | Animal tracking, health, production | PostgreSQL | `/animals`, `/herds`, `/health-records`, `/production` |
| **aquaculture-service** | Fish farming, pond management | PostgreSQL + InfluxDB | `/ponds`, `/fish-batches`, `/water-quality` |
| **processing-service** | Manufacturing, production lines | PostgreSQL | `/plants`, `/production-orders`, `/batches`, `/recipes` |
| **logistics-service** | Transportation, fleet management | PostgreSQL + MongoDB | `/shipments`, `/routes`, `/vehicles`, `/drivers` |
| **warehouse-service** | Inventory, receiving, picking | PostgreSQL | `/warehouses`, `/inventory`, `/transfers`, `/picks` |
| **quality-service** | Quality inspections, compliance | PostgreSQL + MongoDB | `/inspections`, `/certifications`, `/non-conformance` |
| **restaurant-service** | Restaurant operations, POS | PostgreSQL + Redis | `/restaurants`, `/menus`, `/orders`, `/reservations` |
| **retail-service** | Product catalog, B2B orders | PostgreSQL + MongoDB | `/products`, `/catalog`, `/b2b-orders` |
| **order-service** | D2C order management | PostgreSQL | `/orders`, `/carts`, `/checkout` |
| **customer-service** | Customer data, CRM | PostgreSQL + MongoDB | `/customers`, `/segments`, `/communications` |
| **partner-service** | Partner management, portals | PostgreSQL | `/partners`, `/contracts`, `/performance` |
| **payment-service** | Payment processing, invoicing | PostgreSQL | `/payments`, `/invoices`, `/refunds` |

#### Platform Services

| Service | Responsibility | Database | Key APIs |
|---------|---------------|----------|----------|
| **iam-service** | Authentication, authorization | PostgreSQL + Redis | `/auth/login`, `/users`, `/roles`, `/permissions` |
| **notification-service** | Multi-channel notifications | PostgreSQL + MongoDB | `/notifications`, `/templates`, `/preferences` |
| **analytics-service** | Business intelligence, reporting | Data Warehouse | `/dashboards`, `/reports`, `/metrics` |
| **audit-service** | Audit logging, traceability | MongoDB (time-series) | `/audit-logs`, `/trace/{productId}` |
| **document-service** | File storage, document management | S3 + MongoDB | `/documents`, `/upload`, `/download` |
| **integration-service** | Third-party integrations | MongoDB | `/integrations`, `/webhooks` |

---

### 3.2 Service Design Pattern (Example: Order Service)

#### 3.2.1 Service Structure

```
order-service/
├── src/
│   ├── api/                    # API layer (REST endpoints)
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middleware/
│   ├── application/            # Application layer (use cases)
│   │   ├── commands/           # Command handlers (write operations)
│   │   ├── queries/            # Query handlers (read operations)
│   │   └── events/             # Event handlers
│   ├── domain/                 # Domain layer (business logic)
│   │   ├── entities/           # Domain entities
│   │   ├── value-objects/      # Value objects
│   │   ├── repositories/       # Repository interfaces
│   │   └── services/           # Domain services
│   ├── infrastructure/         # Infrastructure layer
│   │   ├── database/           # Database implementations
│   │   ├── messaging/          # Event bus implementations
│   │   ├── external/           # External service clients
│   │   └── cache/              # Caching implementations
│   ├── config/                 # Configuration
│   └── index.ts                # Entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── Dockerfile
├── package.json
└── tsconfig.json
```

#### 3.2.2 Clean Architecture Layers

**1. API Layer (Controllers/Routes)**
- HTTP request handling
- Input validation
- Response formatting
- Authentication/Authorization checks

**2. Application Layer (Use Cases)**
- Business use cases (PlaceOrderUseCase, CancelOrderUseCase)
- Orchestrates domain logic
- Publishes domain events

**3. Domain Layer (Business Logic)**
- Pure business logic
- Domain entities (Order, OrderItem)
- Business rules validation
- No infrastructure dependencies

**4. Infrastructure Layer**
- Database access
- Message queue integration
- External API calls
- Caching

**Benefits:**
- ✅ Testability (mock infrastructure)
- ✅ Maintainability (clear separation)
- ✅ Flexibility (swap infrastructure)

---

### 3.3 API Design Standards

#### 3.3.1 RESTful API Conventions

**Resource Naming:**
- Use nouns, not verbs: `/orders` not `/getOrders`
- Use plural for collections: `/products`, `/customers`
- Use hierarchical paths: `/farms/{farmId}/plots`

**HTTP Methods:**
- `GET` - Retrieve resource(s)
- `POST` - Create new resource
- `PUT` - Update entire resource
- `PATCH` - Partial update
- `DELETE` - Remove resource

**Response Codes:**
- `200 OK` - Success (GET, PUT, PATCH)
- `201 Created` - Resource created (POST)
- `204 No Content` - Success with no body (DELETE)
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Authorization failed
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

**Standard Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Product Name"
  },
  "meta": {
    "timestamp": "2025-11-16T10:30:00Z",
    "requestId": "req-abc123"
  }
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-16T10:30:00Z",
    "requestId": "req-abc123"
  }
}
```

#### 3.3.2 Pagination

**Query Parameters:**
```
GET /products?page=2&limit=20&sort=-createdAt
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "totalPages": 10,
    "totalItems": 200,
    "hasNext": true,
    "hasPrev": true
  }
}
```

#### 3.3.3 Filtering & Search

```
GET /products?category=dairy&minPrice=10&maxPrice=50&search=milk
```

#### 3.3.4 API Versioning

**Strategy:** URL path versioning
```
https://api.suberfood.com/v1/orders
https://api.suberfood.com/v2/orders
```

**Deprecation Policy:**
- Announce deprecation 6 months in advance
- Support old version for 12 months after new version release
- Provide migration guide

---

## 4. Data Architecture

### 4.1 Database Strategy

#### 4.1.1 PostgreSQL (Primary Transactional Database)

**Use Cases:**
- Structured transactional data
- ACID compliance required
- Complex queries and joins
- Referential integrity

**Services Using PostgreSQL:**
- farm-service, livestock-service, processing-service
- order-service, payment-service, customer-service
- iam-service, partner-service, retail-service

**Schema Design Principles:**
- Normalized schemas (3NF minimum)
- Proper indexing on frequently queried columns
- Foreign key constraints within service boundary
- Use of JSON/JSONB for flexible attributes

**Example Schema (Order Service):**
```sql
-- orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
```

#### 4.1.2 MongoDB (Flexible Document Storage)

**Use Cases:**
- Semi-structured or variable schema data
- Document storage (certifications, reports)
- Audit logs and event logs
- Rapid iteration on schema

**Services Using MongoDB:**
- logistics-service (route optimization data, driver logs)
- quality-service (inspection reports, non-conformance details)
- notification-service (notification templates, logs)
- audit-service (audit trails)
- document-service (metadata for files)

**Example Document (Quality Inspection):**
```json
{
  "_id": "inspection-12345",
  "batchId": "BATCH-67890",
  "inspectorId": "user-abc",
  "timestamp": "2025-11-16T10:30:00Z",
  "type": "harvest_inspection",
  "result": "pass",
  "criteria": [
    {
      "name": "visual_appearance",
      "score": 9.5,
      "notes": "Excellent color, no blemishes"
    },
    {
      "name": "size_uniformity",
      "score": 8.0,
      "notes": "Minor variation in size"
    }
  ],
  "photos": [
    "s3://inspections/img1.jpg",
    "s3://inspections/img2.jpg"
  ],
  "metadata": {
    "farmId": "farm-123",
    "plotId": "plot-456"
  }
}
```

#### 4.1.3 Redis (Caching & Session Storage)

**Use Cases:**
- Session management
- API response caching
- Rate limiting
- Real-time leaderboards/counters
- Pub/Sub for real-time features

**Caching Strategy:**
- **Cache-Aside**: Application checks cache first, fetches from DB on miss
- **Write-Through**: Write to cache and DB simultaneously
- **TTL**: Set appropriate expiration times (e.g., product catalog: 1 hour)

**Example:**
```typescript
// Cache product details
async function getProduct(productId: string) {
  const cacheKey = `product:${productId}`;

  // Try cache first
  let product = await redis.get(cacheKey);

  if (!product) {
    // Cache miss - fetch from database
    product = await db.products.findById(productId);

    // Store in cache with 1 hour TTL
    await redis.setex(cacheKey, 3600, JSON.stringify(product));
  }

  return JSON.parse(product);
}
```

#### 4.1.4 InfluxDB (Time-Series Data)

**Use Cases:**
- IoT sensor data (temperature, humidity, water quality)
- Performance metrics
- Farm equipment telemetry

**Services Using InfluxDB:**
- aquaculture-service (water quality measurements)
- Farm monitoring systems

**Example Data:**
```
pond_water_quality,pond_id=pond-123,sensor_id=sensor-789
  temperature=24.5,
  ph=7.2,
  dissolved_oxygen=8.5
  1700131800000000000
```

#### 4.1.5 Data Warehouse (Snowflake/BigQuery)

**Use Cases:**
- Analytics and business intelligence
- Historical data analysis
- Complex aggregations
- Cross-service reporting

**ETL Pipeline:**
```
Operational DBs → Event Bus → Stream Processing → Data Warehouse
```

**Example Analytics Queries:**
- Revenue by product category over time
- Farm yield trends
- Customer lifetime value
- Supply chain efficiency metrics

---

### 4.2 Data Synchronization

#### 4.2.1 Change Data Capture (CDC)

**Tool:** Debezium (Kafka Connect)

**Process:**
1. Debezium monitors PostgreSQL transaction logs
2. Captures INSERT/UPDATE/DELETE operations
3. Publishes changes as events to Kafka
4. Consumers update read models, search indexes, data warehouse

**Use Cases:**
- Sync operational data to data warehouse
- Update Elasticsearch for product search
- Populate analytics dashboards

#### 4.2.2 Event Sourcing (for critical domains)

**Domains:**
- Order lifecycle (complete audit trail)
- Payment transactions
- Inventory movements

**Implementation:**
```typescript
// Event Store (events table)
CREATE TABLE order_events (
  id UUID PRIMARY KEY,
  aggregate_id UUID NOT NULL,  -- Order ID
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

// Event examples
OrderCreated { orderId, customerId, items, total }
OrderPaid { orderId, paymentId, amount }
OrderShipped { orderId, trackingNumber, carrier }
OrderDelivered { orderId, deliveryTime, signature }
```

**Benefits:**
- Complete audit trail
- Replay events to rebuild state
- Temporal queries (state at any point in time)
- Debug production issues

---

## 5. Infrastructure Architecture

### 5.1 Cloud Platform: AWS

**Core Services:**

| AWS Service | Use Case |
|-------------|----------|
| **EKS** (Elastic Kubernetes Service) | Container orchestration |
| **RDS** (PostgreSQL) | Managed relational databases |
| **DocumentDB** | MongoDB-compatible document DB |
| **ElastiCache** (Redis) | Managed Redis caching |
| **MSK** (Managed Kafka) | Event streaming |
| **S3** | Object storage (files, documents, backups) |
| **CloudFront** | CDN for static assets |
| **Route 53** | DNS management |
| **ALB** (Application Load Balancer) | Load balancing |
| **API Gateway** | API management (alternative to Kong) |
| **Cognito** | User authentication (alternative to custom IAM) |
| **SES** | Email sending |
| **SNS/SQS** | Notifications and queuing |
| **CloudWatch** | Logging and monitoring |
| **Secrets Manager** | Secure credentials storage |
| **KMS** | Encryption key management |
| **VPC** | Network isolation |

---

### 5.2 Kubernetes Architecture

#### 5.2.1 Cluster Design

**Multi-Cluster Strategy:**
- **Production Cluster**: Live production workloads
- **Staging Cluster**: Pre-production testing
- **Development Cluster**: Development and QA

**Per-Cluster Namespaces:**
```
- core-services       (IAM, notifications, etc.)
- farm-domain         (farm, livestock, aquaculture, processing)
- logistics-domain    (logistics, warehouse, quality)
- retail-domain       (restaurant, retail, orders)
- data-platform       (analytics, audit)
- monitoring          (Prometheus, Grafana)
```

#### 5.2.2 Deployment Pattern

**Example Kubernetes Deployment (Order Service):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: retail-domain
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
        version: v1.2.0
    spec:
      containers:
      - name: order-service
        image: suberfood/order-service:v1.2.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: order-db-credentials
              key: url
        - name: KAFKA_BROKERS
          value: "kafka:9092"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: order-service
  namespace: retail-domain
spec:
  selector:
    app: order-service
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

#### 5.2.3 Auto-Scaling

**Horizontal Pod Autoscaler (HPA):**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
  namespace: retail-domain
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Cluster Autoscaler:**
- Automatically adds/removes nodes based on pod resource requests
- Integrates with AWS Auto Scaling Groups

---

### 5.3 Service Mesh (Istio)

**Why Service Mesh?**
- **Traffic Management**: Intelligent routing, load balancing, circuit breaking
- **Security**: mTLS between services, authorization policies
- **Observability**: Distributed tracing, metrics, logging
- **Resilience**: Retries, timeouts, fault injection

**Features Used:**
- **Mutual TLS**: Automatic encryption between services
- **Traffic Routing**: Canary deployments, A/B testing
- **Circuit Breaking**: Prevent cascading failures
- **Distributed Tracing**: End-to-end request tracking

**Example: Circuit Breaker Configuration**
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: inventory-service-circuit-breaker
spec:
  host: inventory-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 2
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

#### 6.1.1 Authentication Flow

**For Internal Users (Staff):**
```
1. User logs in with email/password
2. IAM Service validates credentials
3. If MFA enabled, send OTP
4. User enters OTP
5. IAM Service issues JWT access token + refresh token
6. Client includes JWT in subsequent requests (Authorization: Bearer <token>)
7. API Gateway validates JWT signature
8. Request forwarded to service with user context
```

**JWT Payload:**
```json
{
  "sub": "user-id-123",
  "email": "user@suberfood.com",
  "roles": ["farm_manager", "quality_inspector"],
  "permissions": ["farm:read", "farm:write", "quality:read"],
  "iat": 1700131800,
  "exp": 1700135400
}
```

**For Consumers (Customers):**
- Email/password authentication
- Social login (Google, Facebook) via OAuth 2.0
- Phone number + OTP for mobile-first markets

#### 6.1.2 Authorization (RBAC)

**Roles:**
- Super Admin
- Farm Manager
- Livestock Manager
- Quality Inspector
- Logistics Coordinator
- Restaurant Manager
- Partner Admin
- Customer

**Permissions:**
- Resource-based: `{resource}:{action}` (e.g., `farms:read`, `orders:create`)
- Fine-grained: `farms:123:update` (specific resource)

**Implementation:**
```typescript
// Middleware for authorization
async function authorize(requiredPermissions: string[]) {
  return async (req, res, next) => {
    const userPermissions = req.user.permissions;

    const hasPermission = requiredPermissions.every(
      perm => userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// Usage
router.post('/farms',
  authenticate(),
  authorize(['farms:create']),
  createFarmController
);
```

---

### 6.2 Data Security

#### 6.2.1 Encryption

**At Rest:**
- Database encryption (RDS encrypted volumes)
- S3 bucket encryption (SSE-S3 or SSE-KMS)
- Secrets Manager for credentials (encrypted with KMS)

**In Transit:**
- TLS 1.3 for all external communications
- mTLS for service-to-service (Istio)
- Certificate management with cert-manager

#### 6.2.2 Secrets Management

**AWS Secrets Manager:**
```typescript
import { SecretsManager } from 'aws-sdk';

async function getDatabaseCredentials() {
  const secretsManager = new SecretsManager({ region: 'us-east-1' });

  const secret = await secretsManager.getSecretValue({
    SecretId: 'prod/order-service/db'
  }).promise();

  return JSON.parse(secret.SecretString);
}
```

**Kubernetes Secrets (for non-sensitive config):**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: order-db-credentials
type: Opaque
data:
  url: <base64-encoded-db-url>
```

#### 6.2.3 Data Privacy (GDPR Compliance)

**Personal Data Handling:**
- **Data Minimization**: Only collect necessary data
- **Consent Management**: Explicit opt-in for marketing
- **Right to Access**: API for users to download their data
- **Right to Erasure**: Soft delete with anonymization
- **Data Portability**: Export in machine-readable format

**PII Encryption:**
- Encrypt sensitive fields (SSN, payment info) at application level
- Use deterministic encryption for searchable fields
- Store encryption keys in KMS

---

### 6.3 Network Security

**AWS VPC Architecture:**
```
┌─────────────────────────────────────────────────┐
│                  VPC (10.0.0.0/16)              │
├─────────────────────────────────────────────────┤
│  Public Subnets (10.0.1.0/24, 10.0.2.0/24)      │
│  - ALB (Load Balancers)                         │
│  - NAT Gateways                                 │
├─────────────────────────────────────────────────┤
│  Private Subnets (10.0.10.0/24, 10.0.11.0/24)   │
│  - EKS Nodes (Application Services)             │
├─────────────────────────────────────────────────┤
│  Data Subnets (10.0.20.0/24, 10.0.21.0/24)      │
│  - RDS Instances                                │
│  - ElastiCache                                  │
│  - MSK (Kafka)                                  │
└─────────────────────────────────────────────────┘

Security Groups:
- ALB-SG: Allow 80/443 from Internet
- App-SG: Allow traffic from ALB-SG only
- DB-SG: Allow 5432 from App-SG only
```

**Firewall Rules:**
- Ingress: Only ALB accepts traffic from internet
- Service-to-Service: Only within VPC
- Egress: Whitelist required external APIs

---

### 6.4 API Security

**Rate Limiting:**
```
- Anonymous users: 100 requests/minute
- Authenticated users: 1000 requests/minute
- Partner APIs: 10,000 requests/minute
```

**Input Validation:**
- Schema validation (JSON Schema, Joi)
- Sanitization to prevent XSS, SQL injection
- File upload validation (type, size limits)

**CORS Policy:**
```typescript
app.use(cors({
  origin: [
    'https://suberfood.com',
    'https://admin.suberfood.com',
    'https://shop.suberfood.com'
  ],
  credentials: true
}));
```

---

## 7. Integration Architecture

### 7.1 API Gateway (Kong)

**Responsibilities:**
- Request routing to microservices
- Authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- API versioning
- Analytics and logging

**Kong Plugins Used:**
- `jwt`: JWT authentication
- `rate-limiting`: API rate limiting
- `cors`: CORS handling
- `request-transformer`: Modify requests
- `response-transformer`: Modify responses
- `prometheus`: Metrics export

---

### 7.2 Event Bus (Apache Kafka)

**Topics Structure:**
```
- farm.harvests.completed
- processing.batches.produced
- logistics.shipments.created
- logistics.shipments.delivered
- inventory.stock.updated
- inventory.stock.low
- orders.placed
- orders.confirmed
- orders.shipped
- orders.delivered
- payments.completed
- payments.failed
- quality.inspections.failed
- notifications.email.send
- notifications.sms.send
- audit.events
```

**Producer Example:**
```typescript
// Order Service publishes event
await kafkaProducer.send({
  topic: 'orders.placed',
  messages: [{
    key: orderId,
    value: JSON.stringify({
      eventId: uuid(),
      eventType: 'OrderPlaced',
      timestamp: new Date().toISOString(),
      data: orderData
    })
  }]
});
```

**Consumer Example:**
```typescript
// Inventory Service consumes event
kafkaConsumer.subscribe({ topic: 'orders.placed' });

await kafkaConsumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());

    if (event.eventType === 'OrderPlaced') {
      await reserveInventory(event.data);
    }
  }
});
```

---

### 7.3 Third-Party Integrations

**Payment Gateways:**
- **Stripe**: Primary (international)
- **PayPal**: Alternative
- **Local Gateways**: Country-specific (Flutterwave for Africa, Razorpay for India)

**Communication:**
- **SendGrid**: Transactional emails
- **Twilio**: SMS and voice
- **Firebase Cloud Messaging**: Push notifications

**Maps & Geolocation:**
- **Google Maps API**: Geocoding, routing
- **Mapbox**: Alternative for custom maps

**Accounting:**
- **QuickBooks API**: For businesses using QuickBooks
- **Xero API**: Alternative

**Shipping:**
- **EasyPost**: Multi-carrier shipping API
- Direct integrations: FedEx, UPS, DHL APIs

---

## 8. Deployment Architecture

### 8.1 CI/CD Pipeline

**Tools:**
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions
- **Container Registry**: AWS ECR
- **Infrastructure as Code**: Terraform

**Pipeline Stages:**

```
┌──────────────┐
│ Code Commit  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Run Tests    │ (Unit, Integration)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Build Docker │
│ Image        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Push to ECR  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Deploy to    │
│ Staging      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ E2E Tests    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Manual       │
│ Approval     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Deploy to    │
│ Production   │
└──────────────┘
```

**GitHub Actions Workflow Example:**
```yaml
name: Deploy Order Service

on:
  push:
    branches: [main]
    paths:
      - 'services/order-service/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd services/order-service
          npm install
          npm test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/order-service:$IMAGE_TAG .
          docker push $ECR_REGISTRY/order-service:$IMAGE_TAG

      - name: Deploy to EKS
        run: |
          kubectl set image deployment/order-service \
            order-service=$ECR_REGISTRY/order-service:$IMAGE_TAG \
            -n retail-domain
```

---

### 8.2 Multi-Region Deployment

**Regions:**
- **Primary**: US East (N. Virginia) - us-east-1
- **Secondary**: EU West (Ireland) - eu-west-1
- **Tertiary**: Asia Pacific (Singapore) - ap-southeast-1

**Strategy:**
- **Active-Active**: All regions serve traffic
- **Route 53 Geolocation Routing**: Route users to nearest region
- **Data Replication**:
  - Read replicas for databases
  - S3 cross-region replication
  - Kafka MirrorMaker for event replication

---

### 8.3 Disaster Recovery

**Backup Strategy:**
- **Databases**: Daily automated backups with 30-day retention
- **Point-in-Time Recovery**: 5-minute granularity
- **Infrastructure**: Terraform state backed up to S3

**Recovery Objectives:**
- **RTO** (Recovery Time Objective): 4 hours
- **RPO** (Recovery Point Objective): 1 hour

**DR Plan:**
1. Detect failure (automated monitoring)
2. Failover DNS to secondary region
3. Promote read replica to primary
4. Restore from backup if needed
5. Communicate with stakeholders

---

## 9. Observability & Monitoring

### 9.1 Logging

**Stack:** ELK (Elasticsearch, Logstash, Kibana) or Cloud-native (CloudWatch)

**Log Levels:**
- ERROR: Application errors
- WARN: Warnings, degraded performance
- INFO: Important business events
- DEBUG: Detailed debugging (dev/staging only)

**Structured Logging:**
```typescript
logger.info('Order placed', {
  orderId: 'ORD-12345',
  customerId: 'CUST-67890',
  totalAmount: 125.50,
  currency: 'USD',
  timestamp: new Date().toISOString()
});
```

**Log Aggregation:**
- All services send logs to centralized logging
- Correlation IDs for distributed tracing
- Search and filter by service, level, time range

---

### 9.2 Monitoring

**Metrics Stack:** Prometheus + Grafana

**Key Metrics:**

**Application Metrics:**
- Request rate (requests/second)
- Error rate (%)
- Response time (p50, p95, p99)
- Active users
- Orders placed/minute

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network throughput

**Business Metrics:**
- Revenue/hour
- Conversion rate
- Cart abandonment rate
- Average order value

**Dashboards:**
- Executive Dashboard (business KPIs)
- Operations Dashboard (system health)
- Service-specific dashboards

---

### 9.3 Distributed Tracing

**Tool:** Jaeger or AWS X-Ray

**Use Cases:**
- Trace request flow across multiple services
- Identify performance bottlenecks
- Debug production issues

**Example Trace:**
```
Order Placement Request
├─ API Gateway (5ms)
├─ Order Service (50ms)
│  ├─ Inventory Service (20ms)
│  │  └─ PostgreSQL query (15ms)
│  ├─ Payment Service (100ms)
│  │  └─ Stripe API call (95ms)
│  └─ Notification Service (10ms)
└─ Total: 155ms
```

---

### 9.4 Alerting

**Alerting Rules:**
- **Critical**: Page on-call engineer immediately
  - Service down (uptime < 99.9%)
  - Database connection failures
  - Payment processing failures
  - Cold chain temperature violations

- **Warning**: Notify team, investigate during business hours
  - High error rate (>1%)
  - Slow response times (p95 > 500ms)
  - Low stock levels
  - Failed background jobs

**Notification Channels:**
- PagerDuty (critical alerts)
- Slack (warnings)
- Email (daily summaries)

---

## 10. Scalability & Performance

### 10.1 Horizontal Scaling

**Stateless Services:**
- All application services are stateless
- Session data stored in Redis (shared)
- Can scale horizontally by adding more pods

**Database Scaling:**
- **Read Replicas**: Offload read queries
- **Connection Pooling**: PgBouncer for PostgreSQL
- **Sharding**: For very large tables (future consideration)

---

### 10.2 Caching Strategy

**Multi-Layer Caching:**

**1. Client-Side:**
- Browser cache for static assets
- Service worker for offline capability

**2. CDN (CloudFront):**
- Cache static files (images, CSS, JS)
- Cache frequently accessed API responses (product catalog)

**3. Application Cache (Redis):**
- Session data
- User preferences
- Product catalog
- API response caching

**4. Database Query Cache:**
- PostgreSQL query result cache

**Cache Invalidation:**
- Time-based (TTL)
- Event-based (invalidate on update)
- Manual purge for critical updates

---

### 10.3 Performance Optimization

**Database Optimization:**
- Proper indexing
- Query optimization (EXPLAIN ANALYZE)
- Materialized views for complex aggregations
- Database connection pooling

**API Optimization:**
- Response compression (gzip)
- Pagination for large datasets
- Field filtering (GraphQL-style: only return requested fields)
- Batch APIs for bulk operations

**Frontend Optimization:**
- Code splitting
- Lazy loading
- Image optimization (WebP, responsive images)
- Minification and bundling

---

## 11. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + Next.js | Web applications |
| **Mobile** | React Native | iOS/Android apps |
| **Backend** | Node.js + TypeScript | Microservices |
| **API Gateway** | Kong or AWS API Gateway | API management |
| **Databases** | PostgreSQL | Transactional data |
| | MongoDB | Document storage |
| | Redis | Caching, sessions |
| | InfluxDB | Time-series (IoT) |
| **Message Queue** | Apache Kafka | Event streaming |
| **Search** | Elasticsearch | Full-text search |
| **Data Warehouse** | Snowflake or BigQuery | Analytics |
| **Container** | Docker | Containerization |
| **Orchestration** | Kubernetes (EKS) | Container orchestration |
| **Service Mesh** | Istio | Service communication |
| **CI/CD** | GitHub Actions | Automation |
| **IaC** | Terraform | Infrastructure as Code |
| **Monitoring** | Prometheus + Grafana | Metrics and dashboards |
| **Logging** | ELK Stack | Log aggregation |
| **Tracing** | Jaeger or X-Ray | Distributed tracing |
| **CDN** | CloudFront | Content delivery |
| **Storage** | S3 | Object storage |
| **Cloud** | AWS | Infrastructure |

---

## 12. Conclusion

This architecture provides:

✅ **Scalability**: Horizontal scaling, auto-scaling, multi-region
✅ **Reliability**: 99.9% uptime, fault tolerance, disaster recovery
✅ **Security**: Defense in depth, encryption, RBAC, compliance
✅ **Maintainability**: Clean architecture, comprehensive monitoring, documentation
✅ **Performance**: Caching, optimization, efficient data access
✅ **Flexibility**: Microservices allow independent evolution of components

The architecture is designed to support SuberFood's ambitious goals of full vertical integration across multiple countries at large scale.

---

**Next Steps:**
1. Review and approve architecture
2. Set up AWS infrastructure (Terraform)
3. Implement core platform services (IAM, notification)
4. Begin Phase 1 development (Farm Management + Processing)

---

END OF DOCUMENT
