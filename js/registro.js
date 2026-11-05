// Obtener el formulario y el espacio para mostrar mensajes
const formulario = document.getElementById("formularioRegistro");
const alertas = document.getElementById("alertas");
const URL_API_REGISTRO = window.API_BASE_URL || "http://localhost:8080/api";

// Escuchar cuando el usuario envía el formulario
formulario.addEventListener("submit", async function (evento) {

    // Evitar que la página se recargue al enviar el formulario
    evento.preventDefault();

    // Limpiar los mensajes de intentos anteriores 
    alertas.innerHTML = "";

    // Obtener los valores escritos en los campos
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

    // Validar que ningún campo obligatorio esté vacío
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
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== "" && !formatoEmail.test(email)) {
        errores.push("Ingresa un correo electrónico válido. Ejemplo: correo@dominio.com");
    }

    //-----TELÉFONO-----
    const telefonoLimpio = telefono.replace(/[\s()-]/g, "");
    if (telefonoLimpio.startsWith("0")) {
        errores.push("El teléfono no puede comenzar con 0.");
    }
    if (telefono !== "" && !/^\d{10}$/.test(telefonoLimpio)) {
        errores.push("El teléfono debe contener exactamente 10 números.");
    }
    if (/(.)\1{3,}/.test(telefonoLimpio)) {
        errores.push(
            "El teléfono no puede tener más de 3 números iguales consecutivos."
        );
    }

    //-----CONTRASEÑA-----
    if (password !== "" && password.length < 8) {
        errores.push("La contraseña debe tener al menos 8 caracteres.");
    }
    if (password !== "" && !/[A-Z]/.test(password)) {
        errores.push("La contraseña debe contener al menos una letra mayúscula.");
    }
    if (password !== "" && !/[a-z]/.test(password)) {
        errores.push("La contraseña debe contener al menos una letra minúscula.");
    }
    if (password !== "" && !/[0-9]/.test(password)) {
        errores.push("La contraseña debe contener al menos un número.");
    }
    if (password !== confirmar) {
        errores.push("Las contraseñas no coinciden.");
    }

    //-----TÉRMINOS Y CONDICIONES-----
    if (!terminos.checked) {
        errores.push("Debes aceptar los términos y condiciones.");
    }

    // Si hay errores, mostrarlos y detener el registro
    if (errores.length > 0) {
        alertas.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <strong>Revisa los siguientes datos:</strong>
                <ul class="mb-0">
                    ${errores.map(error => `<li>${error}</li>`).join("")}
                </ul>
            </div>
        `;
        return;
    }

    // ===== REGISTRAR EN EL BACKEND API (Spring Boot + MySQL con encriptación BCrypt) =====
    let guardadoEnServidor = false;
    try {
        const resp = await fetch(`${URL_API_REGISTRO}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                rol: { id: 1 },
                nombre: nombre,
                apellido: apellido,
                correo: email.toLowerCase(),
                telefono: telefonoLimpio,
                passwordHash: password,
                aceptaTerminos: true,
                activo: true
            })
        });

        if (resp.status === 409) {
            alertas.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <strong>Este correo ya está registrado.</strong>
                    <a href="login.html" class="alert-link">Inicia sesión aquí</a>.
                </div>
            `;
            return;
        }

        if (!resp.ok) {
            throw new Error(`Error HTTP ${resp.status}`);
        }
        guardadoEnServidor = true;
    } catch (err) {
        console.warn("Guardando usuario en localStorage (API no disponible):", err.message);
    }

    // ===== GUARDAR EL USUARIO EN LOCALSTORAGE SOLO SI LA API NO ESTÁ DISPONIBLE =====
    if (!guardadoEnServidor) {
        let usuariosGuardados = JSON.parse(localStorage.getItem('usuarios') || '[]');
        let correoYaExiste = usuariosGuardados.some(u => u.email.toLowerCase() === email.toLowerCase());

        if (correoYaExiste) {
            alertas.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <strong>Este correo ya está registrado.</strong>
                    <a href="login.html" class="alert-link">Inicia sesión aquí</a>.
                </div>
            `;
            return;
        }

        let nuevoUsuario = {
            nombre: nombre + " " + apellido,
            email: email.toLowerCase(),
            telefono: telefonoLimpio,
            contrasena: btoa(password)
        };
        usuariosGuardados.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuariosGuardados));
    }

    alertas.innerHTML = `
        <div class="alert alert-success" role="alert">
            <strong>¡Registro exitoso!</strong>
            Tu cuenta ha sido creada correctamente. Redirigiendo al inicio de sesión...
        </div>
    `;

    formulario.reset();

    setTimeout(function () {
        window.location.href = "login.html";
    }, 1500);
});
