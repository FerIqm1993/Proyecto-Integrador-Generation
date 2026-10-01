document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar EmailJS con tu Public Key
    emailjs.init({
        publicKey: CONFIG.EMAILJS_PUBLIC_KEY,
    });

    const contactForm = document.getElementById('contactForm');
    const formAlert = document.getElementById('formAlert');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    // Función auxiliar para mostrar alertas generales (éxito o error global)
    function showAlert(message, type = 'success') {
        const iconElement = formAlert.querySelector('i');
        const textElement = formAlert.querySelector('div');

        if (type === 'success') {
            formAlert.style.backgroundColor = '#E6F4EA';
            formAlert.style.borderColor = '#CEEAD6';
            formAlert.style.color = '#137333';
            iconElement.className = 'bi bi-check-circle me-2 fs-5';
        } else {
            formAlert.style.backgroundColor = '#FCE8E6';
            formAlert.style.borderColor = '#FAD2CF';
            formAlert.style.color = '#C5221F';
            iconElement.className = 'bi bi-exclamation-triangle me-2 fs-5';
        }

        textElement.textContent = message;
        formAlert.classList.remove('d-none');
        formAlert.classList.add('d-flex');

        setTimeout(() => {
            formAlert.classList.add('d-none');
            formAlert.classList.remove('d-flex');
        }, 6000);
    }

    // Expresión regular para validar correos electrónicos
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');
            const privacyPolicy = document.getElementById('privacyPolicy');

            // Limpiar errores visuales y validaciones nativas previas de todos los campos
            const inputs = contactForm.querySelectorAll('.form-control, .form-select');
            inputs.forEach(input => {
                input.classList.remove('is-invalid');
                input.setCustomValidity(''); // Resetea el mensaje nativo
            });

            // 1. Validar Nombre
            const name = nameInput.value.trim();
            if (!name) {
                nameInput.setCustomValidity('Por favor, completa este campo.');
                nameInput.reportValidity();
                return;
            }

            // 2. Validar Correo Electrónico
            const email = emailInput.value.trim();
            if (!email || !isValidEmail(email)) {
                emailInput.setCustomValidity('Incluye un signo "@" en la dirección de correo electrónico.');
                emailInput.reportValidity();
                return;
            }

            // 3. Validar Teléfono (Opcional, pero si se llena, solo acepta números y muestra globito nativo)
            const phone = phoneInput.value.trim();
            if (phone !== '') {
                const phoneRegex = /^[0-9]+$/;
                if (!phoneRegex.test(phone)) {
                    phoneInput.setCustomValidity('El número de teléfono solo debe contener números (sin letras ni espacios).');
                    phoneInput.reportValidity(); // Muestra el mensaje nativo flotante estilo navegador
                    return;
                }
            }

            // 4. Validar Motivo de Consulta
            const subject = subjectInput.value;
            if (!subject) {
                subjectInput.setCustomValidity('Por favor, selecciona una opción.');
                subjectInput.reportValidity();
                return;
            }

            // 5. Validar Mensaje
            const message = messageInput.value.trim();
            if (!message) {
                messageInput.setCustomValidity('Por favor, completa este campo.');
                messageInput.reportValidity();
                return;
            }

            // 6. Validar Aviso de Privacidad
            if (!privacyPolicy.checked) {
                showAlert('Debes aceptar el Aviso de Privacidad.', 'error');
                return;
            }

            // Cambiar texto y deshabilitar botón mientras se envía
            const originalButtonText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Enviando...`;

            // Enviar correo a través de EmailJS
            emailjs.sendForm(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, contactForm)
                .then(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalButtonText;
                    showAlert('¡Mensaje recibido con éxito! Te responderemos en un plazo menor a 24 horas.', 'success');
                    contactForm.reset();
                })
                .catch((error) => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalButtonText;
                    console.error('Error de EmailJS:', error);
                    showAlert('Ocurrió un error al enviar el correo. Por favor, intenta más tarde.', 'error');
                });
        });
    }
});
