// global.js
const CART_STORAGE_KEY = 'tienda3v_cart';

function getCart() {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function addProductToCart(product) {
    let cart = getCart();
    // Check if it already exists
    let existing = cart.find(item => item.id == product.id);
    if (existing) {
        existing.quantity += (product.quantity || 1);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            quantity: product.quantity || 1
        });
    }
    saveCart(cart);
}

function updateCartBadge() {
    let cart = getCart();
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    let badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
        badge.textContent = totalItems;
    });
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id != productId);
    saveCart(cart);
}

function updateQuantity(productId, quantity) {
    let cart = getCart();
    let existing = cart.find(item => item.id == productId);
    if (existing) {
        existing.quantity = parseInt(quantity);
        if(existing.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
    }
    saveCart(cart);
}

document.addEventListener('DOMContentLoaded', () => {
    // Global logic across all pages (e.g. mobile menu toggles, search interactions)
    updateCartBadge();
});
