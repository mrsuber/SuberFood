// Script to update all recipes with complete data (ingredients + instructions)
const recipes = [
  {
    menuItemId: "cmqguknwe0003721s35fafent",
    menuItemName: "Scrambled Eggs",
    name: "Scrambled Eggs",
    servingSize: 1,
    prepTime: 3,
    cookTime: 5,
    ingredients: [
      {
        inventoryItemId: "cmqgogd1i0000jf9j22mil6rs", // chicken eggs
        quantity: 3,
        unit: "PCS",
        notes: "beaten"
      },
      {
        inventoryItemId: "cmqi10e660003sycpuw9ez2rg", // Butter
        quantity: 10,
        unit: "G",
        notes: "for cooking"
      },
      {
        inventoryItemId: "cmqgqadhg0002jf9jm9zkuxb3", // table salt
        quantity: 2,
        unit: "G",
        notes: "to taste"
      },
      {
        inventoryItemId: "cmqi10ex30004sycpa2rrr7wu", // Black Pepper
        quantity: 1,
        unit: "G",
        notes: "to taste"
      }
    ],
    instructions: `1. Crack the eggs into a bowl and beat them well with a fork or whisk until fully combined.
2. Heat butter in a non-stick pan over medium heat until melted and slightly foaming.
3. Pour the beaten eggs into the pan and let them sit for 20 seconds without stirring.
4. Using a spatula, gently push the eggs from the edges toward the center, allowing uncooked egg to flow to the edges.
5. Continue this process for 2-3 minutes until the eggs are mostly set but still slightly wet.
6. Season with salt and pepper to taste.
7. Remove from heat while eggs are still slightly creamy (they'll continue cooking from residual heat).
8. Serve immediately while hot and fluffy.`
  },
  {
    menuItemId: "cmqguknwz0009721s0y34s4q3",
    menuItemName: "Fried Eggs (Sunny Side Up)",
    name: "Fried Eggs (Sunny Side Up)",
    servingSize: 1,
    prepTime: 1,
    cookTime: 3,
    ingredients: [
      {
        inventoryItemId: "cmqgogd1i0000jf9j22mil6rs", // chicken eggs
        quantity: 2,
        unit: "PCS",
        notes: ""
      },
      {
        inventoryItemId: "cmqi10e660003sycpuw9ez2rg", // Butter
        quantity: 5,
        unit: "G",
        notes: "for frying"
      },
      {
        inventoryItemId: "cmqgqadhg0002jf9jm9zkuxb3", // table salt
        quantity: 1,
        unit: "G",
        notes: "to taste"
      },
      {
        inventoryItemId: "cmqi10ex30004sycpa2rrr7wu", // Black Pepper
        quantity: 1,
        unit: "G",
        notes: "to taste"
      }
    ],
    instructions: `1. Heat butter in a non-stick frying pan over medium-low heat.
2. Once the butter has melted and is slightly bubbling, crack the eggs directly into the pan, being careful not to break the yolks.
3. Season immediately with a pinch of salt and pepper.
4. Cook for 3-4 minutes without flipping, until the whites are completely set but the yolks remain runny.
5. For a more cooked yolk, cover the pan with a lid for the last minute of cooking.
6. Use a spatula to carefully slide the eggs onto a plate, keeping the yolks intact.
7. Serve immediately while the yolk is still soft and runny.`
  },
  {
    menuItemId: "cmqguknx7000f721sh3y3u0tk",
    menuItemName: "Boiled Eggs",
    name: "Boiled Eggs",
    servingSize: 1,
    prepTime: 1,
    cookTime: 8,
    ingredients: [
      {
        inventoryItemId: "cmqgogd1i0000jf9j22mil6rs", // chicken eggs
        quantity: 2,
        unit: "PCS",
        notes: ""
      },
      {
        inventoryItemId: "cmqgqadhg0002jf9jm9zkuxb3", // table salt
        quantity: 5,
        unit: "G",
        notes: "for boiling water"
      }
    ],
    instructions: `1. Place eggs in a single layer at the bottom of a saucepan or pot.
2. Fill the pot with cold water until eggs are covered by about 1 inch of water.
3. Add salt to the water to help prevent cracking and make peeling easier.
4. Place the pot on high heat and bring to a rolling boil.
5. Once boiling, remove from heat and cover the pot with a lid.
6. Let eggs sit in hot water: 6-7 minutes for soft-boiled, 10-12 minutes for hard-boiled.
7. Drain hot water and immediately transfer eggs to a bowl of ice water to stop cooking.
8. Let eggs cool in ice bath for 5 minutes before peeling.
9. Gently tap and roll eggs on counter to crack shell, then peel under cold running water for easier removal.`
  },
  {
    menuItemId: "cmqguknxp000l721sqdxm75rf",
    menuItemName: "Cheese Omelette",
    name: "Cheese Omelette",
    servingSize: 1,
    prepTime: 3,
    cookTime: 5,
    ingredients: [
      {
        inventoryItemId: "cmqgogd1i0000jf9j22mil6rs", // chicken eggs
        quantity: 3,
        unit: "PCS",
        notes: "beaten"
      },
      {
        inventoryItemId: "cmqi10dyj0002sycp5dhvxwye", // Cheddar Cheese
        quantity: 50,
        unit: "G",
        notes: "shredded"
      },
      {
        inventoryItemId: "cmqi10e660003sycpuw9ez2rg", // Butter
        quantity: 10,
        unit: "G",
        notes: "for cooking"
      },
      {
        inventoryItemId: "cmqgqadhg0002jf9jm9zkuxb3", // table salt
        quantity: 2,
        unit: "G",
        notes: "to taste"
      },
      {
        inventoryItemId: "cmqi10ex30004sycpa2rrr7wu", // Black Pepper
        quantity: 1,
        unit: "G",
        notes: "to taste"
      }
    ],
    instructions: `1. Crack eggs into a bowl and beat thoroughly with a fork until well combined.
2. Season the beaten eggs with salt and pepper.
3. Heat butter in a non-stick omelette pan over medium-high heat until melted and foaming.
4. Pour the beaten eggs into the pan and tilt to spread evenly across the bottom.
5. Let cook undisturbed for 30-45 seconds until edges start to set.
6. Using a spatula, gently push cooked edges toward center, tilting pan to let uncooked egg flow to edges.
7. When eggs are mostly set but still slightly wet on top (about 2 minutes), sprinkle shredded cheese over one half.
8. Using a spatula, carefully fold the omelette in half over the cheese.
9. Cook for another 30 seconds to melt the cheese.
10. Slide onto a plate and serve immediately while cheese is melted and eggs are fluffy.`
  },
  {
    menuItemId: "cmqgukny4000r721sakqan2fz",
    menuItemName: "Egg Sandwich",
    name: "Egg Sandwich",
    servingSize: 1,
    prepTime: 3,
    cookTime: 5,
    ingredients: [
      {
        inventoryItemId: "cmqgogd1i0000jf9j22mil6rs", // chicken eggs
        quantity: 2,
        unit: "PCS",
        notes: "fried or scrambled"
      },
      {
        inventoryItemId: "cmqi116fx0005sycpmy8yvh13", // Sliced Bread
        quantity: 2,
        unit: "PCS",
        notes: "toasted"
      },
      {
        inventoryItemId: "cmqi10e660003sycpuw9ez2rg", // Butter
        quantity: 15,
        unit: "G",
        notes: "for spreading and cooking"
      },
      {
        inventoryItemId: "cmqgqadhg0002jf9jm9zkuxb3", // table salt
        quantity: 2,
        unit: "G",
        notes: "to taste"
      },
      {
        inventoryItemId: "cmqi10ex30004sycpa2rrr7wu", // Black Pepper
        quantity: 1,
        unit: "G",
        notes: "to taste"
      }
    ],
    instructions: `1. Toast the bread slices in a toaster or toaster oven until golden brown and crispy.
2. While bread is toasting, heat half the butter in a non-stick pan over medium heat.
3. Crack eggs into a bowl, season with salt and pepper, and beat well.
4. Pour eggs into the heated pan and scramble or fry according to preference (scrambled: stir continuously; fried: cook without stirring).
5. Cook eggs until fully set and cooked through, about 2-3 minutes.
6. Spread remaining butter on the toasted bread slices while still warm.
7. Place cooked eggs on one slice of buttered toast.
8. Top with the second slice of toast, buttered side down.
9. Cut sandwich diagonally if desired.
10. Serve immediately while eggs are warm and bread is crispy.`
  }
];

async function updateRecipes() {
  const results = [];

  for (const recipe of recipes) {
    try {
      console.log(`\n📝 Updating complete recipe for: ${recipe.menuItemName}`);

      const response = await fetch(`https://suberfoods.com/api/admin/menu/${recipe.menuItemId}/recipe`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: recipe.name,
          servingSize: recipe.servingSize,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions
        })
      });

      const data = await response.json();

      if (data.success) {
        results.push({
          success: true,
          name: recipe.menuItemName,
          recipeId: data.data.id,
          ingredientsCount: recipe.ingredients.length,
          instructionsLength: recipe.instructions.split('\n').filter(l => l.trim()).length
        });
        console.log(`   ✅ Success!`);
        console.log(`   📦 Ingredients: ${recipe.ingredients.length}`);
        console.log(`   📖 Steps: ${recipe.instructions.split('\n').filter(l => l.trim()).length}`);
      } else {
        results.push({
          success: false,
          name: recipe.menuItemName,
          error: data.error
        });
        console.log(`   ❌ Failed: ${data.error}`);
      }
    } catch (error) {
      results.push({
        success: false,
        name: recipe.menuItemName,
        error: error.message
      });
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n\n📊 SUMMARY:');
  console.log('═'.repeat(60));
  console.log(`Total Recipes Updated: ${results.length}`);
  console.log(`✅ Success: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log('═'.repeat(60));

  if (results.filter(r => r.success).length > 0) {
    console.log('\n✅ Successfully updated recipes:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   • ${r.name}: ${r.ingredientsCount} ingredients, ${r.instructionsLength} steps`);
    });
  }

  if (results.filter(r => !r.success).length > 0) {
    console.log('\n❌ Failed recipes:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   • ${r.name}: ${r.error}`);
    });
  }

  return results;
}

updateRecipes();
