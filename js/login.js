// correo admin
const CORREO_ADMIN = "contacto.tiendas3v@gmail.com";
const CONTRASENA_ADMIN = "Pollitosenfuga3";
const URL_API_LOGIN = window.API_BASE_URL || "http://localhost:8080/api";

function crearAdminAutomatico() {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    let existe = false;
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === CORREO_ADMIN) {
            existe = true;
            break;
        }
    }
    
    if (!existe) {
        let admin = {
            nombre: "Administrador Tienda 3V",
            email: CORREO_ADMIN,
            telefono: "5500000000",
            contrasena: btoa(CONTRASENA_ADMIN),
            rol: "admin"
        };
        usuarios.push(admin);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
}

crearAdminAutomatico();

// valido formato de correo
function validarCorreo(correo) {
    let formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return formato.test(correo);
}

// funcion principal
async function iniciarSesion() {
    document.getElementById('mensaje').innerHTML = "";
    
    let correo = document.getElementById('correo').value.trim().toLowerCase();
    let contrasena = document.getElementById('contrasena').value;
    
    if (correo == "" || contrasena == "") {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-danger">Llena todos los campos.</div>';
        return;
    }
    
    if (!validarCorreo(correo)) {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-danger">Escribe un correo válido.</div>';
        return;
    }

    // 1. Intentar autenticar contra el Backend API (Spring Boot + MySQL)
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
            const esAdmin = (usuarioApi.rol && usuarioApi.rol.nombre === "administrador") || usuarioApi.correo === CORREO_ADMIN;
            const nombreCompleto = `${usuarioApi.nombre || ""} ${usuarioApi.apellido || ""}`.trim();

            let sesion = {
                id: usuarioApi.id,
                email: usuarioApi.correo,
                nombre: nombreCompleto,
                telefono: usuarioApi.telefono,
                rol: esAdmin ? "admin" : "usuario"
            };
            localStorage.setItem('sesionActiva', JSON.stringify(sesion));

            document.getElementById('mensaje').innerHTML = 
                '<div class="alert alert-success">' +
                '<strong>¡Bienvenido, ' + nombreCompleto + '!</strong><br>' +
                'Redirigiendo...' +
                '</div>';

            setTimeout(function() {
                if (esAdmin) {
                    window.location.href = "admin-productos.html";
                } else {
                    window.location.href = "../index.html";
                }
            }, 1500);
            return;
        }
    } catch (err) {
        console.warn("Autenticando con localStorage (API no disponible):", err.message);
    }
    
    // 2. Respaldo en localStorage si la API está apagada
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    let contrasenaCodificada = btoa(contrasena);
    
    let correoEncontrado = null;
    let contrasenaCorrecta = false;
    
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email.toLowerCase() == correo) {
            correoEncontrado = usuarios[i];
            if (usuarios[i].contrasena == contrasenaCodificada) {
                contrasenaCorrecta = true;
            }
        }
    }
    
    if (correoEncontrado == null) {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-warning">Este correo no está registrado. <a href="registro.html" class="alert-link">Regístrate aquí</a>.</div>';
        return;
    }
    
    if (!contrasenaCorrecta) {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-danger">Contraseña incorrecta.</div>';
        document.getElementById('contrasena').value = "";
        return;
    }
    
    let esAdmin = correoEncontrado.email === CORREO_ADMIN;
    
    let sesion = {
        email: correoEncontrado.email,
        nombre: correoEncontrado.nombre,
        telefono: correoEncontrado.telefono || "5500000000",
        rol: esAdmin ? "admin" : "usuario"
    };
    localStorage.setItem('sesionActiva', JSON.stringify(sesion));
    
    document.getElementById('mensaje').innerHTML = 
        '<div class="alert alert-success">' +
        '<strong>¡Bienvenido, ' + correoEncontrado.nombre + '!</strong><br>' +
        'Redirigiendo...' +
        '</div>';
    
    setTimeout(function() {
        if (esAdmin) {
            window.location.href = "admin-productos.html";
        } else {
            window.location.href = "../index.html";
        }
    }, 1500);
}

// conecto el boton
document.getElementById('botonEntrar').addEventListener('click', iniciarSesion);

// tambien con enter
document.getElementById('contrasena').addEventListener('keypress', function(e) {
    if (e.key == 'Enter') {
        iniciarSesion();
    }
});
