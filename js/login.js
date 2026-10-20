// funcion para validar formato de correo
function validarCorreo(correo) {
    let formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return formato.test(correo);
}

// funcion principal de inicio de sesion
function iniciarSesion() {
    // limpio mensajes anteriores
    document.getElementById('mensaje').innerHTML = "";

    // obtengo los valores que escribe el usuario
    let correo = document.getElementById('correo').value.trim();
    let contrasena = document.getElementById('contrasena').value;

    // ---- revisar que no esten vacios ----
    if (correo == "" || contrasena == "") {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-danger">' +
            '<i class="bi bi-exclamation-circle-fill me-1"></i>' +
            'Llena todos los campos por favor.' +
            '</div>';
        return;
    }

    // ---- revisar que el correo tenga formato correcto ----
    if (validarCorreo(correo) == false) {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-danger">' +
            '<i class="bi bi-exclamation-circle-fill me-1"></i>' +
            'Escribe un correo válido (ejemplo@correo.com).' +
            '</div>';
        return;
    }

    // ---- buscar el correo en los usuarios registrados ----
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

    // ---- el correo no existe ----
    if (correoEncontrado == null) {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-warning">' +
            '<i class="bi bi-info-circle-fill me-1"></i>' +
            '<strong>Este correo no está registrado.</strong><br>' +
            'Revisa que lo escribiste bien o <a href="registro.html" class="alert-link">regístrate aquí</a>.' +
            '</div>';
        return;
    }

    // ---- el correo existe pero la contraseña está mal ----
    if (contrasenaCorrecta == false) {
        document.getElementById('mensaje').innerHTML = 
            '<div class="alert alert-danger">' +
            '<i class="bi bi-x-circle-fill me-1"></i>' +
            'Contraseña incorrecta. Intenta de nuevo.' +
            '</div>';
        document.getElementById('contrasena').value = "";
        return;
    }

    // ---- todo está correcto - ALERTA DE ÉXITO ----
    let sesion = {
        email: correoEncontrado.email,
        nombre: correoEncontrado.nombre
    };
    localStorage.setItem('sesionActiva', JSON.stringify(sesion));

    // ALERTA DE BIENVENIDA
    document.getElementById('mensaje').innerHTML = 
        '<div class="alert alert-success">' +
        '<i class="bi bi-check-circle-fill me-1"></i>' +
        '<strong>¡Bienvenido, ' + correoEncontrado.nombre + '!</strong><br>' +
        'Inicio de sesión exitoso. Redirigiendo a la página principal...' +
        '</div>';

    // espero un momento para que vea el mensaje y luego lo llevo al inicio
    setTimeout(function() {
        window.location.href = "../index.html";
    }, 1500); // 1.5 segundos para que alcance a leer
}

// conecto el boton con la funcion
document.getElementById('botonEntrar').addEventListener('click', iniciarSesion);

// tambien funciona al presionar Enter
document.getElementById('contrasena').addEventListener('keypress', function(e) {
    if (e.key == 'Enter') {
        iniciarSesion();
    }
});