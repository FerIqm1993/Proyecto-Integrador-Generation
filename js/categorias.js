(() => {
  "use strict"; // Evita algunos usos inseguros o errores comunes de JavaScript.

  // Obtiene elementos HTML que JavaScript actualizará.
  const grid = document.getElementById("productGrid");
  const catList = document.getElementById("catList");
  if (!grid || !catList) return; // Solo ejecutar en la página de categorías.

  // Catálogo: cada objeto contiene los datos de un producto.
  const CLAVE_PRODUCTOS = "tienda3v_productos";
  const PRODUCTOS_RESPALDO = [
    { id: 1, nombre: "Aceite vegetal 1L", descripcion: "Aceite vegetal de cocina botella 1L abarrotes", precio: 45.90, anterior: 65, cat: "alimentos", disp: true, img: "aceite.jpg" },
    { id: 2, nombre: "Leche entera 1L", descripcion: "Leche entera ultrapasteurizada 1L lacteos abarrotes", precio: 28.50, anterior: 34, cat: "alimentos", disp: true, img: "leche.jpg" },
    { id: 3, nombre: "Vino tinto 750ml", descripcion: "Vino tinto botella de 750ml licores", precio: 145, anterior: 180, cat: "cervezas", disp: true, img: "vino.jpg" },
    { id: 4, nombre: "Cerveza clara 6pk", descripcion: "Paquete de 6 cervezas claras", precio: 98, anterior: null, cat: "cervezas", disp: true, img: "cerveza.jpg" },
    { id: 5, nombre: "Detergente 3kg", descripcion: "Detergente en polvo multiusos 3kg limpieza", precio: 89, anterior: 120, cat: "hogar", disp: true, img: "detergente.jpg" },
    { id: 6, nombre: "Papel higiénico 12pk", descripcion: "Paquete de 12 rollos de papel higienico limpieza hogar", precio: 65, anterior: null, cat: "hogar", disp: true, img: "papel.jpg" },
    { id: 7, nombre: "Martillo de uña", descripcion: "Martillo de una uso domestico y profesional herramienta", precio: 129, anterior: null, cat: "ferreteria", disp: true, img: "martillo.jpg" },
    { id: 8, nombre: "Juego de desarmadores", descripcion: "Juego de desarmadores de precision herramienta", precio: 159, anterior: 179, cat: "ferreteria", disp: true, img: "desarmadores.jpg" },
    { id: 9, nombre: "Refresco 2L", descripcion: "Refresco sabor cola botella 2L bebidas", precio: 24, anterior: null, cat: "bebidas", disp: true, img: "refresco.jpg" },
    { id: 10, nombre: "Agua mineral 1.5L", descripcion: "Agua mineral natural botella 1.5L bebidas", precio: 12.50, anterior: null, cat: "bebidas", disp: true, img: "agua.jpg" },
    { id: 11, nombre: "Shampoo 750ml", descripcion: "Shampoo cuidado diario 750ml higiene personal", precio: 54.90, anterior: null, cat: "belleza", disp: true, img: "shampoo.jpg" },
    { id: 12, nombre: "Jabón 3pk", descripcion: "Paquete de 3 jabones de tocador limpieza higiene", precio: 42, anterior: null, cat: "belleza", disp: true, img: "jabon.jpg" },
    { id: 13, nombre: "Croquetas perro 2kg", descripcion: "Alimento balanceado para perro 2kg mascotas", precio: 189, anterior: 210, cat: "mascotas", disp: true, img: "croquetas.jpg" },
    { id: 14, nombre: "Arena para gato 4kg", descripcion: "Arena aglutinante para gato 4kg mascotas", precio: 115, anterior: null, cat: "mascotas", disp: true, img: "arena.jpg" }
  ];

  function obtenerProductos() {
    try {
      const guardados = JSON.parse(localStorage.getItem(CLAVE_PRODUCTOS));
      if (Array.isArray(guardados) && guardados.length > 0) {
        return guardados;
      }
    } catch (error) {
      console.error(error);
    }
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(PRODUCTOS_RESPALDO));
    return [...PRODUCTOS_RESPALDO];
  }

  let PRODUCTOS = obtenerProductos();

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

  const SINONIMOS_CATEGORIA = {
    alimentos: "abarrotes despensa comida cocina lacteos leche aceite",
    cervezas: "vinos licores alcohol botella",
    hogar: "limpieza detergente papel bano casa",
    ferreteria: "herramientas martillo desarmadores reparacion",
    bebidas: "refresco agua jugos",
    belleza: "cuidado personal higiene shampoo jabon",
    mascotas: "perro gato croquetas arena alimento"
  };

  function normalizarTexto(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function coincideConBusqueda(producto, terminoRaw) {
    const termino = normalizarTexto(terminoRaw);
    if (!termino) return true;

    const textoProducto = normalizarTexto([
      producto.nombre,
      producto.descripcion,
      producto.cat,
      CATEGORIAS[producto.cat] || "",
      SINONIMOS_CATEGORIA[producto.cat] || ""
    ].join(" "));

    const palabras = termino.split(/\s+/).filter(Boolean);
    return palabras.every(palabra => textoProducto.includes(palabra));
  }

  // Guarda los filtros y el estado actual de la página.
  const paramsUrl = new URLSearchParams(window.location.search);
  const state = {
    categoria: "alimentos",
    minPrecio: 0,
    maxPrecio: 300,
    soloDisponibles: true,
    orden: "relevancia",
    busqueda: (paramsUrl.get("q") || "").trim()
  };

  const categoriaSolicitada = paramsUrl.get("categoria");
  if (Object.prototype.hasOwnProperty.call(CATEGORIAS, categoriaSolicitada)) {
    state.categoria = categoriaSolicitada;
  }

  const emptyState = document.getElementById("emptyState");
  const foundCount = document.getElementById("foundCount");
  const catTitle = document.getElementById("catTitle");
  const toast = document.getElementById("toastCart");
  const toastText = document.getElementById("toastText");
  const minRange = document.getElementById("minRange");
  const maxRange = document.getElementById("maxRange");
  const minInput = document.getElementById("minInput");
  const maxInput = document.getElementById("maxInput");
  const rangeFill = document.getElementById("rangeFill");
  const MAX = 300; // Precio máximo permitido por el filtro.
  const GAP = 5;   // Diferencia mínima entre los dos precios.

  function obtenerRutaImagen(img) {
    if (!img) return "../img/productos/aceite.jpg";
    if (img.startsWith("data:image/") || img.startsWith("http") || img.startsWith("../img/")) {
      return img;
    }
    if (img.startsWith("img/")) {
      return `../${img}`;
    }
    return `../img/productos/${img}`;
  }

  function filtrarPorCategoriaYPrecio(categoria) {
    return PRODUCTOS
      .filter(p => p.cat === categoria && p.precio >= state.minPrecio && p.precio <= state.maxPrecio)
      .filter(p => !state.soloDisponibles || p.disp)
      .filter(p => coincideConBusqueda(p, state.busqueda));
  }

  function actualizarConteosCategorias() {
    catList.querySelectorAll("li[data-cat]").forEach(item => {
      const contador = item.querySelector(".count");
      if (!contador) return;
      const cantidad = filtrarPorCategoriaYPrecio(item.dataset.cat).length;
      contador.textContent = `(${cantidad})`;
    });
  }

  function sincronizarSeleccionCategoriaUI() {
    document.querySelectorAll("#catList li").forEach(item => {
      item.classList.toggle("active", !state.busqueda && item.dataset.cat === state.categoria);
    });
  }
  sincronizarSeleccionCategoriaUI();

  // Convierte un número a formato de precio.
  const dinero = n => `$${Number(n).toFixed(2).replace(".", ",")}`;

  // Devuelve productos de la categoría (o de todo el catálogo si hay búsqueda activa), rango de precio y disponibilidad elegidos.
  function filtrar() {
    return PRODUCTOS
      .filter(p => (state.busqueda ? true : p.cat === state.categoria))
      .filter(p => p.precio >= state.minPrecio && p.precio <= state.maxPrecio)
      .filter(p => !state.soloDisponibles || p.disp)
      .filter(p => coincideConBusqueda(p, state.busqueda));
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
    actualizarConteosCategorias();
    sincronizarSeleccionCategoriaUI();
    const lista = ordenar(filtrar());
    if (state.busqueda) {
      catTitle.textContent = `Resultados para "${state.busqueda}"`;
    } else {
      catTitle.textContent = CATEGORIAS[state.categoria] || "Productos";
    }
    foundCount.textContent = `(${lista.length} ${lista.length === 1 ? "producto encontrado" : "productos encontrados"})`;
    emptyState.classList.toggle("d-none", lista.length > 0);
    // map() crea el HTML de cada producto; join("") une las tarjetas en un solo texto.
    grid.innerHTML = lista.map(p => `
      <div class="col-12 col-md-6 card-anim">
        <div class="product-card">
          <div class="product-img-wrap">
            ${p.anterior ? '<span class="oferta-tag">OFERTA</span>' : ''}
            ${p.disp ? `<button class="add-btn" data-id="${p.id}" aria-label="Añadir ${p.nombre}"><i class="bi bi-plus-lg"></i></button>` : ''}
            <img src="${obtenerRutaImagen(p.img)}" alt="${p.nombre}" loading="lazy">
          </div>
          <div class="product-body">
            <span class="stock-badge ${p.disp ? 'in' : 'out'}">
              <i class="bi ${p.disp ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>${p.disp ? 'Disponible' : 'Agotado'}
            </span>
            <div class="product-link"><div class="product-name">${p.nombre}</div></div>
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
    const topeMax = Number(maxRange.max) || MAX;
    rangeFill.style.left = `${state.minPrecio / topeMax * 100}%`;
    rangeFill.style.right = `${100 - state.maxPrecio / topeMax * 100}%`;
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
    const topeMax = Number(maxRange.max) || MAX;
    const min = Number(minRange.value);
    let max = Number(maxRange.value);
    if (max < min + GAP) max = min + GAP;
    state.maxPrecio = Math.min(topeMax, max);
    refrescarRango();
  });

  // Lee los precios escritos, limita sus valores y actualiza los filtros.
  function cambiarInputPrecio() {
    const topeMax = Number(maxRange.max) || MAX;
    let min = Math.max(0, Math.min(topeMax, Number(minInput.value) || 0));
    let max = Math.max(0, Math.min(topeMax, Number(maxInput.value) || topeMax));
    if (min > max) [min, max] = [max, min];
    state.minPrecio = min;
    state.maxPrecio = max;
    refrescarRango();
  }

  minInput.addEventListener("change", cambiarInputPrecio);
  maxInput.addEventListener("change", cambiarInputPrecio);

  // Detecta clics en las categorías y actualiza la categoría seleccionada.
  catList.addEventListener("click", e => {
    const li = e.target.closest("li[data-cat]");
    if (!li) return;
    state.categoria = li.dataset.cat;
    state.busqueda = "";
    const inputNav = document.querySelector('#form-buscador input[type="search"]');
    if (inputNav) inputNav.value = "";
    render();
    if (window.innerWidth < 992) {
      const panel = bootstrap.Collapse.getInstance(document.getElementById("filterCollapse"));
      if (panel) panel.hide();
    }
  });

  // Escuchar escritura y envío en la barra de búsqueda del navbar dentro de Categorías
  document.addEventListener("input", e => {
    if (e.target && e.target.matches('#form-buscador input[type="search"]')) {
      state.busqueda = e.target.value.trim();
      render();
    }
  });

  window.addEventListener("busquedaCatalogo", e => {
    state.busqueda = (e.detail && e.detail.termino ? e.detail.termino : "").trim();
    render();
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
    if (typeof agregarProductoAlCarrito === "function") {
      agregarProductoAlCarrito({
        id: prod.id,
        nombre: prod.nombre,
        precio: prod.precio,
        img: obtenerRutaImagen(prod.img),
        cantidad: 1
      });
    }

    // Actualiza el contador y muestra una confirmación visual.
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
  actualizarRangoUI();
  render();

  // Sincronizar con el Backend API (Spring Boot + MySQL)
  if (typeof sincronizarProductosDesdeApi === "function") {
    sincronizarProductosDesdeApi().then(desdeApi => {
      if (Array.isArray(desdeApi) && desdeApi.length > 0) {
        PRODUCTOS = desdeApi;
        const maxEnCat = Math.max(MAX, ...PRODUCTOS.map(p => Number(p.precio) || 0));
        if (maxEnCat > state.maxPrecio && state.maxPrecio === MAX) {
          state.maxPrecio = Math.ceil(maxEnCat);
          maxRange.max = state.maxPrecio;
          maxInput.max = state.maxPrecio;
          actualizarRangoUI();
        }
        render();
      }
    });
  }

  window.addEventListener("storage", event => {
    if (event.key !== CLAVE_PRODUCTOS && event.key !== null) return;
    PRODUCTOS = obtenerProductos();
    actualizarConteosCategorias();
    render();
  });
})();
