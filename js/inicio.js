// 1. ORDEN EXACTO DE CATEGORÍAS (De la más a la menos importante requerida)
const categoriesOrdered = [
  "Hogar",
  "Cervezas, Vinos y Licores",
  "Ferretería",
  "Mascotas",
  "Alimentos",
  "Bebidas",
  "Belleza y Cuidado Personal"
];

// 2. PRODUCTOS DE MUESTRA
const products = [
  { id: 1, name: "Aceite Vegetal Pureco 1L", category: "Alimentos", price: 45.20, originalPrice: 52.00, tag: "Disponible", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Leche Entera Cremosa 1L", category: "Alimentos", price: 22.90, originalPrice: 26.00, tag: "Disponible", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Detergente Multiusos 1kg", category: "Hogar", price: 39.00, originalPrice: 45.00, tag: "Disponible", image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Jabón de Barra Premium 400g", category: "Belleza y Cuidado Personal", price: 18.00, originalPrice: 22.00, tag: "Disponible", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80" },
  { id: 5, name: "Cerveza Clara 6 Pack", category: "Cervezas, Vinos y Licores", price: 98.00, originalPrice: 115.00, tag: "Disponible", image: "https://images.unsplash.com/photo-1481215919404-66ba77de043f?auto=format&fit=crop&w=600&q=80" },
  { id: 6, name: "Alimento para Perro 2kg", category: "Mascotas", price: 145.00, originalPrice: 160.00, tag: "Disponible", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80" },
  { id: 7, name: "Juego de Desarmadores 4 pzs", category: "Ferretería", price: 89.00, originalPrice: 110.00, tag: "Disponible", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80" },
  { id: 8, name: "Agua Mineral 1.5L", category: "Bebidas", price: 16.50, originalPrice: 20.00, tag: "Disponible", image: "https://images.unsplash.com/photo-1546924282-0f057bc9dd5a?auto=format&fit=crop&w=600&q=80" }
];


let currentCategory = "Todos";

// Inicializar Aplicación cuando cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  renderHeaderCategories();
  renderPillCategories();
  renderProducts(products);
  setupEvents();
});

// Cargar categorías en el menú desplegable del Header
function renderHeaderCategories() {
  const container = document.getElementById("headerCategoryList");
  if (!container) return;
  
  container.innerHTML = `<li><a class="dropdown-item fw-bold" href="#" onclick="filterByCategory('Todos')">Todas las Categorías</a></li><li><hr class="dropdown-divider"></li>`;
  
  categoriesOrdered.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `<a class="dropdown-item" href="#ofertas" onclick="filterByCategory('${cat}')">${cat}</a>`;
    container.appendChild(li);
  });
}

// Cargar categorías en botones tipo píldora
function renderPillCategories() {
  const container = document.getElementById("pillsContainer");
  if (!container) return;

  let html = `<button class="category-pill ${currentCategory === 'Todos' ? 'active' : ''}" onclick="filterByCategory('Todos')">Todos</button>`;
  
  categoriesOrdered.forEach(cat => {
    html += `<button class="category-pill ${currentCategory === cat ? 'active' : ''}" onclick="filterByCategory('${cat}')">${cat}</button>`;
  });
  
  container.innerHTML = html;
}

// Renderizar tarjetas de productos
function renderProducts(items) {
  const container = document.getElementById("productsGrid");
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<div class="col-12 text-center py-5"><p class="fs-5 text-muted">No se encontraron productos en esta categoría.</p></div>`;
    return;
  }

  container.innerHTML = items.map(product => `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="product-card d-flex flex-column justify-content-between p-3">
        <div>
          <div class="product-img-wrapper mb-2">
            <a href="pages/producto.html"><img class="product-img" src="${product.image}" alt="${product.name}" loading="lazy"></a>
            <button class="btn-add-cart" onclick="addToCart(${product.id})" title="Agregar al carrito">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          <span class="badge bg-light text-success border mb-1">${product.tag}</span>
          <span class="d-block text-muted small fw-semibold text-uppercase">${product.category}</span>
          <a href="pages/producto.html" style="text-decoration:none; color:inherit;"><h6 class="fw-bold text-dark text-truncate mb-2" title="${product.name}">${product.name}</h6></a>
        </div>
        <div>
          <div class="d-flex align-items-baseline gap-2">
            <span class="fs-5 fw-bold text-primary">$${product.price.toFixed(2)}</span>
            <span class="small text-muted text-decoration-line-through">$${product.originalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Filtrar Productos por categoría
function filterByCategory(category) {
  currentCategory = category;
  renderPillCategories();

  if (category === "Todos") {
    renderProducts(products);
  } else {
    const filtered = products.filter(p => p.category === category);
    renderProducts(filtered);
  }
}

// ==========================================
// LÓGICA DEL CARRITO CON SUMA Y RESTA (1 EN 1)
// ==========================================

// 1. Agregar producto al carrito desde la página
function addToCart(productId) {
  const item = products.find(p => p.id === productId);
  if (!item) return;
  
  // Llama a la función global para sincronizar con localStorage
  addProductToCart({
    id: item.id,
    name: item.name,
    price: item.price,
    img: item.img,
    quantity: 1
  });
  
  updateCartUI();
}

// 2. Cambiar cantidad uno por uno (Sumar +1 o Restar -1)
function changeQuantity(productId, delta) {
  let cart = getCart();
  const item = cart.find(p => p.id == productId);
  if (!item) return;
  updateQuantity(productId, item.quantity + delta);
  updateCartUI();
}

// 3. Quitar por completo el producto
function removeFromCartLocal(productId) {
  removeFromCartLocal(productId);
  updateCartUI();
}

// 4. Actualizar la vista del carrito
function updateCartUI() {
  let cart = getCart(); // desde global.js
  const cartCount = document.getElementById("cartCount");
  const cartItemsList = document.getElementById("cartItemsList");
  const cartTotal = document.getElementById("cartTotal");

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cartCount) cartCount.textContent = totalItems;
  if (cartTotal) cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

  if (!cartItemsList) return;

  if (cart.length === 0) {
    cartItemsList.innerHTML = `<p class="text-center text-muted my-5">Tu carrito está vacío</p>`;
    return;
  }

  cartItemsList.innerHTML = cart.map(item => `
    <div class="d-flex align-items-center justify-content-between border-bottom py-3">
      <div class="me-2 flex-grow-1">
        <h6 class="mb-1 fw-bold small text-dark">${item.name}</h6>
        <div class="text-primary fw-bold small">$${item.price.toFixed(2)} / c.u.</div>
      </div>
      
      <!-- CONTROLES PARA QUITAR Y SUMAR DE 1 EN 1 -->
      <div class="d-flex align-items-center gap-2">
        <div class="cart-qty-controls d-flex align-items-center border rounded-pill bg-light px-1">
          <button class="btn btn-sm text-secondary p-0 px-2 fw-bold" onclick="changeQuantity(${item.id}, -1)">–</button>
          <span class="px-2 fw-bold small">${item.quantity}</span>
          <button class="btn btn-sm text-secondary p-0 px-2 fw-bold" onclick="changeQuantity(${item.id}, 1)">+</button>
        </div>

        <!-- Botón de basurero para eliminar de golpe -->
        <button class="btn btn-sm text-danger p-0 ms-1" onclick="removeFromCartLocal(${item.id})" title="Eliminar todo">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Escuchar búsquedas y botones
function setupEvents() {
  const searchInput = document.getElementById("searchInput");
  const searchInputMobile = document.getElementById("searchInputMobile");
  const mobileSearchBtn = document.getElementById("mobileSearchBtn");
  const mobileSearchContainer = document.getElementById("mobileSearchContainer");
  const resetFilterBtn = document.getElementById("resetFilterBtn");

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    renderProducts(filtered);
  };

  if (searchInput) searchInput.addEventListener("input", handleSearch);
  if (searchInputMobile) searchInputMobile.addEventListener("input", handleSearch);

  if (mobileSearchBtn && mobileSearchContainer) {
    mobileSearchBtn.addEventListener("click", () => {
      mobileSearchContainer.classList.toggle("d-none");
    });
  }

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener("click", () => filterByCategory("Todos"));
  }
}