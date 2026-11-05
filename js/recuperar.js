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
        mostrarMensaje("Escribe un correo válido. ejemplo@dominio.com");
        return;
    }

    let usuarioEncontrado = null;
    let tokenRecuperacion = "";

    // 1. Solicitar token de recuperación firmado en el Backend API (Spring Boot + MySQL)
    try {
        const resp = await fetch(`${URL_API_RECUPERAR}/usuarios/solicitar-recuperacion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo })
        });
        if (resp.ok) {
            const datosToken = await resp.json();
            usuarioEncontrado = {
                email: datosToken.correo,
                nombre: datosToken.nombre || "Usuario"
            };
            tokenRecuperacion = datosToken.token || "";
        }
    } catch (err) {
        console.warn("Buscando usuario en localStorage:", err.message);
    }

    // 2. Respaldo en localStorage si la API está apagada
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
            "Este correo no está registrado. " +
            "<a href='registro.html' class='alert-link'>Crea una cuenta aquí</a>."
        );
        return;
    }

    const sufijoToken = tokenRecuperacion ? `&token=${encodeURIComponent(tokenRecuperacion)}` : "";
    const enlace = window.location.origin
        + window.location.pathname.replace('recuperar.html', 'restablecer.html')
        + '?correo=' + encodeURIComponent(correo)
        + sufijoToken;

    const datosCorreo = {
        to_email: correo,
        nombre: usuarioEncontrado.nombre,
        enlace_restablecer: enlace
    };

    const boton = document.getElementById('btnVerificar');
    boton.disabled = true;
    boton.textContent = "Enviando...";

    emailjs.send(SERVICE_ID, TEMPLATE_ID, datosCorreo)
        .then(function () {
            mostrarMensaje(
                "✅ ¡Correo enviado! Revisa tu bandeja de entrada " +
                "(también revisa la carpeta de spam).",
                "success"
            );
            boton.textContent = "Enviar de nuevo";
            boton.disabled = false;
        })
        .catch(function (error) {
            console.log("error al enviar:", error);
            mostrarMensaje(
                "Hubo un problema al enviar el correo. Intenta más tarde."
            );
            boton.textContent = "Verificar correo";
            boton.disabled = false;
        });
});
