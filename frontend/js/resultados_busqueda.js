const API_URL = "http://localhost:8000";

const queryString = new URLSearchParams(window.location.search);
const query = queryString.get("q") || "";

document.getElementById("searchInput").value = query;
document.getElementById("searchTerm").textContent = query;

document.getElementById("searchBtn").onclick = () => {
  const newQuery = document.getElementById("searchInput").value.trim();
  if (!newQuery) return;
  window.location.href = `resultados_busqueda.html?q=${encodeURIComponent(newQuery)}`;
};

document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchBtn").click();
  }
});

const resultsContainer = document.getElementById("resultsList");
const noResults = document.getElementById("noResults");

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

//agregar/eliminar de favoritos
async function handleFavoriteToggle(event) {
  event.stopPropagation();

  const starElement = event.target;
  const restaurantId = starElement.dataset.restaurantId;
  if (!restaurantId) {
    console.error("No se encontró el ID del restaurante en la estrella.");
    return;
  }

  const isCurrentlyFavorite = starElement.classList.contains("text-yellow-500");
  const url = `${API_URL}/favorites/${restaurantId}`;
  const method = isCurrentlyFavorite ? 'DELETE' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      if (isCurrentlyFavorite) {
        starElement.classList.remove("text-yellow-500");
        starElement.classList.add("text-gray-300");
        starElement.textContent = "☆";
        console.log(`Restaurante ${restaurantId} eliminado de favoritos.`);

      } else {
        starElement.classList.remove("text-gray-300");
        starElement.classList.add("text-yellow-500");
        starElement.textContent = "★";
        console.log(`Restaurante ${restaurantId} agregado a favoritos.`);

      }

    } else if (response.status === 404 && isCurrentlyFavorite) {
        console.warn(`Intentó eliminar favorito ${restaurantId}, pero no se encontró en la BD.`);
         starElement.classList.remove("text-yellow-500");
         starElement.classList.add("text-gray-300");
         starElement.textContent = "☆";

    } else if (response.status === 409 && !isCurrentlyFavorite) {
         console.warn(`Intentó agregar favorito ${restaurantId}, pero ya estaba en la BD.`);
         starElement.classList.remove("text-gray-300");
         starElement.classList.add("text-yellow-500");
         starElement.textContent = "★";
    }

     else {
      throw new Error(`Error en la operación de favoritos: ${response.statusText}`);
    }

  } catch (error) {
    console.error("Error al actualizar favoritos:", error);
    alert("Ocurrió un error al actualizar favoritos. Intenta nuevamente.");
  }
}


//buscar restaurantes
async function searchRestaurants() {
  try {
    //indicador de carga
    resultsContainer.innerHTML = `
      <div class="text-center p-4">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full">
          </div>
            <p class="mt-2">Buscando restaurantes...</p>
          </div>`;

    const response = await fetch(`${API_URL}/restaurants/search/?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Error al buscar restaurantes: ${response.statusText}`);
    }

    const restaurants = await response.json();
    resultsContainer.innerHTML = '';

    if (restaurants.length === 0) {
      noResults.classList.remove("hidden");
    } else {
      noResults.classList.add("hidden");

      const favorites = await fetch(`${API_URL}/favorites/`)
        .then(r => r.json())
        .catch((e) => {
            console.error("Error al obtener favoritos para marcar resultados:", e);
            return []; 
        });
      const favoriteIds = favorites.map(f => f.restaurant_id);

      for (const restaurant of restaurants) {
        const isFavorite = favoriteIds.includes(restaurant.id);

        const div = document.createElement("div");
        div.className = "bg-white rounded shadow p-4 flex items-center gap-4 hover:shadow-lg cursor-pointer transition-all";
        div.onclick = () => window.location.href = `./restaurante.html?id=${restaurant.id}`;

        const imgSrc = restaurant.thumbnail
          ? `${API_URL}${restaurant.thumbnail}`
          : "../assets/default-thumbnail.jpg";

        div.innerHTML = `
          <img src="${imgSrc}" class="w-24 h-24 object-cover rounded" alt="${restaurant.name}" onerror="this.src='../assets/default-thumbnail.jpg'" />
          <div class="flex-1">
            <h3 class="text-lg font-bold">${restaurant.name}</h3>
            <p class="text-sm text-gray-600">${restaurant.type}</p>
            <div class="flex justify-between mt-1">
              <p class="text-sm text-gray-500">Creado: ${formatDate(restaurant.created_at)}</p>
              <p class="text-sm ${restaurant.order_count > 0 ? 'text-green-600' : 'text-gray-500'}">
                Pedidos: ${restaurant.order_count}
              </p>
            </div>
            <p class="text-sm text-gray-500 mt-1">Platillos: ${restaurant.foods?.length || 0}</p>
          </div>
          <span class="font-bold text-xl cursor-pointer favorite-toggle-star ${isFavorite ? 'text-yellow-500' : 'text-gray-300'}" data-restaurant-id="${restaurant.id}">
            ${isFavorite ? '★' : '☆'}
          </span>
        `;

        resultsContainer.appendChild(div);

        const starElement = div.querySelector('.favorite-toggle-star');
        if (starElement) {
            starElement.addEventListener('click', handleFavoriteToggle);
        }
      }
    }
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    resultsContainer.innerHTML = `
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Ocurrió un error al buscar restaurantes. Por favor, intenta nuevamente.</p>
      </div>
    `;
  }
}






document.addEventListener("DOMContentLoaded", searchRestaurants);