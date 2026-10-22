// ==========================================
// recuperar.js - cambiar contraseña
// ==========================================

// funcion para validar formato de correo
function validarCorreo(correo) {
    let formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return formato.test(correo);
}

// mostrar mensajes en pantalla
function mostrarMensaje(texto, tipo = "danger") {
    const caja = document.getElementById('mensaje');
    caja.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
}

// limpiar mensajes
function limpiarMensaje() {
    document.getElementById('mensaje').innerHTML = "";
}

// ===== PASO 1: verificar si el correo existe =====
document.getElementById('btnVerificar').addEventListener('click', function () {
    limpiarMensaje();
    
    const correo = document.getElementById('correoRecuperar').value.trim();
    
    // reviso que no este vacio
    if (correo === "") {
        mostrarMensaje("Escribe tu correo por favor.");
        return;
    }
    
    // reviso formato
    if (!validarCorreo(correo)) {
        mostrarMensaje("Escribe un correo valido. ejemplo@dominio.com");
        return;
    }
    
    // busco el correo en los usuarios guardados
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    let encontrado = false;
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === correo) {
            encontrado = true;
            break;
        }
    }
    
    // si no existe
    if (!encontrado) {
        mostrarMensaje("Este correo no esta registrado. Verifica que lo escribiste bien o <a href='registro.html' class='alert-link'>crea una cuenta</a>.");
        return;
    }
    
    // si existe: oculto el primer formulario y muestro el segundo
    document.getElementById('pasoCorreo').style.display = "none";
    document.getElementById('pasoNuevaContrasena').style.display = "block";
    
    // guardo el correo para usarlo despues
    sessionStorage.setItem('correoRecuperando', correo);
});

// ===== PASO 2: guardar la contraseña nueva =====
document.getElementById('btnCambiar').addEventListener('click', function () {
    limpiarMensaje();
    
    const nueva = document.getElementById('nuevaContrasena').value;
    const confirmar = document.getElementById('confirmarNueva').value;
    const correo = sessionStorage.getItem('correoRecuperando');
    
    // validaciones de la contraseña
    if (nueva === "" || confirmar === "") {
        mostrarMensaje("Llena ambos campos por favor.");
        return;
    }
    if (nueva.length < 8) {
        mostrarMensaje("La contraseña debe tener al menos 8 caracteres.");
        return;
    }
    if (!/[A-Z]/.test(nueva)) {
        mostrarMensaje("La contraseña debe tener al menos una letra mayuscula.");
        return;
    }
    if (!/[a-z]/.test(nueva)) {
        mostrarMensaje("La contraseña debe tener al menos una letra minuscula.");
        return;
    }
    if (!/[0-9]/.test(nueva)) {
        mostrarMensaje("La contraseña debe tener al menos un numero.");
        return;
    }
    if (nueva !== confirmar) {
        mostrarMensaje("Las contraseñas no coinciden.");
        return;
    }
    
    // todo bien: actualizo la contraseña
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === correo) {
            usuarios[i].contrasena = btoa(nueva);
            break;
        }
    }
    
    // guardo los cambios
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    console.log("contraseña actualizada para:", correo);
    
    // aviso y redirijo
    mostrarMensaje("¡Contraseña actualizada! Ahora puedes iniciar sesion.", "success");
    
    // borro de la memoria temporal
    sessionStorage.removeItem('correoRecuperando');
    
    // llevo al login despues de 2 segundos
    setTimeout(function () {
        window.location.href = "login.html";
    }, 2000);
});