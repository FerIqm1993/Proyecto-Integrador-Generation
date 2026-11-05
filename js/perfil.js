// perfil.js - Gestión de perfil de usuario, historial de pedidos y panel administrativo
(() => {
    "use strict";

    const URL_API = window.API_BASE_URL || "http://localhost:8080/api";

    const MAPA_SUCURSALES = {
        1: "Sucursal Insurgentes Centro (CDMX)",
        2: "Sucursal Guadalajara Centro (Jalisco)",
        3: "Sucursal Monterrey Tec (Nuevo León)"
    };

    const MAPA_METODOS_PAGO = {
        1: "Tarjeta bancaria",
        2: "Pago contra entrega en sucursal"
    };

    let sesion = typeof obtenerSesionActiva === "function"
        ? obtenerSesionActiva()
        : JSON.parse(localStorage.getItem("sesionActiva") || "null");

    if (!sesion || !sesion.email) {
        window.location.replace("login.html");
        return;
    }

    let usuarioActualDb = null;
    let pedidosUsuario = [];

    function fechaLocalISO(fecha = new Date()) {
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");
        return `${año}-${mes}-${dia}`;
    }

    function formatearFechaRecoleccion(fecha) {
        if (!fecha) return "Sin seleccionar";
        const [año, mes, dia] = String(fecha).slice(0, 10).split("-").map(Number);
        if (!año || !mes || !dia) return "Sin seleccionar";
        return new Date(año, mes - 1, dia).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function obtenerRecoleccionesGuardadas() {
        try {
            const recolecciones = JSON.parse(localStorage.getItem("tienda3v_recolecciones_pedidos") || "{}");
            return recolecciones && typeof recolecciones === "object" ? recolecciones : {};
        } catch (error) {
            console.warn("No se pudieron leer las fechas de recolección guardadas:", error.message);
            return {};
        }
    }

    function guardarFechaHoraPedido(pedidoId, fecha, horario) {
        const recolecciones = obtenerRecoleccionesGuardadas();
        recolecciones[String(pedidoId)] = { fecha, horario };
        try {
            localStorage.setItem("tienda3v_recolecciones_pedidos", JSON.stringify(recolecciones));
            return true;
        } catch (error) {
            console.warn("No se pudo guardar la fecha de recolección del pedido:", error.message);
            return false;
        }
    }

    function headersAdmin() {
        if (typeof obtenerHeadersAdmin === "function") {
            return obtenerHeadersAdmin();
        }
        const h = { "Content-Type": "application/json" };
        if (sesion.token) h["Authorization"] = `Bearer ${sesion.token}`;
        if (sesion.id != null) h["X-Usuario-Id"] = String(sesion.id);
        if (sesion.rol) h["X-Usuario-Rol"] = String(sesion.rol);
        return h;
    }

    function obtenerNombreSucursal(p) {
        if (p.sucursal && p.sucursal.nombre) return p.sucursal.nombre;
        return MAPA_SUCURSALES[p.sucursalId] || `Sucursal #${p.sucursalId || 1}`;
    }

    function obtenerNombreMetodoPago(p) {
        if (p.metodoPago && p.metodoPago.nombre) return p.metodoPago.nombre;
        return MAPA_METODOS_PAGO[p.metodoPagoId] || "Pago en sucursal";
    }

    function formatearMoneda(monto) {
        return "$" + Number(monto || 0).toFixed(2);
    }

    function formatearFecha(iso) {
        if (!iso) return "Reciente";
        try {
            const fecha = new Date(iso);
            return fecha.toLocaleString("es-MX", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (e) {
            return iso;
        }
    }

    function claseBadgeEstado(estado) {
        const est = String(estado || "pendiente").toLowerCase();
        if (est === "entregado" || est === "completado") return "bg-success text-white";
        if (est === "listo_para_recoger" || est === "listo") return "bg-info text-dark";
        if (est === "preparando" || est === "en_proceso") return "bg-primary text-white";
        if (est === "cancelado") return "bg-danger text-white";
        return "bg-warning text-dark";
    }

    function textoEstadoLegible(estado) {
        const mapa = {
            pendiente: "Pendiente",
            preparando: "En preparación",
            listo_para_recoger: "Listo en sucursal",
            entregado: "Entregado",
            cancelado: "Cancelado"
        };
        return mapa[String(estado || "pendiente").toLowerCase()] || estado || "Pendiente";
    }

    function obtenerIniciales(nombreCompleto) {
        const partes = String(nombreCompleto || "Usuario").trim().split(/\s+/);
        if (partes.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }
        return (partes[0][0] || "U").toUpperCase();
    }

    function separarNombreCompleto(nombreCompleto) {
        const partes = String(nombreCompleto || "").trim().split(/\s+/);
        if (partes.length <= 1) {
            return { nombre: partes[0] || "", apellido: "" };
        }
        return {
            nombre: partes[0],
            apellido: partes.slice(1).join(" ")
        };
    }

    function actualizarEncabezadoUI() {
        const nombreMostrar = sesion.nombre || "Usuario Tienda 3V";
        document.getElementById("avatarIniciales").textContent = obtenerIniciales(nombreMostrar);
        document.getElementById("perfilNombreTitulo").textContent = nombreMostrar;
        document.getElementById("perfilCorreoSubtitulo").textContent = sesion.email;

        const badge = document.getElementById("perfilRolBadge");
        const btnIrAdmin = document.getElementById("btnIrAdminProductos");
        const seccionAdmin = document.getElementById("seccion-admin");

        if (sesion.rol === "admin") {
            badge.textContent = "Administrador";
            badge.className = "badge bg-warning text-dark";
            btnIrAdmin.classList.remove("d-none");
            seccionAdmin.classList.remove("d-none");
        } else {
            badge.textContent = "Cliente";
            badge.className = "badge bg-primary";
            btnIrAdmin.classList.add("d-none");
            seccionAdmin.classList.add("d-none");
        }
    }

    async function cargarDatosUsuarioDesdeBackend() {
        try {
            let resp = null;
            if (sesion.id != null) {
                resp = await fetch(`${URL_API}/usuarios/${sesion.id}`, { headers: headersAdmin() });
            }
            if (!resp || !resp.ok) {
                resp = await fetch(`${URL_API}/usuarios/correo/${encodeURIComponent(sesion.email)}`, { headers: headersAdmin() });
            }
            if (resp && resp.ok) {
                usuarioActualDb = await resp.json();
                const esAdmin = Boolean(usuarioActualDb.rol && usuarioActualDb.rol.nombre === "administrador");
                const nombreCompleto = `${usuarioActualDb.nombre || ""} ${usuarioActualDb.apellido || ""}`.trim();

                sesion = {
                    ...sesion,
                    id: usuarioActualDb.id,
                    email: usuarioActualDb.correo,
                    nombre: nombreCompleto,
                    nombreSolo: usuarioActualDb.nombre || "",
                    apellidoSolo: usuarioActualDb.apellido || "",
                    telefono: usuarioActualDb.telefono || "",
                    rol: esAdmin ? "admin" : "usuario"
                };
                localStorage.setItem("sesionActiva", JSON.stringify(sesion));

                document.getElementById("inputNombre").value = usuarioActualDb.nombre || "";
                document.getElementById("inputApellido").value = usuarioActualDb.apellido || "";
                document.getElementById("inputCorreo").value = usuarioActualDb.correo || sesion.email;
                document.getElementById("inputTelefono").value = usuarioActualDb.telefono || "";
                actualizarEncabezadoUI();
                return;
            }
        } catch (err) {
            console.warn("Cargando perfil desde sesión local:", err.message);
        }

        const partes = separarNombreCompleto(sesion.nombre);
        document.getElementById("inputNombre").value = sesion.nombreSolo || partes.nombre;
        document.getElementById("inputApellido").value = sesion.apellidoSolo || partes.apellido;
        document.getElementById("inputCorreo").value = sesion.email || "";
        document.getElementById("inputTelefono").value = sesion.telefono || "";
        actualizarEncabezadoUI();
    }

    async function guardarCambiosPerfil(e) {
        e.preventDefault();
        const alerta = document.getElementById("alertaPerfil");
        alerta.innerHTML = "";

        const nombre = document.getElementById("inputNombre").value.trim();
        const apellido = document.getElementById("inputApellido").value.trim();
        const telefono = document.getElementById("inputTelefono").value.trim().replace(/[\s()-]/g, "");

        if (nombre.length < 2 || apellido.length < 2) {
            alerta.innerHTML = `<div class="alert alert-danger py-2 small">Nombre y apellido deben tener al menos 2 caracteres.</div>`;
            return;
        }
        if (!/^\d{10}$/.test(telefono)) {
            alerta.innerHTML = `<div class="alert alert-danger py-2 small">El teléfono debe tener exactamente 10 dígitos numéricos.</div>`;
            return;
        }

        const nombreCompleto = `${nombre} ${apellido}`.trim();

        if (sesion.id != null) {
            try {
                const payload = {
                    rol: usuarioActualDb && usuarioActualDb.rol ? { id: usuarioActualDb.rol.id } : { id: sesion.rol === "admin" ? 2 : 1 },
                    nombre,
                    apellido,
                    correo: sesion.email,
                    telefono,
                    aceptaTerminos: true,
                    activo: true
                };
                const resp = await fetch(`${URL_API}/usuarios/${sesion.id}`, {
                    method: "PUT",
                    headers: headersAdmin(),
                    body: JSON.stringify(payload)
                });
                if (!resp.ok) {
                    throw new Error(`HTTP ${resp.status}`);
                }
                usuarioActualDb = await resp.json();
            } catch (err) {
                console.warn("Actualizando perfil en almacenamiento local:", err.message);
            }
        }

        sesion = {
            ...sesion,
            nombre: nombreCompleto,
            nombreSolo: nombre,
            apellidoSolo: apellido,
            telefono
        };
        localStorage.setItem("sesionActiva", JSON.stringify(sesion));
        actualizarEncabezadoUI();

        alerta.innerHTML = `<div class="alert alert-success py-2 small"><i class="bi bi-check-circle-fill me-1"></i>Tus datos se actualizaron correctamente.</div>`;
    }

    async function cargarMisPedidos() {
        const contenedor = document.getElementById("contenedorMisPedidos");
        let pedidos = [];

        try {
            if (sesion.id != null) {
                const resp = await fetch(`${URL_API}/pedidos/usuario/${sesion.id}`, { headers: headersAdmin() });
                if (resp.ok) {
                    pedidos = await resp.json();
                }
            }
            // También incluir pedidos que coincidan por correo o teléfono
            if (!Array.isArray(pedidos) || pedidos.length === 0) {
                const respTodos = await fetch(`${URL_API}/pedidos`, { headers: headersAdmin() });
                if (respTodos.ok) {
                    const todos = await respTodos.json();
                    pedidos = todos.filter(p =>
                        (sesion.id != null && p.usuarioId === sesion.id) ||
                        (p.correoCliente && p.correoCliente.toLowerCase() === sesion.email.toLowerCase()) ||
                        (sesion.telefono && p.telefonoCliente === sesion.telefono)
                    );
                }
            }
        } catch (err) {
            console.warn("No se pudieron cargar pedidos desde la API:", err.message);
        }

        const recoleccionesGuardadas = obtenerRecoleccionesGuardadas();
        pedidosUsuario = Array.isArray(pedidos) ? pedidos.map(p => {
            const guardada = recoleccionesGuardadas[String(p.id)];
            return guardada ? {
                ...p,
                fechaRecoleccion: guardada.fecha || p.fechaRecoleccion || p.fechaEntrega,
                horarioRecoleccion: guardada.horario || p.horarioRecoleccion || p.horarioEntrega
            } : p;
        }) : [];
        if (!Array.isArray(pedidos) || pedidos.length === 0) {
            contenedor.innerHTML = `
                <div class="text-center py-5 border rounded-4 bg-light">
                    <i class="bi bi-bag-x fs-1 text-secondary d-block mb-2"></i>
                    <h6 class="fw-bold text-dark">Aún no tienes pedidos registrados</h6>
                    <p class="text-muted small mb-3">Explora nuestras ofertas de la semana y recoge tu despensa en sucursal.</p>
                    <a href="../index.html#ofertas" class="btn btn-primary btn-sm px-4">Ver productos</a>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = `
            <div class="d-flex flex-column gap-3">
                ${pedidosUsuario.map(p => {
                    const sucursalNombre = obtenerNombreSucursal(p);
                    const metodoNombre = obtenerNombreMetodoPago(p);
                    const codigoCupon = p.codigoCupon || (p.cupon && p.cupon.codigo);
                    const cuponTexto = codigoCupon ? `<span class="badge bg-light text-primary border ms-2">Cupón: ${codigoCupon}</span>` : "";
                    const fechaPedido = p.creadoEn || p.fechaCreacion;
                    const fechaRecoleccion = p.fechaRecoleccion || p.fechaEntrega;
                    const horarioRecoleccion = p.horarioRecoleccion || p.horarioEntrega;
                    const estado = String(p.estado || "pendiente").toLowerCase();
                    const permiteModificar = !["entregado", "completado", "cancelado"].includes(estado);
                    return `
                        <div class="border rounded-4 p-3 bg-white shadow-sm">
                            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 border-bottom pb-2 mb-2">
                                <div>
                                    <span class="fw-bold text-dark">Pedido #${p.id}</span>
                                    <span class="text-muted small ms-2"><i class="bi bi-clock me-1"></i>${formatearFecha(fechaPedido)}</span>
                                    ${cuponTexto}
                                </div>
                                <span class="estado-badge ${claseBadgeEstado(p.estado)} fw-semibold">
                                    ${textoEstadoLegible(p.estado)}
                                </span>
                            </div>
                            <div class="row g-2 align-items-center small">
                                <div class="col-12 col-md-5">
                                    <div class="text-muted"><i class="bi bi-shop me-1 text-primary"></i><strong>Sucursal:</strong> ${sucursalNombre}</div>
                                    <div class="text-muted"><i class="bi bi-credit-card me-1 text-primary"></i><strong>Pago:</strong> ${metodoNombre}</div>
                                    <div class="text-muted"><i class="bi bi-calendar-event me-1 text-primary"></i><strong>Recolección:</strong> ${formatearFechaRecoleccion(fechaRecoleccion)}</div>
                                    <div class="text-muted"><i class="bi bi-clock me-1 text-primary"></i><strong>Horario:</strong> ${horarioRecoleccion || "Sin seleccionar"}</div>
                                </div>
                                <div class="col-6 col-md-4">
                                    <div class="text-muted">Subtotal: ${formatearMoneda(p.subtotal)}</div>
                                    ${Number(p.descuento) > 0 ? `<div class="text-success">Descuento: -${formatearMoneda(p.descuento)}</div>` : ""}
                                    <div class="fw-bold text-dark fs-6">Total: ${formatearMoneda(p.total)}</div>
                                </div>
                                <div class="col-6 col-md-3 text-end">
                                    <button type="button" class="btn btn-sm btn-outline-primary btn-ver-detalle" data-pedido-id="${p.id}">
                                        <i class="bi bi-eye me-1"></i>Ver productos
                                    </button>
                                    ${permiteModificar ? `
                                        <button type="button" class="btn btn-sm btn-outline-secondary btn-modificar-pedido mt-1" data-pedido-id="${p.id}">
                                            <i class="bi bi-calendar2-check me-1"></i>Modificar pedido
                                        </button>
                                    ` : ""}
                                </div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function abrirModalModificarPedido(pedidoId) {
        const pedido = pedidosUsuario.find(p => String(p.id) === String(pedidoId));
        if (!pedido) return;

        const fechaInput = document.getElementById("fechaRecoleccionPedido");
        const horarioInput = document.getElementById("horarioRecoleccionPedido");
        const alerta = document.getElementById("alertaModificarPedido");
        const hoy = fechaLocalISO();
        const fechaActual = pedido.fechaRecoleccion || pedido.fechaEntrega || "";
        const horarioActual = pedido.horarioRecoleccion || pedido.horarioEntrega || "";

        fechaInput.min = hoy;
        fechaInput.value = String(fechaActual).slice(0, 10);
        horarioInput.value = horarioActual;
        document.getElementById("modificarPedidoId").value = String(pedido.id);
        alerta.innerHTML = "";
        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalModificarPedido")).show();
    }

    async function guardarCambiosRecoleccion(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const pedidoId = document.getElementById("modificarPedidoId").value;
        const fecha = document.getElementById("fechaRecoleccionPedido").value;
        const horario = document.getElementById("horarioRecoleccionPedido").value;
        const alerta = document.getElementById("alertaModificarPedido");
        const boton = document.getElementById("btnGuardarCambiosRecoleccion");

        alerta.innerHTML = "";
        if (!fecha || fecha < fechaLocalISO() || !horario) {
            alerta.innerHTML = `<div class="alert alert-warning py-2 small">Selecciona una fecha a partir de hoy y un horario.</div>`;
            return;
        }

        boton.disabled = true;
        let errorApi = "";
        try {
            const resp = await fetch(`${URL_API}/pedidos/${encodeURIComponent(pedidoId)}/recoleccion`, {
                method: "PATCH",
                headers: headersAdmin(),
                body: JSON.stringify({
                    fechaRecoleccion: fecha,
                    horarioRecoleccion: horario
                })
            });
            if (!resp.ok) {
                errorApi = `HTTP ${resp.status}`;
            }
        } catch (err) {
            errorApi = err.message;
        }

        const guardadoLocal = guardarFechaHoraPedido(pedidoId, fecha, horario);
        if (!guardadoLocal && errorApi) {
            alerta.innerHTML = `<div class="alert alert-danger py-2 small">No se pudo guardar el cambio. El servidor respondió ${errorApi} y el navegador tampoco pudo guardarlo.</div>`;
            boton.disabled = false;
            return;
        }

        const pedido = pedidosUsuario.find(p => String(p.id) === String(pedidoId));
        if (pedido) {
            pedido.fechaRecoleccion = fecha;
            pedido.horarioRecoleccion = horario;
        }
        await cargarMisPedidos();

        if (errorApi) {
            alerta.innerHTML = `<div class="alert alert-warning py-2 small">La fecha y el horario se guardaron en este navegador, pero el servidor rechazó el cambio (${errorApi}). No se sincronizarán con otros dispositivos.</div>`;
        } else {
            bootstrap.Modal.getOrCreateInstance(document.getElementById("modalModificarPedido")).hide();
        }

        if (!guardadoLocal && !errorApi) {
            console.warn("El cambio se guardó en el servidor, pero no pudo almacenarse en este navegador.");
        }
        boton.disabled = false;
    }

    async function abrirModalDetallePedido(pedidoId) {
        const modalEl = document.getElementById("modalDetallePedido");
        const titulo = document.getElementById("modalDetallePedidoLabel");
        const cuerpo = document.getElementById("modalDetallePedidoBody");

        titulo.textContent = `Productos del Pedido #${pedidoId}`;
        cuerpo.innerHTML = `<div class="text-center py-4 text-muted">Cargando productos del pedido...</div>`;

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();

        try {
            const resp = await fetch(`${URL_API}/detalles-pedido/pedido/${pedidoId}`, { headers: headersAdmin() });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const detalles = await resp.json();

            if (!Array.isArray(detalles) || detalles.length === 0) {
                cuerpo.innerHTML = `<div class="alert alert-info mb-0">No se encontraron líneas de detalle registradas para este pedido.</div>`;
                return;
            }

            cuerpo.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-striped align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th class="text-center">Cantidad</th>
                                <th class="text-end">Precio Unitario</th>
                                <th class="text-end">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${detalles.map(d => {
                                const nombreProd = d.nombreProducto || (d.producto && (d.producto.nombreProducto || d.producto.nombre)) || `Producto #${d.productoId || ""}`;
                                return `
                                    <tr>
                                        <td class="fw-semibold">${nombreProd}</td>
                                        <td class="text-center">${d.cantidad}</td>
                                        <td class="text-end">${formatearMoneda(d.precioUnitario)}</td>
                                        <td class="text-end fw-bold">${formatearMoneda(d.subtotal)}</td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) {
            cuerpo.innerHTML = `<div class="alert alert-danger mb-0">Error al consultar el detalle del pedido: ${err.message}</div>`;
        }
    }

    // ==========================================
    // FUNCIONES EXCLUSIVAS DE ADMINISTRADOR
    // ==========================================

    async function cargarDatosPanelAdmin() {
        if (sesion.rol !== "admin") return;

        await Promise.all([
            cargarAdminPedidos(),
            cargarAdminUsuarios(),
            cargarAdminMensajes()
        ]);
    }

    async function cargarAdminPedidos() {
        const tbody = document.getElementById("tablaAdminPedidos");
        const contador = document.getElementById("contadorAdminPedidos");
        try {
            const resp = await fetch(`${URL_API}/pedidos`, { headers: headersAdmin() });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const pedidos = await resp.json();
            contador.textContent = pedidos.length;

            if (pedidos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">No hay pedidos registrados.</td></tr>`;
                return;
            }

            const estadosDisponibles = [
                { valor: "pendiente", texto: "Pendiente" },
                { valor: "preparando", texto: "En preparación" },
                { valor: "listo_para_recoger", texto: "Listo en sucursal" },
                { valor: "entregado", texto: "Entregado" },
                { valor: "cancelado", texto: "Cancelado" }
            ];

            tbody.innerHTML = pedidos.map(p => {
                const sucursal = obtenerNombreSucursal(p);
                const metodo = obtenerNombreMetodoPago(p);
                const estadoActual = String(p.estado || "pendiente").toLowerCase();
                const opciones = estadosDisponibles.map(op =>
                    `<option value="${op.valor}" ${op.valor === estadoActual ? "selected" : ""}>${op.texto}</option>`
                ).join("");

                return `
                    <tr>
                        <td class="fw-bold">#${p.id}</td>
                        <td>
                            <div class="fw-semibold">${p.nombreCliente || "Cliente"}</div>
                            <div class="small text-muted">${p.correoCliente || ""} ${p.telefonoCliente ? "· " + p.telefonoCliente : ""}</div>
                        </td>
                        <td class="small">${sucursal}</td>
                        <td class="small">${metodo}</td>
                        <td class="fw-bold text-primary">${formatearMoneda(p.total)}</td>
                        <td>
                            <select class="form-select form-select-sm select-estado-pedido" data-pedido-id="${p.id}" style="min-width: 155px;">
                                ${opciones}
                            </select>
                        </td>
                        <td>
                            <button type="button" class="btn btn-sm btn-outline-primary btn-ver-detalle" data-pedido-id="${p.id}">
                                <i class="bi bi-list-ul"></i> Productos
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-3">No se pudieron cargar los pedidos (${err.message}).</td></tr>`;
        }
    }

    async function cambiarEstadoPedidoAdmin(pedidoId, nuevoEstado) {
        const alerta = document.getElementById("alertaAdminGeneral");
        try {
            const resp = await fetch(`${URL_API}/pedidos/${pedidoId}/estado`, {
                method: "PATCH",
                headers: headersAdmin(),
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            alerta.innerHTML = `<div class="alert alert-success py-2 small">Estado del pedido #${pedidoId} actualizado a <strong>${textoEstadoLegible(nuevoEstado)}</strong>.</div>`;
            cargarMisPedidos();
        } catch (err) {
            alerta.innerHTML = `<div class="alert alert-danger py-2 small">No se pudo actualizar el pedido #${pedidoId}: ${err.message}</div>`;
        }
    }

    async function cargarAdminUsuarios() {
        const tbody = document.getElementById("tablaAdminUsuarios");
        const contador = document.getElementById("contadorAdminUsuarios");
        try {
            const resp = await fetch(`${URL_API}/usuarios`, { headers: headersAdmin() });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const usuarios = await resp.json();
            contador.textContent = usuarios.length;

            tbody.innerHTML = usuarios.map(u => {
                const esAdminUser = u.rol && u.rol.nombre === "administrador";
                const nombreCompleto = `${u.nombre || ""} ${u.apellido || ""}`.trim();
                const esAdminPrincipal = Number(u.id) === 1;
                return `
                    <tr>
                        <td>${u.id}</td>
                        <td class="fw-semibold">${nombreCompleto}</td>
                        <td>${u.correo}</td>
                        <td>${u.telefono || "—"}</td>
                        <td>
                            <span class="badge ${esAdminUser ? "bg-warning text-dark" : "bg-secondary"}">
                                ${esAdminUser ? "Administrador" : "Cliente"}
                            </span>
                        </td>
                        <td>
                            <span class="badge ${u.activo ? "bg-success" : "bg-danger"}">
                                ${u.activo ? "Activo" : "Inactivo"}
                            </span>
                        </td>
                        <td>
                            ${esAdminPrincipal
                                ? `<span class="text-muted small">Cuenta principal</span>`
                                : `<button type="button" class="btn btn-sm btn-outline-${u.activo ? "danger" : "success"} btn-toggle-usuario" data-usuario-id="${u.id}">
                                    ${u.activo ? "Desactivar" : "Activar"}
                                   </button>`
                            }
                        </td>
                    </tr>
                `;
            }).join("");

            window._usuariosAdminCache = usuarios;
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-3">No se pudieron cargar los usuarios (${err.message}).</td></tr>`;
        }
    }

    async function alternarEstadoUsuarioAdmin(usuarioId) {
        const lista = window._usuariosAdminCache || [];
        const u = lista.find(item => Number(item.id) === Number(usuarioId));
        if (!u) return;

        const alerta = document.getElementById("alertaAdminGeneral");
        try {
            const resp = await fetch(`${URL_API}/usuarios/${u.id}`, {
                method: "PUT",
                headers: headersAdmin(),
                body: JSON.stringify({
                    rol: u.rol ? { id: u.rol.id } : { id: 1 },
                    nombre: u.nombre,
                    apellido: u.apellido,
                    correo: u.correo,
                    telefono: u.telefono,
                    aceptaTerminos: Boolean(u.aceptaTerminos ?? true),
                    activo: !u.activo
                })
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            alerta.innerHTML = `<div class="alert alert-success py-2 small">Estado del usuario <strong>${u.correo}</strong> actualizado correctamente.</div>`;
            await cargarAdminUsuarios();
        } catch (err) {
            alerta.innerHTML = `<div class="alert alert-danger py-2 small">Error al actualizar usuario: ${err.message}</div>`;
        }
    }

    async function cargarAdminMensajes() {
        const tbody = document.getElementById("tablaAdminMensajes");
        const contador = document.getElementById("contadorAdminMensajes");
        try {
            const resp = await fetch(`${URL_API}/mensajes-contacto`, { headers: headersAdmin() });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const mensajes = await resp.json();
            contador.textContent = mensajes.length;

            if (mensajes.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No hay mensajes de contacto registrados.</td></tr>`;
                return;
            }

            tbody.innerHTML = mensajes.map(m => `
                <tr>
                    <td>#${m.id}</td>
                    <td class="fw-semibold">${m.nombre || "—"}</td>
                    <td>
                        <div>${m.correo || "—"}</div>
                        <div class="small text-muted">${m.telefono || ""}</div>
                    </td>
                    <td><span class="badge bg-info text-dark">${m.motivo || "General"}</span></td>
                    <td class="small" style="max-width: 320px;">${m.mensaje || ""}</td>
                    <td class="small text-muted">${formatearFecha(m.creadoEn || m.fechaCreacion)}</td>
                </tr>
            `).join("");
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-3">No se pudieron cargar los mensajes (${err.message}).</td></tr>`;
        }
    }

    // ==========================================
    // EVENTOS E INICIALIZACIÓN
    // ==========================================
    document.addEventListener("DOMContentLoaded", async () => {
        actualizarEncabezadoUI();
        await cargarDatosUsuarioDesdeBackend();
        await cargarMisPedidos();
        await cargarDatosPanelAdmin();

        document.getElementById("formActualizarPerfil").addEventListener("submit", guardarCambiosPerfil);
        document.getElementById("formModificarPedido").addEventListener("submit", guardarCambiosRecoleccion);

        document.getElementById("btnCerrarSesionPerfil").addEventListener("click", () => {
            if (typeof cerrarSesionUsuario === "function") {
                cerrarSesionUsuario();
            } else {
                localStorage.removeItem("sesionActiva");
                window.location.href = "../index.html";
            }
        });

        const btnRecargarAdmin = document.getElementById("btnRecargarAdmin");
        if (btnRecargarAdmin) {
            btnRecargarAdmin.addEventListener("click", cargarDatosPanelAdmin);
        }

        document.addEventListener("click", e => {
            const btnDetalle = e.target.closest(".btn-ver-detalle");
            if (btnDetalle) {
                abrirModalDetallePedido(btnDetalle.dataset.pedidoId);
            }
            const btnModificarPedido = e.target.closest(".btn-modificar-pedido");
            if (btnModificarPedido) {
                abrirModalModificarPedido(btnModificarPedido.dataset.pedidoId);
            }
            const btnToggleUser = e.target.closest(".btn-toggle-usuario");
            if (btnToggleUser) {
                alternarEstadoUsuarioAdmin(btnToggleUser.dataset.usuarioId);
            }
        });

        document.addEventListener("change", e => {
            if (e.target && e.target.classList.contains("select-estado-pedido")) {
                cambiarEstadoPedidoAdmin(e.target.dataset.pedidoId, e.target.value);
            }
        });
    });
})();
