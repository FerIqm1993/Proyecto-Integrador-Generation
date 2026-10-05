// navbar.js
document.addEventListener("DOMContentLoaded", () => {
  // Determinar si estamos en el index (raíz) o en alguna página dentro de /pages/
  const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('/pages/');
  const navbarPath = isRoot ? "pages/navbar.html" : "../pages/navbar.html";

  fetch(navbarPath)
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;
    })
    .catch(error => console.error("Error al cargar el navbar:", error));
});
