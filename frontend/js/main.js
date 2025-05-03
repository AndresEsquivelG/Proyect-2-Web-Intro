document.getElementById("logo").onclick = () => {
    window.location.href = "index.html";
  };
  
  document.getElementById("addRestaurantBtn").onclick = () => {
    window.location.href = "agregar_restaurante.html";
  };
  
  document.getElementById("searchBtn").onclick = () => {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) return;
    window.location.href = `resultados_busqueda.html?q=${encodeURIComponent(query)}`;
  };
  
  // Simulación inicial para renderizado (puedes conectar luego a la API real)
  const renderRestaurantCard = (container, data) => {
    data.forEach(r => {
      const card = document.createElement("div");
      card.className = "min-w-[200px] bg-white rounded shadow p-2 cursor-pointer hover:shadow-lg";
      card.innerHTML = `
        <img src="${r.img}" class="w-full h-32 object-cover rounded" />
        <h3 class="mt-2 font-bold">${r.name}</h3>
        <p class="text-sm text-gray-600">${r.type}</p>
      `;
      card.onclick = () => window.location.href = `restaurante.html?id=${r.id}`;
      container.appendChild(card);
    });
  };
  
  const dummyData = [
    { id: 1, name: "Taco Express", type: "Comida Mexicana", img: "assets/default-thumbnail.jpg" },
    { id: 2, name: "Pasta House", type: "Comida Italiana", img: "assets/default-thumbnail.jpg" },
    { id: 3, name: "Café Chill", type: "Cafetería", img: "assets/default-thumbnail.jpg" },
  ];
  
  renderRestaurantCard(document.getElementById("allRestaurants"), dummyData);
  renderRestaurantCard(document.getElementById("favoriteRestaurants"), dummyData.reverse());
  renderRestaurantCard(document.getElementById("topRestaurants"), dummyData);
  