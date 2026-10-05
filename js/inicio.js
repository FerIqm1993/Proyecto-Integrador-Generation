// ORDEN DE CATEGORÍAS
const categoriasOrdenadas = [
  "Hogar",
  "Cervezas, Vinos y Licores",
  "Ferretería",
  "Mascotas",
  "Alimentos",
  "Bebidas",
  "Belleza y Cuidado Personal"
];

// PRODUCTOS DE MUESTRA
const productos = [
  { id: 1, nombre: "Aceite Vegetal Pureco 1L", categoria: "Alimentos", precio: 45.20, precioOriginal: 52.00, etiqueta: "Disponible", imagen: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80" },
  { id: 2, nombre: "Leche Entera Cremosa 1L", categoria: "Alimentos", precio: 22.90, precioOriginal: 26.00, etiqueta: "Disponible", imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80" },
  { id: 3, nombre: "Detergente Multiusos 1kg", categoria: "Hogar", precio: 39.00, precioOriginal: 45.00, etiqueta: "Disponible", imagen: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80" },
  { id: 4, nombre: "Jabón de Barra Premium 400g", categoria: "Belleza y Cuidado Personal", precio: 18.00, precioOriginal: 22.00, etiqueta: "Disponible", imagen: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80" },
  { id: 5, nombre: "Cerveza Clara 6 Pack", categoria: "Cervezas, Vinos y Licores", precio: 98.00, precioOriginal: 115.00, etiqueta: "Disponible", imagen: "https://images.unsplash.com/photo-1481215919404-66ba77de043f?auto=format&fit=crop&w=600&q=80" },
  { id: 6, nombre: "Alimento para Perro 2kg", categoria: "Mascotas", precio: 145.00, precioOriginal: 160.00, etiqueta: "Disponible", imagen: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80" },
  { id: 7, nombre: "Juego de Desarmadores 4 pzs", categoria: "Ferretería", precio: 89.00, precioOriginal: 110.00, etiqueta: "Disponible", imagen: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80" },
  { id: 8, nombre: "Agua Mineral 1.5L", categoria: "Bebidas", precio: 16.50, precioOriginal: 20.00, etiqueta: "Disponible", imagen: "https://images.unsplash.com/photo-1546924282-0f057bc9dd5a?auto=format&fit=crop&w=600&q=80" }
];


let categoriaActual = "Todos";

// Inicializar Aplicación
document.addEventListener("DOMContentLoaded", () => {
  renderizarCategoriasHeader();
  renderizarCategoriasPildora();
  renderizarProductos(productos);
  configurarEventos();
});

// Cargar categorías en el menú desplegable del Header
function renderizarCategoriasHeader() {
  const contenedor = document.getElementById("headerCategoryList");
  if (!contenedor) return;
  
  contenedor.innerHTML = `<li><a class="dropdown-item fw-bold" href="#" onclick="filtrarPorCategoria('Todos')">Todas las Categorías</a></li><li><hr class="dropdown-divider"></li>`;
  
  categoriasOrdenadas.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `<a class="dropdown-item" href="#ofertas" onclick="filtrarPorCategoria('${cat}')">${cat}</a>`;
    contenedor.appendChild(li);
  });
}

// Cargar categorías en botones tipo píldora
function renderizarCategoriasPildora() {
  const contenedor = document.getElementById("contenedorPildoras");
  if (!contenedor) return;

  let html = `<button class="category-pill ${categoriaActual === 'Todos' ? 'active' : ''}" onclick="filtrarPorCategoria('Todos')">Todos</button>`;
  
  categoriasOrdenadas.forEach(cat => {
    html += `<button class="category-pill ${categoriaActual === cat ? 'active' : ''}" onclick="filtrarPorCategoria('${cat}')">${cat}</button>`;
  });
  
  contenedor.innerHTML = html;
}

// Renderizar tarjetas de productos
function renderizarProductos(articulos) {
  const contenedor = document.getElementById("cuadriculaProductos");
  if (!contenedor) return;

  if (articulos.length === 0) {
    contenedor.innerHTML = `<div class="col-12 text-center py-5"><p class="fs-5 text-muted">No se encontraron productos en esta categoría.</p></div>`;
    return;
  }

  contenedor.innerHTML = articulos.map(producto => `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="product-card d-flex flex-column justify-content-between p-3">
        <div>
          <div class="product-img-wrapper mb-2">
            <a href="pages/producto.html"><img class="product-img" src="${producto.imagen}" alt="${producto.nombre}" loading="lazy"></a>
            <button class="btn-add-cart d-flex align-items-center justify-content-center text-white fw-bold fs-5" onclick="agregarAlCarrito(${producto.id})" title="Agregar al carrito" style="line-height: 1;">
            +
            </button>
          </div>
          <span class="badge bg-light text-success border mb-1">${producto.etiqueta}</span>
          <span class="d-block text-muted small fw-semibold text-uppercase">${producto.categoria}</span>
          <a href="pages/producto.html" style="text-decoration:none; color:inherit;"><h6 class="fw-bold text-dark text-truncate mb-2" title="${producto.nombre}">${producto.nombre}</h6></a>
        </div>
        <div>
          <div class="d-flex align-items-baseline gap-2">
            <span class="fs-5 fw-bold text-primary">$${producto.precio.toFixed(2)}</span>
            <span class="small text-muted text-decoration-line-through">$${producto.precioOriginal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Filtrar Productos por categoría
function filtrarPorCategoria(categoria) {
  categoriaActual = categoria;
  renderizarCategoriasPildora();

  if (categoria === "Todos") {
    renderizarProductos(productos);
  } else {
    const filtrados = productos.filter(p => p.categoria === categoria);
    renderizarProductos(filtrados);
  }
}

// ==========================================
// LÓGICA DEL CARRITO CON SUMA Y RESTA (1 EN 1)
// ==========================================


// Cambiar cantidad uno por uno (Sumar +1 o Restar -1)
function cambiarCantidad(idProducto, delta) {
  let carrito = obtenerCarrito();
  const articulo = carrito.find(p => p.id == idProducto);
  if (!articulo) return;
  actualizarCantidad(idProducto, articulo.cantidad + delta);
  actualizarUICarrito();
}

// Quitar por completo el producto
function eliminarProducto(idProducto) {
  eliminarDelCarritoLocal(idProducto);
  actualizarUICarrito();
}

// Actualizar la vista del carrito
function actualizarUICarrito() {
  let carrito = typeof obtenerCarrito !== 'undefined' ? obtenerCarrito() : []; // desde global.js (fallback to [] if not defined)
  const contadorCarrito = document.querySelector(".contador-carrito");
  const listaItemsCarrito = document.getElementById("listaItemsCarrito");
  const totalCarrito = document.getElementById("totalCarrito");

  const totalArticulos = carrito.reduce((acc, articulo) => acc + articulo.cantidad, 0);
  const precioTotal = carrito.reduce((acc, articulo) => acc + (articulo.precio * articulo.cantidad), 0);

  if (contadorCarrito) contadorCarrito.textContent = totalArticulos;
  if (totalCarrito) totalCarrito.textContent = `$${precioTotal.toFixed(2)}`;

  if (!listaItemsCarrito) return;

  if (carrito.length === 0) {
    listaItemsCarrito.innerHTML = `<p class="text-center text-muted my-5">Tu carrito está vacío</p>`;
    return;
  }

  listaItemsCarrito.innerHTML = carrito.map(articulo => `
    <div class="d-flex align-items-center justify-content-between border-bottom py-3">
      <div class="me-2 flex-grow-1">
        <h6 class="mb-1 fw-bold small text-dark">${articulo.nombre}</h6>
        <div class="text-primary fw-bold small">$${articulo.precio.toFixed(2)} / c.u.</div>
      </div>
      
      <!-- CONTROLES PARA QUITAR Y SUMAR DE 1 EN 1 -->
      <div class="d-flex align-items-center gap-2">
        <div class="cart-qty-controls d-flex align-items-center border rounded-pill bg-light px-1">
          <button class="btn btn-sm text-secondary p-0 px-2 fw-bold" onclick="cambiarCantidad(${articulo.id}, -1)">–</button>
          <span class="px-2 fw-bold small">${articulo.cantidad}</span>
          <button class="btn btn-sm text-secondary p-0 px-2 fw-bold" onclick="cambiarCantidad(${articulo.id}, 1)">+</button>
        </div>

        <!-- Botón de basurero para eliminar de golpe -->
        <button class="btn btn-sm text-danger p-0 ms-1" onclick="eliminarProducto(${articulo.id})" title="Eliminar todo">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Escuchar búsquedas y botones
function configurarEventos() {
  const inputBusqueda = document.querySelector('input[type="search"]');
  const inputBusquedaMovil = document.getElementById("searchInputMobile");
  const botonBusquedaMovil = document.getElementById("mobileSearchBtn");
  const contenedorBusquedaMovil = document.getElementById("mobileSearchContainer");
  const botonRestablecerFiltro = document.getElementById("btnRestablecerFiltro");

  const manejarBusqueda = (e) => {
    const consulta = e.target.value.toLowerCase();
    const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(consulta) || p.categoria.toLowerCase().includes(consulta));
    renderizarProductos(filtrados);
  };

  if (inputBusqueda) inputBusqueda.addEventListener("input", manejarBusqueda);
  if (inputBusquedaMovil) inputBusquedaMovil.addEventListener("input", manejarBusqueda);

  if (botonBusquedaMovil && contenedorBusquedaMovil) {
    botonBusquedaMovil.addEventListener("click", () => {
      contenedorBusquedaMovil.classList.toggle("d-none");
    });
  }

  if (botonRestablecerFiltro) {
    botonRestablecerFiltro.addEventListener("click", () => filtrarPorCategoria("Todos"));
  }
  
}