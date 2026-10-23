function obtenerCarrito() {
  const carritoGuardado = localStorage.getItem('carrito');
  if (!carritoGuardado) return [];

  const carrito = JSON.parse(carritoGuardado);
  if (!Array.isArray(carrito)) {
    throw new TypeError('El carrito guardado debe ser una lista de productos.');
  }

  const carritoNormalizado = carrito.map(articulo => {
    const nombre = articulo.nombre ?? articulo.name;
    const precio = Number(articulo.precio ?? articulo.price);
    const cantidadGuardada = articulo.cantidad ?? articulo.quantity;
    const cantidad = Number(cantidadGuardada);

    return {
      ...articulo,
      nombre,
      precio,
      cantidad: Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1
    };
  });

  if (JSON.stringify(carritoNormalizado) !== carritoGuardado) {
    localStorage.setItem('carrito', JSON.stringify(carritoNormalizado));
  }

  return carritoNormalizado;
}

function agregarProductoAlCarrito(articulo) {
  let carrito = obtenerCarrito();
  const existente = carrito.find(p => p.id === articulo.id);
  if (existente) {
    existente.cantidad += articulo.cantidad;
  } else {
    carrito.push(articulo);
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarCantidad(idProducto, cantidad) {
  let carrito = obtenerCarrito();
  const articulo = carrito.find(p => String(p.id) === String(idProducto));
  if (articulo) {
    articulo.cantidad = cantidad;
    if (articulo.cantidad <= 0) {
      carrito = carrito.filter(p => p.id !== idProducto);
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }
}

function eliminarDelCarritoLocal(idProducto) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(p => String(p.id) !== String(idProducto));
  localStorage.setItem('carrito', JSON.stringify(carrito));
}
