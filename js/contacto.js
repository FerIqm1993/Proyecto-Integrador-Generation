document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar EmailJS con tu Public Key
    if (typeof CONFIG !== 'undefined') {
        emailjs.init({
            publicKey: CONFIG.EMAILJS_PUBLIC_KEY,
        });
    } else {
        console.warn("Advertencia: config.js no está presente o CONFIG no está definido.");
    }

    const formularioContacto = document.getElementById('formularioContacto');
    const alertaFormulario = document.getElementById('alertaFormulario');
    const botonEnviar = formularioContacto.querySelector('button[type="submit"]');

    // Función auxiliar para mostrar alertas generales (éxito o error)
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

    // Expresión regular para validar correos electrónicos
    function esCorreoValido(correo) {
        const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        return regex.test(correo);
    }

    if (formularioContacto) {
        formularioContacto.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue

            const inputNombre = document.getElementById('nombre');
            const inputCorreo = document.getElementById('correo');
            const inputTelefono = document.getElementById('telefono');
            const inputAsunto = document.getElementById('asunto');
            const inputMensaje = document.getElementById('mensaje');
            const politicaPrivacidad = document.getElementById('politicaPrivacidad');

            // Limpiar errores visuales y validaciones nativas previas de todos los campos
            const inputs = formularioContacto.querySelectorAll('.form-control, .form-select');
            inputs.forEach(input => {
                input.classList.remove('is-invalid');
                input.setCustomValidity(''); // Resetea el mensaje
            });

            // Validar Nombre
            const nombre = inputNombre.value.trim();
            if (!nombre || nombre.length < 3) {
                mostrarAlerta('El nombre debe tener al menos 3 caracteres.', 'error');
                inputNombre.classList.add('is-invalid');
                return;
            }

            // Validar Correo Electrónico
            const correo = inputCorreo.value.trim();
            if (!correo || !esCorreoValido(correo)) {
                mostrarAlerta('Por favor, ingresa un correo electrónico válido (ej. usuario@dominio.com).', 'error');
                inputCorreo.classList.add('is-invalid');
                return;
            }

            // Validar Teléfono (Opcional, pero si se llena, debe tener 10 dígitos)
            const telefono = inputTelefono.value.trim();
            if (telefono !== '') {
                const regexTelefono = /^[0-9]{10}$/;
                if (!regexTelefono.test(telefono)) {
                    mostrarAlerta('El número de teléfono debe contener exactamente 10 dígitos numéricos.', 'error');
                    inputTelefono.classList.add('is-invalid');
                    return;
                }
            }

            // Validar Motivo de Consulta
            const asunto = inputAsunto.value;
            if (!asunto) {
                mostrarAlerta('Por favor, selecciona un motivo de consulta.', 'error');
                inputAsunto.classList.add('is-invalid');
                return;
            }

            // Validar Mensaje
            const mensaje = inputMensaje.value.trim();
            if (!mensaje || mensaje.length < 10) {
                mostrarAlerta('El mensaje debe tener al menos 10 caracteres.', 'error');
                inputMensaje.classList.add('is-invalid');
                return;
            }

            // Validar Aviso de Privacidad
            if (!politicaPrivacidad.checked) {
                mostrarAlerta('Debes aceptar el Aviso de Privacidad.', 'error');
                return;
            }

            // Cambiar texto y deshabilitar botón mientras se envía
            const textoBotonOriginal = botonEnviar.innerHTML;
            botonEnviar.disabled = true;
            botonEnviar.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Enviando...`;

            // Enviar correo a través de EmailJS
            if (typeof CONFIG !== 'undefined') {
                emailjs.sendForm(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, formularioContacto)
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
                // Simulación en caso de que falte config.js
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
