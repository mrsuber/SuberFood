// Script to add missing ingredients to inventory
const ingredientsToAdd = [
  {
    name: "Sliced Bread",
    category: "Bakery",
    unit: "SLICES",
    rawStock: 50,
    minimumStock: 10,
    maximumStock: 100,
    reorderPoint: 15,
    reorderQuantity: 50,
    costPerUnit: 50,
    description: "White or wheat sliced bread for sandwiches"
  },
  {
    name: "Cheddar Cheese",
    category: "Dairy",
    unit: "G",
    rawStock: 500,
    minimumStock: 100,
    maximumStock: 1000,
    reorderPoint: 150,
    reorderQuantity: 500,
    costPerUnit: 2,
    description: "Cheddar cheese for omelettes and sandwiches"
  },
  {
    name: "Butter",
    category: "Dairy",
    unit: "G",
    rawStock: 500,
    minimumStock: 100,
    maximumStock: 1000,
    reorderPoint: 150,
    reorderQuantity: 500,
    costPerUnit: 1.5,
    description: "Butter for cooking"
  },
  {
    name: "Black Pepper",
    category: "Spices",
    unit: "G",
    rawStock: 200,
    minimumStock: 50,
    maximumStock: 500,
    reorderPoint: 75,
    reorderQuantity: 200,
    costPerUnit: 0.5,
    description: "Ground black pepper for seasoning"
  }
];

async function addIngredients() {
  const results = [];

  for (const ingredient of ingredientsToAdd) {
    try {
      const response = await fetch('https://suberfoods.com/api/inventory/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredient)
      });

      const data = await response.json();

      if (data.success) {
        results.push({
          success: true,
          name: ingredient.name,
          id: data.data.id
        });
        console.log(`✅ Added: ${ingredient.name} (${data.data.id})`);
      } else {
        results.push({
          success: false,
          name: ingredient.name,
          error: data.error
        });
        console.log(`❌ Failed: ${ingredient.name} - ${data.error}`);
      }
    } catch (error) {
      results.push({
        success: false,
        name: ingredient.name,
        error: error.message
      });
      console.log(`❌ Error: ${ingredient.name} - ${error.message}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`Total: ${results.length}`);
  console.log(`Success: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);

  return results;
}

addIngredients();
