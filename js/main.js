// main.js

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formAlert = document.getElementById('formAlert');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue

            // Obtenemos los valores de los inputs
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value.trim();

            // Validación básica extra
            if (name && email && subject && message) {
                // Aquí podrías agregar una llamada a una API (fetch)
                // para enviar los datos reales al servidor.

                // Por ahora simulamos que fue exitoso mostrando el mensaje:
                formAlert.classList.remove('d-none');
                
                // Reiniciamos el formulario
                contactForm.reset();

                // Ocultamos la alerta después de 5 segundos
                setTimeout(() => {
                    formAlert.classList.add('d-none');
                }, 5000);
            }
        });
    }
});
