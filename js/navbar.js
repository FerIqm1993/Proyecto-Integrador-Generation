// navbar.js - Carga dinámica del Navbar, estado de sesión (RBAC) y buscador global
document.addEventListener("DOMContentLoaded", () => {
  const isRoot = window.location.pathname.endsWith("index.html")
    || window.location.pathname.endsWith("/")
    || !window.location.pathname.includes("/pages/");
  const navbarPath = isRoot ? "pages/navbar.html" : "../pages/navbar.html";
  const prefixPages = isRoot ? "pages/" : "";
  const prefixRoot = isRoot ? "" : "../";

  fetch(`${navbarPath}?v=20261104-2`)
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
      configurarBuscadorGlobalNavbar(isRoot, prefixRoot);
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

function configurarBuscadorGlobalNavbar(isRoot, prefixRoot) {
  const formBuscador = document.getElementById("form-buscador");
  if (!formBuscador) return;

  const input = formBuscador.querySelector('input[type="search"]');
  if (!input) return;

  // Si venimos redirigidos con ?q=... en index.html, rellenar el buscador
  const params = new URLSearchParams(window.location.search);
  const queryUrl = params.get("q");
  if (isRoot && queryUrl) {
    input.value = queryUrl;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  formBuscador.addEventListener("submit", e => {
    e.preventDefault();
    const termino = input.value.trim();
    if (isRoot) {
      input.dispatchEvent(new Event("input", { bubbles: true }));
      const seccionOfertas = document.getElementById("ofertas");
      if (seccionOfertas) {
        seccionOfertas.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      const destino = termino
        ? `${prefixRoot}index.html?q=${encodeURIComponent(termino)}#ofertas`
        : `${prefixRoot}index.html#ofertas`;
      window.location.href = destino;
    }
  });
}
