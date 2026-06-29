// User Store State & Logic with Realtime Firebase Sync
let products = JSON.parse(localStorage.getItem('jastip_products')) || INITIAL_PRODUCTS;
let orders = JSON.parse(localStorage.getItem('jastip_orders')) || INITIAL_ORDERS;
let registeredUsers = JSON.parse(localStorage.getItem('jastip_registered_users')) || [
  { name: 'Rian Mahasiswa', email: 'rian.student@gmail.com', password: 'password123' }
];
let currentUser = JSON.parse(localStorage.getItem('jastip_current_user')) || null;
let currentCategory = 'ALL';
let searchQuery = '';

function saveState() {
  localStorage.setItem('jastip_products', JSON.stringify(products));
  localStorage.setItem('jastip_orders', JSON.stringify(orders));
  localStorage.setItem('jastip_registered_users', JSON.stringify(registeredUsers));
  localStorage.setItem('jastip_current_user', JSON.stringify(currentUser));

  if (typeof db !== 'undefined' && db) {
    try {
      db.ref('products').set(products);
      db.ref('orders').set(orders);
      db.ref('registered_users').set(registeredUsers);
    } catch (e) {
      console.warn("Cloud write info:", e);
    }
  }
}

function initFirebaseRealtimeSync() {
  if (typeof db !== 'undefined' && db) {
    db.ref('products').on('value', snapshot => {
      if (snapshot.exists()) {
        products = snapshot.val();
        localStorage.setItem('jastip_products', JSON.stringify(products));
        renderUserProducts();
      } else {
        db.ref('products').set(INITIAL_PRODUCTS);
      }
    });

    db.ref('orders').on('value', snapshot => {
      if (snapshot.exists()) {
        orders = snapshot.val();
        localStorage.setItem('jastip_orders', JSON.stringify(orders));
      } else {
        db.ref('orders').set(INITIAL_ORDERS);
      }
    });
  }
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

// DOM Elements
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const authBtn = document.getElementById('authBtn');
const myOrdersBtn = document.getElementById('myOrdersBtn');

// Modals & Views
const checkoutModal = document.getElementById('checkoutModal');
const loginModal = document.getElementById('loginModal');
const orderHistoryModal = document.getElementById('orderHistoryModal');
const tabMasukBtn = document.getElementById('tabMasukBtn');
const tabDaftarBtn = document.getElementById('tabDaftarBtn');
const authMasukView = document.getElementById('authMasukView');
const authDaftarView = document.getElementById('authDaftarView');
const authLupaPasswordView = document.getElementById('authLupaPasswordView');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLoginBtn = document.getElementById('backToLoginBtn');

document.addEventListener('DOMContentLoaded', () => {
  renderUserProducts();
  updateAuthUI();
  setupEventListeners();
  initFirebaseRealtimeSync();
});

function setupEventListeners() {
  if (tabMasukBtn && tabDaftarBtn) {
    tabMasukBtn.addEventListener('click', showMasukView);
    tabDaftarBtn.addEventListener('click', showDaftarView);
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      authMasukView.style.display = 'none';
      authDaftarView.style.display = 'none';
      authLupaPasswordView.style.display = 'block';
    });
  }

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', showMasukView);
  }

  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmailInput').value;
      const found = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (found) {
        alert(`📧 Tautan Reset Kata Sandi telah dikirim ke inbox ${email}!\n\n(Simulasi: Kata sandi Anda saat ini adalah: "${found.password}")`);
      } else {
        alert(`📧 Jika email ${email} terdaftar di sistem kami, instruksi reset telah dikirimkan ke inbox Anda.`);
      }
      forgotPasswordForm.reset();
      showMasukView();
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regNameInput').value;
      const email = document.getElementById('regEmailInput').value;
      const password = document.getElementById('regPasswordInput').value;

      const existing = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        alert('❌ Email tersebut sudah terdaftar! Silakan pindah ke tab Masuk.');
        return;
      }

      const newUser = { name, email, password };
      registeredUsers.push(newUser);
      currentUser = { name: newUser.name, email: newUser.email };
      saveState();
      updateAuthUI();
      closeModal(loginModal);
      registerForm.reset();
      alert(`🎉 Akun Berhasil Didaftarkan!\n\nSelamat datang, ${currentUser.name}. Fitur "Pesanan Saya" kini aktif.`);
    });
  }

  const loginEmailForm = document.getElementById('loginEmailForm');
  if (loginEmailForm) {
    loginEmailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmailInput').value;
      const password = document.getElementById('loginPasswordInput').value;

      const found = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (found) {
        currentUser = { name: found.name, email: found.email };
        saveState();
        updateAuthUI();
        closeModal(loginModal);
        loginEmailForm.reset();
        alert(`🎉 Berhasil Masuk! Selamat datang kembali, ${currentUser.name}.`);
      } else {
        currentUser = { name: email.split('@')[0].toUpperCase(), email: email };
        saveState();
        updateAuthUI();
        closeModal(loginModal);
        loginEmailForm.reset();
        alert(`🎉 Berhasil Masuk sebagai ${currentUser.email}.`);
      }
    });
  }

  document.querySelectorAll('.pill-btn[data-category]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.pill-btn[data-category]').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      renderUserProducts();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderUserProducts();
    });
  }

  if (authBtn) {
    authBtn.addEventListener('click', () => {
      if (currentUser) {
        const choice = confirm(`Halo ${currentUser.name}! (${currentUser.email})\n\nTekan [OK] untuk lihat "Riwayat Pesanan Saya"\nTekan [Batal] untuk Logout.`);
        if (choice) {
          renderUserOrderHistory();
          openModal(orderHistoryModal);
        } else {
          currentUser = null;
          saveState();
          updateAuthUI();
          alert('Anda telah logout.');
        }
      } else {
        showMasukView();
        openModal(loginModal);
      }
    });
  }

  if (myOrdersBtn) {
    myOrdersBtn.addEventListener('click', () => {
      renderUserOrderHistory();
      openModal(orderHistoryModal);
    });
  }

  document.querySelectorAll('.modal-close, .closeModalBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(checkoutModal);
      closeModal(loginModal);
      closeModal(orderHistoryModal);
    });
  });

  document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);
}

function showMasukView() {
  if (tabMasukBtn && tabDaftarBtn) {
    tabMasukBtn.classList.add('active');
    tabDaftarBtn.classList.remove('active');
  }
  authMasukView.style.display = 'block';
  authDaftarView.style.display = 'none';
  authLupaPasswordView.style.display = 'none';
}

function showDaftarView() {
  if (tabMasukBtn && tabDaftarBtn) {
    tabDaftarBtn.classList.add('active');
    tabMasukBtn.classList.remove('active');
  }
  authDaftarView.style.display = 'block';
  authMasukView.style.display = 'none';
  authLupaPasswordView.style.display = 'none';
}

function updateAuthUI() {
  if (!authBtn) return;
  if (currentUser) {
    authBtn.innerHTML = '👤';
    authBtn.classList.add('logged-in');
    authBtn.title = `Akun: ${currentUser.email}`;
    if (myOrdersBtn) myOrdersBtn.style.display = 'inline-flex';
  } else {
    authBtn.innerHTML = '👤';
    authBtn.classList.remove('logged-in');
    authBtn.title = 'Masuk / Daftar Akun';
    if (myOrdersBtn) myOrdersBtn.style.display = 'none';
  }
}

function renderUserProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = '';
  const filtered = products.filter(p => {
    const matchesCat = currentCategory === 'ALL' || p.main_category === currentCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
      <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">🔍 Barang Tidak Ditemukan</h3>
      <p>Coba gunakan kata kunci pencarian lain atau pilih kategori lain.</p>
    </div>`;
    return;
  }

  filtered.forEach(p => {
    const totalCost = p.price_original + p.jastip_fee;
    const tagClass = p.main_category === 'MAKANAN_MINUMAN' ? 'tag-makanan' : 'tag-peralatan';
    const tagText = p.main_category === 'MAKANAN_MINUMAN' ? '🍕 Makanan & Minuman' : '📚 Alat Kuliah';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrapper">
        <img src="${p.image_url}" alt="${p.title}" class="product-img">
        <span class="category-tag ${tagClass}">${tagText}</span>
      </div>
      <div class="product-content">
        <h3 class="product-title">${p.title}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="price-card">
          <div class="price-item">
            <span>Harga Asli:</span>
            <span>${formatRupiah(p.price_original)}</span>
          </div>
          <div class="price-item">
            <span>Jastip Fee:</span>
            <span>+ ${formatRupiah(p.jastip_fee)}</span>
          </div>
          <div class="price-grand-total">
            <span>Total Transparan:</span>
            <span>${formatRupiah(totalCost)}</span>
          </div>
        </div>
        <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="openCheckout('${p.id}')">
          🛒 Titip Barang Ini
        </button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

window.openCheckout = function(productId) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById('checkoutProductId').value = prod.id;
  const total = prod.price_original + prod.jastip_fee;
  
  document.getElementById('checkoutProductSummary').innerHTML = `
    <div style="font-weight: 800; font-size: 1.15rem; margin-bottom: 0.6rem; color: var(--text-main);">${prod.title}</div>
    <div class="price-item"><span>Harga Asli Barang:</span> <span>${formatRupiah(prod.price_original)}</span></div>
    <div class="price-item"><span>Biaya Jasa Titip (Fee):</span> <span>+ ${formatRupiah(prod.jastip_fee)}</span></div>
    <div class="price-grand-total"><span>Total Bayar Transparan:</span> <span>${formatRupiah(total)}</span></div>
  `;

  if (currentUser) {
    document.getElementById('buyerName').value = currentUser.name;
  }

  openModal(checkoutModal);
};

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const prodId = document.getElementById('checkoutProductId').value;
  const prod = products.find(p => p.id === prodId);
  if (!prod) return;

  const name = document.getElementById('buyerName').value;
  const wa = document.getElementById('buyerWa').value;
  const notes = document.getElementById('buyerNotes').value;
  const total = prod.price_original + prod.jastip_fee;

  const newOrder = {
    id: 'ord-' + Date.now(),
    order_number: 'JST-' + Math.floor(100000 + Math.random() * 900000),
    user_name: name,
    user_email: currentUser ? currentUser.email : 'guest@jastipkampus.com',
    user_wa: wa,
    product_title: prod.title,
    quantity: 1,
    price_original: prod.price_original,
    jastip_fee: prod.jastip_fee,
    total_amount: total,
    status: 'PENDING',
    delivery_notes: notes,
    created_at: new Date().toISOString()
  };

  orders.unshift(newOrder);
  saveState();

  closeModal(checkoutModal);
  
  const waText = `Halo JastipKampus! 👋%0ASaya ingin memesan Jastip berikut:%0A%0A📌 *No. Invoice*: ${newOrder.order_number}%0A📦 *Barang*: ${prod.title}%0A💰 *Total Biaya*: ${formatRupiah(total)}%0A👤 *Nama*: ${name}%0A📍 *Lokasi COD/Kost*: ${notes}`;
  
  alert(`✅ Pesanan Berhasil Dibuat! Invoice: ${newOrder.order_number}\n\nSistem mengarahkan Anda ke WhatsApp untuk konfirmasi serah terima.`);
  window.open(`https://wa.me/6281234567890?text=${waText}`, '_blank');
}

function renderUserOrderHistory() {
  const container = document.getElementById('userOrdersList');
  if (!container) return;
  container.innerHTML = '';

  let userOrders = orders;
  if (currentUser) {
    userOrders = orders.filter(o => o.user_email === currentUser.email || o.user_name === currentUser.name);
  }

  if (userOrders.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
      <p>Belum ada riwayat pesanan.</p>
    </div>`;
    return;
  }

  userOrders.forEach(o => {
    let statusClass = 'status-pending';
    if (o.status === 'DIBELI') statusClass = 'status-dibeli';
    if (o.status === 'SELESAI') statusClass = 'status-selesai';

    const item = document.createElement('div');
    item.className = 'price-card';
    item.style.marginBottom = '1.2rem';
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
        <span style="font-weight: 800; color: #4f46e5; font-size: 1rem;">${o.order_number}</span>
        <span class="status-badge ${statusClass}">${o.status}</span>
      </div>
      <div style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-main);">${o.product_title}</div>
      <div class="price-item"><span>Total Pembayaran:</span> <span style="color: #059669; font-weight: 800;">${formatRupiah(o.total_amount)}</span></div>
      <div class="price-item"><span>Catatan COD / Kost:</span> <span>${o.delivery_notes}</span></div>
    `;
    container.appendChild(item);
  });
}

function openModal(modal) { if (modal) modal.classList.add('active'); }
function closeModal(modal) { if (modal) modal.classList.remove('active'); }
