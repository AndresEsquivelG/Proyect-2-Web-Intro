const API_URL = "http://localhost:8000";

document.getElementById("logo").onclick = () => {
  window.location.href = "index.html";
};

document.getElementById("addRestaurantBtn").onclick = () => {
  window.location.href = "./pages/agregar_restaurante.html";
};

document.getElementById("searchBtn").onclick = () => {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;
  window.location.href = `./pages/resultados_busqueda.html?q=${encodeURIComponent(query)}`;
};

document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchBtn").click();
  }
});

//renderizar tarjetas de restaurantes
const renderRestaurantCard = (container, restaurants = []) => {
  container.innerHTML = "";
  
  if (restaurants.length === 0) {
    container.innerHTML = "<p class='text-gray-500 italic'>No hay restaurantes disponibles</p>";
    return;
  }
  
  restaurants.forEach(restaurant => {
    const card = document.createElement("div");
    card.className = "min-w-[200px] bg-white rounded shadow p-2 cursor-pointer hover:shadow-lg transition-shadow";
    
    const imgSrc = restaurant.thumbnail 
      ? `${API_URL}${restaurant.thumbnail}` 
      : "./assets/default-thumbnail.jpg";
    
    card.innerHTML = `
      <img src="${imgSrc}" class="w-full h-32 object-cover rounded" alt="${restaurant.name}" onerror="this.src='./assets/default-thumbnail.jpg'" />
      <h3 class="mt-2 font-bold">${restaurant.name}</h3>
      <p class="text-sm text-gray-600">${restaurant.type}</p>
      <div class="mt-2 flex justify-between text-sm">
        <span>${restaurant.foods?.length || 0} platillos</span>
        <span>${restaurant.order_count || 0} pedidos</span>
      </div>
    `;
    card.onclick = () => window.location.href = `./pages/restaurante.html?id=${restaurant.id}`;
    container.appendChild(card);
  });
};

const showError = (message) => {
  console.error(message);
};

//cargar todos los restaurantes
const loadAllRestaurants = async () => {
  try {
    const response = await fetch(`${API_URL}/restaurants/`);
    if (!response.ok) throw new Error("Error al cargar restaurantes");
    
    const data = await response.json();
    renderRestaurantCard(document.getElementById("allRestaurants"), data);
  } catch (error) {
    showError("No se pudieron cargar los restaurantes");
    console.error(error);
  }
};

//cargar restaurantes favoritos
const loadFavorites = async () => {
  try {
    const favResponse = await fetch(`${API_URL}/favorites/`);
    if (!favResponse.ok) throw new Error("Error al cargar favoritos");
    
    const favorites = await favResponse.json();
    
    if (favorites.length === 0) {
      document.getElementById("favoriteRestaurants").innerHTML = 
        "<p class='text-gray-500 italic'>No tienes restaurantes favoritos</p>";
      return;
    }
    
    //favorito: datos del restaurante
    const favoriteRestaurants = await Promise.all(
      favorites.map(async (fav) => {
        const restResponse = await fetch(`${API_URL}/restaurants/${fav.restaurant_id}`);
        if (!restResponse.ok) return null;
        return restResponse.json();
      })
    );
    
    const validRestaurants = favoriteRestaurants.filter(r => r !== null);
    
    renderRestaurantCard(document.getElementById("favoriteRestaurants"), validRestaurants);
  } catch (error) {
    showError("No se pudieron cargar los favoritos");
    console.error(error);
  }
};

//cargar restaurantes más pedidos
const loadTopRestaurants = async () => {
  try {
    const response = await fetch(`${API_URL}/restaurants/top/ordered`);
    if (!response.ok) throw new Error("Error al cargar top restaurantes");
    
    const data = await response.json();
    renderRestaurantCard(document.getElementById("topRestaurants"), data);
  } catch (error) {
    showError("No se pudieron cargar los restaurantes más pedidos");
    console.error(error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadAllRestaurants();
  loadFavorites();
  loadTopRestaurants();
});