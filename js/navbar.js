// navbar.js
document.addEventListener("DOMContentLoaded", () => {
  // Determinar si estamos en el index (raíz) o en alguna página dentro de /pages/
  const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('/pages/');
  const navbarPath = isRoot ? "pages/navbar.html" : "../pages/navbar.html";

  fetch(`${navbarPath}?v=20261023-1`)
    .then(response => response.text())
    .then(data => {
      // Si estamos en la raíz, limpiamos los "subir un nivel" de las rutas
      if (isRoot) {
        data = data.replace(/\.\.\//g, "");
      }
      document.getElementById("navbar-container").innerHTML = data;
      if (typeof actualizarContadorCarrito === "function") {
        actualizarContadorCarrito();
      }
    })
    .catch(error => console.error("Error al cargar el navbar:", error));
});
