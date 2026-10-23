// ===== TUS CLAVES DE EMAILJS (cambialas por las tuyas) =====
const SERVICE_ID = "@Pollitosenfuga4";    // del paso 2
const TEMPLATE_ID = "template_atru08m";  // del paso 3
// la public key ya esta en el html

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
document.getElementById('btnVerificar').addEventListener('click', function () {
    document.getElementById('mensaje').innerHTML = "";
    
    const correo = document.getElementById('correoRecuperar').value.trim();
    
    // valido que no este vacio
    if (correo === "") {
        mostrarMensaje("Escribe tu correo por favor.");
        return;
    }
    
    // valido formato
    if (!validarCorreo(correo)) {
        mostrarMensaje("Escribe un correo valido. ejemplo@dominio.com");
        return;
    }
    
    // busco en localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    let usuarioEncontrado = null;
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === correo) {
            usuarioEncontrado = usuarios[i];
            break;
        }
    }
    
    // si no existe
    if (!usuarioEncontrado) {
        mostrarMensaje(
            "Este correo no esta registrado. " +
            "<a href='registro.html' class='alert-link'>Crea una cuenta aqui</a>."
        );
        return;
    }
    
    // ===== SI EXISTE: ARMO EL ENLACE Y ENVIO EL CORREO =====
    // creo el enlace que llevara al usuario a cambiar su contraseña
    // (cambia la URL por la de tu proyecto en github pages o local)
    const enlace = window.location.origin + window.location.pathname.replace('recuperar.html', 'restablecer.html') 
                   + '?correo=' + encodeURIComponent(correo);
    
    console.log("enlace de recuperacion:", enlace);
    
    // datos que se envian al correo (coinciden con las variables de la plantilla)
    const datosCorreo = {
        to_email: correo,
        nombre: usuarioEncontrado.nombre,
        enlace_restablecer: enlace
    };
    
    // desactivo el boton mientras se envia
    const boton = document.getElementById('btnVerificar');
    boton.disabled = true;
    boton.textContent = "Enviando...";
    
    // ===== ENVIO EL CORREO CON EMAILJS =====
    emailjs.send(SERVICE_ID, TEMPLATE_ID, datosCorreo)
        .then(function() {
            // todo bien: correo enviado
            mostrarMensaje(
                "✅ ¡Correo enviado! Revisa tu bandeja de entrada " +
                "(tambien revisa la carpeta de spam).", 
                "success"
            );
            boton.textContent = "Enviar de nuevo";
            boton.disabled = false;
        })
        .catch(function(error) {
            // algo salio mal
            console.log("error al enviar:", error);
            mostrarMensaje(
                "Hubo un problema al enviar el correo. Intenta mas tarde."
            );
            boton.textContent = "Verificar correo";
            boton.disabled = false;
        });
});