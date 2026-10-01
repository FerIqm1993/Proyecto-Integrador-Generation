// Validación del formulario de registro
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Evita envío automático

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmar = document.getElementById("confirmar").value.trim();
    const checkbox = form.querySelector("input[type='checkbox']");

    let errores = [];

    // Validar email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      errores.push("Ingresa un correo electrónico válido.");
    }

    // Validar contraseña
    if (password.length < 8) {
      errores.push("La contraseña debe tener al menos 8 caracteres.");
    }

    // Confirmar contraseña
    if (password !== confirmar) {
      errores.push("Las contraseñas no coinciden.");
    }

    // Checkbox
    if (!checkbox.checked) {
      errores.push("Debes aceptar los términos de servicio.");
    }

    // Mostrar errores o enviar
    if (errores.length > 0) {
      alert("Errores:\n- " + errores.join("\n- "));
    } else {
      alert("Registro exitoso 🎉");
      form.submit(); // Aquí sí se envía el formulario
    }
  });
});
