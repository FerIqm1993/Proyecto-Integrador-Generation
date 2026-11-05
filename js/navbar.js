// navbar.js - Carga dinámica del Navbar, estado de sesión (RBAC) y buscador global del catálogo
const CATALOGO_RESPALDO_NAV = [
  { id: 1, nombre: "Aceite vegetal 1L", descripcion: "Aceite vegetal de cocina botella 1L abarrotes", precio: 45.90, anterior: 65, cat: "alimentos", disp: true, img: "aceite.jpg" },
  { id: 2, nombre: "Leche entera 1L", descripcion: "Leche entera ultrapasteurizada 1L lacteos abarrotes", precio: 28.50, anterior: 34, cat: "alimentos", disp: true, img: "leche.jpg" },
  { id: 3, nombre: "Vino tinto 750ml", descripcion: "Vino tinto botella de 750ml licores", precio: 145, anterior: 180, cat: "cervezas", disp: true, img: "vino.jpg" },
  { id: 4, nombre: "Cerveza clara 6pk", descripcion: "Paquete de 6 cervezas claras", precio: 98, anterior: null, cat: "cervezas", disp: true, img: "cerveza.jpg" },
  { id: 5, nombre: "Detergente 3kg", descripcion: "Detergente en polvo multiusos 3kg limpieza", precio: 89, anterior: 120, cat: "hogar", disp: true, img: "detergente.jpg" },
  { id: 6, nombre: "Papel higiénico 12pk", descripcion: "Paquete de 12 rollos de papel higienico limpieza hogar", precio: 65, anterior: null, cat: "hogar", disp: true, img: "papel.jpg" },
  { id: 7, nombre: "Martillo de uña", descripcion: "Martillo de una uso domestico y profesional herramienta", precio: 129, anterior: null, cat: "ferreteria", disp: true, img: "martillo.jpg" },
  { id: 8, nombre: "Juego de desarmadores", descripcion: "Juego de desarmadores de precision herramienta", precio: 159, anterior: 179, cat: "ferreteria", disp: true, img: "desarmadores.jpg" },
  { id: 9, nombre: "Refresco 2L", descripcion: "Refresco sabor cola botella 2L bebidas", precio: 24, anterior: null, cat: "bebidas", disp: true, img: "refresco.jpg" },
  { id: 10, nombre: "Agua mineral 1.5L", descripcion: "Agua mineral natural botella 1.5L bebidas", precio: 12.50, anterior: null, cat: "bebidas", disp: true, img: "agua.jpg" },
  { id: 11, nombre: "Shampoo 750ml", descripcion: "Shampoo cuidado diario 750ml higiene personal", precio: 54.90, anterior: null, cat: "belleza", disp: true, img: "shampoo.jpg" },
  { id: 12, nombre: "Jabón 3pk", descripcion: "Paquete de 3 jabones de tocador limpieza higiene", precio: 42, anterior: null, cat: "belleza", disp: true, img: "jabon.jpg" },
  { id: 13, nombre: "Croquetas perro 2kg", descripcion: "Alimento balanceado para perro 2kg mascotas", precio: 189, anterior: 210, cat: "mascotas", disp: true, img: "croquetas.jpg" },
  { id: 14, nombre: "Arena para gato 4kg", descripcion: "Arena aglutinante para gato 4kg mascotas", precio: 115, anterior: null, cat: "mascotas", disp: true, img: "arena.jpg" }
];

const NOMBRES_CAT_NAV = {
  alimentos: "Alimentos",
  cervezas: "Cervezas, Vinos y Licores",
  hogar: "Hogar",
  ferreteria: "Ferretería",
  bebidas: "Bebidas",
  belleza: "Belleza y Cuidado Personal",
  mascotas: "Mascotas"
};

const SINONIMOS_CAT_NAV = {
  alimentos: "abarrotes despensa comida cocina lacteos leche aceite",
  cervezas: "vinos licores alcohol botella",
  hogar: "limpieza detergente papel bano casa",
  ferreteria: "herramientas martillo desarmadores reparacion",
  bebidas: "refresco agua jugos",
  belleza: "cuidado personal higiene shampoo jabon",
  mascotas: "perro gato croquetas arena alimento"
};

function normalizarBusquedaNav(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obtenerCatalogoParaBusqueda() {
  try {
    const guardados = JSON.parse(localStorage.getItem("tienda3v_productos") || "null");
    if (Array.isArray(guardados) && guardados.length > 0) {
      return guardados;
    }
  } catch (e) {
    // Usar respaldo
  }
  return CATALOGO_RESPALDO_NAV;
}

function obtenerRutaImagenNav(img, prefixRoot) {
  if (!img) return `${prefixRoot}img/productos/aceite.jpg`;
  if (img.startsWith("data:image/") || img.startsWith("http")) return img;
  const limpia = img.replace(/^\.\.\//, "").replace(/^img\/productos\//, "").replace(/^img\//, "");
  return `${prefixRoot}img/productos/${limpia}`;
}

function buscarProductosEnCatalogo(terminoRaw) {
  const termino = normalizarBusquedaNav(terminoRaw);
  if (!termino) return [];
  const palabras = termino.split(/\s+/).filter(Boolean);
  const catalogo = obtenerCatalogoParaBusqueda();

  return catalogo.filter(p => {
    const texto = normalizarBusquedaNav([
      p.nombre || "",
      p.descripcion || "",
      p.cat || "",
      NOMBRES_CAT_NAV[p.cat] || "",
      SINONIMOS_CAT_NAV[p.cat] || ""
    ].join(" "));
    return palabras.every(pal => texto.includes(pal));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const isRoot = window.location.pathname.endsWith("index.html")
    || window.location.pathname.endsWith("/")
    || !window.location.pathname.includes("/pages/");
  const navbarPath = isRoot ? "pages/navbar.html" : "../pages/navbar.html";
  const prefixPages = isRoot ? "pages/" : "";
  const prefixRoot = isRoot ? "" : "../";

  fetch(`${navbarPath}?v=20261104-3`)
    .then(response => response.text())
    .then(data => {
      if (isRoot) {
        data = data.replace(/\.\.\//g, "");
      }
      const contenedor = document.getElementById("navbar-container");
      if (!contenedor) return;
      contenedor.innerHTML = data;

      if (typeof actualizarContadorCarrito === "function") {
        actualizarContadorCarrito();
      }

      renderizarEstadoSesionNavbar(prefixPages, prefixRoot);
      configurarBuscadorGlobalNavbar(isRoot, prefixPages, prefixRoot);
    })
    .catch(error => console.error("Error al cargar el navbar:", error));
});

function renderizarEstadoSesionNavbar(prefixPages, prefixRoot) {
  let sesion = null;
  try {
    sesion = JSON.parse(localStorage.getItem("sesionActiva") || "null");
  } catch (e) {
    sesion = null;
  }

  const navActions = document.querySelector("#navbar-container .nav-actions");
  const btnMiCuenta = document.querySelector("#navbar-container .boton-micuenta");
  if (!navActions || !btnMiCuenta) return;

  if (!sesion || !sesion.email) {
    btnMiCuenta.setAttribute("title", "Iniciar sesión");
    return;
  }

  const esAdmin = sesion.rol === "admin";
  const nombreCompleto = String(sesion.nombre || "Mi Cuenta").trim();
  const primerNombre = nombreCompleto.split(" ")[0] || "Cuenta";

  const wrapper = document.createElement("div");
  wrapper.className = "dropdown";

  const badgeAdmin = esAdmin
    ? `<span class="badge bg-warning text-dark ms-1" style="font-size:0.68rem;">Admin</span>`
    : "";

  const linksAdmin = esAdmin
    ? `
      <li><hr class="dropdown-divider"></li>
      <li><h6 class="dropdown-header text-uppercase small text-primary fw-bold">Administración</h6></li>
      <li>
        <a class="dropdown-item fw-semibold" href="${prefixPages}admin-productos.html">
          <i class="bi bi-box-seam me-2 text-primary"></i>Productos y Cupones
        </a>
      </li>
      <li>
        <a class="dropdown-item fw-semibold" href="${prefixPages}perfil.html#seccion-admin">
          <i class="bi bi-shield-check me-2 text-primary"></i>Pedidos, Usuarios y Mensajes
        </a>
      </li>
    `
    : "";

  wrapper.innerHTML = `
    <button
      type="button"
      class="btn-usuario-logueado dropdown-toggle"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      title="Sesión iniciada como ${nombreCompleto}"
    >
      <i class="bi bi-person-check-fill"></i>
      <span class="nombre-corto-nav">${primerNombre}</span>
      ${badgeAdmin}
    </button>
    <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" style="min-width: 240px; border-radius: 14px;">
      <li class="px-3 py-2 border-bottom bg-light rounded-top">
        <div class="fw-bold text-dark text-truncate">${nombreCompleto}</div>
        <div class="small text-muted text-truncate">${sesion.email}</div>
      </li>
      <li class="mt-1">
        <a class="dropdown-item" href="${prefixPages}perfil.html">
          <i class="bi bi-person-vcard me-2 text-secondary"></i>Mi Perfil y Mis Pedidos
        </a>
      </li>
      ${linksAdmin}
      <li><hr class="dropdown-divider"></li>
      <li>
        <button type="button" class="dropdown-item text-danger fw-semibold" id="btnCerrarSesionNav">
          <i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión
        </button>
      </li>
    </ul>
  `;

  btnMiCuenta.replaceWith(wrapper);

  const btnCerrar = document.getElementById("btnCerrarSesionNav");
  if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
      localStorage.removeItem("sesionActiva");
      window.location.href = `${prefixRoot}index.html`;
    });
  }
}

function configurarBuscadorGlobalNavbar(isRoot, prefixPages, prefixRoot) {
  const formBuscador = document.getElementById("form-buscador");
  if (!formBuscador) return;

  const input = formBuscador.querySelector('input[type="search"]');
  if (!input) return;

  const enCategorias = window.location.pathname.includes("categorias.html");

  // Contenedor de resultados rápidos en el buscador
  const cajaSugerencias = document.createElement("div");
  cajaSugerencias.id = "sugerencias-buscador";
  cajaSugerencias.className = "sugerencias-buscador d-none";
  formBuscador.appendChild(cajaSugerencias);

  // Si venimos con ?q=... en la URL, rellenar el campo y disparar el filtro
  const params = new URLSearchParams(window.location.search);
  const queryUrl = params.get("q");
  if (queryUrl) {
    input.value = queryUrl;
    window.dispatchEvent(new CustomEvent("busquedaCatalogo", { detail: { termino: queryUrl } }));
  }

  function renderizarSugerencias(terminoRaw) {
    const termino = terminoRaw.trim();
    if (!termino) {
      cajaSugerencias.classList.add("d-none");
      cajaSugerencias.innerHTML = "";
      return;
    }

    const coincidencias = buscarProductosEnCatalogo(termino);
    if (coincidencias.length === 0) {
      cajaSugerencias.innerHTML = `
        <div class="p-3 text-center text-muted small">
          No se encontraron productos para "<strong>${termino}</strong>"
        </div>
      `;
      cajaSugerencias.classList.remove("d-none");
      return;
    }

    const primeros = coincidencias.slice(0, 6);
    cajaSugerencias.innerHTML = `
      <div class="sugerencias-lista">
        ${primeros.map(p => {
          const imgSrc = obtenerRutaImagenNav(p.img, prefixRoot);
          const catNombre = NOMBRES_CAT_NAV[p.cat] || p.cat || "";
          const urlDestino = `${prefixPages}categorias.html?q=${encodeURIComponent(p.nombre)}`;
          return `
            <a href="${urlDestino}" class="sugerencia-item" data-nombre="${p.nombre}">
              <img src="${imgSrc}" alt="${p.nombre}" class="sugerencia-img">
              <div class="sugerencia-info">
                <div class="sugerencia-nombre">${p.nombre}</div>
                <div class="sugerencia-cat">${catNombre}</div>
              </div>
              <div class="sugerencia-precio">$${Number(p.precio).toFixed(2)}</div>
            </a>
          `;
        }).join("")}
      </div>
      <button type="submit" class="sugerencia-ver-todos">
        Ver los ${coincidencias.length} resultados para "${termino}" &rarr;
      </button>
    `;
    cajaSugerencias.classList.remove("d-none");
  }

  input.addEventListener("input", () => {
    const termino = input.value;
    renderizarSugerencias(termino);
    if (isRoot || enCategorias) {
      window.dispatchEvent(new CustomEvent("busquedaCatalogo", { detail: { termino } }));
    }
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) {
      renderizarSugerencias(input.value);
    }
  });

  // Cerrar desplegable al hacer clic fuera del buscador
  document.addEventListener("click", e => {
    if (!formBuscador.contains(e.target)) {
      cajaSugerencias.classList.add("d-none");
    }
  });

  formBuscador.addEventListener("submit", e => {
    e.preventDefault();
    const termino = input.value.trim();
    cajaSugerencias.classList.add("d-none");

    if (enCategorias) {
      window.dispatchEvent(new CustomEvent("busquedaCatalogo", { detail: { termino } }));
      const grid = document.getElementById("productGrid");
      if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (isRoot) {
      window.dispatchEvent(new CustomEvent("busquedaCatalogo", { detail: { termino } }));
      const seccionOfertas = document.getElementById("ofertas");
      if (seccionOfertas) {
        seccionOfertas.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    // Desde cualquier otra página, llevar al catálogo filtrado con ?q=
    const destino = termino
      ? `${prefixPages}categorias.html?q=${encodeURIComponent(termino)}`
      : `${prefixPages}categorias.html`;
    window.location.href = destino;
  });
}
