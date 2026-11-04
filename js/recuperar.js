// ===== TUS CLAVES DE EMAILJS =====
const SERVICE_ID = "@Pollitosenfuga4";
const TEMPLATE_ID = "template_atru08m";
const URL_API_RECUPERAR = window.API_BASE_URL || "http://localhost:8080/api";

// valido formato de correo
function validarCorreo(correo) {
    let formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return formato.test(correo);
}

// muestro mensajes en pantalla
function mostrarMensaje(texto, tipo = "danger") {
    document.getElementById('mensaje').innerHTML = 
        `<div class="alert alert-${tipo}">${texto}</div>`;
}

// cuando le dan click a verificar correo
document.getElementById('btnVerificar').addEventListener('click', async function () {
    document.getElementById('mensaje').innerHTML = "";
    
    const correo = document.getElementById('correoRecuperar').value.trim().toLowerCase();
    
    if (correo === "") {
        mostrarMensaje("Escribe tu correo por favor.");
        return;
    }
    
    if (!validarCorreo(correo)) {
        mostrarMensaje("Escribe un correo valido. ejemplo@dominio.com");
        return;
    }
    
    let usuarioEncontrado = null;

    // 1. Buscar en el Backend API (Spring Boot + MySQL)
    try {
        const resp = await fetch(`${URL_API_RECUPERAR}/usuarios/correo/${encodeURIComponent(correo)}`);
        if (resp.ok) {
            const usuarioApi = await resp.json();
            usuarioEncontrado = {
                email: usuarioApi.correo,
                nombre: `${usuarioApi.nombre || ""} ${usuarioApi.apellido || ""}`.trim()
            };
        }
    } catch (err) {
        console.warn("Buscando usuario en localStorage:", err.message);
    }

    // 2. Respaldo en localStorage
    if (!usuarioEncontrado) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        for (let i = 0; i < usuarios.length; i++) {
            if (usuarios[i].email.toLowerCase() === correo) {
                usuarioEncontrado = usuarios[i];
                break;
            }
        }
    }
    
    if (!usuarioEncontrado) {
        mostrarMensaje(
            "Este correo no esta registrado. " +
            "<a href='registro.html' class='alert-link'>Crea una cuenta aqui</a>."
        );
        return;
    }
    
    const enlace = window.location.origin + window.location.pathname.replace('recuperar.html', 'restablecer.html') 
                   + '?correo=' + encodeURIComponent(correo);
    
    console.log("enlace de recuperacion:", enlace);
    
    const datosCorreo = {
        to_email: correo,
        nombre: usuarioEncontrado.nombre,
        enlace_restablecer: enlace
    };
    
    const boton = document.getElementById('btnVerificar');
    boton.disabled = true;
    boton.textContent = "Enviando...";
    
    emailjs.send(SERVICE_ID, TEMPLATE_ID, datosCorreo)
        .then(function() {
            mostrarMensaje(
                "✅ ¡Correo enviado! Revisa tu bandeja de entrada " +
                "(tambien revisa la carpeta de spam).", 
                "success"
            );
            boton.textContent = "Enviar de nuevo";
            boton.disabled = false;
        })
        .catch(function(error) {
            console.log("error al enviar:", error);
            mostrarMensaje(
                "Hubo un problema al enviar el correo. Intenta mas tarde."
            );
            boton.textContent = "Verificar correo";
            boton.disabled = false;
        });
});
