document.addEventListener('DOMContentLoaded', () => {
    const formularioContacto = document.getElementById('formularioContacto');
    const alertaFormulario = document.getElementById('alertaFormulario');

    // Verificar que el formulario exista antes de continuar.
    if (!formularioContacto) {
        console.error('No se encontró el formulario #formularioContacto.');
        return;
    }

    const botonEnviar = formularioContacto.querySelector('button[type="submit"]');
    const inputNombre = document.getElementById('nombre');
    const inputCorreo = document.getElementById('correo');
    const inputTelefono = document.getElementById('telefono');
    const inputAsunto = document.getElementById('asunto');
    const inputMensaje = document.getElementById('mensaje');
    const politicaPrivacidad = document.getElementById('politicaPrivacidad');

    // Desactivar la validación nativa del navegador para controlar todo desde JS.
    formularioContacto.setAttribute('novalidate', 'novalidate');

    // =========================================================
    // 1. Función para mostrar alertas
    // =========================================================
    function mostrarAlerta(mensaje, tipo = 'success') {
        if (!alertaFormulario) {
            console.error(mensaje);
            return;
        }

        const elementoIcono = alertaFormulario.querySelector('i');
        const elementoTexto = alertaFormulario.querySelector('div');

        if (tipo === 'success') {
            alertaFormulario.style.backgroundColor = '#E6F4EA';
            alertaFormulario.style.borderColor = '#CEEAD6';
            alertaFormulario.style.color = '#137333';

            if (elementoIcono) {
                elementoIcono.className = 'bi bi-check-circle me-2 fs-5';
            }
        } else {
            alertaFormulario.style.backgroundColor = '#FCE8E6';
            alertaFormulario.style.borderColor = '#FAD2CF';
            alertaFormulario.style.color = '#C5221F';

            if (elementoIcono) {
                elementoIcono.className = 'bi bi-exclamation-triangle me-2 fs-5';
            }
        }

        if (elementoTexto) {
            elementoTexto.textContent = mensaje;
        }

        alertaFormulario.classList.remove('d-none');
        alertaFormulario.classList.add('d-flex');

        // Cancelar temporizadores anteriores para evitar comportamientos extraños.
        clearTimeout(mostrarAlerta.temporizador);

        mostrarAlerta.temporizador = setTimeout(() => {
            alertaFormulario.classList.add('d-none');
            alertaFormulario.classList.remove('d-flex');
        }, 6000);
    }

    // =========================================================
    // 2. Marcar campo como inválido
    // =========================================================
    function mostrarError(campo, mensaje) {
        if (!campo) {
            mostrarAlerta(mensaje, 'error');
            return;
        }

        campo.classList.add('is-invalid');
        campo.setAttribute('aria-invalid', 'true');
        mostrarAlerta(mensaje, 'error');
        campo.focus();
    }

    // =========================================================
    // 3. Limpiar error cuando el usuario vuelva a escribir
    // =========================================================
    [inputNombre, inputCorreo, inputTelefono, inputAsunto, inputMensaje].forEach((campo) => {
        if (!campo) return;

        campo.addEventListener('input', () => {
            campo.classList.remove('is-invalid');
            campo.removeAttribute('aria-invalid');
        });

        campo.addEventListener('change', () => {
            campo.classList.remove('is-invalid');
            campo.removeAttribute('aria-invalid');
        });
    });

    // =========================================================
    // 4. Validación de correo electrónico
    // Ejemplo válido: usuario@gmail.com
    // =========================================================
    function esCorreoValido(correo) {
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return regexCorreo.test(correo);
    }

    // =========================================================
    // 5. Evento Submit
    // =========================================================
    formularioContacto.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Limpiar errores anteriores.
        [inputNombre, inputCorreo, inputTelefono, inputAsunto, inputMensaje].forEach((campo) => {
            if (!campo) return;
            campo.classList.remove('is-invalid');
            campo.removeAttribute('aria-invalid');
        });

        // =====================================================
        // VALIDACIÓN 1: NOMBRE
        // Más de 3 caracteres.
        // =====================================================
        const nombre = inputNombre ? inputNombre.value.trim() : '';

        if (nombre.length <= 3) {
            mostrarError(
                inputNombre,
                'El nombre debe tener más de 3 caracteres. Ingresa tu nombre completo.'
            );
            return;
        }

        // =====================================================
        // VALIDACIÓN 2: CORREO
        // Formato esperado: usuario@gmail.com
        // =====================================================
        const correo = inputCorreo ? inputCorreo.value.trim() : '';

        if (!esCorreoValido(correo)) {
            mostrarError(
                inputCorreo,
                'El correo electrónico no es válido. Ingresa uno correcto, por ejemplo: usuario@gmail.com'
            );
            return;
        }

        // =====================================================
        // VALIDACIÓN 3: TELÉFONO
        // Exactamente 10 números.
        // =====================================================
        const telefono = inputTelefono ? inputTelefono.value.trim() : '';

        if (!/^\d{10}$/.test(telefono)) {
            mostrarError(
                inputTelefono,
                'El teléfono debe contener exactamente 10 números.'
            );
            return;
        }

        // =====================================================
        // VALIDACIÓN 4: MOTIVO DE CONSULTA
        // =====================================================
        const asunto = inputAsunto ? inputAsunto.value.trim() : '';

        if (!asunto) {
            mostrarError(
                inputAsunto,
                'Por favor, selecciona un motivo de consulta.'
            );
            return;
        }

        // =====================================================
        // VALIDACIÓN 5: MENSAJE
        // =====================================================
        const mensaje = inputMensaje ? inputMensaje.value.trim() : '';

        if (!mensaje) {
            mostrarError(
                inputMensaje,
                'Por favor, escribe tu mensaje.'
            );
            return;
        }

        // =====================================================
        // VALIDACIÓN 6: AVISO DE PRIVACIDAD
        // =====================================================
        if (!politicaPrivacidad || !politicaPrivacidad.checked) {
            mostrarAlerta(
                'Debes aceptar el Aviso de Privacidad.',
                'error'
            );
            if (politicaPrivacidad) {
                politicaPrivacidad.focus();
            }
            return;
        }

        // =====================================================
        // 6. Comprobar EmailJS SOLO después de validar
        // =====================================================
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS no está cargado.');
            mostrarAlerta(
                'No se pudo cargar el servicio de correo. Recarga la página e intenta nuevamente.',
                'error'
            );
            return;
        }

        if (typeof CONFIG === 'undefined' ||
            !CONFIG.EMAILJS_PUBLIC_KEY ||
            !CONFIG.EMAILJS_SERVICE_ID ||
            !CONFIG.EMAILJS_TEMPLATE_ID) {
            console.error('La configuración de EmailJS no está disponible o está incompleta.');
            mostrarAlerta(
                'La configuración del servicio de correo no está disponible. Revisa config.js.',
                'error'
            );
            return;
        }

        // Inicializar EmailJS justo antes del envío.
        emailjs.init({
            publicKey: CONFIG.EMAILJS_PUBLIC_KEY,
        });

        // =====================================================
        // 7. Enviar formulario mediante EmailJS
        // =====================================================
        const textoBotonOriginal = botonEnviar ? botonEnviar.innerHTML : 'Enviar mensaje';

        if (botonEnviar) {
            botonEnviar.disabled = true;
            botonEnviar.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enviando...
            `;
        }

        emailjs.sendForm(
            CONFIG.EMAILJS_SERVICE_ID,
            CONFIG.EMAILJS_TEMPLATE_ID,
            formularioContacto
        )
        .then(() => {
            if (botonEnviar) {
                botonEnviar.disabled = false;
                botonEnviar.innerHTML = textoBotonOriginal;
            }

            mostrarAlerta(
                '¡Mensaje recibido con éxito! Te responderemos en un plazo menor a 24 horas.',
                'success'
            );

            formularioContacto.reset();
        })
        .catch((error) => {
            if (botonEnviar) {
                botonEnviar.disabled = false;
                botonEnviar.innerHTML = textoBotonOriginal;
            }

            console.error('Error de EmailJS:', error);

            mostrarAlerta(
                'Ocurrió un error al enviar el correo. Por favor, intenta más tarde.',
                'error'
            );
        });
    });
});