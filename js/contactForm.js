export function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formAlert = document.getElementById('formAlert');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue

            // Obtenemos los valores de los inputs
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value.trim();
            const privacy = document.getElementById('privacyPolicy').checked;

            // Validación básica extra
            if (name && email && phone && subject && message && privacy) {
                // Simulamos éxito mostrando el mensaje:
                formAlert.classList.remove('d-none');
                formAlert.classList.add('d-flex');
                
                // Reiniciamos el formulario
                contactForm.reset();

                // Ocultamos la alerta después de 5 segundos
                setTimeout(() => {
                    formAlert.classList.add('d-none');
                    formAlert.classList.remove('d-flex');
                }, 5000);
            }
        });
    }
}

