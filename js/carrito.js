document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartBadgeCount = document.getElementById("cart-badge-count");
    const cartTitleCount = document.getElementById("cart-title-count");
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryDiscount = document.getElementById("summary-discount");
    const summaryTotal = document.getElementById("summary-total");
    const btnCheckout = document.getElementById("btn-checkout");
    const timeSlots = document.querySelectorAll(".time-slot");
    const pickupDateInput = document.getElementById("pickup-date");

    // Renderizar carrito
    function renderCart() {
        let cart = getCart(); // desde global.js
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
                let subtotal = item.price * item.quantity;
                totalSubtotal += subtotal;
                totalProductsCount += item.quantity;

                cartItemsContainer.innerHTML += `
                    <tr data-id="${item.id}">
                        <td class="ps-4 py-3">
                            <div class="d-flex align-items-center gap-3">
                                <div class="bg-light p-2 rounded-3 border" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
                                    <img src="${item.img}" alt="${item.name}" style="max-height: 100%; object-fit: contain;">
                                </div>
                                <span class="fw-semibold text-dark" style="font-size: 14px;">${item.name}</span>
                            </div>
                        </td>
                        <td class="text-secondary" style="font-size: 14px;">$${item.price.toFixed(2)}</td>
                        <td>
                            <div class="input-group input-group-sm quantity-control border rounded bg-light" style="width: 100px;">
                                <button class="btn btn-light border-0 text-dark px-2 btn-minus" type="button">-</button>
                                <input type="text" class="form-control text-center border-0 bg-light px-0 quantity-input" value="${item.quantity}" readonly style="font-size: 14px;">
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

        // Calcular descuento fijo de cupón ($25.00) solo si hay productos
        let discount = totalSubtotal > 0 ? 25.00 : 0.00;
        let finalTotal = Math.max(0, totalSubtotal - discount);

        // Actualizar textos en el resumen del pedido
        summarySubtotal.textContent = "$" + totalSubtotal.toFixed(2);
        summaryDiscount.textContent = totalSubtotal > 0 ? "-$" + discount.toFixed(2) : "$0.00";
        summaryTotal.textContent = "$" + finalTotal.toFixed(2);
        btnCheckout.textContent = "Confirmar pedido $" + finalTotal.toFixed(2);

        // Actualizar contadores superiores del carrito si existen en carrito.html
        if (cartBadgeCount) cartBadgeCount.textContent = totalProductsCount;
        if (cartTitleCount) cartTitleCount.textContent = `(${totalProductsCount} ${totalProductsCount === 1 ? 'producto' : 'productos'})`;
    }

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
            updateQuantity(productId, qty);
            renderCart();
        }

        // Botón Decrementar (-)
        if (targetButton.classList.contains("btn-minus")) {
            let input = row.querySelector(".quantity-input");
            let qty = parseInt(input.value);
            if (qty > 1) {
                updateQuantity(productId, qty - 1);
                renderCart();
            }
        }

        // Botón Eliminar (Bote de basura)
        if (targetButton.classList.contains("btn-delete")) {
            removeFromCart(productId);
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

    // Cargar la fecha actual en el selector de fecha
    if (pickupDateInput) {
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let today = new Date().toLocaleDateString('es-MX', options);
        pickupDateInput.value = "Hoy, " + today;
    }

    // Llamada inicial
    renderCart();
});