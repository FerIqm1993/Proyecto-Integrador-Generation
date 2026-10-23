// leo el correo que viene en el enlace (?correo=...)
const parametros = new URLSearchParams(window.location.search);
const correo = parametros.get('correo');

const cajaMensaje = document.getElementById('mensaje');
const correoMostrado = document.getElementById('correoMostrado');

// si no hay correo en el enlace, algo esta mal
if (!correo) {
    cajaMensaje.innerHTML = '<div class="alert alert-danger">Enlace no valido. Pide uno nuevo.</div>';
} else {
    correoMostrado.textContent = 'Cambiando contraseña para: ' + correo;
}

// cuando le dan click a guardar
document.getElementById('btnGuardar').addEventListener('click', function () {
    const nueva = document.getElementById('nueva').value;
    const confirmar = document.getElementById('confirmar').value;

    // validaciones (mismas que en registro)
    if (!nueva || !confirmar) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Llena ambos campos.</div>';
        return;
    }
    if (nueva.length < 8) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Minimo 8 caracteres.</div>';
        return;
    }
    if (!/[A-Z]/.test(nueva) || !/[a-z]/.test(nueva) || !/[0-9]/.test(nueva)) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Debe tener mayuscula, minuscula y numero.</div>';
        return;
    }
    if (nueva !== confirmar) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Las contraseñas no coinciden.</div>';
        return;
    }

    // actualizo en localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.email === correo);
    
    if (!usuario) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Usuario no encontrado.</div>';
        return;
    }

    // guardo la contraseña nueva codificada
    usuario.contrasena = btoa(nueva);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    cajaMensaje.innerHTML = '<div class="alert alert-success">✅ ¡Contraseña actualizada! Yendo a iniciar sesion...</div>';
    
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
});