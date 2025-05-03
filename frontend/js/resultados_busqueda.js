const queryString = new URLSearchParams(window.location.search);
const query = queryString.get("q") || "";

document.getElementById("searchInput").value = query;
document.getElementById("searchTerm").textContent = query;

document.getElementById("searchBtn").onclick = () => {
  const newQuery = document.getElementById("searchInput").value.trim();
  if (!newQuery) return;
  window.location.href = `resultados_busqueda.html?q=${encodeURIComponent(newQuery)}`;
};

// Simulación de búsqueda
const dummyRestaurants = [
  { id: 1, name: "Pasta House", type: "Comida Italiana", created: "2025-04-10", orders: 8, favorite: true, img: "assets/default-thumbnail.jpg" },
  { id: 2, name: "Soda Tica", type: "Comida Típica", created: "2025-04-01", orders: 2, favorite: false, img: "assets/default-thumbnail.jpg" },
];

const filtered = dummyRestaurants.filter(r =>
  r.name.toLowerCase().includes(query.toLowerCase()) ||
  r.type.toLowerCase().includes(query.toLowerCase())
);

const resultsContainer = document.getElementById("resultsList");
const noResults = document.getElementById("noResults");

if (filtered.length === 0) {
  noResults.classList.remove("hidden");
} else {
  filtered.forEach(r => {
    const div = document.createElement("div");
    div.className = "bg-white rounded shadow p-4 flex items-center gap-4 hover:shadow-lg cursor-pointer";
    div.onclick = () => window.location.href = `restaurante.html?id=${r.id}`;

    div.innerHTML = `
      <img src="${r.img}" class="w-24 h-24 object-cover rounded" />
      <div class="flex-1">
        <h3 class="text-lg font-bold">${r.name}</h3>
        <p class="text-sm text-gray-600">${r.type}</p>
        <p class="text-sm text-gray-500">Created: ${r.created} | Orders: ${r.orders}</p>
      </div>
      ${r.favorite ? '<span class="text-yellow-500 font-bold text-xl">★</span>' : ''}
    `;
    resultsContainer.appendChild(div);
  });
}
