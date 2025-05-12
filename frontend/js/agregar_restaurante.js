const container = document.getElementById("mealsContainer");
const addBtn = document.getElementById("addMealBtn");
const restaurantForm = document.getElementById("restaurantForm");
let mealIndex = 0;

function createMealFields(index) {
  return `
    <div class="border p-4 rounded bg-gray-100 space-y-2 meal-item" data-index="${index}">
      <div>
        <label class="block text-sm font-medium">Meal Name</label>
        <input type="text" name="meals[${index}][name]" maxlength="150" required class="w-full border p-1 rounded"/>
      </div>
      <div>
        <label class="block text-sm font-medium">Price</label>
        <input type="number" name="meals[${index}][price]" step="0.01" required class="w-full border p-1 rounded"/>
      </div>
      <div>
        <label class="block text-sm font-medium">Image (optional, JPG, max 2MB)</label>
        <input type="file" name="meals[${index}][image]" accept=".jpg" class="w-full"/>
      </div>
    </div>
  `;
}

addBtn.onclick = () => {
  container.insertAdjacentHTML("beforeend", createMealFields(mealIndex));
  mealIndex++;
};

// Al menos una comida al cargar
window.onload = () => addBtn.click();

restaurantForm.onsubmit = async function(event) {
  event.preventDefault();
  
  try {
    const restaurantFormData = new FormData();

    restaurantFormData.append("name", this.elements.name.value);
    restaurantFormData.append("type", this.elements.type.value);
    
    const restaurantImage = this.elements.restaurantImage.files[0];
    if (restaurantImage) {
      restaurantFormData.append("restaurant_image", restaurantImage);
    }
    
    //datos de las comidas
    const meals = [];
    const mealItems = document.querySelectorAll('.meal-item');
    
    mealItems.forEach(item => {
      const index = item.dataset.index;
      const nameField = item.querySelector(`input[name="meals[${index}][name]"]`);
      const priceField = item.querySelector(`input[name="meals[${index}][price]"]`);
      
      if (nameField && priceField && nameField.value && priceField.value) {
        meals.push({
          name: nameField.value,
          price: parseFloat(priceField.value)
        });
      }
    });
    
    restaurantFormData.append("meals_data", JSON.stringify(meals));
    
    const restaurantResponse = await fetch('http://127.0.0.1:8000/restaurants/', {
      method: 'POST',
      body: restaurantFormData
    });
    
    if (!restaurantResponse.ok) {
      throw new Error(`Error al crear restaurante: ${restaurantResponse.statusText}`);
    }
    
    const restaurantData = await restaurantResponse.json();
    
    for (const item of mealItems) {
      const index = item.dataset.index;
      const nameField = item.querySelector(`input[name="meals[${index}][name]"]`);
      const priceField = item.querySelector(`input[name="meals[${index}][price]"]`);
      const imageField = item.querySelector(`input[name="meals[${index}][image]"]`);
      
      //imagen para subir
      if (nameField && priceField && imageField && imageField.files[0]) {
        const foodFormData = new FormData();
        foodFormData.append("name", nameField.value);
        foodFormData.append("price", priceField.value);
        foodFormData.append("food_image", imageField.files[0]);

        await fetch(`http://127.0.0.1:8000/restaurants/${restaurantData.id}/foods`, {
          method: 'POST',
          body: foodFormData
        });
      }
    }
    
    window.location.href = "../index.html";
    
  } catch (error) {
    console.error("Error:", error);
    alert("Error al crear el restaurante: " + error.message);
  }
};