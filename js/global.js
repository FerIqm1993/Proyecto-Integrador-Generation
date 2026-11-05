// ==========================================
// CONFIGURACIÓN Y UTILIDADES GLOBALES (API + CARRITO + SESIÓN JWT)
// ==========================================

window.API_BASE_URL = (typeof CONFIG !== "undefined" && CONFIG.API_BASE_URL)
  ? CONFIG.API_BASE_URL
  : "http://localhost:8080/api";

// ==========================================
// GESTIÓN DE SESIÓN, JWT Y ROLES
// ==========================================

function obtenerSesionActiva() {
  try {
    const raw = localStorage.getItem("sesionActiva");
    if (!raw) return null;
    const sesion = JSON.parse(raw);
    return sesion && typeof sesion === "object" && sesion.email ? sesion : null;
  } catch (e) {
    return null;
  }
}

function esAdminSesion() {
  const sesion = obtenerSesionActiva();
  return Boolean(sesion && sesion.rol === "admin");
}

function obtenerHeadersAdmin() {
  const sesion = obtenerSesionActiva();
  const headers = { "Content-Type": "application/json" };
  if (sesion) {
    if (sesion.token) {
      headers["Authorization"] = `Bearer ${sesion.token}`;
    }
    if (sesion.id != null) {
      headers["X-Usuario-Id"] = String(sesion.id);
    }
    if (sesion.rol) {
      headers["X-Usuario-Rol"] = String(sesion.rol);
    }
  }
  return headers;
}

function cerrarSesionUsuario() {
  localStorage.removeItem("sesionActiva");
  const isRoot = window.location.pathname.endsWith("index.html")
    || window.location.pathname.endsWith("/")
    || !window.location.pathname.includes("/pages/");
  window.location.href = isRoot ? "index.html" : "../index.html";
}

// ==========================================
// MAPEO DE CATEGORÍAS Y PRODUCTOS
// ==========================================

const MAPA_ID_A_CAT = {
  1: "alimentos",
  2: "cervezas",
  3: "hogar",
  4: "ferreteria",
  5: "bebidas",
  6: "belleza",
  7: "mascotas"
};

const MAPA_SLUG_A_CAT = {
  "alimentos": "alimentos",
  "cervezas-vinos-licores": "cervezas",
  "cervezas": "cervezas",
  "hogar": "hogar",
  "ferreteria": "ferreteria",
  "bebidas": "bebidas",
  "belleza-cuidado-personal": "belleza",
  "belleza": "belleza",
  "mascotas": "mascotas"
};

const MAPA_CAT_A_ID = {
  alimentos: 1,
  cervezas: 2,
  hogar: 3,
  ferreteria: 4,
  bebidas: 5,
  belleza: 6,
  mascotas: 7
};

function obtenerClaveCategoriaDesdeApi(categoriaObj) {
  if (!categoriaObj) return "alimentos";
  if (categoriaObj.slug && MAPA_SLUG_A_CAT[categoriaObj.slug.toLowerCase()]) {
    return MAPA_SLUG_A_CAT[categoriaObj.slug.toLowerCase()];
  }
  if (categoriaObj.idCategoria && MAPA_ID_A_CAT[categoriaObj.idCategoria]) {
    return MAPA_ID_A_CAT[categoriaObj.idCategoria];
  }
  return "alimentos";
}

function obtenerIdCategoriaPorClave(claveCat) {
  if (!claveCat) return 1;
  const clave = String(claveCat).toLowerCase().trim();
  return MAPA_CAT_A_ID[clave] || 1;
}

function mapearProductoApiAFrontend(p) {
  const precio = Number(p.precio ?? 0);
  const anteriorRaw = p.precioAnterior != null ? Number(p.precioAnterior) : null;
  const anterior = anteriorRaw != null && anteriorRaw > precio ? anteriorRaw : null;
  return {
    id: Number(p.idProducto ?? p.id),
    nombre: p.nombreProducto ?? p.nombre ?? "",
    descripcion: p.descripcionProducto ?? p.descripcion ?? "",
    precio,
    anterior,
    cat: p.categoria ? obtenerClaveCategoriaDesdeApi(p.categoria) : (p.cat || "alimentos"),
    disp: p.activo !== undefined ? Boolean(p.activo) : Boolean(p.disp ?? true),
    img: p.imagenUrl || p.img || "aceite.jpg"
  };
}

function mapearProductoFrontendAApi(prod) {
  const precio = Number(prod.precio);
  const anteriorVal = prod.anterior != null && prod.anterior !== "" ? Number(prod.anterior) : null;
  const precioAnterior = anteriorVal != null && anteriorVal > precio ? anteriorVal : null;
  return {
    categoria: { idCategoria: obtenerIdCategoriaPorClave(prod.cat) },
    nombreProducto: prod.nombre,
    descripcionProducto: prod.descripcion || prod.nombre,
    precio,
    precioAnterior,
    imagenUrl: prod.img || "aceite.jpg",
    activo: Boolean(prod.disp)
  };
}

async function sincronizarProductosDesdeApi() {
  try {
    const resp = await fetch(`${window.API_BASE_URL}/productos`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const datosApi = await resp.json();
    if (Array.isArray(datosApi)) {
      const mapeados = datosApi.map(mapearProductoApiAFrontend);
      localStorage.setItem("tienda3v_productos", JSON.stringify(mapeados));
      return mapeados;
    }
  } catch (err) {
    console.warn("Usando catálogo en localStorage (API no disponible):", err.message);
  }
  return null;
}

// ==========================================
// CARRITO DE COMPRAS
// ==========================================

function actualizarContadorCarrito() {
  const contador = document.querySelector(".contador-carrito");
  if (!contador) return;

  const totalArticulos = obtenerCarrito().reduce((total, articulo) => total + articulo.cantidad, 0);
  contador.textContent = totalArticulos;
  contador.hidden = totalArticulos === 0;
  const etiqueta = `${totalArticulos} ${totalArticulos === 1 ? "producto" : "productos"} en el carrito`;
  const botonCarrito = contador.closest(".btn-carrito");
  if (botonCarrito) botonCarrito.setAttribute("aria-label", etiqueta);
}

function notificarCambioCarrito() {
  actualizarContadorCarrito();
  window.dispatchEvent(new Event("carritoActualizado"));
}

window.addEventListener("storage", event => {
  if (event.key === "carrito" || event.key === null) {
    actualizarContadorCarrito();
  }
});

window.addEventListener("carritoActualizado", actualizarContadorCarrito);

function obtenerCarrito() {
  const carritoGuardado = localStorage.getItem('carrito');
  if (!carritoGuardado) return [];

  const carrito = JSON.parse(carritoGuardado);
  if (!Array.isArray(carrito)) {
    throw new TypeError('El carrito guardado debe ser una lista de productos.');
  }

  const carritoNormalizado = carrito.map(articulo => {
    const nombre = articulo.nombre ?? articulo.name;
    const precio = Number(articulo.precio ?? articulo.price);
    const cantidadGuardada = articulo.cantidad ?? articulo.quantity;
    const cantidad = Number(cantidadGuardada);

    return {
      ...articulo,
      nombre,
      precio,
      cantidad: Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1
    };
  });

  if (JSON.stringify(carritoNormalizado) !== carritoGuardado) {
    localStorage.setItem('carrito', JSON.stringify(carritoNormalizado));
  }

  return carritoNormalizado;
}

function agregarProductoAlCarrito(articulo) {
  let carrito = obtenerCarrito();
  const existente = carrito.find(p => p.id === articulo.id);
  if (existente) {
    existente.cantidad += articulo.cantidad;
  } else {
    carrito.push(articulo);
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  notificarCambioCarrito();
}

function actualizarCantidad(idProducto, cantidad) {
  let carrito = obtenerCarrito();
  const articulo = carrito.find(p => String(p.id) === String(idProducto));
  if (articulo) {
    articulo.cantidad = cantidad;
    if (articulo.cantidad <= 0) {
      carrito = carrito.filter(p => p.id !== idProducto);
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    notificarCambioCarrito();
  }
}

function eliminarDelCarritoLocal(idProducto) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(p => String(p.id) !== String(idProducto));
  localStorage.setItem('carrito', JSON.stringify(carrito));
  notificarCambioCarrito();
}
