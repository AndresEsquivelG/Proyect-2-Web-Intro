const API_BASE_URL = 'http://localhost:8000';
const urlParams = new URLSearchParams(window.location.search);
const restaurantId = urlParams.get('id');

const restImg = document.getElementById('restImg');
const restName = document.getElementById('restName');
const restType = document.getElementById('restType');
const restCreated = document.getElementById('restCreated');
const restOrders = document.getElementById('restOrders');
const favBtn = document.getElementById('favBtn');
const viewOrdersBtn = document.getElementById('viewOrdersBtn');
const mealList = document.getElementById('mealList');
const cartItemsContainer = document.getElementById('cartItems');
const subtotalSpan = document.getElementById('subtotal');
const taxSpan = document.getElementById('tax');
const deliverySpan = document.getElementById('delivery');
const serviceSpan = document.getElementById('service');
const totalSpan = document.getElementById('total');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const ordersModal = document.getElementById('ordersModal');
const ordersList = document.getElementById('ordersList');

let currentRestaurant = null;
let cart = []; //food_id, name, price, thumbnail, quantity
let isCurrentRestaurantFavorite = false;

//detalles del restaurante
async function fetchRestaurantDetails() {
    if (!restaurantId) {
        console.error('ID de restaurante no encontrado en la URL');
        document.querySelector('main').innerHTML = '<p class="text-center text-red-500 text-xl mt-8">Error: No se especificó el ID del restaurante.</p>';
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.error('Restaurante no encontrado');
                document.querySelector('main').innerHTML = '<p class="text-center text-red-500 text-xl mt-8">Restaurante no encontrado.</p>';
            } else {
                throw new Error(`Error HTTP! estado: ${response.status}`);
            }
            return;
        }
        currentRestaurant = await response.json();
        displayRestaurantDetails(currentRestaurant);
        displayFoodItems(currentRestaurant.foods);
        await checkAndDisplayFavoriteStatus(); 
        loadCart(); 
    } catch (error) {
        console.error('Error al obtener los detalles del restaurante:', error);
        document.querySelector('main').innerHTML = '<p class="text-center text-red-500 text-xl mt-8">Error al cargar los detalles del restaurante.</p>';
    }
}

//estado de favorito y actualizar botón
async function checkAndDisplayFavoriteStatus() {
    if (!restaurantId) return;
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/`);
        if (!response.ok) {
            console.error('Error al obtener la lista de favoritos:', response.statusText);
            isCurrentRestaurantFavorite = false;
            updateFavoriteButton();
            return;
        }
        const favorites = await response.json();
        isCurrentRestaurantFavorite = favorites.some(fav => fav.restaurant_id === parseInt(restaurantId));
        updateFavoriteButton();

    } catch (error) {
        console.error('Error al verificar el estado de favorito:', error);
        isCurrentRestaurantFavorite = false; 
        updateFavoriteButton();
    }
}

function updateFavoriteButton() {
    if (isCurrentRestaurantFavorite) {
        favBtn.textContent = "★ Eliminar de Favoritos";
        favBtn.classList.remove("bg-yellow-400");
        favBtn.classList.add("bg-red-500"); //cambiar color para "eliminar"
    } else {
        favBtn.textContent = "☆ Agregar a Favoritos";
        favBtn.classList.remove("bg-red-500");
        favBtn.classList.add("bg-yellow-400"); //para "agregar"
    }
}


//detalles del restaurante
function displayRestaurantDetails(restaurant) {
    restImg.src = restaurant.thumbnail ? `${API_BASE_URL}${restaurant.thumbnail}` : '../assets/default-thumbnail.jpg';
    restName.textContent = restaurant.name;
    restType.textContent = restaurant.type;
    restCreated.textContent = `Creado el: ${new Date(restaurant.created_at).toLocaleDateString()}`;
    restOrders.textContent = `Pedidos realizados: ${restaurant.order_count}`;
}

//mostrar items de comida
function displayFoodItems(foods) {
    mealList.innerHTML = '';
    if (foods.length === 0) {
        mealList.innerHTML = '<p class="text-gray-600">No hay comidas disponibles en este restaurante.</p>';
        return;
    }
foods.forEach(food => {
    const foodElement = `
        <div class="bg-gray-100 rounded-lg p-4 flex items-center gap-4"
             draggable="true"
             ondragstart='handleDragStart(event)'
             data-food-id="${food.id}"
             data-food-name="${food.name}"
             data-food-price="${food.price}"
             data-food-thumbnail="${food.thumbnail || '../assets/default-thumbnail.jpg'}">
             
            <img src="${food.thumbnail ? `${API_BASE_URL}${food.thumbnail}` : '../assets/default-thumbnail.jpg'}"
                 class="w-20 h-20 object-cover rounded" alt="${food.name}" />
            
            <div class="flex-1">
                <h4 class="text-lg font-semibold">${food.name}</h4>
                <p class="text-gray-700">₡${food.price.toFixed(2)}</p>
            </div>

            <button class="bg-blue-500 text-white px-3 py-1 rounded add-to-cart-btn"
                    data-food-id="${food.id}"
                    data-food-name="${food.name}"
                    data-food-price="${food.price}"
                    data-food-thumbnail="${food.thumbnail || '../assets/default-thumbnail.jpg'}">
                Agregar
            </button>
        </div>
    `;
    mealList.innerHTML += foodElement;
});

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
}

//carrito
function loadCart() {
    const savedCart = localStorage.getItem(`cart_${restaurantId}`);
    if (savedCart) {
        cart = JSON.parse(savedCart);
        renderCart();
    }
}

function saveCart() {
    localStorage.setItem(`cart_${restaurantId}`, JSON.stringify(cart));
}

function handleAddToCart(event) {
    const button = event.target;
    const foodId = parseInt(button.dataset.foodId);
    const foodName = button.dataset.foodName;
    const foodPrice = parseFloat(button.dataset.foodPrice);
    const foodThumbnail = button.dataset.foodThumbnail;

    const existingItemIndex = cart.findIndex(item => item.food_id === foodId);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            food_id: foodId,
            name: foodName,
            price: foodPrice,
            thumbnail: foodThumbnail,
            quantity: 1
        });
    }

    renderCart();
    saveCart();
}

function updateQuantity(foodId, change) {
    const itemIndex = cart.findIndex(item => item.food_id === foodId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        renderCart();
        saveCart();
    }
}

function removeFromCart(foodId) {
    cart = cart.filter(item => item.food_id !== foodId);
    renderCart();
    saveCart();
}

function calculateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.13;
    const deliveryRate = 0.10;
    const serviceRate = 0.10;

    const tax = subtotal * taxRate;
    const delivery = subtotal * deliveryRate;
    const service = subtotal * serviceRate;
    const total = subtotal + tax + delivery + service;

    return { subtotal, tax, delivery, service, total };
}

function renderCart() {
    cartItemsContainer.innerHTML = ''; 
    const totals = calculateCartTotals();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-600">Tu carrito está vacío.</p>';
        placeOrderBtn.disabled = true;
    } else {
        cart.forEach(item => {
            const cartItemElement = `
                <div class="flex items-center gap-4 border-b pb-2">
                    <img src="${item.thumbnail ? `${API_BASE_URL}${item.thumbnail}` : '../assets/default-thumbnail.jpg'}" class="w-12 h-12 object-cover rounded" alt="${item.name}" />
                    <div class="flex-1">
                        <h5 class="font-medium">${item.name}</h5>
                        <p class="text-sm text-gray-600">₡${item.price.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center">
                        <button class="bg-gray-300 px-2 py-1 rounded-l decrease-quantity" data-food-id="${item.food_id}">-</button>
                        <span class="px-3">${item.quantity}</span>
                        <button class="bg-gray-300 px-2 py-1 rounded-r increase-quantity" data-food-id="${item.food_id}">+</button>
                    </div>
                    <button class="text-red-600 hover:text-red-800 remove-item" data-food-id="${item.food_id}">&times;</button>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemElement;
        });
        placeOrderBtn.disabled = false;

      
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', () => updateQuantity(parseInt(button.dataset.foodId), -1));
        });
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', () => updateQuantity(parseInt(button.dataset.foodId), 1));
        });
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', () => removeFromCart(parseInt(button.dataset.foodId)));
        });
    }

    subtotalSpan.textContent = totals.subtotal.toFixed(2);
    taxSpan.textContent = totals.tax.toFixed(2);
    deliverySpan.textContent = totals.delivery.toFixed(2);
    serviceSpan.textContent = totals.service.toFixed(2);
    totalSpan.textContent = totals.total.toFixed(2);
}

// realizar pedido
async function handlePlaceOrder() {
    if (cart.length === 0) {
        showOrderStatus('Tu carrito está vacío.', 'error');
        return;
    }

    if (!currentRestaurant) {
        console.error('Detalles del restaurante no cargados.');
        return;
    }

    const totals = calculateCartTotals();
    const orderDetails = cart.map(item => ({
        food_id: item.food_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.thumbnail
    }));

    const orderData = {
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.delivery,
        service: totals.service,
        total: totals.total,
        details: JSON.stringify(orderDetails)
    };

    try {
        showOrderStatus("Procesando pedido...", "loading");
        const response = await fetch(`${API_BASE_URL}/orders/${restaurantId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }

        const result = await response.json();
        console.log('Pedido realizado:', result);

        cart = [];
        saveCart();
        renderCart();

        showOrderSuccessWithRedirect("Pedido realizado correctamente.");

    } catch (error) {
        console.error('Error al realizar el pedido:', error);
        showOrderStatus("Fallo al realizar el pedido. Intenta nuevamente.", "error");
    }
}

//alternar favorito
async function handleFavoriteToggle() {
    if (!restaurantId) return;

    const url = `${API_BASE_URL}/favorites/${restaurantId}`;
    const method = isCurrentRestaurantFavorite ? 'DELETE' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            isCurrentRestaurantFavorite = !isCurrentRestaurantFavorite;
            updateFavoriteButton(); 

        } else if (response.status === 409 && method === 'POST') {
             console.warn(`Restaurante ${restaurantId} ya estaba en favoritos.`);
             isCurrentRestaurantFavorite = true;
             updateFavoriteButton();

        } else if (response.status === 404 && method === 'DELETE') {
             console.warn(`Restaurante ${restaurantId} no se encontró en favoritos para eliminar.`);
             isCurrentRestaurantFavorite = false;
             updateFavoriteButton();
             
        }
         else {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }

    } catch (error) {
        console.error('Error al actualizar favoritos:', error);
        alert('Ocurrió un error al actualizar favoritos. Por favor, intenta nuevamente.');
    }
}


//ver pedidos
async function handleViewOrders() {
    if (!restaurantId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${restaurantId}`);
        if (!response.ok) {
             if (response.status === 404) {
                ordersList.innerHTML = '<p class="text-gray-600">No se encontraron pedidos para este restaurante.</p>';
             } else {
                throw new Error(`Error HTTP! estado: ${response.status}`);
             }
             return;
        }
        const orders = await response.json();
        displayOrdersInModal(orders);
        openOrdersModal();
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        ordersList.innerHTML = '<p class="text-red-500">Error al cargar pedidos.</p>';
        openOrdersModal();
    }
}

function displayOrdersInModal(orders) {
    ordersList.innerHTML = '';
     if (orders.length === 0) {
        ordersList.innerHTML = '<p class="text-gray-600">No se encontraron pedidos anteriores.</p>';
        return;
    }
    orders.forEach(order => {
        const orderDetails = JSON.parse(order.details || '[]');
        const orderItemsHtml = orderDetails.map(item => `
            <p class="text-sm text-gray-700">- ${item.quantity}x ${item.name} (₡${item.price.toFixed(2)})</p>
        `).join('');

        const orderElement = `
            <div class="border-b pb-4">
                <p class="font-semibold">ID del Pedido: ${order.id}</p> <p class="text-sm text-gray-500">Fecha: ${new Date(order.created_at).toLocaleString()}</p> <div class="ml-4 mt-2">
                    ${orderItemsHtml}
                </div>
                <p class="text-sm font-bold mt-2">Total: ₡${order.total.toFixed(2)}</p>
            </div>
        `;
        ordersList.innerHTML += orderElement;
    });
}

function openOrdersModal() {
    ordersModal.classList.remove('hidden');
}

function closeOrdersModal() {
    ordersModal.classList.add('hidden');
}

favBtn.addEventListener('click', handleFavoriteToggle);
viewOrdersBtn.addEventListener('click', handleViewOrders);
placeOrderBtn.addEventListener('click', handlePlaceOrder);

const orderStatusMessage = document.getElementById("orderStatusMessage");

function showOrderStatus(message, type = "info") {
    const base = "p-4 rounded text-center mb-4 ";
    let classes = "";

    if (type === "loading") {
        classes = base + "bg-blue-100 text-blue-800 animate-pulse";
    } else if (type === "success") {
        classes = base + "bg-green-100 text-green-800";
    } else if (type === "error") {
        classes = base + "bg-red-100 text-red-800";
    }

    orderStatusMessage.className = classes;
    orderStatusMessage.textContent = message;
    orderStatusMessage.classList.remove("hidden");
}

function showOrderSuccessWithRedirect(message) {
    showOrderStatus(message, "success");
    const button = document.createElement("button");
    button.textContent = "Aceptar";
    button.className = "mt-2 bg-green-600 text-white px-4 py-2 rounded";
    button.onclick = () => location.reload(); // o redirige si prefieres
    orderStatusMessage.appendChild(document.createElement("br"));
    orderStatusMessage.appendChild(button);
}

function hideOrderStatus() {
    orderStatusMessage.classList.add("hidden");
    orderStatusMessage.textContent = "";
}


fetchRestaurantDetails();

function handleDragStart(event) {
    const target = event.currentTarget;
    const foodData = {
        food_id: parseInt(target.dataset.foodId),
        name: target.dataset.foodName,
        price: parseFloat(target.dataset.foodPrice),
        thumbnail: target.dataset.foodThumbnail
    };
    event.dataTransfer.setData("application/json", JSON.stringify(foodData));
}

function handleDrop(event) {
    event.preventDefault();
    const foodData = JSON.parse(event.dataTransfer.getData("application/json"));
    const existingItemIndex = cart.findIndex(item => item.food_id === foodData.food_id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ ...foodData, quantity: 1 });
    }

    renderCart();
    saveCart();
}
