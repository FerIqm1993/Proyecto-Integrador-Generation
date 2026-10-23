// correo admin
const CORREO_ADMIN = "contacto.tiendas3v@gmail.com";
const CONTRASENA_ADMIN = "Pollitosenfuga3";  // contrseña

function crearAdminAutomatico() {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    // busco si ya existe el admin
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
            contrasena: btoa(CONTRASENA_ADMIN),  //
            rol: "admin"
        };
        usuarios.push(admin);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        console.log("✅ Admin creado automaticamente");
        console.log("Correo: " + CORREO_ADMIN);
        console.log("Contraseña: " + CONTRASENA_ADMIN);
    }
}

// ejecuto la funcion al cargar la pagina
crearAdminAutomatico();

// valido formato de correo
function validarCorreo(correo) {
    let formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return formato.test(correo);
}

// funcion principal
function iniciarSesion() {
    // limpio mensajes
    document.getElementById('mensaje').innerHTML = "";
    
    // tomo los valores
    let correo = document.getElementById('correo').value.trim();
    let contrasena = document.getElementById('contrasena').value;
    
    // valido campos vacios
    if (correo == "" || contrasena == "") {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-danger">Llena todos los campos.</div>';
        return;
    }
    
    // valido formato de correo
    if (!validarCorreo(correo)) {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-danger">Escribe un correo válido.</div>';
        return;
    }
    
    // busco en usuarios guardados
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    let contrasenaCodificada = btoa(contrasena);
    
    let correoEncontrado = null;
    let contrasenaCorrecta = false;
    
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email == correo) {
            correoEncontrado = usuarios[i];
            if (usuarios[i].contrasena == contrasenaCodificada) {
                contrasenaCorrecta = true;
            }
        }
    }
    
    // no existe el correo
    if (correoEncontrado == null) {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-warning">Este correo no está registrado. <a href="registro.html" class="alert-link">Regístrate aquí</a>.</div>';
        return;
    }
    
    // contraseña incorrecta
    if (!contrasenaCorrecta) {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-danger">Contraseña incorrecta.</div>';
        document.getElementById('contrasena').value = "";
        return;
    }
    
    // ===== TODO BIEN - reviso si es admin =====
    let esAdmin = false;
    if (correoEncontrado.email === CORREO_ADMIN) {
        esAdmin = true;
    }
    
    // guardo la sesion
    let sesion = {
        email: correoEncontrado.email,
        nombre: correoEncontrado.nombre,
        rol: esAdmin ? "admin" : "usuario"
    };
    localStorage.setItem('sesionActiva', JSON.stringify(sesion));
    
    // mensaje de bienvenida
    document.getElementById('mensaje').innerHTML = 
        '<div class="alert alert-success">' +
        '<strong>¡Bienvenido, ' + correoEncontrado.nombre + '!</strong><br>' +
        'Redirigiendo...' +
        '</div>';
    
    // redirijo segun el rol
    setTimeout(function() {
        if (esAdmin) {
            window.location.href = "admin-productos.html";  // tu pagina de admin
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