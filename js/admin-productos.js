// EJECUCIÓN: eventos y carga inicial

// Vista previa de la imagen seleccionada.
// Mostramos una vista previa de la imagen seleccionada.
obtenerElemento("img").addEventListener("change", function() {
    let archivo = obtenerElemento("img").files[0];
    let vistaPrevia = obtenerElemento("vistaPrevia");
    // Si no hay imagen seleccionada, no hacemos nada.
    if (!archivo) return;
    // Mostramos la imagen antes de guardar.
    vistaPrevia.src = URL.createObjectURL(archivo);
    vistaPrevia.style.display = "block";
});

// CONECTAMOS LOS BOTONES DEL HTML CON LAS FUNCIONES

// Cuando se envía cada formulario, guardamos sus datos.
obtenerElemento("productoForm").addEventListener("submit", guardarFormularioProducto);
obtenerElemento("cuponForm").addEventListener("submit", guardarFormularioCupon);

// Botones para cancelar una edición.
obtenerElemento("cancelar").addEventListener("click", limpiarFormularioProducto);
obtenerElemento("cancelarCupon").addEventListener("click", limpiarFormularioCupon);

// Botones para descargar los JSON.
obtenerElemento("exportar").addEventListener("click", function() {
    descargarJSON(listaProductos, "productos-tienda3v.json");
});
obtenerElemento("exportarCupones").addEventListener("click", function() {
    descargarJSON(listaCupones, "cupones-tienda3v.json");
});

// Al abrir la página, mostramos los productos y cupones guardados.
mostrarProductos();
mostrarCupones();
limpiarFormularioProducto();
