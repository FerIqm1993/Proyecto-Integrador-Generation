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

    // Función principal para recalcular totales del carrito
    function updateCart() {
        let rows = cartItemsContainer.querySelectorAll("tr[data-price]");
        let totalSubtotal = 0;
        let totalProductsCount = 0;

        rows.forEach(row => {
            let price = parseFloat(row.getAttribute("data-price"));
            let quantityInput = row.querySelector(".quantity-input");
            let quantity = parseInt(quantityInput.value);
            let subtotal = price * quantity;

            // Actualizar subtotal visual de la fila
            row.querySelector(".subtotal-text").textContent = "$" + subtotal.toFixed(2);

            totalSubtotal += subtotal;
            totalProductsCount += quantity;
        });

        // Calcular descuento fijo de cupón ($25.00) solo si hay productos
        let discount = totalSubtotal > 0 ? 25.00 : 0.00;
        let finalTotal = Math.max(0, totalSubtotal - discount);

        // Actualizar textos en el resumen del pedido
        summarySubtotal.textContent = "$" + totalSubtotal.toFixed(2);
        summaryDiscount.textContent = totalSubtotal > 0 ? "-$" + discount.toFixed(2) : "$0.00";
        summaryTotal.textContent = "$" + finalTotal.toFixed(2);
        btnCheckout.textContent = "Confirmar pedido $" + finalTotal.toFixed(2);

        // Actualizar contadores superiores del carrito
        cartBadgeCount.textContent = totalProductsCount;
        cartTitleCount.textContent = `(${totalProductsCount} ${totalProductsCount === 1 ? 'producto' : 'productos'})`;

        // Si el carrito está vacío, mostrar mensaje
        if (rows.length === 0) {
            cartItemsContainer.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                        <i class="bi bi-cart-x fs-1 d-block mb-2"></i>
                        Tu carrito está vacío
                    </td>
                </tr>
            `;
        }
    }

    // Eventos para botones de cantidad (+) y (-) y eliminar (bote de basura)
    cartItemsContainer.addEventListener("click", function (e) {
        let targetButton = e.target.closest("button");
        if (!targetButton) return;

        let row = targetButton.closest("tr");
        if (!row) return;

        // Botón Incrementar (+)
        if (targetButton.classList.contains("btn-plus")) {
            let input = row.querySelector(".quantity-input");
            input.value = parseInt(input.value) + 1;
            updateCart();
        }

        // Botón Decrementar (-)
        if (targetButton.classList.contains("btn-minus")) {
            let input = row.querySelector(".quantity-input");
            let currentVal = parseInt(input.value);
            if (currentVal > 1) {
                input.value = currentVal - 1;
                updateCart();
            }
        }

        // Botón Eliminar (Bote de basura)
        if (targetButton.classList.contains("btn-delete")) {
            row.remove();
            updateCart();
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

    // Acción del botón de confirmar pedido
    btnCheckout.addEventListener("click", function () {
        let totalRows = cartItemsContainer.querySelectorAll("tr[data-price]").length;
        if (totalRows === 0) {
            alert("Tu carrito está vacío. Agrega productos antes de confirmar.");
            return;
        }
        let selectedBranch = document.getElementById("branch-select").value;
        let selectedDate = pickupDateInput ? pickupDateInput.value : "No especificada";
        let activeTime = document.querySelector(".time-slot.active-slot").textContent;
        
        alert(`¡Pedido confirmado con éxito!\n\nSucursal: ${selectedBranch}\nFecha de recolección: ${selectedDate}\nHorario: ${activeTime}\nTotal pagado: ${summaryTotal.textContent}`);
    });

    // Inicializar al cargar
    updateCart();
});