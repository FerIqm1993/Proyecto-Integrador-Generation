async function iniciarSesion() {

    document.getElementById("mensaje").innerHTML = "";

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("contrasena").value;
  

    if (correo === "" || password === "") {

        document.getElementById("mensaje").innerHTML =
            '<div class="alert alert-danger">Llena todos los campos.</div>';

        return;
    }

    try {
  console.log("Correo:", correo);
console.log("Password:", password);
        const response = await fetch("http://localhost:8080/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    correo: correo,
                    password: password
                })
            }
        );

        if (!response.ok) {

            document.getElementById("mensaje").innerHTML =
                '<div class="alert alert-danger">Correo o contraseña incorrectos.</div>';

            return;
        }

        const data = await response.json();

        localStorage.setItem("token", data.token);
        localStorage.setItem("tipo", data.tipo);

        document.getElementById("mensaje").innerHTML =
            '<div class="alert alert-success">Inicio de sesión correcto.</div>';

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1500);

    } catch (error) {

        console.error(error);

        document.getElementById("mensaje").innerHTML =
            '<div class="alert alert-danger">Error al conectar con el servidor.</div>';
    }
}

document
    .getElementById("botonEntrar")
    .addEventListener("click", iniciarSesion);

document
    .getElementById("contrasena")
    .addEventListener("keypress", function(e) {

        if (e.key === "Enter") {
            iniciarSesion();
        }

    });