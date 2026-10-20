// ORDEN DE CATEGORÍAS
const CATEGORIAS = {
  alimentos: "Alimentos",
  cervezas: "Cervezas, Vinos y Licores",
  hogar: "Hogar",
  ferreteria: "Ferretería",
  bebidas: "Bebidas",
  belleza: "Belleza y Cuidado Personal",
  mascotas: "Mascotas"
};

const categoriasOrdenadas = [
  "Hogar",
  "Cervezas, Vinos y Licores",
  "Ferretería",
  "Mascotas",
  "Alimentos",
  "Bebidas",
  "Belleza y Cuidado Personal"
];

// PRODUCTOS HOMOLOGADOS CON EL CATÁLOGO
const productos = [
  { id: 1,  nombre: "Aceite vegetal 1L",    precio: 45.90, anterior: 65,   cat: "alimentos",   disp: true, img: "aceite.jpg" },
  { id: 2,  nombre: "Leche entera 1L",      precio: 28.50, anterior: 34,   cat: "alimentos",   disp: true, img: "leche.jpg" },
  { id: 3,  nombre: "Vino tinto 750ml",     precio: 145,   anterior: 180,  cat: "cervezas",    disp: true, img: "vino.jpg" },
  { id: 4,  nombre: "Cerveza clara 6pk",    precio: 98,    anterior: null, cat: "cervezas",    disp: true, img: "cerveza.jpg" },
  { id: 5,  nombre: "Detergente 3kg",       precio: 89,    anterior: 120,  cat: "hogar",       disp: true, img: "detergente.jpg" },
  { id: 6,  nombre: "Papel higiénico 12pk", precio: 65,    anterior: null, cat: "hogar",       disp: true, img: "papel.jpg" },
  { id: 7,  nombre: "Martillo de uña",      precio: 129,   anterior: null, cat: "ferreteria",  disp: true, img: "martillo.jpg" },
  { id: 8,  nombre: "Juego de desarmadores",precio: 159,   anterior: 179,  cat: "ferreteria",  disp: true, img: "desarmadores.jpg" },
  { id: 9,  nombre: "Refresco 2L",          precio: 24,    anterior: null, cat: "bebidas",     disp: true, img: "refresco.jpg" },
  { id: 10, nombre: "Agua mineral 1.5L",   precio: 12.50, anterior: null, cat: "bebidas",     disp: true, img: "agua.jpg" },
  { id: 11, nombre: "Shampoo 750ml",       precio: 54.90, anterior: null, cat: "belleza",     disp: true, img: "shampoo.jpg" },
  { id: 12, nombre: "Jabón 3pk",           precio: 42,    anterior: null, cat: "belleza",     disp: true, img: "jabon.jpg" },
  { id: 13, nombre: "Croquetas perro 2kg", precio: 189,   anterior: 210,  cat: "mascotas",    disp: true, img: "croquetas.jpg" },
  { id: 14, nombre: "Arena para gato 4kg", precio: 115,   anterior: null, cat: "mascotas",    disp: true, img: "arena.jpg" }
];

let categoriaActual = "Todos";

// Inicializar Aplicación
document.addEventListener("DOMContentLoaded", () => {
  renderizarCategoriasHeader();
  renderizarCategoriasPildora();
  renderizarProductos(productos);
  configurarEventos();
  actualizarUICarrito();
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

// Renderizar tarjetas de productos adaptadas al nuevo array
function renderizarProductos(articulos) {
  const contenedor = document.getElementById("cuadriculaProductos");
  if (!contenedor) return;

  if (articulos.length === 0) {
    contenedor.innerHTML = `<div class="col-12 text-center py-5"><p class="fs-5 text-muted">No se encontraron productos en esta categoría.</p></div>`;
    return;
  }

  contenedor.innerHTML = articulos.map(producto => {
    const nombreCat = CATEGORIAS[producto.cat] || producto.categoria || producto.cat || "General";
    const rutaImagen = producto.img 
      ? (producto.img.startsWith('http') || producto.img.startsWith('img/') ? producto.img : `img/productos/${producto.img}`)
      : (producto.imagen || 'img/productos/producto.img.png');
    
    // Etiqueta de oferta o disponibilidad
    let etiquetaBadge = '';
    if (producto.anterior && producto.anterior > producto.precio) {
      etiquetaBadge = `<span class="badge bg-danger text-white border mb-1">Oferta</span>`;
    } else if (producto.disp === false) {
      etiquetaBadge = `<span class="badge bg-light text-danger border mb-1">Agotado</span>`;
    } else {
      etiquetaBadge = `<span class="badge bg-light text-success border mb-1">${producto.etiqueta || "Disponible"}</span>`;
    }

    // Precio anterior tachado si aplica
    const precioTachado = (producto.anterior || producto.precioOriginal)
      ? `<span class="small text-muted text-decoration-line-through ms-2">$${Number(producto.anterior || producto.precioOriginal).toFixed(2)}</span>`
      : '';

    return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="product-card d-flex flex-column justify-content-between p-3">
        <div>
          <div class="product-img-wrapper mb-2">
            <a href="pages/categorias.html">
              <img class="product-img" src="${rutaImagen}" alt="${producto.nombre}" loading="lazy" style="object-fit: contain;">
            </a>
            <button class="btn-add-cart d-flex align-items-center justify-content-center text-white fw-bold fs-5" onclick="agregarAlCarrito(${producto.id})" title="Agregar al carrito" style="line-height: 1;">
              +
            </button>
          </div>
          ${etiquetaBadge}
          <span class="d-block text-muted small fw-semibold text-uppercase">${nombreCat}</span>
          <a href="pages/categorias.html" style="text-decoration:none; color:inherit;">
            <h6 class="fw-bold text-dark text-truncate mb-2" title="${producto.nombre}">${producto.nombre}</h6>
          </a>
        </div>
        <div>
          <div class="d-flex align-items-baseline">
            <span class="fs-5 fw-bold text-primary">$${Number(producto.precio).toFixed(2)}</span>
            ${precioTachado}
          </div>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

// Filtrar Productos por categoría (soporta tanto nombre completo como clave interna)
function filtrarPorCategoria(categoria) {
  categoriaActual = categoria;
  renderizarCategoriasPildora();

  if (categoria === "Todos") {
    renderizarProductos(productos);
  } else {
    const catBuscada = categoria.toLowerCase();
    const filtrados = productos.filter(p => {
      const catNombre = (CATEGORIAS[p.cat] || p.categoria || p.cat || "").toLowerCase();
      const catClave = (p.cat || "").toLowerCase();
      return catNombre === catBuscada || catClave === catBuscada;
    });
    renderizarProductos(filtrados);
  }
}

// Agregar producto al carrito desde la cuadrícula de inicio
function agregarAlCarrito(idProducto) {
  const prod = productos.find(p => p.id === idProducto);
  if (!prod) return;

  const rutaImagen = prod.img 
    ? (prod.img.startsWith('http') || prod.img.startsWith('img/') ? prod.img : `img/productos/${prod.img}`)
    : (prod.imagen || '');

  if (typeof agregarProductoAlCarrito === "function") {
    agregarProductoAlCarrito({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      img: rutaImagen,
      cantidad: 1
    });
    
    actualizarUICarrito();

    // Abrir canvas lateral del carrito para retroalimentación visual
    const canvasEl = document.getElementById("canvasCarrito");
    if (canvasEl && typeof bootstrap !== "undefined") {
      const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(canvasEl);
      bsOffcanvas.show();
    }
  }
}

// ==========================================
// LÓGICA DEL CARRITO CON SUMA Y RESTA (1 EN 1)
// ==========================================

// Cambiar cantidad uno por uno (Sumar +1 o Restar -1)
function cambiarCantidad(idProducto, delta) {
  let carrito = typeof obtenerCarrito !== 'undefined' ? obtenerCarrito() : [];
  const articulo = carrito.find(p => p.id == idProducto);
  if (!articulo) return;
  actualizarCantidad(idProducto, articulo.cantidad + delta);
  actualizarUICarrito();
}

// Quitar por completo el producto
function eliminarProducto(idProducto) {
  if (typeof eliminarDelCarritoLocal === 'function') {
    eliminarDelCarritoLocal(idProducto);
  }
  actualizarUICarrito();
}

// Actualizar la vista del carrito
function actualizarUICarrito() {
  let carrito = typeof obtenerCarrito !== 'undefined' ? obtenerCarrito() : [];
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

        <!-- Botón para eliminar de golpe -->
        <button class="btn btn-sm text-danger p-0 ms-1" onclick="eliminarProducto(${articulo.id})" title="Eliminar todo">
          <i class="bi bi-trash"></i>
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
    const consulta = e.target.value.toLowerCase().trim();
    const filtrados = productos.filter(p => {
      const nombre = (p.nombre || "").toLowerCase();
      const cat = (CATEGORIAS[p.cat] || p.categoria || p.cat || "").toLowerCase();
      return nombre.includes(consulta) || cat.includes(consulta);
    });
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