// Script to create recipes for all menu items
const recipes = [
  {
    menuItemName: "Scrambled Eggs",
    menuItemId: "cmqguknwe0003721s35fafent",
    name: "Scrambled Eggs",
    servingSize: 1,
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
    ]
  },
  {
    menuItemName: "Fried Eggs (Sunny Side Up)",
    menuItemId: "cmqguknwz0009721s0y34s4q3",
    name: "Fried Eggs (Sunny Side Up)",
    servingSize: 1,
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
    ]
  },
  {
    menuItemName: "Boiled Eggs",
    menuItemId: "cmqguknx7000f721sh3y3u0tk",
    name: "Boiled Eggs",
    servingSize: 1,
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
    ]
  },
  {
    menuItemName: "Cheese Omelette",
    menuItemId: "cmqguknxp000l721sqdxm75rf",
    name: "Cheese Omelette",
    servingSize: 1,
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
    ]
  },
  {
    menuItemName: "Egg Sandwich",
    menuItemId: "cmqgukny4000r721sakqan2fz",
    name: "Egg Sandwich",
    servingSize: 1,
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
    ]
  }
];

async function createRecipes() {
  const results = [];

  for (const recipe of recipes) {
    try {
      console.log(`\n📝 Creating recipe for: ${recipe.menuItemName}`);

      const response = await fetch(`https://suberfoods.com/api/admin/menu/${recipe.menuItemId}/recipe`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: recipe.name,
          servingSize: recipe.servingSize,
          ingredients: recipe.ingredients
        })
      });

      const data = await response.json();

      if (data.success) {
        results.push({
          success: true,
          name: recipe.menuItemName,
          recipeId: data.data.id
        });
        console.log(`   ✅ Success! Recipe ID: ${data.data.id}`);
        console.log(`   📊 Ingredients: ${recipe.ingredients.length}`);
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
  console.log('═'.repeat(50));
  console.log(`Total Recipes: ${results.length}`);
  console.log(`✅ Success: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log('═'.repeat(50));

  if (results.filter(r => r.success).length > 0) {
    console.log('\n✅ Successfully created recipes for:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   • ${r.name}`);
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

createRecipes();
