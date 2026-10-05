// navbar.js
document.addEventListener("DOMContentLoaded", () => {
  fetch("../pages/navbar.html") // ajusta la ruta según tu estructura
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;
    })
    .catch(error => console.error("Error al cargar el navbar:", error));
});
