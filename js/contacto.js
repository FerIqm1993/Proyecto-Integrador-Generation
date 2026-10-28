document.addEventListener('DOMContentLoaded', () => {
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
        formularioContacto.addEventListener('submit', (e) => {
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
            const telefono = inputTelefono.value.trim();
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

            // envio el correo con datos limpios ✅
            if (typeof CONFIG !== 'undefined') {
                // armo el objeto con los datos para que salgan bien
                const datos = {
                    de_nombre: nombre,
                    correo_usuario: correo,
                    telefono: telefono,
                    asunto: asunto, // asi llega SIN codigos raros
                    mensaje: mensaje
                };

                // uso send en lugar de sendForm
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
                        mostrarAlerta('Ocurrió un error al enviar el correo. Por favor, intenta más tarde.', 'error');
                    });
            } else {
                // modo simulacion
                setTimeout(() => {
                    botonEnviar.disabled = false;
                    botonEnviar.innerHTML = textoBotonOriginal;
                    mostrarAlerta('¡Mensaje recibido con éxito! (Simulado, config.js no detectado)', 'success');
                    formularioContacto.reset();
                }, 1500);
            }
        });
    }
});