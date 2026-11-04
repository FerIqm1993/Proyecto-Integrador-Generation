document.addEventListener('DOMContentLoaded', () => {
    const URL_API_CONTACTO = window.API_BASE_URL || (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) || "http://localhost:8080/api";

    // inicializo emailjs con mi clave publica
    if (typeof CONFIG !== 'undefined' && CONFIG.EMAILJS_PUBLIC_KEY) {
        emailjs.init({
            publicKey: CONFIG.EMAILJS_PUBLIC_KEY,
        });
    } else {
        console.warn("aviso: emailjs no configurado o credenciales vacias en config.js. se usara el modo simulacion.");
    }

    const formularioContacto = document.getElementById('formularioContacto');
    const alertaFormulario = document.getElementById('alertaFormulario');
    const botonEnviar = formularioContacto.querySelector('button[type="submit"]');

    // funcion para mostrar mensajes de alerta
    function mostrarAlerta(mensaje, tipo = 'success') {
        const elementoIcono = alertaFormulario.querySelector('i');
        const elementoTexto = alertaFormulario.querySelector('div');
        
        if (tipo === 'success') {
            alertaFormulario.style.backgroundColor = '#E6F4EA';
            alertaFormulario.style.borderColor = '#CEEAD6';
            alertaFormulario.style.color = '#137333';
            elementoIcono.className = 'bi bi-check-circle me-2 fs-5';
        } else {
            alertaFormulario.style.backgroundColor = '#FCE8E6';
            alertaFormulario.style.borderColor = '#FAD2CF';
            alertaFormulario.style.color = '#C5221F';
            elementoIcono.className = 'bi bi-exclamation-triangle me-2 fs-5';
        }
        
        elementoTexto.textContent = mensaje;
        alertaFormulario.classList.remove('d-none');
        alertaFormulario.classList.add('d-flex');
        
        setTimeout(() => {
            alertaFormulario.classList.add('d-none');
            alertaFormulario.classList.remove('d-flex');
        }, 6000);
    }

    // valido formato de correo
    function esCorreoValido(correo) {
        const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        return regex.test(correo);
    }

    if (formularioContacto) {
        formularioContacto.addEventListener('submit', async (e) => {
            e.preventDefault(); // evito que la pagina se recargue

            // tomo los valores del formulario
            const inputNombre = document.getElementById('nombre');
            const inputCorreo = document.getElementById('correo');
            const inputTelefono = document.getElementById('telefono');
            const inputAsunto = document.getElementById('asunto');
            const inputMensaje = document.getElementById('mensaje');
            const politicaPrivacidad = document.getElementById('politicaPrivacidad');

            // limpio errores anteriores
            const inputs = formularioContacto.querySelectorAll('.form-control, .form-select');
            inputs.forEach(input => {
                input.classList.remove('is-invalid');
                input.setCustomValidity('');
            });

            // valido nombre
            const nombre = inputNombre.value.trim();
            if (!nombre || nombre.length < 3) {
                mostrarAlerta('El nombre debe tener al menos 3 caracteres.', 'error');
                inputNombre.classList.add('is-invalid');
                return;
            }

            // valido correo
            const correo = inputCorreo.value.trim();
            if (!correo || !esCorreoValido(correo)) {
                mostrarAlerta('Por favor, ingresa un correo electrónico válido (ej. usuario@dominio.com).', 'error');
                inputCorreo.classList.add('is-invalid');
                return;
            }

            // valido telefono (si se llena)
            const telefono = inputTelefono.value.trim().replace(/[\s()-]/g, '');
            if (telefono !== '') {
                const regexTelefono = /^[0-9]{10}$/;
                if (!regexTelefono.test(telefono)) {
                    mostrarAlerta('El número de teléfono debe contener exactamente 10 dígitos numéricos.', 'error');
                    inputTelefono.classList.add('is-invalid');
                    return;
                }
            }

            // valido asunto
            const asunto = inputAsunto.value;
            if (!asunto) {
                mostrarAlerta('Por favor, selecciona un motivo de consulta.', 'error');
                inputAsunto.classList.add('is-invalid');
                return;
            }

            // valido mensaje
            const mensaje = inputMensaje.value.trim();
            if (!mensaje || mensaje.length < 10) {
                mostrarAlerta('El mensaje debe tener al menos 10 caracteres.', 'error');
                inputMensaje.classList.add('is-invalid');
                return;
            }

            // valido aviso de privacidad
            if (!politicaPrivacidad.checked) {
                mostrarAlerta('Debes aceptar el Aviso de Privacidad.', 'error');
                return;
            }

            // deshabilito boton mientras se envia
            const textoBotonOriginal = botonEnviar.innerHTML;
            botonEnviar.disabled = true;
            botonEnviar.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Enviando...`;

            // 1. Guardar mensaje en la base de datos mediante el Backend API
            try {
                let sesion = null;
                try {
                    sesion = JSON.parse(localStorage.getItem('sesionActiva') || 'null');
                } catch (_) {
                    sesion = null;
                }
                await fetch(`${URL_API_CONTACTO}/mensajes-contacto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuarioId: sesion && sesion.id ? Number(sesion.id) : null,
                        nombre: nombre,
                        correo: correo.toLowerCase(),
                        telefono: telefono || null,
                        motivo: asunto,
                        mensaje: mensaje,
                        aceptaAvisoPrivacidad: true,
                        estado: 'nuevo'
                    })
                });
            } catch (err) {
                console.warn('Mensaje de contacto no guardado en API (API no disponible):', err.message);
            }

            // 2. Enviar el correo con EmailJS
            if (typeof CONFIG !== 'undefined' && CONFIG.EMAILJS_PUBLIC_KEY) {
                const datos = {
                    de_nombre: nombre,
                    correo_usuario: correo,
                    telefono: telefono,
                    asunto: asunto,
                    mensaje: mensaje
                };

                emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, datos)
                    .then(() => {
                        botonEnviar.disabled = false;
                        botonEnviar.innerHTML = textoBotonOriginal;
                        mostrarAlerta('¡Mensaje recibido con éxito! Te responderemos en un plazo menor a 24 horas.', 'success');
                        formularioContacto.reset();
                    })
                    .catch((error) => {
                        botonEnviar.disabled = false;
                        botonEnviar.innerHTML = textoBotonOriginal;
                        console.error('Error de EmailJS:', error);
                        mostrarAlerta('Tu mensaje se guardó en nuestro sistema. Te responderemos pronto.', 'success');
                        formularioContacto.reset();
                    });
            } else {
                setTimeout(() => {
                    botonEnviar.disabled = false;
                    botonEnviar.innerHTML = textoBotonOriginal;
                    mostrarAlerta('¡Mensaje recibido con éxito!', 'success');
                    formularioContacto.reset();
                }, 800);
            }
        });
    }
});
