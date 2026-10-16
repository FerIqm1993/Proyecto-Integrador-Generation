// TIENDA 3V - ADMINISTRACIÓN DE PRODUCTOS Y CUPONES

// Claves para guardar los datos en el navegador.
const CLAVE_PRODUCTOS = "tienda3v_productos";
const CLAVE_CUPONES = "tienda3v_cupones";

const productosIniciales = [ // Estos productos aparecen de base, ya que son los creados en categorias.
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

const cuponesIniciales = [ // Cupón de ejemplo que aparece la primera vez.
    { id: 1, codigo: "BIENVENIDO10", descuento: 10, activo: true }
];

function obtenerElemento(idElemento) { // Buscamos un elemento del HTML utilizando su ID.
    return document.getElementById(idElemento);
}

function cargarLista(clave, listaInicial) { // Recuperamos una lista guardada o usamos la lista inicial.
    try { // Obtenemos y convertimos los datos guardados.
        let datos = JSON.parse(localStorage.getItem(clave));
        if (Array.isArray(datos)) return datos; // Si los datos son una lista, los devolvemos.
    } catch (error) {
        console.log("Error al cargar datos:", error);
    }// Si no hay datos válidos, devolvemos una copia de la lista inicial.
    return listaInicial.map(elemento => ({ ...elemento }));
}

// Dos listas distintas, pero dentro del mismo archivo JavaScript.
let listaProductos = cargarLista(CLAVE_PRODUCTOS, productosIniciales);
let listaCupones = cargarLista(CLAVE_CUPONES, cuponesIniciales);

function guardarProductos() { // Guardamos los cambios para que no desaparezcan al recargar.
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(listaProductos));
}
function guardarCupones() {
    localStorage.setItem(CLAVE_CUPONES, JSON.stringify(listaCupones));
}

// Mostramos un mensaje de Bootstrap sin insertar HTML del usuario.
function mostrarAlerta(idContenedor, mensaje, tipo) {
    obtenerElemento(idContenedor).innerHTML =
        `<div class="alert alert-${tipo} mt-3" role="alert">${mensaje}</div>`;
}

function agregarCelda(fila, contenido) { // Agregamos una celda a una fila de la tabla.
    let celda = fila.insertCell();
    celda.textContent = contenido;
    return celda;
}

function descargarJSON(lista, nombreArchivo) {// Descargamos los datos como archivo JSON.
    let enlace = document.createElement("a"); //Creamos un enlace con el contenido directamente
    enlace.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lista));
    enlace.download = nombreArchivo;
    enlace.click(); // Simulamos el clic para descargar
}

// CRUD DE PRODUCTOS

function encontrarProducto(idBuscado) { // Buscamos un producto en la lista comparando su ID.
    return listaProductos.find(producto => producto.id === idBuscado) || null;
}

function mostrarProductos() { // Dibujamos todos los productos en la tabla del HTML.
    let tabla = obtenerElemento("tablaProductos");
    tabla.innerHTML = "";

    for (let producto of listaProductos) { // Recorremos todos los productos para mostrarlos en la tabla.
        let fila = document.createElement("tr");
        // Agregamos los datos del producto.
        agregarCelda(fila, producto.id);
        agregarCelda(fila, producto.nombre);
        agregarCelda(fila, "$" + producto.precio.toFixed(2));
        agregarCelda(fila, producto.anterior == null ? "—" : "$" + producto.anterior.toFixed(2));
        agregarCelda(fila, producto.cat);
        agregarCelda(fila, producto.disp ? "Sí" : "No");

        let imagen = document.createElement("img"); // Creamos la imagen del producto.
        imagen.src = producto.img.startsWith("data:image/") // Comprobamos si es una imagen subida o una imagen de la carpeta.
            ? producto.img : "../img/productos/" + producto.img;

        imagen.style.cssText = "width:70px; height:70px; object-fit:contain;"; // Ajustamos el tamaño y descripción de la imagen.
        imagen.alt = producto.nombre;
        agregarCelda(fila, "").appendChild(imagen); // Agregamos la imagen a su celda.

        let acciones = agregarCelda(fila, ""); // Creamos los botones de editar y eliminar.
        let botonEditar = document.createElement("button");
        botonEditar.className = "btn btn-sm btn-outline-primary me-2";
        botonEditar.textContent = "Editar";
        botonEditar.onclick = () => editarProducto(producto.id);

        let botonEliminar = document.createElement("button");
        botonEliminar.className = "btn btn-sm btn-outline-danger";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.onclick = () => eliminarProducto(producto.id);

        acciones.append(botonEditar, botonEliminar); // Agregamos los botones y la fila a la tabla.
        tabla.appendChild(fila);
    }
}

function limpiarFormularioProducto() { // Limpiamos el formulario para registrar otro producto.
    obtenerElemento("productoForm").reset(); // Reiniciamos todos los campos del formulario.
    obtenerElemento("id").value = ""; // Limpiamos el ID y bloqueamos el nombre.
    obtenerElemento("nombre").value = "";
    obtenerElemento("nombre").readOnly = true;
    obtenerElemento("ayudaId").textContent = "Escribe un ID para buscar el producto."; // Restauramos los textos originales.
    obtenerElemento("tituloFormulario").textContent = "Nuevo producto";
    obtenerElemento("guardar").textContent = "Guardar producto";
}

function buscarProductoPorId() { // Cuando escribimos un ID, buscamos el producto y completamos sus datos.
    let textoId = obtenerElemento("id").value.trim();
    let numeroId = Number(textoId);
    let idValido = textoId !== "" && Number.isSafeInteger(numeroId) && numeroId > 0;
    let productoEncontrado = idValido ? encontrarProducto(numeroId) : null;
// Completamos los campos si existe el producto o los limpiamos si es nuevo.
    obtenerElemento("nombre").value = productoEncontrado?.nombre || "";
    obtenerElemento("nombre").readOnly = !!productoEncontrado || !idValido;
    obtenerElemento("precio").value = productoEncontrado?.precio ?? "";
    obtenerElemento("anterior").value = productoEncontrado?.anterior ?? "";
    obtenerElemento("cat").value = productoEncontrado?.cat || "";
    obtenerElemento("disp").checked = productoEncontrado?.disp ?? true;
// Cambiamos los textos dependiendo de si estamos editando o registrando.
    obtenerElemento("tituloFormulario").textContent = productoEncontrado
        ? "Editar producto #" + numeroId : "Nuevo producto";
    obtenerElemento("guardar").textContent = productoEncontrado
        ? "Actualizar producto" : "Guardar producto";
    obtenerElemento("ayudaId").textContent = productoEncontrado // Mostramos un mensaje según el resultado de la búsqueda.
        ? "Producto encontrado: puedes actualizar sus datos." : idValido
        ? "ID disponible: escribe el nombre del producto nuevo." : "Escribe un ID entero mayor que cero.";
}

function editarProducto(idProducto) { // El botón Editar coloca el ID y reutiliza el autocompletado.
    obtenerElemento("id").value = idProducto;
    buscarProductoPorId();
    obtenerElemento("productoForm").scrollIntoView({ behavior: "smooth" });
}

function eliminarProducto(idProducto) { // Eliminamos un producto solamente si la persona confirma.
    let producto = encontrarProducto(idProducto);
    if (producto === null) return;
    if (!confirm('¿Eliminar el producto "' + producto.nombre + '"?')) return;

    listaProductos = listaProductos.filter(elemento => elemento.id !== idProducto);
    guardarProductos();
    mostrarProductos();
    limpiarFormularioProducto();
    mostrarAlerta("alertas", "Producto eliminado correctamente.", "success");
}

async function guardarFormularioProducto(evento) { // Guardamos un producto nuevo o actualizamos uno existente.
    evento.preventDefault(); // Evitamos que se recargue la página.
    // Obtenemos los datos del formulario.
    let textoId = obtenerElemento("id").value.trim();
    let id = Number(textoId);
    let nombre = obtenerElemento("nombre").value.trim();
    let textoPrecio = obtenerElemento("precio").value.trim();
    let precio = Number(textoPrecio);
    let textoAnterior = obtenerElemento("anterior").value.trim();
    let anterior = textoAnterior === "" ? null : Number(textoAnterior);
    let cat = obtenerElemento("cat").value;
    let disp = obtenerElemento("disp").checked;
    let existente = encontrarProducto(id); // Buscamos si el producto ya existe.
    let error = ""; 
    // Validamos los datos antes de guardarlos.
    if (!textoId || !Number.isSafeInteger(id) || id <= 0) 
        error = "Escribe un ID entero mayor que cero.";
    else if (nombre.length < 2)
        error = "El nombre debe tener al menos 2 caracteres.";
    else if (!textoPrecio || !Number.isFinite(precio) || precio <= 0)
        error = "Ingresa un precio mayor que cero.";
    else if (anterior !== null && (!Number.isFinite(anterior) || anterior <= 0))
        error = "El precio anterior debe ser mayor que cero.";
    else if (!["alimentos", "cervezas", "hogar", "ferreteria", "bebidas", "belleza", "mascotas"].includes(cat))
        error = "Selecciona una categoría válida.";
    else if (existente && nombre !== existente.nombre)
        error = "No puedes cambiar el nombre de un producto existente.";
    // Si hay un error, mostramos el mensaje y detenemos el guardado.
    if (error) {
        mostrarAlerta("alertas", error, "danger");
        return;
    }
    let img = existente ? existente.img : "producto.jpg";  // Conservamos la imagen anterior o usamos una predeterminada.
    let archivo = obtenerElemento("img").files[0];

    if (archivo) { // Si seleccionamos una imagen, validamos su formato y tamaño.
        if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type))
            error = "Selecciona una imagen JPG, PNG o WEBP.";
        else if (archivo.size > 500 * 1024)
            error = "La imagen debe pesar menos de 500 KB.";
        if (error) {
            mostrarAlerta("alertas", error, "danger");
            return;
        }
        try {  // Convertimos la imagen a texto para guardarla.
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

    let producto = { id, nombre, precio, anterior, cat, disp, img }; // Creamos el objeto del producto.
    if (existente) { // Agregamos el producto o actualizamos el existente.
        listaProductos[listaProductos.indexOf(existente)] = producto;
    } else {
        listaProductos.push(producto);
    }

    guardarProductos(); // Guardamos los cambios y actualizamos la tabla.
    mostrarProductos();
    limpiarFormularioProducto();
    mostrarAlerta("alertas", existente // Mostramos un mensaje de confirmación.
        ? "Producto actualizado correctamente." : "Producto registrado correctamente.", "success");
    console.log("Producto en JSON:", JSON.stringify(producto, null, 2));
}

// CRUD DE CUPONES

function encontrarCupon(idCupon) { // Buscamos un cupón por su ID interno.
    return listaCupones.find(cupon => cupon.id === idCupon) || null;
}

function limpiarFormularioCupon() { // Limpiamos el formulario de cupones.
    obtenerElemento("cuponForm").reset();
    obtenerElemento("cuponId").value = "";
    obtenerElemento("cuponPorcentaje").value = "10";
    obtenerElemento("cuponActivo").checked = true;
    obtenerElemento("guardarCupon").textContent = "Crear cupón";
}

function crearBoton(texto, color, accion) { // Creamos un botón con su texto, color y función.
    let boton = document.createElement("button");
    boton.type = "button";
    boton.className = `btn btn-sm btn-outline-${color} me-2`;
    boton.textContent = texto;
    boton.onclick = accion;
    return boton;
}

function mostrarCupones() { // Mostramos los cupones y sus botones en la tabla.
    let tabla = obtenerElemento("tablaCupones");
    tabla.innerHTML = "";

    for (let cupon of listaCupones) { // Recorremos los cupones registrados.
        let fila = document.createElement("tr");
        agregarCelda(fila, cupon.codigo); // Agregamos los datos del cupón.
        agregarCelda(fila, cupon.descuento + "%");

        let estado = agregarCelda(fila, cupon.activo ? "Activo" : "Inactivo"); // Mostramos si está activo o inactivo.
        estado.className = cupon.activo ? "text-success fw-semibold" : "text-secondary";

        let acciones = agregarCelda(fila, ""); // Creamos los botones usando nuestra función.
        acciones.append(
            crearBoton("Editar", "primary", () => editarCupon(cupon.id)),
            crearBoton(cupon.activo ? "Desactivar" : "Activar", "secondary", () => cambiarEstadoCupon(cupon.id)),
            crearBoton("Eliminar", "danger", () => eliminarCupon(cupon.id))
        );
        tabla.appendChild(fila); // Agregamos la fila a la tabla.
    } 

    if (listaCupones.length === 0) { // Mostramos un mensaje si no hay cupones.
        let fila = document.createElement("tr");
        agregarCelda(fila, "No hay cupones registrados.").colSpan = 4;
        tabla.appendChild(fila);
    }
}

function editarCupon(idCupon) { // Copiamos los datos del cupón seleccionado al formulario.
    let cupon = encontrarCupon(idCupon);
    if (cupon === null) return;
    obtenerElemento("cuponId").value = cupon.id;
    obtenerElemento("cuponCodigo").value = cupon.codigo;
    obtenerElemento("cuponPorcentaje").value = cupon.descuento;
    obtenerElemento("cuponActivo").checked = cupon.activo;
    obtenerElemento("guardarCupon").textContent = "Actualizar cupón";
    obtenerElemento("cuponForm").scrollIntoView({ behavior: "smooth" });
}

function cambiarEstadoCupon(idCupon) { // Cambiamos un cupón activo a inactivo, o viceversa.
    let cupon = encontrarCupon(idCupon); // Buscamos el cupón y verificamos que exista
    if (cupon === null) return;
    cupon.activo = !cupon.activo;
    guardarCupones(); // Guardamos los cambios y actualizamos la tabla.
    mostrarCupones();
    mostrarAlerta("alertasCupones", "Estado del cupón actualizado.", "success");
}

function eliminarCupon(idCupon) { // Borramos un cupón después de confirmar.
    let cupon = encontrarCupon(idCupon); // Buscamos el cupón y verificamos que exista.
    if (cupon === null) return;
    if (!confirm("¿Eliminar el cupón " + cupon.codigo + "?")) return; // Preguntamos si realmente queremos eliminarlo.
    listaCupones = listaCupones.filter(elemento => elemento.id !== idCupon);
    guardarCupones(); // Guardamos los cambios y actualizamos la tabla.
    mostrarCupones();
    limpiarFormularioCupon();
    mostrarAlerta("alertasCupones", "Cupón eliminado correctamente.", "success");
}

function guardarFormularioCupon(evento) { // Creamos o actualizamos un cupón.
    evento.preventDefault(); // Evitamos que se recargue la página.
    let codigoCupon = obtenerElemento("cuponCodigo").value.trim().toUpperCase();
    let textoPorcentaje = obtenerElemento("cuponPorcentaje").value.trim(); // Obtenemos el porcentaje de descuento.
    let porcentajeDescuento = Number(textoPorcentaje);
    let idCupon = obtenerElemento("cuponId").value; // Obtenemos el ID o usamos null si es un cupón nuevo.
    idCupon = idCupon === "" ? null : Number(idCupon);
    let error = ""; // Validamos el código y el porcentaje del cupón.

    if (!/^[A-Z0-9_-]{3,30}$/.test(codigoCupon))
        error = "El código debe tener entre 3 y 30 caracteres.";
    else if (!textoPorcentaje || !Number.isInteger(porcentajeDescuento) || porcentajeDescuento < 1 || porcentajeDescuento > 100)
        error = "El descuento debe ser un número entero entre 1 y 100.";
    else if (listaCupones.some(c => c.codigo === codigoCupon && c.id !== idCupon)) // Verificamos que no exista otro cupón con el mismo código.
        error = "Ya existe un cupón con ese código.";

    let cuponExistente = idCupon === null ? null : encontrarCupon(idCupon); // Buscamos el cupón si estamos editando.
        if (!error && idCupon !== null && !cuponExistente)
        error = "No se encontró el cupón para editar.";
        if (error) { // Si hay un error, lo mostramos y detenemos el guardado.
        mostrarAlerta("alertasCupones", error, "danger");
        return;
    }

    if (idCupon === null) // Si es nuevo, generamos el siguiente ID disponible.
    idCupon = Math.max(0, ...listaCupones.map(c => c.id)) + 1;
    let nuevoCupon = { // Creamos el objeto del cupón.
    id: idCupon, codigo: codigoCupon, descuento: porcentajeDescuento, activo: obtenerElemento("cuponActivo").checked
};

    if (cuponExistente) { // Agregamos el cupón o actualizamos el existente.
        listaCupones[listaCupones.indexOf(cuponExistente)] = nuevoCupon;
    } else {
        listaCupones.push(nuevoCupon);
    }

    guardarCupones(); // Guardamos los cambios y actualizamos la tabla.
    mostrarCupones();
    limpiarFormularioCupon();
    mostrarAlerta("alertasCupones", cuponExistente // Mostramos un mensaje de confirmación.
    ? "Cupón actualizado correctamente." : "Cupón creado correctamente.", "success");
    console.log("Cupón en JSON:", JSON.stringify(nuevoCupon, null, 2));
}

