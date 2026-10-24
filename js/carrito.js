document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartBadgeCount = document.getElementById("cart-badge-count");
    const cartTitleCount = document.getElementById("cart-title-count");
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryDiscount = document.getElementById("summary-discount");
    const summaryTotal = document.getElementById("summary-total");
    const btnCheckout = document.getElementById("btn-checkout");
    const couponCodeInput = document.getElementById("coupon-code");
    const applyCouponButton = document.getElementById("apply-coupon");
    const couponMessage = document.getElementById("coupon-message");
    const branchSelect = document.getElementById("branch-select");
    const timeSlots = document.querySelectorAll(".time-slot");
    const pickupDateInput = document.getElementById("pickup-date");
    const checkoutMessageModal = document.getElementById("checkout-message-modal");
    const checkoutMessageTitle = document.getElementById("checkout-message-title");
    const checkoutMessageBody = document.getElementById("checkout-message-body");
    let appliedCoupon = null;

    function showCheckoutMessage(title, message) {
        checkoutMessageTitle.textContent = title;
        checkoutMessageBody.textContent = message;
        bootstrap.Modal.getOrCreateInstance(checkoutMessageModal).show();
    }

    function showCouponMessage(message, type) {
        couponMessage.textContent = message;
        couponMessage.className = `small mt-1 text-${type}`;
    }

    function loadCoupons() {
        const savedCoupons = localStorage.getItem("tienda3v_cupones");
        if (savedCoupons === null) {
            return [{ codigo: "BIENVENIDO10", descuento: 10, activo: true }];
        }

        const coupons = JSON.parse(savedCoupons);
        if (!Array.isArray(coupons)) {
            throw new Error("La lista de cupones guardada no es válida.");
        }
        return coupons;
    }

    // Renderizar carrito
    function renderCart() {
        let cart = obtenerCarrito(); // Desde global.js
        cartItemsContainer.innerHTML = '';
        let totalSubtotal = 0;
        let totalProductsCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                        <i class="bi bi-cart-x fs-1 d-block mb-2"></i>
                        Tu carrito está vacío
                    </td>
                </tr>
            `;
        } else {
            cart.forEach(item => {
                let subtotal = item.precio * item.cantidad;
                totalSubtotal += subtotal;
                totalProductsCount += item.cantidad;
                const imagePath = item.img && item.img.startsWith("img/")
                    ? `../${item.img}`
                    : item.img;

                cartItemsContainer.innerHTML += `
                    <tr data-id="${item.id}">
                        <td class="ps-4 py-3">
                            <div class="d-flex align-items-center gap-3">
                                <div class="bg-light p-2 rounded-3 border" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
                                    <img src="${imagePath}" alt="${item.nombre}" style="max-height: 100%; object-fit: contain;">
                                </div>
                                <span class="fw-semibold text-dark" style="font-size: 14px;">${item.nombre}</span>
                            </div>
                        </td>
                        <td class="text-secondary" style="font-size: 14px;">$${item.precio.toFixed(2)}</td>
                        <td>
                            <div class="input-group input-group-sm quantity-control border rounded bg-light" style="width: 100px;">
                                <button class="btn btn-light border-0 text-dark px-2 btn-minus" type="button">-</button>
                                <input type="text" class="form-control text-center border-0 bg-light px-0 quantity-input" value="${item.cantidad}" readonly style="font-size: 14px;">
                                <button class="btn btn-light border-0 text-dark px-2 btn-plus" type="button">+</button>
                            </div>
                        </td>
                        <td class="fw-bold text-primary subtotal-text" style="font-size: 14px;">$${subtotal.toFixed(2)}</td>
                        <td>
                            <button class="btn btn-link text-danger p-0 btn-delete" type="button"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        let discount = appliedCoupon && totalSubtotal > 0
            ? Number((totalSubtotal * appliedCoupon.descuento / 100).toFixed(2))
            : 0;
        let finalTotal = Math.max(0, totalSubtotal - discount);

        // Actualizar textos en el resumen del pedido
        summarySubtotal.textContent = "$" + totalSubtotal.toFixed(2);
        summaryDiscount.textContent = "-$" + discount.toFixed(2);
        summaryTotal.textContent = "$" + finalTotal.toFixed(2);
        btnCheckout.textContent = "Confirmar pedido $" + finalTotal.toFixed(2);

        // Actualizar contadores superiores del carrito si existen
        if (cartBadgeCount) cartBadgeCount.textContent = totalProductsCount;
        if (cartTitleCount) cartTitleCount.textContent = `(${totalProductsCount} ${totalProductsCount === 1 ? 'producto' : 'productos'})`;
    }

    applyCouponButton.addEventListener("click", function () {
        const code = couponCodeInput.value.trim().toUpperCase();
        appliedCoupon = null;

        if (!code) {
            showCouponMessage("Ingresa un código de cupón.", "danger");
            renderCart();
            return;
        }

        let coupons;
        try {
            coupons = loadCoupons();
        } catch (error) {
            console.error("No se pudieron cargar los cupones:", error);
            showCouponMessage("No se pudieron cargar los cupones. Intenta de nuevo.", "danger");
            renderCart();
            return;
        }

        const coupon = coupons.find(item =>
            item && typeof item.codigo === "string" &&
            item.codigo.toUpperCase() === code
        );

        if (!coupon) {
            showCouponMessage("El cupón no existe.", "danger");
        } else if (coupon.activo !== true) {
            showCouponMessage("Este cupón no está activo.", "danger");
        } else if (!Number.isInteger(coupon.descuento) || coupon.descuento < 1 || coupon.descuento > 100) {
            showCouponMessage("El descuento de este cupón no es válido.", "danger");
        } else {
            appliedCoupon = coupon;
            couponCodeInput.value = code;
            showCouponMessage(`Cupón aplicado: ${coupon.descuento}% de descuento.`, "success");
        }

        renderCart();
    });

    // Eventos para botones de cantidad (+) y (-) y eliminar (bote de basura)
    cartItemsContainer.addEventListener("click", function (e) {
        let targetButton = e.target.closest("button");
        if (!targetButton) return;

        let row = targetButton.closest("tr");
        if (!row) return;

        let productId = row.getAttribute("data-id");

        // Botón Incrementar (+)
        if (targetButton.classList.contains("btn-plus")) {
            let input = row.querySelector(".quantity-input");
            let qty = parseInt(input.value) + 1;
            actualizarCantidad(productId, qty);
            renderCart();
        }

        // Botón Decrementar (-)
        if (targetButton.classList.contains("btn-minus")) {
            let input = row.querySelector(".quantity-input");
            let qty = parseInt(input.value);
            if (qty > 1) {
                actualizarCantidad(productId, qty - 1);
                renderCart();
            }
        }

        // Botón Eliminar (Bote de basura)
        if (targetButton.classList.contains("btn-delete")) {
            eliminarDelCarritoLocal(productId);
            renderCart();
        }
    });

    // Interactividad para los botones de horarios
    timeSlots.forEach(slot => {
        slot.addEventListener("click", function () {
            timeSlots.forEach(s => {
                s.classList.remove("active-slot", "btn-outline-primary", "fw-medium");
                s.classList.add("btn-outline-secondary", "text-muted", "bg-light", "border-0");
            });
            this.classList.remove("btn-outline-secondary", "text-muted", "bg-light", "border-0");
            this.classList.add("active-slot", "btn-outline-primary", "fw-medium");
        });
    });

    btnCheckout.addEventListener("click", function () {
        if (obtenerCarrito().length === 0) {
            showCheckoutMessage("Carrito vacío", "Agrega al menos un producto antes de confirmar el pedido.");
            return;
        }

        const branch = branchSelect.options[branchSelect.selectedIndex].textContent.trim();
        const pickupDate = pickupDateInput.value.trim();
        const selectedTimeSlot = document.querySelector(".time-slot.active-slot");

        if (!pickupDate || !selectedTimeSlot) {
            showCheckoutMessage("Faltan datos", "Selecciona una fecha y un horario para recoger tu pedido.");
            return;
        }

        showCheckoutMessage(
            "Pedido confirmado",
            `Sucursal: ${branch}\nFecha de recolección: ${pickupDate}\nHorario: ${selectedTimeSlot.textContent.trim()}`
        );
    });

    // Cargar la fecha actual en el selector de fecha
    if (pickupDateInput) {
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let today = new Date().toLocaleDateString('es-MX', options);
        pickupDateInput.value = "Hoy, " + today;
    }

    // Llamada inicial
    renderCart();
});