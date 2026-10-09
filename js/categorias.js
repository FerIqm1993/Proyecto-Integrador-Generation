(() => {
  "use strict"; // Evita algunos usos inseguros o errores comunes de JavaScript.

  // Catálogo: cada objeto contiene los datos de un producto.
  const PRODUCTOS = [
    { id: 1,  nombre: "Aceite vegetal 1L",    precio: 45.90, anterior: 65,  cat: "alimentos",   disp: true, img: "aceite.jpg" },
    { id: 2,  nombre: "Leche entera 1L",      precio: 28.50, anterior: 34,  cat: "alimentos",   disp: true, img: "leche.jpg" },
    { id: 3,  nombre: "Vino tinto 750ml",     precio: 145,   anterior: 180, cat: "cervezas",    disp: true, img: "vino.jpg" },
    { id: 4,  nombre: "Cerveza clara 6pk",    precio: 98,    anterior: null,cat: "cervezas",    disp: true, img: "cerveza.jpg" },
    { id: 5,  nombre: "Detergente 3kg",       precio: 89,    anterior: 120, cat: "hogar",       disp: true, img: "detergente.jpg" },
    { id: 6,  nombre: "Papel higiénico 12pk", precio: 65,    anterior: null,cat: "hogar",       disp: true, img: "papel.jpg" },
    { id: 7,  nombre: "Martillo de uña",      precio: 129,   anterior: null,cat: "ferreteria",  disp: true, img: "martillo.jpg" },
    { id: 8,  nombre: "Juego de desarmadores",precio: 159,  anterior: 179, cat: "ferreteria",  disp: true, img: "desarmadores.jpg" },
    { id: 9,  nombre: "Refresco 2L",          precio: 24,    anterior: null,cat: "bebidas",     disp: true, img: "refresco.jpg" },
    { id: 10, nombre: "Agua mineral 1.5L",   precio: 12.50, anterior: null,cat: "bebidas",     disp: true, img: "agua.jpg" },
    { id: 11, nombre: "Shampoo 750ml",       precio: 54.90, anterior: null,cat: "belleza",     disp: true, img: "shampoo.jpg" },
    { id: 12, nombre: "Jabón 3pk",           precio: 42,    anterior: null,cat: "belleza",     disp: true, img: "jabon.jpg" },
    { id: 13, nombre: "Croquetas perro 2kg", precio: 189,   anterior: 210, cat: "mascotas",    disp: true, img: "croquetas.jpg" },
    { id: 14, nombre: "Arena para gato 4kg", precio: 115,   anterior: null,cat: "mascotas",    disp: true, img: "arena.jpg" }
  ];

  // Relaciona la clave interna de cada categoría con el nombre que ve el usuario.
  const CATEGORIAS = {
    alimentos: "Alimentos",
    cervezas: "Cervezas, Vinos y Licores",
    hogar: "Hogar",
    ferreteria: "Ferretería",
    bebidas: "Bebidas",
    belleza: "Belleza y cuidado personal",
    mascotas: "Mascotas"
  };

  // Guarda los filtros y el estado actual de la página.
  const state = {
    categoria: "alimentos",
    minPrecio: 0,
    maxPrecio: 300,
    soloDisponibles: true,
    orden: "relevancia",
    carrito: 0
  };

  // Obtiene elementos HTML que JavaScript actualizará.
  const grid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");
  const foundCount = document.getElementById("foundCount");
  const catTitle = document.getElementById("catTitle");
  const cartBadge = document.getElementById("cartBadge");
  const toast = document.getElementById("toastCart");
  const toastText = document.getElementById("toastText");
  const minRange = document.getElementById("minRange");
  const maxRange = document.getElementById("maxRange");
  const minInput = document.getElementById("minInput");
  const maxInput = document.getElementById("maxInput");
  const rangeFill = document.getElementById("rangeFill");
  const MAX = 300; // Precio máximo permitido por el filtro.
  const GAP = 5;   // Diferencia mínima entre los dos precios.

  // Convierte un número a formato de precio.
  const dinero = n => `$${n.toFixed(2).replace(".", ",")}`;

  // Devuelve productos de la categoría, rango de precio y disponibilidad elegidos.
  function filtrar() {
    return PRODUCTOS
      .filter(p => p.cat === state.categoria && p.precio >= state.minPrecio && p.precio <= state.maxPrecio)
      .filter(p => !state.soloDisponibles || p.disp);
  }

  // Ordena una copia de la lista para no modificar el catálogo original.
  function ordenar(lista) {
    const copia = [...lista];
    if (state.orden === "precio-asc") copia.sort((a, b) => a.precio - b.precio);
    if (state.orden === "precio-desc") copia.sort((a, b) => b.precio - a.precio);
    if (state.orden === "nombre") copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return copia;
  }

  // Dibuja o actualiza las tarjetas de productos y los textos de la página.
  function render() {
    const lista = ordenar(filtrar());
    catTitle.textContent = CATEGORIAS[state.categoria] || "Productos";
    foundCount.textContent = `(${lista.length} productos encontrados)`;
    emptyState.classList.toggle("d-none", lista.length > 0);
    // map() crea el HTML de cada producto; join("") une las tarjetas en un solo texto.
    grid.innerHTML = lista.map(p => `
      <div class="col-12 col-md-6 card-anim">
        <div class="product-card">
          <div class="product-img-wrap">
            ${p.anterior ? '<span class="oferta-tag">OFERTA</span>' : ''}
            ${p.disp ? `<button class="add-btn" data-id="${p.id}" aria-label="Añadir ${p.nombre}"><i class="bi bi-plus-lg"></i></button>` : ''}
            <a href="producto.html"><img src="../img/productos/${p.img}" alt="${p.nombre}" loading="lazy"></a>
          </div>
          <div class="product-body">
            <span class="stock-badge ${p.disp ? 'in' : 'out'}">
              <i class="bi ${p.disp ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>${p.disp ? 'Disponible' : 'Agotado'}
            </span>
            <a href="producto.html" class="product-link"><div class="product-name">${p.nombre}</div></a>
            <div class="price-row">
              <span class="price-now">${dinero(p.precio)}</span>
              ${p.anterior ? `<span class="price-old">${dinero(p.anterior)}</span>` : ''}
            </div>
          </div>
        </div>
      </div>`).join("");
  }

  // Sincroniza los controles del precio y la barra visual con state.
  function actualizarRangoUI() {
    rangeFill.style.left = `${state.minPrecio / MAX * 100}%`;
    rangeFill.style.right = `${100 - state.maxPrecio / MAX * 100}%`;
    minInput.value = state.minPrecio;
    maxInput.value = state.maxPrecio;
    minRange.value = state.minPrecio;
    maxRange.value = state.maxPrecio;
  }

  // Actualiza el filtro visual y vuelve a mostrar los productos.
  function refrescarRango() {
    actualizarRangoUI();
    render();
  }

  // Cuando se mueve el precio mínimo, evita que quede demasiado cerca del máximo.
  minRange.addEventListener("input", function () {
    let min = Number(minRange.value);
    const max = Number(maxRange.value);
    if (min > max - GAP) min = max - GAP;
    state.minPrecio = Math.max(0, min);
    refrescarRango();
  });

  // Cuando se mueve el precio máximo, conserva la separación mínima.
  maxRange.addEventListener("input", function () {
    const min = Number(minRange.value);
    let max = Number(maxRange.value);
    if (max < min + GAP) max = min + GAP;
    state.maxPrecio = Math.min(MAX, max);
    refrescarRango();
  });

  // Lee los precios escritos, limita sus valores y actualiza los filtros.
  function cambiarInputPrecio() {
    let min = Math.max(0, Math.min(MAX, Number(minInput.value) || 0));
    let max = Math.max(0, Math.min(MAX, Number(maxInput.value) || MAX));
    if (min > max) [min, max] = [max, min];
    state.minPrecio = min;
    state.maxPrecio = max;
    refrescarRango();
  }

  minInput.addEventListener("change", cambiarInputPrecio);
  maxInput.addEventListener("change", cambiarInputPrecio);

  // Detecta clics en las categorías y actualiza la categoría seleccionada.
  document.getElementById("catList").addEventListener("click", e => {
    const li = e.target.closest("li[data-cat]");
    if (!li) return;
    document.querySelectorAll("#catList li").forEach(item => item.classList.remove("active"));
    li.classList.add("active");
    state.categoria = li.dataset.cat;
    render();
    if (window.innerWidth < 992) {
      const panel = bootstrap.Collapse.getInstance(document.getElementById("filterCollapse"));
      if (panel) panel.hide();
    }
  });

  // Activa o desactiva el filtro de productos disponibles.
  document.getElementById("stockToggle").addEventListener("change", e => {
    state.soloDisponibles = e.target.checked;
    render();
  });

  // Cambia el criterio de ordenamiento seleccionado.
  document.getElementById("sortSelect").addEventListener("change", e => {
    state.orden = e.target.value;
    render();
  });

  // Maneja los clics en los botones de agregar al carrito.
  let toastTimer; // Guarda el temporizador del aviso para poder reiniciarlo.
  grid.addEventListener("click", e => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;

    // Busca el producto cuyo id está guardado en el botón pulsado.
    const prod = PRODUCTOS.find(p => p.id === Number(btn.dataset.id));
    if (!prod) return;

    // Si existe la función del carrito principal, envía el producto a esa función.
    if (typeof addProductToCart === "function") {
      addProductToCart({
        id: prod.id,
        name: prod.nombre,
        price: prod.precio,
        img: `../img/productos/${prod.img}`,
        quantity: 1
      });
    }

    // Actualiza el contador y muestra una confirmación visual.
    state.carrito += 1;
    cartBadge.textContent = state.carrito;
    btn.classList.add("added");
    btn.innerHTML = '<i class="bi bi-check-lg"></i>';
    setTimeout(() => {
      btn.classList.remove("added");
      btn.innerHTML = '<i class="bi bi-plus-lg"></i>';
    }, 900);

    // Muestra un aviso temporal y reinicia su temporizador si ya estaba visible.
    toastText.textContent = `${prod.nombre} añadido al carrito`;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  });

  // Estado inicial: contador, controles de precio y catálogo.
  cartBadge.textContent = state.carrito;
  actualizarRangoUI();
  render();
})();
