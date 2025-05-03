const container = document.getElementById("mealsContainer");
const addBtn = document.getElementById("addMealBtn");

let mealIndex = 0;

function createMealFields(index) {
  return `
    <div class="border p-4 rounded bg-gray-100 space-y-2">
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
