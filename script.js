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

// Simple client-side auth (demo only) - stores users in localStorage under 'ss_users'
document.addEventListener('DOMContentLoaded', function () {
  const USERS_KEY = 'ss_users_v1';

  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveUsers(u) { try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch (e) {} }

  function showMessage(el, msg, ok) {
    if (!el) return; el.textContent = msg; el.style.color = ok ? 'green' : 'var(--muted)';
  }

  async function handleSignup(form) {
    const name = (form.querySelector('#name') || {}).value || '';
    const email = (form.querySelector('#email') || {}).value.trim().toLowerCase();
    const password = (form.querySelector('#password') || {}).value;
    const password2 = (form.querySelector('#password2') || {}).value;
    const msgEl = document.getElementById('signup-message');

    if (!name || !email || !password) { showMessage(msgEl, 'Please complete all fields.'); return; }
    if (password !== password2) { showMessage(msgEl, 'Passwords do not match.'); return; }

    const users = loadUsers();
    if (users.find(u => u.email === email)) { showMessage(msgEl, 'An account with that email already exists.'); return; }

    users.push({ name, email, password });
    saveUsers(users);
    showMessage(msgEl, 'Account created. Redirecting to login...', true);
    setTimeout(() => { window.location.href = 'login.html'; }, 900);
  }

  function handleLogin(form) {
    const email = (form.querySelector('#login-email') || {}).value.trim().toLowerCase();
    const password = (form.querySelector('#login-pass') || {}).value;
    const msgEl = document.getElementById('login-message');

    if (!email || !password) { showMessage(msgEl, 'Please enter email and password.'); return; }
    const users = loadUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { showMessage(msgEl, 'Invalid credentials.'); return; }

    try { localStorage.setItem('ss_current_user', JSON.stringify({ email: user.email, name: user.name })); } catch (e) {}
    showMessage(msgEl, 'Signed in — redirecting...', true);
    setTimeout(() => { window.location.href = 'index.html'; }, 700);
  }

  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (form && form.id === 'signup-form') {
      e.preventDefault(); handleSignup(form); return;
    }
    if (form && form.id === 'login-form') {
      e.preventDefault(); handleLogin(form); return;
    }
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
    // render items list if container exists
    if (cartItemsWrap) {
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
    }

    const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
    if (cartTotalValue) cartTotalValue.textContent = formatPrice(total);
    // always update badge (may be visible even when drawer absent)
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

// Generate 100 product cards on the Pricing page if needed
document.addEventListener('DOMContentLoaded', function () {
  try {
    if (!document.title || !document.title.toLowerCase().includes('pricing')) return;
    const grid = document.querySelector('.product-grid');
    if (!grid) return;
    // If there are already many items, skip generation
    if (grid.querySelectorAll('.product-card').length >= 20) return;

    for (let i = 5; i <= 104; i++) {
      const id = 'p' + i;
      const name = `Fashion Item ${i}`;
      const price = (19.99 + (i % 20) * 1.5).toFixed(2);
      const img = `https://picsum.photos/seed/${id}/400/300`;

      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${img}" alt="${name}">
        <h4>${name}</h4>
        <p>$${price}</p>
        <button class="add-to-cart" data-id="${id}" data-name="${name}" data-price="${price}">Add to Cart</button>
      `;
      grid.appendChild(card);
    }
  } catch (e) {
    console.error('Failed to generate pricing items', e);
  }
});

// Theme toggle: insert button and persist preference
document.addEventListener('DOMContentLoaded', function () {
  try {
    const header = document.querySelector('.headerarea');
    if (!header) return;
    if (header.querySelector('.theme-toggle')) return; // already added

    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark / light theme');
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = '<span class="material-icons">dark_mode</span>';

    // place after cart toggle if present, otherwise at end of headerarea
    const cartBtn = header.querySelector('.cart-toggle');
    if (cartBtn && cartBtn.parentElement === header) {
      header.insertBefore(btn, cartBtn.nextSibling);
    } else {
      header.appendChild(btn);
    }

    function applyTheme(dark) {
      document.body.classList.toggle('dark', dark);
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      const icon = btn.querySelector('.material-icons');
      if (icon) icon.textContent = dark ? 'light_mode' : 'dark_mode';
      try { localStorage.setItem('ss_theme', dark ? 'dark' : 'light'); } catch (e) {}
    }

    // read preference
    let pref = null;
    try { pref = localStorage.getItem('ss_theme'); } catch (e) {}
    if (pref === 'dark' || pref === 'light') {
      applyTheme(pref === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme(true);
    }

    btn.addEventListener('click', function () { applyTheme(!document.body.classList.contains('dark')); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
  } catch (e) {
    console.error('Failed to initialize theme toggle', e);
  }
});
