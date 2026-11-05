// Obtener el formulario y el espacio para mostrar mensajes
const formulario = document.getElementById("formularioRegistro");
const alertas = document.getElementById("alertas");

// Escuchar cuando el usuario envía el formulario
formulario.addEventListener("submit", function (evento) {

    // Evitar que la página se recargue al enviar el formulario
    evento.preventDefault();

    // Limpiar los mensajes de intentos anteriores 
    alertas.innerHTML = "";

    //Obtener los valores escritos en los campos
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar").value;

    // Obtener la casilla de términos y condiciones
    const terminos = formulario.querySelector('input[type="checkbox"]');

    // Crear un arreglo para almacenar los errores
    const errores = [];

    //Validar que ningún campo obligatorio esté vacío
    if (
        nombre === "" ||
        apellido === "" ||
        email === "" ||
        telefono === "" ||
        password === "" ||
        confirmar === ""
    ) {
        errores.push("Todos los campos son obligatorios.");
    }

    //-----validación de nombre y apellido-----

     if (nombre !== "" && nombre.length <= 3) {
        errores.push("El nombre debe tener más de 3 caracteres.");
    }
    if (apellido !== "" && apellido.length <= 3) {
        errores.push("El apellido debe tener más de 3 caracteres.");
    }
    


//-----CORREO-----
    //Validar el formato del correo electrónico
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email !== "" && !formatoEmail.test(email)) {
        errores.push("Ingresa un correo electrónico válido. Ejemplo: correo@dominio.com");
    }

//-----TELÉFONO-----
    //Limpiar espacios, guiones y paréntesis del teléfono
    // Esto permite validar los números aunque estén separados
    const telefonoLimpio = telefono.replace(/[\s()-]/g, "");
    
     if (telefonoLimpio.startsWith("0")) {
        errores.push("El teléfono no puede comenzar con 0.");
    }

    if (telefonoLimpio.startsWith("0")) {
        errores.push("El teléfono no puede comenzar con 0.");
    }

    // Comprobar que el teléfono tenga exactamente 10 dígitos
    if (telefono !== "" && !/^\d{10}$/.test(telefonoLimpio)) {
        errores.push("El teléfono debe contener exactamente 10 números.");
    }


    //Validar que no haya más de 3 números iguales consecutivos
    // La expresión detecta 4 o más números iguales seguidos
    if (/(.)\1{3,}/.test(telefonoLimpio)) {
        errores.push(
            "El teléfono no puede tener más de 3 números iguales consecutivos."
        );
    }

//-----CONTRASEÑA-----
    // Validar que la contraseña tenga al menos 8 caracteres
    if (password !== "" && password.length < 8) {
        errores.push("La contraseña debe tener al menos 8 caracteres.");
    }

    // Validar que contenga al menos una letra mayúscula
    if (password !== "" && !/[A-Z]/.test(password)) {
        errores.push("La contraseña debe contener al menos una letra mayúscula.");
    }

    // Validar que contenga al menos una letra minúscula
    if (password !== "" && !/[a-z]/.test(password)) {
        errores.push("La contraseña debe contener al menos una letra minúscula.");
    }

    // Validar que contenga al menos un número
    if (password !== "" && !/[0-9]/.test(password)) {
     errores.push("La contraseña debe contener al menos un número.");
    }


    // Comprobar que las dos contraseñas sean iguales
    if (password !== confirmar) {
        errores.push("Las contraseñas no coinciden.");
    }

//-----TERMINOS Y CONDICIONES-----
    // Comprobar que el usuario acepte los términos
    if (!terminos.checked) {
        errores.push("Debes aceptar los términos y condiciones.");
    }

    // Si hay errores, mostrarlos y detener el registro
    if (errores.length > 0) {

        // Crear una alerta roja de Bootstrap
        alertas.innerHTML = `
            <div class="alert alert-danger" role="alert">

                <strong>Revisa los siguientes datos:</strong>

                <ul class="mb-0">
                    ${errores.map(error => `<li>${error}</li>`).join("")}
                </ul>

            </div>
        `;

        // Detener la función para no crear el usuario
        return;
    }


    // Mostrar una alerta verde cuando todo sea válido
    alertas.innerHTML = `
        <div class="alert alert-success" role="alert">

            <strong>¡Registro validado!</strong>
            Los datos del usuario se han procesado correctamente.

        </div>
    `;

// ===== GUARDAR EL USUARIO EN LA BD =====
fetch("http://localhost:8080/api/usuarios", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        nombre: nombre,
        apellido: apellido,
        correo: email,
        telefono: telefonoLimpio,
        passwordHash: password,
        aceptaTerminos: true
    })
})
.then(async response => {

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    return response.json();
})
.then(data => {

    console.log("Usuario registrado:", data);

    alertas.innerHTML = `
        <div class="alert alert-success" role="alert">
            <strong>¡Registro exitoso!</strong>
        </div>
    `;

    formulario.reset();

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);

})
.catch(error => {

    console.error(error);

    alertas.innerHTML = `
        <div class="alert alert-danger" role="alert">
            Error al registrar usuario.
        </div>
    `;
});