// Validación del formulario de inicio de sesión
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    let errores = [];

    // Validar correo
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(correo)) {
      errores.push("Ingresa un correo electrónico válido.");
    }

    // Validar contraseña
    if (password.length < 8) {
      errores.push("La contraseña debe tener al menos 8 caracteres.");
    }

    if (errores.length > 0) {
      alert("Errores:\n- " + errores.join("\n- "));
    } else {
      alert("Inicio de sesión exitoso ✅");
      form.submit();
    }
  });
});
