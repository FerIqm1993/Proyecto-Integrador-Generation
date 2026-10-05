function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

function addProductToCart(item) {
  let cart = getCart();
  const existing = cart.find(p => p.id === item.id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateQuantity(productId, quantity) {
  let cart = getCart();
  const item = cart.find(p => p.id === productId);
  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      cart = cart.filter(p => p.id !== productId);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}

function removeFromCartLocal(productId) {
  let cart = getCart();
  cart = cart.filter(p => p.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
}
