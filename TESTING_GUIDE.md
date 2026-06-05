# SuberFood Testing Guide

## Quick Start Testing

Once the app is running, follow this guide to test all features.

---

## 🚀 Start the Application

### Development Mode
```bash
cd apps/landing-page
npm run dev
```
Visit: http://localhost:3000

### Production Mode
```bash
npm run build
npm start
```

---

## 🧪 Test Scenarios

### 1. **Location Browsing** (Public - No Auth Required)

**URL:** http://localhost:3000/locations

**Test Steps:**
1. ✅ Page loads with location cards
2. ✅ Click "Filters" button
3. ✅ Select a city from dropdown
4. ✅ Verify locations filter correctly
5. ✅ Clear filters
6. ✅ Click on a location card

**Expected:**
- Should see all restaurant locations
- Filters should work
- Clicking location goes to detail page

---

### 2. **Location Details** (Public)

**URL:** http://localhost:3000/locations/[location-id]

**Test Steps:**
1. ✅ View location name, address, hours
2. ✅ See staff count and equipment count
3. ✅ View amenities list
4. ✅ Click "View Menu & Order" button

**Expected:**
- All location details displayed
- Stats show correct counts
- Button navigates to menu

---

### 3. **Menu with Real-Time Inventory** (Public)

**URL:** http://localhost:3000/locations/[location-id]/menu

**Test Steps:**
1. ✅ Menu items load with prices
2. ✅ See dietary badges (Vegan, Gluten-Free, etc.)
3. ✅ Check for "Low stock" warnings
4. ✅ Click "Filters" and select dietary preference
5. ✅ Click on a menu item card

**Expected:**
- Menu items display with images
- Items show availability based on inventory
- Filters work correctly
- Clicking item goes to detail page

---

### 4. **Menu Item Detail & Customization** (Public)

**URL:** http://localhost:3000/locations/[location-id]/menu/[menu-item-id]

**Test Steps:**
1. ✅ View full item details (name, price, description)
2. ✅ See ingredient list with checkboxes
3. ✅ Click to remove 2-3 ingredients
4. ✅ Add special instructions: "Extra sauce please"
5. ✅ Increase quantity to 2
6. ✅ Click "Add to Cart"

**Expected:**
- Item details fully displayed
- Ingredients can be toggled
- Price updates with quantity
- Item added to cart successfully
- Alert shows confirmation

---

### 5. **Shopping Cart** (Public)

**After adding items, test cart:**

**Test Steps:**
1. ✅ Click floating cart button (bottom-right)
2. ✅ Cart drawer opens showing items
3. ✅ Verify customizations show (removed ingredients, notes)
4. ✅ Click + to increase quantity
5. ✅ Click - to decrease quantity
6. ✅ Click trash icon to remove item
7. ✅ Add another item to cart
8. ✅ Click "Proceed to Checkout"

**Expected:**
- Cart persists across page refreshes
- Quantities update correctly
- Total price calculates correctly
- Removed items disappear
- Checkout button navigates to checkout

---

### 6. **Guest Checkout** (No Auth Required)

**URL:** http://localhost:3000/checkout

**Test Steps:**
1. ✅ Enter name: "Test Customer"
2. ✅ Enter phone: "(555) 123-4567"
3. ✅ Enter email (optional): "test@example.com"
4. ✅ Select "Dine-In" order type
5. ✅ Enter table number: "A5"
6. ✅ Set number of guests: 2
7. ✅ Select "Pay at Cashier"
8. ✅ Add note: "Please make it spicy"
9. ✅ Click "Place Order"

**Expected:**
- Guest form appears when not logged in
- Pickup/Delivery disabled for guests
- Dine-in form shows table number field
- Order submits successfully
- Redirects to order confirmation
- Prompt to create account appears

---

### 7. **Authenticated Checkout** (Requires Login)

**First, sign in or create account**

**Test Steps:**
1. ✅ Sign in at: http://localhost:3000/auth/signin
2. ✅ Add items to cart
3. ✅ Go to checkout
4. ✅ Test **Delivery** order type:
   - Enter address: "123 Main St, Apt 4B"
   - Enter city: "San Francisco"
   - Enter state: "CA"
   - Enter postal code: "94102"
   - Add delivery instructions: "Ring doorbell twice"
5. ✅ Test **Pickup** order type:
   - Select future pickup time
6. ✅ Select payment method
7. ✅ Place order

**Expected:**
- Guest form not shown when logged in
- All order types available
- Conditional forms show based on order type
- Delivery fee added for delivery orders
- Order submits successfully

---

### 8. **Cart Persistence** (Public)

**Test Steps:**
1. ✅ Add 2-3 items to cart
2. ✅ Close browser tab
3. ✅ Open new tab to same site
4. ✅ Click cart button

**Expected:**
- Cart items still present
- Quantities preserved
- Customizations preserved
- Total price correct

---

### 9. **Restaurant Validation** (Public)

**Test Steps:**
1. ✅ Add item from Location A to cart
2. ✅ Browse to Location B menu
3. ✅ Try to add item from Location B
4. ✅ See warning dialog
5. ✅ Choose to clear cart or cancel

**Expected:**
- Warning appears about different restaurant
- Option to clear cart and proceed
- Cart remains unchanged if canceled

---

### 10. **Staff Management** (Admin Only)

**URL:** http://localhost:3000/admin/staff

**Requirements:** Admin account with role SUPER_ADMIN, ADMIN, or RESTAURANT_MANAGER

**Test Steps:**
1. ✅ View staff list
2. ✅ See performance stats (total, active, by role)
3. ✅ Filter by role (select "CHEF")
4. ✅ Search by name
5. ✅ Click "View" on a staff member
6. ✅ Click "Deactivate" on a staff member

**Expected:**
- Staff list displays with details
- Stats accurate
- Filters work
- Search works
- Staff details modal/page shows
- Deactivate sets status to TERMINATED

---

### 11. **Equipment Management** (Admin Only)

**URL:** http://localhost:3000/admin/equipment

**Requirements:** Admin account

**Test Steps:**
1. ✅ View equipment cards
2. ✅ See stats (total, operational, maintenance needed)
3. ✅ Filter by type
4. ✅ Filter by status
5. ✅ Click on equipment card for details

**Expected:**
- Equipment displayed in cards
- Stats accurate
- Filters work
- Maintenance costs tracked
- Usage statistics shown

---

## 🎯 Feature Checklist

### Public Features
- [ ] Location browsing with filters
- [ ] Location details with stats
- [ ] Menu with real-time inventory
- [ ] Menu item detail with customization
- [ ] Shopping cart (add, update, remove)
- [ ] Cart persistence (localStorage)
- [ ] Restaurant validation
- [ ] Guest checkout (dine-in only)

### Authenticated Features
- [ ] User registration
- [ ] User login
- [ ] Full checkout (all order types)
- [ ] Delivery address entry
- [ ] Pickup time selection
- [ ] Order placement
- [ ] Order history (if implemented)

### Admin Features
- [ ] Staff management dashboard
- [ ] Staff creation/update
- [ ] Staff assignment
- [ ] Equipment management dashboard
- [ ] Equipment maintenance logging
- [ ] Usage tracking

---

## 🐛 Known Issues to Watch

1. **Payment Gateway:** Online payment is placeholder only - will show warning
2. **Prisma Generation:** May need to run `npx prisma generate` if seeing type errors
3. **Images:** Menu item images may not load if not seeded
4. **Email Notifications:** Not implemented yet

---

## 📊 Test Data Needed

Before testing, ensure database has:

### Required Data
- ✅ At least 1 restaurant location
- ✅ Menu items for that restaurant
- ✅ Recipes for menu items
- ✅ Inventory items with stock > 0
- ✅ At least 1 admin user account

### Optional Data
- Staff members
- Equipment entries
- Multiple restaurant locations

---

## 🔧 Troubleshooting

### Cart Not Persisting
- Check browser localStorage is enabled
- Clear cache and try again

### Menu Items Not Showing
- Check inventory levels (rawStock > 0)
- Check recipe ingredients exist
- Check restaurantId on inventory items

### Can't Access Admin Pages
- Ensure user role is admin
- Check JWT token refresh (5-min interval)
- Sign out and sign in again

### Order Placement Fails
- Check inventory is sufficient
- Check all required fields filled
- Check console for errors
- Verify database connection

---

## ✅ Success Criteria

**Basic Flow Working:**
1. Can browse locations
2. Can view menus
3. Can add items to cart
4. Cart persists
5. Can checkout (guest or authenticated)
6. Order creates successfully
7. Inventory deducts

**Admin Flow Working:**
1. Can access admin dashboards
2. Can view staff/equipment lists
3. Can create/update records
4. Filters and search work

---

## 📞 Support

If you encounter issues:
1. Check console for errors (F12 → Console)
2. Check network tab for API errors
3. Verify database connection
4. Check environment variables
5. Restart dev server

---

**Happy Testing!** 🚀
