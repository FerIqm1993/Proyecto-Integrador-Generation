// login.js - Autenticación segura contra Spring Boot API + MySQL (sin contraseñas expuestas en cliente)
const CORREO_ADMIN_SISTEMA = "contacto.tiendas3v@gmail.com";
const URL_API_LOGIN = window.API_BASE_URL || "http://localhost:8080/api";

// Limpiar cualquier contraseña de administrador heredada en localStorage por versiones anteriores
(function limpiarCredencialesHeredadas() {
    try {
        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        if (Array.isArray(usuarios) && usuarios.some(u => u.email === CORREO_ADMIN_SISTEMA)) {
            const filtrados = usuarios.filter(u => u.email !== CORREO_ADMIN_SISTEMA);
            localStorage.setItem("usuarios", JSON.stringify(filtrados));
        }
    } catch (e) {
        // Ignorar errores de parseo
    }
})();

// Valido formato de correo
function validarCorreo(correo) {
    let formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return formato.test(correo);
}

// Función principal de inicio de sesión
async function iniciarSesion() {
    document.getElementById('mensaje').innerHTML = "";

    let correo = document.getElementById('correo').value.trim().toLowerCase();
    let contrasena = document.getElementById('contrasena').value;

    if (correo === "" || contrasena === "") {
        document.getElementById('mensaje').innerHTML =
            '<div class="alert alert-danger">Llena todos los campos.</div>';
        return;
    }

    if (!validarCorreo(correo)) {
        document.getElementById('mensaje').innerHTML =
            '<div class="alert alert-danger">Escribe un correo válido.</div>';
        return;
    }

    // 1. Autenticar contra el Backend API (Spring Boot + MySQL con SHA-256)
    try {
        const resp = await fetch(`${URL_API_LOGIN}/usuarios/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                correo: correo,
                passwordHash: contrasena
            })
        });

        if (resp.status === 404) {
            document.getElementById('mensaje').innerHTML =
                '<div class="alert alert-warning">Este correo no está registrado. <a href="registro.html" class="alert-link">Regístrate aquí</a>.</div>';
            return;
        }

        if (resp.status === 401) {
            document.getElementById('mensaje').innerHTML =
                '<div class="alert alert-danger">Contraseña incorrecta.</div>';
            document.getElementById('contrasena').value = "";
            return;
        }

        if (resp.ok) {
            const usuarioApi = await resp.json();
            const esAdmin = Boolean(usuarioApi.rol && usuarioApi.rol.nombre === "administrador");
            const nombreCompleto = `${usuarioApi.nombre || ""} ${usuarioApi.apellido || ""}`.trim();

            let sesion = {
                id: usuarioApi.id,
                email: usuarioApi.correo,
                nombre: nombreCompleto,
                nombreSolo: usuarioApi.nombre || "",
                apellidoSolo: usuarioApi.apellido || "",
                telefono: usuarioApi.telefono || "",
                rol: esAdmin ? "admin" : "usuario"
            };
            localStorage.setItem('sesionActiva', JSON.stringify(sesion));

            document.getElementById('mensaje').innerHTML =
                '<div class="alert alert-success">' +
                '<strong>¡Bienvenido, ' + nombreCompleto + '!</strong><br>' +
                'Redirigiendo...' +
                '</div>';

            setTimeout(function () {
                if (esAdmin) {
                    window.location.href = "admin-productos.html";
                } else {
                    window.location.href = "perfil.html";
                }
            }, 1200);
            return;
        }
    } catch (err) {
        console.warn("Autenticando con respaldo local (API no disponible):", err.message);
    }

    // 2. Respaldo en localStorage únicamente para clientes registrados en modo sin conexión
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    let contrasenaCodificada = btoa(contrasena);

    let correoEncontrado = null;
    let contrasenaCorrecta = false;

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email.toLowerCase() === correo) {
            correoEncontrado = usuarios[i];
            if (usuarios[i].contrasena === contrasenaCodificada) {
                contrasenaCorrecta = true;
            }
        }
    }

    if (correoEncontrado == null) {
        document.getElementById('mensaje').innerHTML =
            '<div class="alert alert-warning">No se pudo conectar con el servidor o el correo no está registrado. <a href="registro.html" class="alert-link">Regístrate aquí</a>.</div>';
        return;
    }

    if (!contrasenaCorrecta) {
        document.getElementById('mensaje').innerHTML =
            '<div class="alert alert-danger">Contraseña incorrecta.</div>';
        document.getElementById('contrasena').value = "";
        return;
    }

    let sesion = {
        email: correoEncontrado.email,
        nombre: correoEncontrado.nombre,
        telefono: correoEncontrado.telefono || "",
        rol: "usuario"
    };
    localStorage.setItem('sesionActiva', JSON.stringify(sesion));

    document.getElementById('mensaje').innerHTML =
        '<div class="alert alert-success">' +
        '<strong>¡Bienvenido, ' + correoEncontrado.nombre + '!</strong><br>' +
        'Redirigiendo...' +
        '</div>';

    setTimeout(function () {
        window.location.href = "perfil.html";
    }, 1200);
}

// Conecto el botón
document.getElementById('botonEntrar').addEventListener('click', iniciarSesion);

// También con Enter
document.getElementById('contrasena').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        iniciarSesion();
    }
});
