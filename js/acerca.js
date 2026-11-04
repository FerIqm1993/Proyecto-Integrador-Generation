document.addEventListener('DOMContentLoaded', async () => {
    const URL_API_SUCURSALES = window.API_BASE_URL || "http://localhost:8080/api";
    const seccionSucursales = document.querySelector("#sucursales .row.g-4");
    if (!seccionSucursales) return;

    try {
        const resp = await fetch(`${URL_API_SUCURSALES}/sucursales`);
        if (!resp.ok) return;
        const sucursales = await resp.json();
        if (!Array.isArray(sucursales) || sucursales.length === 0) return;

        const activas = sucursales.filter(s => s.activa !== false);
        if (activas.length === 0) return;

        seccionSucursales.innerHTML = activas.map(s => `
            <div class="col-md-6 col-lg-4">
                <article class="sucursal">
                    <div class="tarjeta-sucursal">
                        <div class="cabecera-sucursal">
                            <div class="icono-ubicacion">
                                <i class="bi bi-geo-alt"></i>
                            </div>
                            <h3>${s.nombre}</h3>
                        </div>
                        <p class="direccion">
                            ${s.direccion}, ${s.ciudad}, ${s.estado}
                        </p>
                        <p class="horario"><i class="bi bi-calendar-fill"></i>
                            ${s.horario || "Lun - Dom: 8:00 AM - 9:00 PM"}
                        </p>
                    </div>
                    <img src="${s.mapaUrl || '../img/CDMX_Maps.png'}" alt="Mapa de ${s.nombre}" class="mapa-sucursal">
                </article>
            </div>
        `).join("");
    } catch (err) {
        console.warn("Mostrando sucursales estáticas (API no disponible):", err.message);
    }
});
