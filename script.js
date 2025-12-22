// Simple mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('.headerarea');
  if (!header) return;

  const toggle = header.querySelector('.menu-toggle');
  const nav = header.querySelector('.navlinks');
  const log = header.querySelector('.log');

  if (!toggle || !nav) return;

  // helper to open/close
  function setOpen(open) {
    nav.classList.toggle('open', open);
    if (log) log.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
  }

  // click / activate
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!nav.classList.contains('open'));
  });

  // keyboard support: Enter / Space to toggle, Escape to close
  toggle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!nav.classList.contains('open'));
    } else if (e.key === 'Escape') {
      setOpen(false);
      toggle.focus();
    }
  });

  // close on Escape when focus is inside nav
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // close nav when clicking outside
  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('open')) return;
    if (header.contains(e.target)) return; // click inside header (toggle already handled)
    setOpen(false);
  });
});

// Cart functionality
document.addEventListener('DOMContentLoaded', function () {
  const CART_KEY = 'ss_cart_v1';
  const cartToggle = document.querySelector('.cart-toggle');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartItemsWrap = document.querySelector('.cart-items');
  const cartTotalValue = document.querySelector('.cart-total-value');
  const cartBadge = document.querySelector('.cart-badge');
  const cartClose = document.querySelector('.cart-close');

  let cart = [];

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      cart = raw ? JSON.parse(raw) : [];
    } catch (e) {
      cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function formatPrice(n) {
    return '$' + Number(n).toFixed(2);
  }

  function updateBadge() {
    const count = cart.reduce((s, it) => s + it.qty, 0);
    if (cartBadge) cartBadge.textContent = count;
  }

  function renderCart() {
    if (!cartItemsWrap) return;
    cartItemsWrap.innerHTML = '';
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div style="flex:1">
          <h5>${item.name}</h5>
          <div class="item-meta">${formatPrice(item.price)} × ${item.qty}</div>
        </div>
        <div>
          <button class="remove-item" data-id="${item.id}" aria-label="Remove">✕</button>
        </div>`;
      cartItemsWrap.appendChild(div);
    });
    const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
    if (cartTotalValue) cartTotalValue.textContent = formatPrice(total);
    updateBadge();
  }

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    if (cartToggle) cartToggle.setAttribute('aria-expanded', 'true');
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    if (cartToggle) cartToggle.setAttribute('aria-expanded', 'false');
  }

  function addToCart(id, name, price) {
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, name, price: Number(price), qty: 1 });
    saveCart();
    renderCart();
    openCart();
  }

  // init
  loadCart();
  renderCart();

  // delegate add-to-cart
  document.addEventListener('click', function (e) {
    const btn = e.target.closest && e.target.closest('.add-to-cart');
    if (btn) {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      addToCart(id, name, price);
    }

    const rem = e.target.closest && e.target.closest('.remove-item');
    if (rem) {
      const id = rem.getAttribute('data-id');
      cart = cart.filter(i => i.id !== id);
      saveCart();
      renderCart();
    }
  });

  if (cartToggle) cartToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (cartDrawer.classList.contains('open')) closeCart(); else openCart();
  });

  if (cartClose) cartClose.addEventListener('click', function () { closeCart(); });

  // close when clicking outside drawer
  document.addEventListener('click', function (e) {
    if (!cartDrawer) return;
    if (!cartDrawer.classList.contains('open')) return;
    if (cartDrawer.contains(e.target) || (cartToggle && cartToggle.contains(e.target))) return;
    closeCart();
  });

  // close on ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('open')) closeCart();
  });

});
