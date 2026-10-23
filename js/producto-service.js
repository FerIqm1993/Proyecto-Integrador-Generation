// =====================================
// PRODUCTO SERVICE
// Fuente de datos temporal: LocalStorage
// =====================================

const STORAGE_KEY = "productos_tienda3v";

// Productos iniciales del catálogo
const PRODUCTOS_INICIALES = [
  { id: 1, nombre: "Aceite vegetal 1L", precio: 45.90, anterior: 65, cat: "alimentos", disp: true, img: "aceite.jpg" },
  { id: 2, nombre: "Leche entera 1L", precio: 28.50, anterior: 34, cat: "alimentos", disp: true, img: "leche.jpg" },
  { id: 3, nombre: "Vino tinto 750ml", precio: 145, anterior: 180, cat: "cervezas", disp: true, img: "vino.jpg" },
  { id: 4, nombre: "Cerveza clara 6pk", precio: 98, anterior: null, cat: "cervezas", disp: true, img: "cerveza.jpg" },
  { id: 5, nombre: "Detergente 3kg", precio: 89, anterior: 120, cat: "hogar", disp: true, img: "detergente.jpg" },
  { id: 6, nombre: "Papel higiénico 12pk", precio: 65, anterior: null, cat: "hogar", disp: true, img: "papel.jpg" },
  { id: 7, nombre: "Martillo de uña", precio: 129, anterior: null, cat: "ferreteria", disp: true, img: "martillo.jpg" },
  { id: 8, nombre: "Juego de desarmadores", precio: 159, anterior: 179, cat: "ferreteria", disp: true, img: "desarmadores.jpg" },
  { id: 9, nombre: "Refresco 2L", precio: 24, anterior: null, cat: "bebidas", disp: true, img: "refresco.jpg" },
  { id: 10, nombre: "Agua mineral 1.5L", precio: 12.50, anterior: null, cat: "bebidas", disp: true, img: "agua.jpg" },
  { id: 11, nombre: "Shampoo 750ml", precio: 54.90, anterior: null, cat: "belleza", disp: true, img: "shampoo.jpg" },
  { id: 12, nombre: "Jabón 3pk", precio: 42, anterior: null, cat: "belleza", disp: true, img: "jabon.jpg" },
  { id: 13, nombre: "Croquetas perro 2kg", precio: 189, anterior: 210, cat: "mascotas", disp: true, img: "croquetas.jpg" },
  { id: 14, nombre: "Arena para gato 4kg", precio: 115, anterior: null, cat: "mascotas", disp: true, img: "arena.jpg" }
];

// Inicializar catálogo si no existe
function inicializarProductos() {
  const datos = localStorage.getItem(STORAGE_KEY);

  if (!datos) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(PRODUCTOS_INICIALES)
    );
  }
}

// Obtener todos los productos
function obtenerProductos() {
  inicializarProductos();

  return JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  ) || [];
}

// Guardar lista completa
function guardarProductos(productos) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(productos)
  );
}

// Agregar producto
function agregarProducto(producto) {
  const productos = obtenerProductos();

  productos.push(producto);

  guardarProductos(productos);
}

// Buscar por ID
function obtenerProductoPorId(id) {
  return obtenerProductos().find(
    producto => producto.id === id
  );
}

// Eliminar producto
function eliminarProducto(id) {
  const productos = obtenerProductos().filter(
    producto => producto.id !== id
  );

  guardarProductos(productos);
}

// Actualizar producto
function actualizarProducto(productoActualizado) {
  const productos = obtenerProductos();

  const indice = productos.findIndex(
    producto => producto.id === productoActualizado.id
  );

  if (indice !== -1) {
    productos[indice] = productoActualizado;

    guardarProductos(productos);
  }
}

// Obtener siguiente ID
function generarNuevoId() {
  const productos = obtenerProductos();

  if (productos.length === 0) {
    return 1;
  }

  return Math.max(
    ...productos.map(p => p.id)
  ) + 1;
}