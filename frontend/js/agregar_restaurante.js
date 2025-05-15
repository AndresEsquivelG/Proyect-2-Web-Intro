    console.log("Hola en agregar_restaurante")
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

const statusMessage = document.getElementById("statusMessage");

function showStatus(message, type = "info") {
  const base = "p-4 rounded text-center mb-4 ";
  let classes = "";

  if (type === "loading") {
    classes = base + "bg-blue-100 text-blue-800 animate-pulse";
  } else if (type === "success") {
    classes = base + "bg-green-100 text-green-800";
  } else if (type === "error") {
    classes = base + "bg-red-100 text-red-800";
  }

  statusMessage.className = classes;
  statusMessage.textContent = message;
  statusMessage.classList.remove("hidden");
}

function showSuccessWithRedirect(message) {
  showStatus(message, "success");

  const button = document.createElement("button");
  button.textContent = "Aceptar";
  button.className = "mt-2 bg-green-600 text-white px-4 py-2 rounded";
  button.onclick = () => window.location.href = "../index.html";
  statusMessage.appendChild(document.createElement("br"));
  statusMessage.appendChild(button);
}

function hideStatus() {
  statusMessage.classList.add("hidden");
  statusMessage.textContent = "";
}


restaurantForm.onsubmit = async function(event) {
  event.preventDefault();
  try {
    showStatus("Creando restaurante...", "loading");

    // 1) Prepara datos del restaurante (sólo campos y fotos del restaurante)
    const restaurantFormData = new FormData();
    restaurantFormData.append("name", this.elements.name.value);
    restaurantFormData.append("type", this.elements.type.value);
    const restaurantImage = this.elements.restaurantImage.files[0];
    if (restaurantImage) {
      restaurantFormData.append("restaurant_image", restaurantImage);
    }

    // 2) Construye sólo el array de meals SIN imagen
    const mealsWithoutImages = [];
    const mealItems = document.querySelectorAll('.meal-item');
    mealItems.forEach(item => {
      const idx = item.dataset.index;
      const nameField  = item.querySelector(`input[name="meals[${idx}][name]"]`);
      const priceField = item.querySelector(`input[name="meals[${idx}][price]"]`);
      const imgField   = item.querySelector(`input[name="meals[${idx}][image]"]`);
      if (nameField.value && priceField.value && (!imgField.files[0])) {
        mealsWithoutImages.push({
          name:  nameField.value,
          price: parseFloat(priceField.value)
        });
      }
    });
    restaurantFormData.append("meals_data", JSON.stringify(mealsWithoutImages));

    // 3) Crea el restaurante y los platillos sin imagen
    const resp = await fetch('http://127.0.0.1:8000/restaurants/', {
      method: 'POST',
      body: restaurantFormData
    });
    if (!resp.ok) throw new Error(`Error al crear restaurante: ${resp.statusText}`);
    const restaurantData = await resp.json();

    // 4) Ahora crea **sólo** los platillos **con** imagen
    for (const item of mealItems) {
      const idx = item.dataset.index;
      const nameField  = item.querySelector(`input[name="meals[${idx}][name]"]`);
      const priceField = item.querySelector(`input[name="meals[${idx}][price]"]`);
      const imgField   = item.querySelector(`input[name="meals[${idx}][image]"]`);
      if (imgField.files[0]) {
        const foodForm = new FormData();
        foodForm.append("name",  nameField.value);
        foodForm.append("price", priceField.value);
        foodForm.append("food_image", imgField.files[0]);
        await fetch(`http://127.0.0.1:8000/restaurants/${restaurantData.id}/foods`, {
          method: 'POST',
          body: foodForm
        });
      }
    }

    showSuccessWithRedirect("Restaurante creado correctamente.");
  } catch (err) {
    console.error(err);
    showStatus("Error al crear el restaurante: " + err.message, "error");
  }
};