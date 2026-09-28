with open('js/inicio.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('let cart = [];', '')

old_addToCart = '''function addToCart(productId) {
  const item = products.find(p => p.id === productId);
  if (!item) return;

  const existing = cart.find(p => p.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  updateCartUI();
}'''

new_addToCart = '''function addToCart(productId) {
  const item = products.find(p => p.id === productId);
  if (!item) return;
  
  // Llama a la función global para sincronizar con localStorage
  addProductToCart({
    id: item.id,
    name: item.name,
    price: item.price,
    img: item.image,
    quantity: 1
  });
  
  updateCartUI();
}'''

text = text.replace(old_addToCart, new_addToCart)

old_update = '''function updateCartUI() {
  const cartCount = document.getElementById("cartCount");
  const cartItemsList = document.getElementById("cartItemsList");
  const cartTotal = document.getElementById("cartTotal");

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);'''

new_update = '''function updateCartUI() {
  let cart = getCart(); // desde global.js
  const cartCount = document.getElementById("cartCount");
  const cartItemsList = document.getElementById("cartItemsList");
  const cartTotal = document.getElementById("cartTotal");

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);'''

text = text.replace(old_update, new_update)

old_changeQuantity = '''function changeQuantity(productId, delta) {
  const item = cart.find(p => p.id === productId);
  if (!item) return;

  item.qty += delta;

  // Si la cantidad llega a 0, se elimina automáticamente del carrito
  if (item.qty <= 0) {
    cart = cart.filter(p => p.id !== productId);
  }

  updateCartUI();
}'''

new_changeQuantity = '''function changeQuantity(productId, delta) {
  let cart = getCart();
  const item = cart.find(p => p.id == productId);
  if (!item) return;
  updateQuantity(productId, item.quantity + delta);
  updateCartUI();
}'''

text = text.replace(old_changeQuantity, new_changeQuantity)

old_remove = '''function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
}'''

new_remove = '''function removeFromCartLocal(productId) {
  removeFromCart(productId);
  updateCartUI();
}'''

text = text.replace(old_remove, new_remove)
text = text.replace('removeFromCart(', 'removeFromCartLocal(')
text = text.replace('item.qty', 'item.quantity')
text = text.replace('item.image', 'item.img')

with open('js/inicio.js', 'w', encoding='utf-8') as f:
    f.write(text)
print('Updated inicio.js')
