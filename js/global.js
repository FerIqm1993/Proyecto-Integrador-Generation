function obtenerCarrito() {
  const carrito = localStorage.getItem('carrito');
  return carrito ? JSON.parse(carrito) : [];
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
  const articulo = carrito.find(p => p.id === idProducto);
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
  carrito = carrito.filter(p => p.id !== idProducto);
  localStorage.setItem('carrito', JSON.stringify(carrito));
}
