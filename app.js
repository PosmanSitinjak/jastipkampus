// Storefront Logic, Realtime Cloud Sync, Product Gallery & User Auth System
let products = JSON.parse(localStorage.getItem('jastip_products')) || INITIAL_PRODUCTS;
let orders = JSON.parse(localStorage.getItem('jastip_orders')) || INITIAL_ORDERS;
let registeredUsers = JSON.parse(localStorage.getItem('jastip_registered_users')) || [
  { name: 'Rian Mahasiswa', email: 'rian.student@gmail.com', password: 'password123' }
];
let currentUser = JSON.parse(localStorage.getItem('jastip_current_user')) || null;

let currentCategory = 'ALL';
let searchQuery = '';
let selectedDetailProduct = null;

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');
const authModal = document.getElementById('authModal');
const openAuthModalBtn = document.getElementById('openAuthModalBtn');
const userProfileMenu = document.getElementById('userProfileMenu');
const userGreeting = document.getElementById('userGreeting');
const logoutBtn = document.getElementById('logoutBtn');
const myOrdersNavBtn = document.getElementById('myOrdersNavBtn');
const myOrdersModal = document.getElementById('myOrdersModal');

// Product Detail & Gallery Modal Elements
const productDetailModal = document.getElementById('productDetailModal');
const detailMainImage = document.getElementById('detailMainImage');
const galleryThumbnailsWrapper = document.getElementById('galleryThumbnailsWrapper');
const detailProductTitle = document.getElementById('detailProductTitle');
const detailProductDesc = document.getElementById('detailProductDesc');
const detailCategoryBadge = document.getElementById('detailCategoryBadge');
const detailSourceStore = document.getElementById('detailSourceStore');
const detailWeight = document.getElementById('detailWeight');
const detailExpiry = document.getElementById('detailExpiry');
const detailOriginalPrice = document.getElementById('detailOriginalPrice');
const detailJastipFee = document.getElementById('detailJastipFee');
const detailGrandTotal = document.getElementById('detailGrandTotal');
const detailOrderWaBtn = document.getElementById('detailOrderWaBtn');

// Auth Form Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');
const authModalTitle = document.getElementById('authModalTitle');
const switchToRegisterBtn = document.getElementById('switchToRegisterBtn');
const switchToLoginFromRegBtn = document.getElementById('switchToLoginFromRegBtn');
const switchToForgotBtn = document.getElementById('switchToForgotBtn');
const switchToLoginFromForgotBtn = document.getElementById('switchToLoginFromForgotBtn');

document.addEventListener('DOMContentLoaded', () => {
  initRealtimeCloudSync();
  updateUserAuthUI();
  renderProducts();
  setupEventListeners();
});

function initRealtimeCloudSync() {
  if (typeof db !== 'undefined' && db) {
    try {
      db.ref('products').on('value', (snapshot) => {
        const cloudData = snapshot.val();
        if (cloudData && Array.isArray(cloudData)) {
          products = cloudData;
          localStorage.setItem('jastip_products', JSON.stringify(products));
          renderProducts();
        }
      });

      db.ref('orders').on('value', (snapshot) => {
        const cloudOrders = snapshot.val();
        if (cloudOrders && Array.isArray(cloudOrders)) {
          orders = cloudOrders;
          localStorage.setItem('jastip_orders', JSON.stringify(orders));
        }
      });
    } catch (e) {
      console.warn("Realtime sync fallback to local:", e);
    }
  }
}

function renderProducts() {
  if (!productsGrid) return;
  productsGrid.innerHTML = '';

  const filtered = products.filter(p => {
    const matchesCat = (currentCategory === 'ALL') || (p.main_category === currentCategory);
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sub_category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0;">
        <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🔍</span>
        <h3 style="font-size: 1.3rem; color: #0f172a; margin-bottom: 0.5rem;">Barang tidak ditemukan</h3>
        <p style="color: #64748b;">Coba gunakan kata kunci pencarian lain atau pilih kategori lain.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(p => {
    const totalCost = p.price_original + p.jastip_fee;
    const isMakanan = p.main_category === 'MAKANAN_MINUMAN';
    const tagClass = isMakanan ? 'tag-makanan' : 'tag-peralatan';
    const tagText = isMakanan ? '🍕 Makanan' : '📚 Peralatan';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrapper" onclick="openProductDetailModal('${p.id}')" style="cursor: pointer;">
        <img src="${p.image_url}" alt="${p.title}" class="product-img">
        <span class="category-tag ${tagClass}">${tagText}</span>
      </div>
      <div class="product-content">
        <h3 class="product-title" onclick="openProductDetailModal('${p.id}')" style="cursor: pointer;">${p.title}</h3>
        <p class="product-desc">${p.description}</p>
        
        <div class="price-card">
          <div class="price-item">
            <span>Harga Asli Toko:</span>
            <span>${formatRupiah(p.price_original)}</span>
          </div>
          <div class="price-item">
            <span>Fee Jastip:</span>
            <span style="color: #4f46e5; font-weight: 700;">+ ${formatRupiah(p.jastip_fee)}</span>
          </div>
          <div class="price-grand-total">
            <span>Total Bayar:</span>
            <span>${formatRupiah(totalCost)}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.6rem;">
          <button class="btn btn-secondary" style="flex: 1; justify-content: center; padding: 0.75rem; font-size: 0.88rem;" onclick="openProductDetailModal('${p.id}')">
            🔍 Detail & Foto
          </button>
          <button class="btn btn-primary" style="flex: 1.2; justify-content: center; padding: 0.75rem; font-size: 0.88rem;" onclick="openOrderModal('${p.id}')">
            🛒 Titip Barang
          </button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

window.openProductDetailModal = function(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  selectedDetailProduct = prod;
  detailProductTitle.textContent = prod.title;
  detailProductDesc.textContent = prod.description;

  const isMakanan = prod.main_category === 'MAKANAN_MINUMAN';
  detailCategoryBadge.className = `category-tag ${isMakanan ? 'tag-makanan' : 'tag-peralatan'}`;
  detailCategoryBadge.textContent = isMakanan ? '🍕 Makanan & Minuman' : '📚 Peralatan Kuliah';

  detailSourceStore.textContent = prod.source_store || 'Toko Reseller Resmi Kampus';
  detailWeight.textContent = prod.weight || 'Sesuai Standar Kemasan';
  detailExpiry.textContent = prod.expiry_shelf_life || 'Garansi Segar & Berkualitas';

  detailOriginalPrice.textContent = formatRupiah(prod.price_original);
  detailJastipFee.textContent = `+ ${formatRupiah(prod.jastip_fee)}`;
  detailGrandTotal.textContent = formatRupiah(prod.price_original + prod.jastip_fee);

  // Setup Gallery Images
  const gallery = prod.gallery_images && prod.gallery_images.length > 0 ? prod.gallery_images : [prod.image_url];
  detailMainImage.src = gallery[0];

  galleryThumbnailsWrapper.innerHTML = '';
  gallery.forEach((imgSrc, idx) => {
    const thumb = document.createElement('img');
    thumb.src = imgSrc;
    thumb.alt = `Foto ${idx + 1}`;
    thumb.style.cssText = `width: 68px; height: 68px; object-fit: cover; border-radius: 12px; cursor: pointer; border: 2px solid ${idx === 0 ? '#4f46e5' : '#e2e8f0'}; transition: all 0.2s ease;`;
    thumb.addEventListener('click', () => {
      detailMainImage.src = imgSrc;
      Array.from(galleryThumbnailsWrapper.children).forEach(c => c.style.borderColor = '#e2e8f0');
      thumb.style.borderColor = '#4f46e5';
    });
    galleryThumbnailsWrapper.appendChild(thumb);
  });

  openModal(productDetailModal);
};

window.openOrderModal = function(id) {
  closeModal(productDetailModal);
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  const totalCost = prod.price_original + prod.jastip_fee;
  document.getElementById('orderProductId').value = prod.id;
  document.getElementById('modalProductTitle').textContent = prod.title;
  document.getElementById('modalProductPrice').textContent = formatRupiah(totalCost);

  if (currentUser) {
    document.getElementById('orderUserName').value = currentUser.name;
  }

  openModal(orderModal);
};

function setupEventListeners() {
  // Category Filtering Pills
  document.querySelectorAll('.category-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.category-pills .pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      renderProducts();
    });
  });

  // Search Bar Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Detail Order WA Button
  if (detailOrderWaBtn) {
    detailOrderWaBtn.addEventListener('click', () => {
      if (selectedDetailProduct) {
        openOrderModal(selectedDetailProduct.id);
      }
    });
  }

  // Checkout Form Submit -> Redirect to WhatsApp Admin
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const prodId = document.getElementById('orderProductId').value;
      const userName = document.getElementById('orderUserName').value;
      const userWa = document.getElementById('orderUserWa').value;
      const notes = document.getElementById('orderNotes').value;

      const prod = products.find(p => p.id === prodId);
      if (!prod) return;

      const totalCost = prod.price_original + prod.jastip_fee;
      const orderNum = 'JST-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(100 + Math.random() * 900);

      const newOrder = {
        id: 'ord-' + Date.now(),
        order_number: orderNum,
        product_id: prod.id,
        product_title: prod.title,
        user_name: userName,
        user_email: currentUser ? currentUser.email : 'Tamu (Tanpa Akun)',
        user_wa: userWa,
        total_amount: totalCost,
        status: 'PENDING',
        delivery_notes: notes,
        created_at: new Date().toLocaleString('id-ID')
      };

      orders.unshift(newOrder);
      localStorage.setItem('jastip_orders', JSON.stringify(orders));

      if (typeof db !== 'undefined' && db) {
        try { db.ref('orders').set(orders); } catch(err) {}
      }

      closeModal(orderModal);

      // Construct WhatsApp String
      const adminPhone = '6281234567890';
      const textMsg = `Halo Admin JastipKampus! 👋%0ASaya ingin memesan jastip barang berikut:%0A%0A📦 *Barang Titipan*: ${encodeURIComponent(prod.title)}%0A📑 *No. Invoice*: ${orderNum}%0A💰 *Total Bayar*: ${encodeURIComponent(formatRupiah(totalCost))}%0A👤 *Nama Pemesan*: ${encodeURIComponent(userName)}%0A📱 *No. WA*: ${encodeURIComponent(userWa)}%0A📍 *Catatan COD / Kost*: ${encodeURIComponent(notes)}%0A%0AMohon diproses ya Admin, terima kasih! 🙏`;
      
      window.open(`https://wa.me/${adminPhone}?text=${textMsg}`, '_blank');
      alert(`✅ Pesanan Berhasil dibuat!\n\nNomor Invoice: ${orderNum}\nAnda akan diarahkan ke WhatsApp Admin untuk mengonfirmasi pengiriman.`);
    });
  }

  // Modals Close Buttons
  document.querySelectorAll('.modal-close, .closeModalBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(orderModal);
      closeModal(authModal);
      closeModal(myOrdersModal);
      closeModal(productDetailModal);
    });
  });

  // Auth Modals Event Listeners
  if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', () => showAuthView('login'));
  if (switchToRegisterBtn) switchToRegisterBtn.addEventListener('click', () => showAuthView('register'));
  if (switchToLoginFromRegBtn) switchToLoginFromRegBtn.addEventListener('click', () => showAuthView('login'));
  if (switchToForgotBtn) switchToForgotBtn.addEventListener('click', () => showAuthView('forgot'));
  if (switchToLoginFromForgotBtn) switchToLoginFromForgotBtn.addEventListener('click', () => showAuthView('login'));

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const pass = document.getElementById('loginPassword').value;

      const user = registeredUsers.find(u => u.email === email && u.password === pass);
      if (user) {
        currentUser = user;
        localStorage.setItem('jastip_current_user', JSON.stringify(currentUser));
        updateUserAuthUI();
        closeModal(authModal);
        alert(`👋 Selamat Datang kembali, ${currentUser.name}!`);
      } else {
        alert('❌ Email atau Kata Sandi Salah!');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const pass = document.getElementById('regPassword').value;

      if (registeredUsers.some(u => u.email === email)) {
        alert('❌ Email sudah terdaftar! Silakan login.');
        return;
      }

      const newUser = { name, email, password: pass };
      registeredUsers.push(newUser);
      localStorage.setItem('jastip_registered_users', JSON.stringify(registeredUsers));

      currentUser = newUser;
      localStorage.setItem('jastip_current_user', JSON.stringify(currentUser));
      updateUserAuthUI();
      closeModal(authModal);
      alert(`🎉 Pendaftaran Akun Berhasil!\n\nSelamat datang di JastipKampus, ${name}!`);
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value;
      if (registeredUsers.some(u => u.email === email)) {
        alert(`📧 Tautan pemulihan kata sandi telah dikirim ke ${email}. Silakan periksa kotak masuk Gmail Anda.`);
        showAuthView('login');
      } else {
        alert('❌ Email tidak ditemukan di sistem kami.');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      currentUser = null;
      localStorage.removeItem('jastip_current_user');
      updateUserAuthUI();
      alert('🔒 Anda telah keluar dari akun.');
    });
  }

  if (myOrdersNavBtn) {
    myOrdersNavBtn.addEventListener('click', renderMyOrders);
  }
}

function showAuthView(view) {
  loginForm.style.display = 'none';
  registerForm.style.display = 'none';
  forgotForm.style.display = 'none';

  if (view === 'login') {
    authModalTitle.textContent = '🔑 Masuk ke JastipKampus';
    loginForm.style.display = 'block';
  } else if (view === 'register') {
    authModalTitle.textContent = '📝 Daftar Akun Baru';
    registerForm.style.display = 'block';
  } else if (view === 'forgot') {
    authModalTitle.textContent = '🔒 Lupa Kata Sandi';
    forgotForm.style.display = 'block';
  }
  openModal(authModal);
}

function updateUserAuthUI() {
  if (currentUser) {
    if (openAuthModalBtn) openAuthModalBtn.style.display = 'none';
    if (userProfileMenu) userProfileMenu.style.display = 'flex';
    if (userGreeting) userGreeting.textContent = `👤 ${currentUser.name}`;
    if (myOrdersNavBtn) myOrdersNavBtn.style.display = 'inline-flex';
  } else {
    if (openAuthModalBtn) openAuthModalBtn.style.display = 'inline-flex';
    if (userProfileMenu) userProfileMenu.style.display = 'none';
    if (myOrdersNavBtn) myOrdersNavBtn.style.display = 'none';
  }
}

function renderMyOrders() {
  const listContainer = document.getElementById('myOrdersList');
  if (!listContainer || !currentUser) return;
  listContainer.innerHTML = '';

  const userOrders = orders.filter(o => o.user_email === currentUser.email || o.user_name === currentUser.name);

  if (userOrders.length === 0) {
    listContainer.innerHTML = `<div style="text-align: center; padding: 2rem; color: #64748b;">Belum ada riwayat pesanan titipan.</div>`;
  } else {
    userOrders.forEach(o => {
      const card = document.createElement('div');
      card.style.cssText = 'background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 1rem;';
      card.innerHTML = `
        <div>
          <span style="font-size: 0.78rem; font-weight: 700; color: #4f46e5; background: #e0e7ff; padding: 2px 8px; border-radius: 6px;">${o.order_number}</span>
          <h4 style="font-size: 1rem; font-weight: 800; margin-top: 4px; color: #0f172a;">${o.product_title}</h4>
          <span style="font-size: 0.88rem; color: #059669; font-weight: 700;">${formatRupiah(o.total_amount)}</span>
        </div>
        <div>
          <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }
  openModal(myOrdersModal);
}

function openModal(modal) { if (modal) modal.classList.add('active'); }
function closeModal(modal) { if (modal) modal.classList.remove('active'); }
