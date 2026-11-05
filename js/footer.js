// footer.js
document.addEventListener("DOMContentLoaded", () => {
  const footerContainer = document.getElementById("footer-container");
  if (!footerContainer) return;

  // Determinar si estamos en el index (raíz) o en alguna página dentro de /pages/
  const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('/pages/');
  const footerPath = isRoot ? "pages/footer.html" : "../pages/footer.html";

  fetch(footerPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error cargando footer: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      // Si estamos en la raíz, limpiamos los "subir un nivel" de las rutas
      if (isRoot) {
        data = data.replace(/\.\.\//g, "");
      }
      footerContainer.innerHTML = data;
    })
    .catch(error => console.error("Error al cargar el footer:", error));
});
