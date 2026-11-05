// leo el correo y el token que vienen en el enlace (?correo=...&token=...)
const parametros = new URLSearchParams(window.location.search);
const correo = parametros.get('correo');
const tokenRecuperacion = parametros.get('token') || "";
const URL_API_RESTABLECER = window.API_BASE_URL || "http://localhost:8080/api";

const cajaMensaje = document.getElementById('mensaje');
const correoMostrado = document.getElementById('correoMostrado');

if (!correo) {
    cajaMensaje.innerHTML = '<div class="alert alert-danger">Enlace no válido. Pide uno nuevo en <a href="recuperar.html" class="alert-link">Recuperar contraseña</a>.</div>';
} else {
    correoMostrado.textContent = 'Cambiando contraseña para: ' + correo;
}

document.getElementById('btnGuardar').addEventListener('click', async function () {
    if (!correo) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Enlace no válido. Solicita uno nuevo.</div>';
        return;
    }

    const nueva = document.getElementById('nueva').value;
    const confirmar = document.getElementById('confirmar').value;

    if (!nueva || !confirmar) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Llena ambos campos.</div>';
        return;
    }
    if (nueva.length < 8) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Mínimo 8 caracteres.</div>';
        return;
    }
    if (!/[A-Z]/.test(nueva) || !/[a-z]/.test(nueva) || !/[0-9]/.test(nueva)) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Debe tener mayúscula, minúscula y número.</div>';
        return;
    }
    if (nueva !== confirmar) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Las contraseñas no coinciden.</div>';
        return;
    }

    let actualizadoEnApi = false;

    try {
        const resp = await fetch(`${URL_API_RESTABLECER}/usuarios/password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                correo: correo.toLowerCase(),
                passwordHash: nueva,
                token: tokenRecuperacion
            })
        });
        if (resp.status === 403) {
            cajaMensaje.innerHTML = '<div class="alert alert-danger">El enlace de recuperación expiró o no es válido. <a href="recuperar.html" class="alert-link">Solicita uno nuevo aquí</a>.</div>';
            return;
        }
        if (resp.ok) {
            actualizadoEnApi = true;
        }
    } catch (err) {
        console.warn("Actualizando contraseña en localStorage:", err.message);
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.email.toLowerCase() === correo.toLowerCase());

    if (usuario) {
        usuario.contrasena = btoa(nueva);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    } else if (!actualizadoEnApi) {
        cajaMensaje.innerHTML = '<div class="alert alert-danger">Usuario no encontrado.</div>';
        return;
    }

    cajaMensaje.innerHTML = '<div class="alert alert-success">✅ ¡Contraseña actualizada! Yendo a iniciar sesión...</div>';

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
});
