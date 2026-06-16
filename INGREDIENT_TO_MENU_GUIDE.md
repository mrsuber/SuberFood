# 🍳 Complete Guide: From Ingredients to Menu Item (Eggs Example)

## Overview
This guide shows you the exact workflow to add a breakfast menu item (eggs) to your SuberFood system.

**The Flow:**
```
Raw Ingredients → Recipe → Menu Item → Appears on Public Menu
```

---

## Step 1: Add Raw Ingredients 🥚

**Where:** https://suberfoods.com/admin/inventory/new

**For a simple fried egg dish, you'll need these ingredients:**

### 1.1 Add Eggs
1. Go to: `Admin → Inventory → Add Item` (click the "Add Item" button)
2. Fill in the form:
   - **Name:** `Fresh Eggs`
   - **Category:** Select `EGGS`
   - **Unit:** `pieces` (or `count`)
   - **Supplier:** e.g., `Local Farm Supply`
   - **Storage Location:** e.g., `Refrigerator A`
   - **Cost Per Unit:** e.g., `0.50` (50 cents per egg)
   - **Minimum Stock:** `50` (alert when below 50 eggs)
   - **Maximum Stock:** `200`
   - **Reorder Point:** `60` (reorder when hits 60)
   - **Reorder Quantity:** `100` (order 100 at a time)
   - **Is Compound Ingredient:** `NO` (eggs are raw, not prepared)
3. Click **Save**

### 1.2 Add Butter (Optional for fried eggs)
1. Click "Add Item" again
2. Fill in:
   - **Name:** `Unsalted Butter`
   - **Category:** Select `OILS_FATS`
   - **Unit:** `grams` (or `oz`)
   - **Supplier:** e.g., `Dairy Distributor`
   - **Storage Location:** e.g., `Refrigerator B`
   - **Cost Per Unit:** `0.01` (1 cent per gram)
   - **Minimum Stock:** `1000`
   - **Maximum Stock:** `5000`
   - **Reorder Point:** `1500`
   - **Reorder Quantity:** `3000`
   - **Is Compound Ingredient:** `NO`
3. Click **Save**

### 1.3 Add Salt (Optional)
1. Click "Add Item" again
2. Fill in:
   - **Name:** `Fine Sea Salt`
   - **Category:** Select `SPICES_HERBS`
   - **Unit:** `grams`
   - **Supplier:** e.g., `Spice Wholesaler`
   - **Storage Location:** e.g., `Dry Storage`
   - **Cost Per Unit:** `0.002` (very cheap)
   - **Minimum Stock:** `500`
   - **Maximum Stock:** `2000`
   - **Is Compound Ingredient:** `NO`
3. Click **Save**

---

## Step 2: Add Stock to Your Ingredients 📦

**Where:** https://suberfoods.com/admin/inventory/movements

After adding ingredients, you need to add initial stock:

### 2.1 Add Initial Egg Stock
1. Go to: `Admin → Inventory → Stock Movements`
2. Click "Record Movement" or "Add Stock"
3. Fill in:
   - **Movement Type:** `PURCHASE` or `INCOMING`
   - **Inventory Item:** Select `Fresh Eggs`
   - **Quantity:** `100` (you're buying 100 eggs)
   - **Unit Cost:** `0.50`
   - **Supplier:** `Local Farm Supply`
   - **Reference:** `PO-001` (purchase order number)
   - **Notes:** `Initial stock purchase`
4. Click **Save**

### 2.2 Add Butter Stock
- Repeat the same process for butter (add maybe 2000 grams)

### 2.3 Add Salt Stock
- Repeat for salt (add maybe 1000 grams)

**After this step:** Go to `Admin → Inventory` and you should see your ingredients with stock levels!

---

## Step 3: Create a Recipe 👨‍🍳

**Where:** https://suberfoods.com/admin/inventory/recipes

This is where you define HOW to make the dish.

### 3.1 Create "Fried Eggs" Recipe
1. Go to: `Admin → Inventory → Recipes`
2. Click "Create Recipe" or "New Recipe"
3. Fill in:
   - **Recipe Name:** `Classic Fried Eggs (2 eggs)`
   - **Description:** `Two perfectly fried eggs, seasoned with salt`
   - **Yields Quantity:** `1` (this recipe makes 1 serving)
   - **Yields Unit:** `serving`
   - **Preparation Time:** `5` (minutes)
   - **Skill Level:** Select `EASY`
   - **Instructions:**
     ```
     1. Heat butter in a non-stick pan over medium heat
     2. Crack eggs into the pan
     3. Cook for 3-4 minutes until whites are set
     4. Season with salt
     5. Serve immediately
     ```

### 3.2 Add Ingredients to the Recipe
In the same form, you'll see an "Ingredients" section:

**Ingredient 1:**
- **Inventory Item:** Select `Fresh Eggs`
- **Quantity:** `2` (2 eggs per serving)
- **Notes:** `Large eggs preferred`

**Ingredient 2:**
- **Inventory Item:** Select `Unsalted Butter`
- **Quantity:** `10` (10 grams of butter)
- **Notes:** `For frying`

**Ingredient 3:**
- **Inventory Item:** Select `Fine Sea Salt`
- **Quantity:** `0.5` (0.5 grams)
- **Notes:** `To taste`

4. Click **Save Recipe**

**Important:** The system now knows that to make 1 serving of "Classic Fried Eggs", you need:
- 2 eggs
- 10g butter
- 0.5g salt

---

## Step 4: Create a Menu Category (if needed) 📋

**Where:** https://suberfoods.com/admin/menus/categories

### 4.1 Create "Breakfast" Category
1. Go to: `Admin → Menus → Categories`
2. Click "New Category"
3. Fill in:
   - **Name:** `Breakfast`
   - **Description:** `Start your day right with our breakfast items`
   - **Display Order:** `1` (shows first)
   - **Is Active:** `YES`
4. Click **Save**

---

## Step 5: Create the Menu Item 🍽️

**Where:** https://suberfoods.com/admin/menus/new

This is the final step - creating what customers see on the menu!

### 5.1 Create "Fried Eggs" Menu Item
1. Go to: `Admin → Menus → Add Menu Item`
2. Fill in:

   **Basic Information:**
   - **Name:** `Classic Fried Eggs`
   - **Description:** `Two farm-fresh eggs fried to perfection, lightly seasoned`
   - **Category:** Select `Breakfast`
   - **Price:** `8.99` (or whatever you want to charge)
   - **Restaurant:** Select your restaurant location

   **Recipe & Availability:**
   - **Recipe:** Select `Classic Fried Eggs (2 eggs)`
   - **Is Available:** `YES`
   - **Is Featured:** `NO` (or YES if you want to highlight it)
   - **Dietary Tags:** You can add `Vegetarian`, `Gluten Free`, etc.

   **Optional:**
   - **Image:** Upload a nice photo of fried eggs
   - **Preparation Time:** `5 minutes`
   - **Calories:** `140` (optional nutrition info)

3. Click **Save**

---

## Step 6: Verify It's Working! ✅

### 6.1 Check Admin Menu
Go to: `Admin → Menus`
- You should see "Classic Fried Eggs" in the list
- Status should show "Available"

### 6.2 Check Public Menu
Go to: `https://suberfoods.com/distribution/restaurants/menu`
- Your "Classic Fried Eggs" should appear under "Breakfast"
- Customers can now see and order it!

### 6.3 Check Availability Calculation
Go to: `Admin → Menus → Availability`
- The system will show how many servings you can make based on stock
- Example: If you have 100 eggs, you can make 50 servings (since each uses 2 eggs)

---

## 🎯 What Happens When Someone Orders?

When a customer orders "Classic Fried Eggs":

1. **Order Created** → System checks if ingredients are available
2. **If Available** → Order proceeds
3. **Stock Deduction:**
   - Fresh Eggs: 100 → 98 (-2)
   - Butter: 2000g → 1990g (-10g)
   - Salt: 1000g → 999.5g (-0.5g)
4. **Auto-Hide When Out:** If eggs drop to 0, the menu item automatically disappears from public menu!

---

## 🚨 Important Notes

### Stock Levels
- **Raw Stock:** What you receive from suppliers
- **WIP Stock:** Work-in-progress (for compound ingredients like dough)
- **Consumed Stock:** Already used in orders

### Compound vs Simple Ingredients
- **Simple/Raw:** Eggs, butter, salt (check "Is Compound: NO")
- **Compound:** Pre-made items like "Pasta Dough" (made from flour, eggs, water)
  - For compound items, create a "Preparation Recipe" first

### The Magic of Auto-Availability
- Menu items automatically hide when ANY ingredient runs out
- They automatically reappear when you restock
- No manual toggling needed!

---

## 📍 Quick Reference - Admin URLs

- **Add Ingredients:** `/admin/inventory/new`
- **View Inventory:** `/admin/inventory`
- **Record Stock Movements:** `/admin/inventory/movements`
- **Create Recipes:** `/admin/inventory/recipes`
- **Create Menu Categories:** `/admin/menus/categories/new`
- **Create Menu Items:** `/admin/menus/new`
- **View Public Menu:** `/distribution/restaurants/menu`
- **Check Availability:** `/admin/menus/availability`

---

## 🎓 Next Steps

After mastering eggs, you can create more complex items:

1. **Scrambled Eggs:** Different recipe, same ingredients
2. **Omelette:** Add vegetables (new ingredients: onions, peppers, cheese)
3. **Breakfast Platter:** Combine multiple menu items
4. **Compound Ingredients:** Make "Hollandaise Sauce" as a prepared ingredient

---

## ✨ Tips for Success

1. **Start Simple:** Master basic items before complex ones
2. **Accurate Quantities:** Measure ingredient usage accurately
3. **Set Realistic Minimums:** Avoid running out unexpectedly
4. **Regular Stocktaking:** Compare system vs actual stock weekly
5. **Use Batch Numbers:** Track ingredient batches for food safety

---

**You're all set! Start with eggs and build from there! 🚀**
