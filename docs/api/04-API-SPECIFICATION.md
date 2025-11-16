# SuberFood - API Specification

**Version:** 1.0
**Date:** November 16, 2025
**Base URL:** `https://api.suberfood.com/v1`

---

## Table of Contents

1. [API Standards](#api-standards)
2. [Authentication](#authentication)
3. [Farm Service APIs](#farm-service-apis)
4. [Livestock Service APIs](#livestock-service-apis)
5. [Processing Service APIs](#processing-service-apis)
6. [Logistics & Warehouse APIs](#logistics--warehouse-apis)
7. [Restaurant Service APIs](#restaurant-service-apis)
8. [Order Service APIs](#order-service-apis)
9. [Payment Service APIs](#payment-service-apis)
10. [IAM Service APIs](#iam-service-apis)
11. [Error Codes](#error-codes)

---

## 1. API Standards

### 1.1 Request Format

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
X-Request-ID: {unique_request_id}
X-API-Version: v1
```

### 1.2 Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-16T10:30:00Z",
    "requestId": "req-abc123"
  }
}
```

**Error Response:**
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

### 1.3 Pagination

**Query Parameters:**
```
?page=1&limit=20&sort=-createdAt&filter[status]=active
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 10,
    "totalItems": 200,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 2. Authentication

### 2.1 Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@suberfood.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "user-123",
      "email": "user@suberfood.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["farm_manager"]
    }
  }
}
```

### 2.2 Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### 2.3 Logout

**Endpoint:** `POST /auth/logout`

---

## 3. Farm Service APIs

### 3.1 Farms

#### List Farms
**Endpoint:** `GET /farms`
**Query Params:** `?page=1&limit=20&farmType=crop&status=active`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "farm-123",
      "farmCode": "FARM-001",
      "name": "Green Valley Farm",
      "farmType": "crop",
      "country": "USA",
      "totalAreaHectares": 150.5,
      "status": "active",
      "manager": {
        "id": "user-456",
        "name": "Jane Smith"
      },
      "createdAt": "2025-01-15T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Create Farm
**Endpoint:** `POST /farms`

**Request:**
```json
{
  "farmCode": "FARM-002",
  "name": "Sunrise Organic Farm",
  "farmType": "crop",
  "countryCode": "USA",
  "address": {
    "line1": "123 Farm Road",
    "city": "Fresno",
    "state": "CA",
    "postalCode": "93701",
    "country": "USA"
  },
  "coordinates": {
    "latitude": 36.7378,
    "longitude": -119.7871
  },
  "totalAreaHectares": 200,
  "managerId": "user-789",
  "certifications": ["organic", "fair_trade"]
}
```

#### Get Farm Details
**Endpoint:** `GET /farms/{farmId}`

#### Update Farm
**Endpoint:** `PATCH /farms/{farmId}`

#### Delete Farm
**Endpoint:** `DELETE /farms/{farmId}`

---

### 3.2 Plots

#### List Plots
**Endpoint:** `GET /farms/{farmId}/plots`

#### Create Plot
**Endpoint:** `POST /farms/{farmId}/plots`

**Request:**
```json
{
  "plotCode": "PLOT-A1",
  "name": "North Field",
  "areaHectares": 5.5,
  "soilType": "loamy",
  "soilPh": 6.5,
  "irrigationType": "drip",
  "coordinates": {
    "type": "Polygon",
    "coordinates": [...]
  }
}
```

---

### 3.3 Plantings

#### List Plantings
**Endpoint:** `GET /plantings`
**Query:** `?plotId=plot-123&status=growing&cropType=tomato`

#### Create Planting
**Endpoint:** `POST /plantings`

**Request:**
```json
{
  "plotId": "plot-123",
  "cropTypeId": "crop-456",
  "variety": "Roma Tomato",
  "plantingDate": "2025-03-01",
  "expectedHarvestDate": "2025-06-15",
  "areaPlantedHectares": 2.5,
  "seedQuantityKg": 10,
  "isOrganic": true
}
```

#### Get Planting Details
**Endpoint:** `GET /plantings/{plantingId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "planting-789",
    "plantingCode": "PLANT-2025-001",
    "plot": {
      "id": "plot-123",
      "plotCode": "PLOT-A1",
      "farm": {
        "id": "farm-123",
        "name": "Green Valley Farm"
      }
    },
    "cropType": {
      "id": "crop-456",
      "name": "Tomato",
      "scientificName": "Solanum lycopersicum"
    },
    "variety": "Roma Tomato",
    "plantingDate": "2025-03-01",
    "expectedHarvestDate": "2025-06-15",
    "status": "growing",
    "areaPlantedHectares": 2.5,
    "isOrganic": true,
    "growthRecords": [...]
  }
}
```

---

### 3.4 Harvests

#### Record Harvest
**Endpoint:** `POST /harvests`

**Request:**
```json
{
  "plantingId": "planting-789",
  "harvestDate": "2025-06-20",
  "quantityKg": 5000,
  "qualityGrade": "A",
  "destination": "processing",
  "processingPlantId": "plant-456",
  "notes": "Excellent yield, minimal pest damage"
}
```

#### Get Harvest Details
**Endpoint:** `GET /harvests/{harvestId}`

---

### 3.5 Traceability

#### Trace Product to Source
**Endpoint:** `GET /trace/product/{batchNumber}`

**Response:**
```json
{
  "success": true,
  "data": {
    "batchNumber": "BATCH-2025-1234",
    "product": {
      "sku": "PROD-TOMATO-SAUCE-500G",
      "name": "Organic Tomato Sauce 500g"
    },
    "traceability": {
      "processingBatch": {
        "batchNumber": "BATCH-2025-1234",
        "productionDate": "2025-06-25",
        "plant": {
          "id": "plant-456",
          "name": "Valley Processing Plant"
        }
      },
      "rawMaterials": [
        {
          "harvestCode": "HARV-2025-001",
          "harvestDate": "2025-06-20",
          "quantityKg": 5000,
          "planting": {
            "plantingCode": "PLANT-2025-001",
            "cropType": "Tomato",
            "variety": "Roma Tomato",
            "plantingDate": "2025-03-01",
            "isOrganic": true
          },
          "plot": {
            "plotCode": "PLOT-A1",
            "farm": {
              "farmCode": "FARM-001",
              "name": "Green Valley Farm",
              "location": "Fresno, CA, USA"
            }
          }
        }
      ]
    }
  }
}
```

---

## 4. Livestock Service APIs

### 4.1 Herds

#### List Herds
**Endpoint:** `GET /herds`

#### Create Herd
**Endpoint:** `POST /herds`

---

### 4.2 Animals

#### List Animals
**Endpoint:** `GET /animals`
**Query:** `?herdId=herd-123&status=active&species=cattle`

#### Register Animal
**Endpoint:** `POST /animals`

**Request:**
```json
{
  "herdId": "herd-123",
  "tagNumber": "COW-001",
  "rfid": "RFID-123456",
  "species": "cattle",
  "breed": "Holstein",
  "sex": "female",
  "dateOfBirth": "2023-05-15",
  "acquisitionType": "born",
  "motherId": "animal-456",
  "fatherId": "animal-789"
}
```

#### Get Animal Details
**Endpoint:** `GET /animals/{animalId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "animal-123",
    "tagNumber": "COW-001",
    "species": "cattle",
    "breed": "Holstein",
    "sex": "female",
    "dateOfBirth": "2023-05-15",
    "ageMonths": 18,
    "currentWeightKg": 450,
    "status": "active",
    "healthRecords": [...],
    "productionHistory": [...]
  }
}
```

---

### 4.3 Health Records

#### Add Health Record
**Endpoint:** `POST /animals/{animalId}/health-records`

**Request:**
```json
{
  "recordDate": "2025-11-16",
  "recordType": "vaccination",
  "vaccine": "Brucellosis vaccine",
  "administeredBy": "vet-123",
  "nextDueDate": "2026-11-16"
}
```

---

### 4.4 Production Records

#### Add Production Record
**Endpoint:** `POST /production-records`

**Request:**
```json
{
  "animalId": "animal-123",
  "productionDate": "2025-11-16",
  "productionType": "milk",
  "quantity": 25.5,
  "unit": "liters",
  "qualityGrade": "A"
}
```

#### Get Production Summary
**Endpoint:** `GET /production-records/summary`
**Query:** `?animalId=animal-123&startDate=2025-11-01&endDate=2025-11-30&type=milk`

---

## 5. Processing Service APIs

### 5.1 Processing Plants

#### List Plants
**Endpoint:** `GET /processing-plants`

---

### 5.2 Production Orders

#### Create Production Order
**Endpoint:** `POST /production-orders`

**Request:**
```json
{
  "plantId": "plant-456",
  "recipeId": "recipe-789",
  "plannedQuantity": 1000,
  "plannedStartDate": "2025-11-20T08:00:00Z",
  "priority": 1
}
```

#### Get Production Order
**Endpoint:** `GET /production-orders/{orderId}`

---

### 5.3 Production Batches

#### Create Batch
**Endpoint:** `POST /production-batches`

**Request:**
```json
{
  "productionOrderId": "order-123",
  "productionDate": "2025-11-20",
  "quantityProduced": 950,
  "unit": "kg",
  "expiryDate": "2026-11-20",
  "rawMaterialBatches": [
    {
      "harvestCode": "HARV-2025-001",
      "quantityUsed": 1200,
      "unit": "kg"
    }
  ]
}
```

#### Get Batch Details
**Endpoint:** `GET /production-batches/{batchId}`

---

## 6. Logistics & Warehouse APIs

### 6.1 Warehouses

#### List Warehouses
**Endpoint:** `GET /warehouses`

---

### 6.2 Inventory

#### Get Inventory
**Endpoint:** `GET /inventory`
**Query:** `?warehouseId=wh-123&sku=PROD-123&status=available`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv-123",
      "warehouse": {
        "id": "wh-123",
        "name": "Main Distribution Center"
      },
      "sku": "PROD-TOMATO-SAUCE-500G",
      "productName": "Organic Tomato Sauce 500g",
      "batchNumber": "BATCH-2025-1234",
      "quantity": 5000,
      "unit": "pieces",
      "expiryDate": "2026-11-20",
      "status": "available",
      "locationCode": "A-12-03"
    }
  ]
}
```

#### Update Inventory
**Endpoint:** `PATCH /inventory/{inventoryId}`

---

### 6.3 Shipments

#### Create Shipment
**Endpoint:** `POST /shipments`

**Request:**
```json
{
  "fromWarehouseId": "wh-123",
  "toWarehouseId": "wh-456",
  "vehicleId": "vehicle-789",
  "driverId": "driver-012",
  "scheduledPickupDate": "2025-11-17T09:00:00Z",
  "scheduledDeliveryDate": "2025-11-17T15:00:00Z",
  "items": [
    {
      "sku": "PROD-123",
      "batchNumber": "BATCH-2025-1234",
      "quantity": 1000,
      "unit": "pieces"
    }
  ],
  "temperatureRequired": 4.0
}
```

#### Get Shipment Details
**Endpoint:** `GET /shipments/{shipmentId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "shipment-123",
    "shipmentNumber": "SHIP-2025-0001",
    "status": "in_transit",
    "fromWarehouse": {...},
    "toWarehouse": {...},
    "vehicle": {...},
    "driver": {...},
    "scheduledDeliveryDate": "2025-11-17T15:00:00Z",
    "estimatedArrival": "2025-11-17T14:45:00Z",
    "currentLocation": {
      "latitude": 36.7378,
      "longitude": -119.7871
    },
    "items": [...],
    "temperatureLogs": [...]
  }
}
```

#### Update Shipment Status
**Endpoint:** `PATCH /shipments/{shipmentId}/status`

**Request:**
```json
{
  "status": "delivered",
  "actualDeliveryDate": "2025-11-17T14:50:00Z",
  "notes": "Delivered successfully, signed by John Doe"
}
```

---

## 7. Restaurant Service APIs

### 7.1 Restaurants

#### List Restaurants
**Endpoint:** `GET /restaurants`

---

### 7.2 Menu Management

#### Get Menu
**Endpoint:** `GET /restaurants/{restaurantId}/menu`

#### Update Menu Item Availability
**Endpoint:** `PATCH /menu-items/{itemId}/availability`

**Request:**
```json
{
  "isAvailable": false,
  "reason": "Out of stock"
}
```

---

### 7.3 Orders

#### Create Restaurant Order
**Endpoint:** `POST /restaurant-orders`

**Request:**
```json
{
  "restaurantId": "rest-123",
  "orderType": "dine_in",
  "tableNumber": "T-15",
  "items": [
    {
      "menuItemId": "menu-456",
      "quantity": 2,
      "specialInstructions": "No onions"
    },
    {
      "menuItemId": "menu-789",
      "quantity": 1
    }
  ]
}
```

#### Get Order Details
**Endpoint:** `GET /restaurant-orders/{orderId}`

#### Update Order Status
**Endpoint:** `PATCH /restaurant-orders/{orderId}/status`

---

### 7.4 Reservations (Classical Restaurants)

#### Create Reservation
**Endpoint:** `POST /reservations`

**Request:**
```json
{
  "restaurantId": "rest-123",
  "guestName": "Jane Doe",
  "guestPhone": "+1234567890",
  "guestEmail": "jane@example.com",
  "partySize": 4,
  "reservationDate": "2025-11-20",
  "reservationTime": "19:00:00",
  "specialRequests": "Window seat if available"
}
```

#### Get Reservation
**Endpoint:** `GET /reservations/{reservationId}`

---

## 8. Order Service APIs (D2C E-commerce)

### 8.1 Products

#### Get Product Catalog
**Endpoint:** `GET /products`
**Query:** `?category=dairy&search=milk&minPrice=5&maxPrice=20`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-123",
      "sku": "MILK-FRESH-1L",
      "name": "Fresh Whole Milk 1L",
      "description": "Farm-fresh whole milk from grass-fed cows",
      "category": "dairy",
      "price": 4.99,
      "currency": "USD",
      "imageUrl": "https://cdn.suberfood.com/products/milk-1l.jpg",
      "inStock": true,
      "stockQuantity": 500,
      "origin": {
        "farmName": "Green Valley Farm",
        "location": "California, USA"
      },
      "certifications": ["organic", "non_gmo"],
      "nutritionalInfo": {...}
    }
  ],
  "pagination": {...}
}
```

---

### 8.2 Shopping Cart

#### Get Cart
**Endpoint:** `GET /cart`

#### Add to Cart
**Endpoint:** `POST /cart/items`

**Request:**
```json
{
  "sku": "MILK-FRESH-1L",
  "quantity": 2
}
```

#### Update Cart Item
**Endpoint:** `PATCH /cart/items/{itemId}`

#### Remove from Cart
**Endpoint:** `DELETE /cart/items/{itemId}`

---

### 8.3 Checkout & Orders

#### Checkout
**Endpoint:** `POST /checkout`

**Request:**
```json
{
  "shippingAddressId": "addr-123",
  "billingAddressId": "addr-123",
  "paymentMethodId": "pm-456",
  "deliveryDate": "2025-11-20",
  "deliveryTimeSlot": "09:00-12:00",
  "notes": "Please ring doorbell"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order-789",
    "orderNumber": "ORD-2025-001234",
    "total": 9.98,
    "estimatedDelivery": "2025-11-20",
    "paymentStatus": "completed"
  }
}
```

#### Get Order
**Endpoint:** `GET /orders/{orderId}`

#### List My Orders
**Endpoint:** `GET /orders`
**Query:** `?status=delivered&startDate=2025-01-01`

---

## 9. Payment Service APIs

### 9.1 Process Payment

**Endpoint:** `POST /payments`

**Request:**
```json
{
  "orderId": "order-789",
  "amount": 9.98,
  "currency": "USD",
  "paymentMethod": "credit_card",
  "paymentMethodId": "pm-456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay-123",
    "status": "completed",
    "transactionId": "txn_1234567890",
    "paidAt": "2025-11-16T10:35:00Z"
  }
}
```

### 9.2 Refund Payment

**Endpoint:** `POST /payments/{paymentId}/refund`

---

## 10. IAM Service APIs

### 10.1 User Management

#### Create User
**Endpoint:** `POST /users`

#### Get User
**Endpoint:** `GET /users/{userId}`

#### Update User
**Endpoint:** `PATCH /users/{userId}`

---

### 10.2 Role & Permission Management

#### List Roles
**Endpoint:** `GET /roles`

#### Assign Role to User
**Endpoint:** `POST /users/{userId}/roles`

**Request:**
```json
{
  "roleId": "role-123"
}
```

---

## 11. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Webhooks

### Webhook Events

Subscribable events for external integrations:

- `order.placed`
- `order.shipped`
- `order.delivered`
- `payment.completed`
- `payment.failed`
- `inventory.low_stock`
- `quality.inspection_failed`
- `shipment.delayed`

**Webhook Payload Format:**
```json
{
  "eventId": "evt_123",
  "eventType": "order.placed",
  "timestamp": "2025-11-16T10:30:00Z",
  "data": { ... }
}
```

---

END OF DOCUMENT
