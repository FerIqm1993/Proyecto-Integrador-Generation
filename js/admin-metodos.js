// TIENDA 3V - ADMINISTRACIÓN DE PRODUCTOS Y CUPONES (Protegido por Rol Admin + Backend API + LocalStorage)

// Claves para guardar los datos en el navegador.
const CLAVE_PRODUCTOS = "tienda3v_productos";
const CLAVE_CUPONES = "tienda3v_cupones";
const URL_API = window.API_BASE_URL || "http://localhost:8080/api";

// ==========================================
// GUARDIA DE SEGURIDAD (SOLO ADMINISTRADOR)
// ==========================================
(function verificarAccesoAdministrador() {
    let sesion = null;
    try {
        sesion = JSON.parse(localStorage.getItem("sesionActiva") || "null");
    } catch (e) {
        sesion = null;
    }

    if (!sesion || !sesion.email) {
        window.location.replace("login.html");
        return;
    }

    if (sesion.rol !== "admin") {
        alert("Acceso restringido: Esta sección es exclusiva para administradores de Tienda 3V.");
        window.location.replace("../index.html");
        return;
    }

    // Verificación adicional contra MySQL si el servidor está activo
    if (sesion.id != null) {
        fetch(`${URL_API}/usuarios/${sesion.id}`)
            .then(resp => {
                if (resp.status === 404) {
                    localStorage.removeItem("sesionActiva");
                    window.location.replace("login.html");
                    return null;
                }
                return resp.ok ? resp.json() : null;
            })
            .then(usuarioDb => {
                if (usuarioDb && (!usuarioDb.rol || usuarioDb.rol.nombre !== "administrador" || usuarioDb.activo === false)) {
                    alert("Tu cuenta no cuenta con privilegios de administrador en el servidor.");
                    localStorage.removeItem("sesionActiva");
                    window.location.replace("../index.html");
                }
            })
            .catch(() => {
                // Si la API está apagada, se mantiene la validación de sesión local
            });
    }
})();

function construirHeadersAdmin() {
    if (typeof obtenerHeadersAdmin === "function") {
        return obtenerHeadersAdmin();
    }
    let sesion = null;
    try {
        sesion = JSON.parse(localStorage.getItem("sesionActiva") || "null");
    } catch (e) {
        sesion = null;
    }
    const headers = { "Content-Type": "application/json" };
    if (sesion) {
        if (sesion.id != null) headers["X-Usuario-Id"] = String(sesion.id);
        if (sesion.rol) headers["X-Usuario-Rol"] = String(sesion.rol);
    }
    return headers;
}

const productosIniciales = [
    { id: 1, nombre: 'Aceite vegetal 1L', precio: 45.90, anterior: 65, cat: 'alimentos', disp: true, img: 'aceite.jpg' },
    { id: 2, nombre: 'Leche entera 1L', precio: 28.50, anterior: 34, cat: 'alimentos', disp: true, img: 'leche.jpg' },
    { id: 3, nombre: 'Vino tinto 750ml', precio: 145, anterior: 180, cat: 'cervezas', disp: true, img: 'vino.jpg' },
    { id: 4, nombre: 'Cerveza clara 6pk', precio: 98, anterior: null, cat: 'cervezas', disp: true, img: 'cerveza.jpg' },
    { id: 5, nombre: 'Detergente 3kg', precio: 89, anterior: 120, cat: 'hogar', disp: true, img: 'detergente.jpg' },
    { id: 6, nombre: 'Papel higiénico 12pk', precio: 65, anterior: null, cat: 'hogar', disp: true, img: 'papel.jpg' },
    { id: 7, nombre: 'Martillo de uña', precio: 129, anterior: null, cat: 'ferreteria', disp: true, img: 'martillo.jpg' },
    { id: 8, nombre: 'Juego de desarmadores', precio: 159, anterior: 179, cat: 'ferreteria', disp: true, img: 'desarmadores.jpg' },
    { id: 9, nombre: 'Refresco 2L', precio: 24, anterior: null, cat: 'bebidas', disp: true, img: 'refresco.jpg' },
    { id: 10, nombre: 'Agua mineral 1.5L', precio: 12.50, anterior: null, cat: 'bebidas', disp: true, img: 'agua.jpg' },
    { id: 11, nombre: 'Shampoo 750ml', precio: 54.90, anterior: null, cat: 'belleza', disp: true, img: 'shampoo.jpg' },
    { id: 12, nombre: 'Jabón 3pk', precio: 42, anterior: null, cat: 'belleza', disp: true, img: 'jabon.jpg' },
    { id: 13, nombre: 'Croquetas perro 2kg', precio: 189, anterior: 210, cat: 'mascotas', disp: true, img: 'croquetas.jpg' },
    { id: 14, nombre: 'Arena para gato 4kg', precio: 115, anterior: null, cat: 'mascotas', disp: true, img: 'arena.jpg' }
];

const cuponesIniciales = [
    { id: 1, codigo: "BIENVENIDO10", descuento: 10, activo: true, usos: 0 }
];

function obtenerElemento(idElemento) {
    return document.getElementById(idElemento);
}

function cargarLista(clave, listaInicial) {
    try {
        let datos = JSON.parse(localStorage.getItem(clave));
        if (Array.isArray(datos)) {
            return datos;
        }
    } catch (error) {
        console.log(error);
    }
    localStorage.setItem(clave, JSON.stringify(listaInicial));
    return [...listaInicial];
}

let listaProductos = cargarLista(CLAVE_PRODUCTOS, productosIniciales);
let listaCupones = cargarLista(CLAVE_CUPONES, cuponesIniciales);

function guardarProductos() {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(listaProductos));
}
function guardarCupones() {
    localStorage.setItem(CLAVE_CUPONES, JSON.stringify(listaCupones));
}

function mapearCuponApiAFrontend(c) {
    return {
        id: Number(c.idCupon ?? c.id),
        codigo: String(c.codigo || "").toUpperCase(),
        descuento: Math.round(Number(c.porcentajeDescuento ?? c.descuento ?? 10)),
        activo: Boolean(c.activo ?? true),
        usos: Number(c.usos ?? 0)
    };
}

async function sincronizarAdminConBackend() {
    if (typeof sincronizarProductosDesdeApi === "function") {
        const prods = await sincronizarProductosDesdeApi();
        if (Array.isArray(prods)) {
            listaProductos = prods;
            mostrarProductos();
            limpiarFormularioProducto();
        }
    }
    try {
        const respCupones = await fetch(`${URL_API}/cupones`);
        if (respCupones.ok) {
            const datosCupones = await respCupones.json();
            if (Array.isArray(datosCupones)) {
                listaCupones = datosCupones.map(mapearCuponApiAFrontend);
                guardarCupones();
                mostrarCupones();
            }
        }
    } catch (err) {
        console.warn("Usando cupones en localStorage (API no disponible):", err.message);
    }
}

// Mostramos un mensaje de Bootstrap sin insertar HTML del usuario.
function mostrarAlerta(idContenedor, mensaje, tipo) {
    obtenerElemento(idContenedor).innerHTML =
        `<div class="alert alert-${tipo} mt-3" role="alert">${mensaje}</div>`;
}

function agregarCelda(fila, contenido) {
    let celda = fila.insertCell();
    celda.textContent = contenido;
    return celda;
}

function descargarJSON(lista, nombreArchivo) {
    let enlace = document.createElement("a");
    enlace.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lista));
    enlace.download = nombreArchivo;
    enlace.click();
}

// CRUD DE PRODUCTOS

function encontrarProducto(idBuscado) {
    return listaProductos.find(producto => producto.id === idBuscado) || null;
}

function generarIdProducto() {
    let ultimoId = Number(localStorage.getItem("ultimoIdProducto")) || 0;
    let mayorId = Math.max(0, ...listaProductos.map(p => p.id));
    return Math.max(ultimoId, mayorId) + 1;
}

function obtenerSrcImagenAdmin(img) {
    if (!img) return "../img/productos/aceite.jpg";
    if (img.startsWith("data:image/") || img.startsWith("http") || img.startsWith("../img/")) {
        return img;
    }
    if (img.startsWith("img/")) {
        return "../" + img;
    }
    return "../img/productos/" + img;
}

function mostrarProductos() {
    let tabla = obtenerElemento("tablaProductos");
    tabla.innerHTML = "";

    for (let producto of listaProductos) {
        let fila = document.createElement("tr");
        agregarCelda(fila, producto.id);
        agregarCelda(fila, producto.nombre);
        agregarCelda(fila, "$" + Number(producto.precio).toFixed(2));
        agregarCelda(fila, producto.anterior == null ? "—" : "$" + Number(producto.anterior).toFixed(2));
        agregarCelda(fila, producto.cat);
        agregarCelda(fila, producto.disp ? "Sí" : "No");

        let imagen = document.createElement("img");
        imagen.src = obtenerSrcImagenAdmin(producto.img);
        imagen.style.cssText = "width:70px; height:70px; object-fit:contain;";
        imagen.alt = producto.nombre;
        agregarCelda(fila, "").appendChild(imagen);

        let acciones = agregarCelda(fila, "");
        let botonEditar = document.createElement("button");
        botonEditar.className = "btn btn-sm btn-outline-primary me-2";
        botonEditar.textContent = "Editar";
        botonEditar.onclick = () => editarProducto(producto.id);

        let botonEliminar = document.createElement("button");
        botonEliminar.className = "btn btn-sm btn-outline-danger";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.onclick = () => eliminarProducto(producto.id);

        acciones.append(botonEditar, botonEliminar);
        tabla.appendChild(fila);
    }
}

function limpiarFormularioProducto() {
    obtenerElemento("productoForm").reset();
    obtenerElemento("id").value = generarIdProducto();
    obtenerElemento("nombre").readOnly = false;

    let vistaPrevia = obtenerElemento("vistaPrevia");
    vistaPrevia.removeAttribute("src");
    vistaPrevia.style.display = "none";

    obtenerElemento("tituloFormulario").textContent = "Nuevo producto";
    obtenerElemento("guardar").textContent = "Guardar producto";
}

function editarProducto(idProducto) {
    let producto = encontrarProducto(idProducto);
    if (!producto) return;
    obtenerElemento("id").value = producto.id;
    obtenerElemento("nombre").value = producto.nombre;
    obtenerElemento("nombre").readOnly = false;
    obtenerElemento("precio").value = producto.precio;
    obtenerElemento("anterior").value = producto.anterior ?? "";
    obtenerElemento("cat").value = producto.cat;
    obtenerElemento("disp").checked = producto.disp;
    let imagen = obtenerElemento("vistaPrevia");
    imagen.src = obtenerSrcImagenAdmin(producto.img);
    imagen.style.display = "block";

    obtenerElemento("tituloFormulario").textContent = "Editar producto #" + producto.id;
    obtenerElemento("guardar").textContent = "Actualizar producto";
    obtenerElemento("productoForm").scrollIntoView({ behavior: "smooth" });
    obtenerElemento("img").value = "";
}

async function eliminarProducto(idProducto) {
    let producto = encontrarProducto(idProducto);
    if (producto === null) return;
    if (!confirm('¿Eliminar el producto "' + producto.nombre + '"?')) return;

    try {
        const resp = await fetch(`${URL_API}/productos/${idProducto}`, {
            method: "DELETE",
            headers: construirHeadersAdmin()
        });
        if (resp.status === 403) {
            mostrarAlerta("alertas", "Acceso denegado: Se requieren permisos de administrador.", "danger");
            return;
        }
    } catch (err) {
        console.warn("Eliminado solo en localStorage (API no disponible):", err.message);
    }

    listaProductos = listaProductos.filter(elemento => elemento.id !== idProducto);
    guardarProductos();
    mostrarProductos();
    limpiarFormularioProducto();
    mostrarAlerta("alertas", "Producto eliminado correctamente.", "success");
}

// Guardamos productos nuevos o actualizamos los existentes.
async function guardarFormularioProducto(evento) {
    evento.preventDefault();
    let id = Number(obtenerElemento("id").value);
    let existente = encontrarProducto(id);
    let nombre = obtenerElemento("nombre").value.trim();
    let textoPrecio = obtenerElemento("precio").value.trim();
    let precio = Number(textoPrecio);
    let textoAnterior = obtenerElemento("anterior").value.trim();
    let anterior = textoAnterior === "" ? null : Number(textoAnterior);
    let cat = obtenerElemento("cat").value;
    let disp = obtenerElemento("disp").checked;
    let archivo = obtenerElemento("img").files[0];

    let cantidadLetras = (nombre.match(/\p{L}/gu) || []).length;
    if (cantidadLetras < 4) {
        mostrarAlerta("alertas", "El nombre debe tener mínimo 4 letras.", "danger");
        return;
    }
    if (!textoPrecio || !Number.isFinite(precio) || precio <= 0) {
        mostrarAlerta("alertas", "Ingresa un precio mayor que cero.", "danger");
        return;
    }
    if (anterior !== null && (!Number.isFinite(anterior) || anterior <= precio)) {
        mostrarAlerta("alertas", "El precio anterior debe ser mayor que el precio actual.", "danger");
        return;
    }
    if (!["alimentos", "cervezas", "hogar", "ferreteria", "bebidas", "belleza", "mascotas"].includes(cat)) {
        mostrarAlerta("alertas", "Selecciona una categoría válida.", "danger");
        return;
    }
    if (!existente && !archivo) {
        mostrarAlerta("alertas", "Debes seleccionar una imagen del producto.", "danger");
        return;
    }

    let img = existente ? existente.img : "";
    if (archivo) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) {
            mostrarAlerta("alertas", "Selecciona una imagen JPG, PNG o WEBP.", "danger");
            return;
        }
        if (archivo.size > 500 * 1024) {
            mostrarAlerta("alertas", "La imagen debe pesar máximo 500 KB.", "danger");
            return;
        }

        try {
            img = await new Promise((resolve, reject) => {
                let lector = new FileReader();
                lector.onload = () => resolve(lector.result);
                lector.onerror = () => reject(new Error("Error al leer la imagen"));
                lector.readAsDataURL(archivo);
            });
        } catch (error) {
            mostrarAlerta("alertas", "No se pudo leer la imagen.", "danger");
            return;
        }
    }

    if (!existente) {
        id = generarIdProducto();
    }

    let producto = { id, nombre, precio, anterior, cat, disp, img };

    // Intentamos persistir en el Backend API (MySQL)
    try {
        const payloadApi = mapearProductoFrontendAApi(producto);
        const url = existente ? `${URL_API}/productos/${existente.id}` : `${URL_API}/productos`;
        const metodo = existente ? "PUT" : "POST";
        const resp = await fetch(url, {
            method: metodo,
            headers: construirHeadersAdmin(),
            body: JSON.stringify(payloadApi)
        });
        if (resp.status === 403) {
            mostrarAlerta("alertas", "Acceso denegado: Se requieren permisos de administrador.", "danger");
            return;
        }
        if (resp.ok) {
            const guardadoEnApi = await resp.json();
            producto = mapearProductoApiAFrontend(guardadoEnApi);
        }
    } catch (err) {
        console.warn("Guardado en localStorage (API no disponible):", err.message);
    }

    if (existente) {
        listaProductos[listaProductos.indexOf(existente)] = producto;
    } else {
        listaProductos.push(producto);
    }

    try {
        guardarProductos();
        if (!existente) {
            localStorage.setItem("ultimoIdProducto", producto.id);
        }
    } catch (error) {
        listaProductos = cargarLista(CLAVE_PRODUCTOS, productosIniciales);
        mostrarAlerta("alertas", "No se pudo guardar. Revisa el espacio disponible.", "danger");
        return;
    }

    mostrarProductos();
    limpiarFormularioProducto();
    mostrarAlerta("alertas", existente ? "Producto actualizado correctamente." : "Producto registrado correctamente.", "success");
}

// CRUD DE CUPONES

function encontrarCupon(idCupon) {
    return listaCupones.find(cupon => cupon.id === idCupon) || null;
}

function limpiarFormularioCupon() {
    obtenerElemento("cuponForm").reset();
    obtenerElemento("cuponId").value = "";
    obtenerElemento("cuponPorcentaje").value = "10";
    obtenerElemento("cuponActivo").checked = true;
    obtenerElemento("guardarCupon").textContent = "Crear cupón";
}

function crearBoton(texto, color, accion) {
    let boton = document.createElement("button");
    boton.type = "button";
    boton.className = `btn btn-sm btn-outline-${color} me-2`;
    boton.textContent = texto;
    boton.onclick = accion;
    return boton;
}

function mostrarCupones() {
    let tabla = obtenerElemento("tablaCupones");
    tabla.innerHTML = "";

    for (let cupon of listaCupones) {
        let fila = document.createElement("tr");
        agregarCelda(fila, cupon.codigo);
        agregarCelda(fila, cupon.descuento + "%");

        let estado = agregarCelda(fila, cupon.activo ? "Activo" : "Inactivo");
        estado.className = cupon.activo ? "text-success fw-semibold" : "text-secondary";

        let acciones = agregarCelda(fila, "");
        acciones.append(
            crearBoton("Editar", "primary", () => editarCupon(cupon.id)),
            crearBoton(cupon.activo ? "Desactivar" : "Activar", "secondary", () => cambiarEstadoCupon(cupon.id)),
            crearBoton("Eliminar", "danger", () => eliminarCupon(cupon.id))
        );
        tabla.appendChild(fila);
    }

    if (listaCupones.length === 0) {
        let fila = document.createElement("tr");
        agregarCelda(fila, "No hay cupones registrados.").colSpan = 4;
        tabla.appendChild(fila);
    }
}

function editarCupon(idCupon) {
    let cupon = encontrarCupon(idCupon);
    if (cupon === null) return;
    obtenerElemento("cuponId").value = cupon.id;
    obtenerElemento("cuponCodigo").value = cupon.codigo;
    obtenerElemento("cuponPorcentaje").value = cupon.descuento;
    obtenerElemento("cuponActivo").checked = cupon.activo;
    obtenerElemento("guardarCupon").textContent = "Actualizar cupón";
    obtenerElemento("cuponForm").scrollIntoView({ behavior: "smooth" });
}

async function cambiarEstadoCupon(idCupon) {
    let cupon = encontrarCupon(idCupon);
    if (cupon === null) return;
    cupon.activo = !cupon.activo;

    try {
        const resp = await fetch(`${URL_API}/cupones/${idCupon}`, {
            method: "PUT",
            headers: construirHeadersAdmin(),
            body: JSON.stringify({
                codigo: cupon.codigo,
                porcentajeDescuento: cupon.descuento,
                activo: cupon.activo,
                usos: cupon.usos ?? 0
            })
        });
        if (resp.status === 403) {
            cupon.activo = !cupon.activo;
            mostrarAlerta("alertasCupones", "Acceso denegado: Se requieren permisos de administrador.", "danger");
            return;
        }
    } catch (err) {
        console.warn("Estado de cupón actualizado en localStorage:", err.message);
    }

    guardarCupones();
    mostrarCupones();
    mostrarAlerta("alertasCupones", "Estado del cupón actualizado.", "success");
}

async function eliminarCupon(idCupon) {
    let cupon = encontrarCupon(idCupon);
    if (cupon === null) return;
    if (!confirm("¿Eliminar el cupón " + cupon.codigo + "?")) return;

    try {
        const resp = await fetch(`${URL_API}/cupones/${idCupon}`, {
            method: "DELETE",
            headers: construirHeadersAdmin()
        });
        if (resp.status === 403) {
            mostrarAlerta("alertasCupones", "Acceso denegado: Se requieren permisos de administrador.", "danger");
            return;
        }
    } catch (err) {
        console.warn("Cupón eliminado en localStorage:", err.message);
    }

    listaCupones = listaCupones.filter(elemento => elemento.id !== idCupon);
    guardarCupones();
    mostrarCupones();
    limpiarFormularioCupon();
    mostrarAlerta("alertasCupones", "Cupón eliminado correctamente.", "success");
}

async function guardarFormularioCupon(evento) {
    evento.preventDefault();
    let codigoCupon = obtenerElemento("cuponCodigo").value.trim().toUpperCase();
    let textoPorcentaje = obtenerElemento("cuponPorcentaje").value.trim();
    let porcentajeDescuento = Number(textoPorcentaje);
    let idCupon = obtenerElemento("cuponId").value;
    idCupon = idCupon === "" ? null : Number(idCupon);
    let error = "";

    if (!/^[A-Z0-9_-]{3,30}$/.test(codigoCupon))
        error = "El código debe tener entre 3 y 30 caracteres.";
    else if (!textoPorcentaje || !Number.isInteger(porcentajeDescuento) || porcentajeDescuento < 1 || porcentajeDescuento > 100)
        error = "El descuento debe ser un número entero entre 1 y 100.";
    else if (listaCupones.some(c => c.codigo === codigoCupon && c.id !== idCupon))
        error = "Ya existe un cupón con ese código.";

    let cuponExistente = idCupon === null ? null : encontrarCupon(idCupon);
    if (!error && idCupon !== null && !cuponExistente)
        error = "No se encontró el cupón para editar.";
    if (error) {
        mostrarAlerta("alertasCupones", error, "danger");
        return;
    }

    const activoChecked = obtenerElemento("cuponActivo").checked;
    let nuevoCupon = {
        id: idCupon ?? (Math.max(0, ...listaCupones.map(c => c.id)) + 1),
        codigo: codigoCupon,
        descuento: porcentajeDescuento,
        activo: activoChecked,
        usos: cuponExistente ? (cuponExistente.usos ?? 0) : 0
    };

    try {
        const url = cuponExistente ? `${URL_API}/cupones/${cuponExistente.id}` : `${URL_API}/cupones`;
        const metodo = cuponExistente ? "PUT" : "POST";
        const resp = await fetch(url, {
            method: metodo,
            headers: construirHeadersAdmin(),
            body: JSON.stringify({
                codigo: codigoCupon,
                porcentajeDescuento: porcentajeDescuento,
                activo: activoChecked,
                usos: nuevoCupon.usos
            })
        });
        if (resp.status === 403) {
            mostrarAlerta("alertasCupones", "Acceso denegado: Se requieren permisos de administrador.", "danger");
            return;
        }
        if (resp.ok) {
            const guardadoApi = await resp.json();
            nuevoCupon = mapearCuponApiAFrontend(guardadoApi);
        }
    } catch (err) {
        console.warn("Cupón guardado en localStorage:", err.message);
    }

    if (cuponExistente) {
        listaCupones[listaCupones.indexOf(cuponExistente)] = nuevoCupon;
    } else {
        listaCupones.push(nuevoCupon);
    }

    guardarCupones();
    mostrarCupones();
    limpiarFormularioCupon();
    mostrarAlerta("alertasCupones", cuponExistente
        ? "Cupón actualizado correctamente." : "Cupón creado correctamente.", "success");
}

// Mostramos los productos y cupones guardados y sincronizamos con el Backend API.
mostrarProductos();
mostrarCupones();
limpiarFormularioProducto();
sincronizarAdminConBackend();
