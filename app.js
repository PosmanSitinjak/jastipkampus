// Storefront Logic, Realtime Cloud Sync, Product Gallery & Interactive Quantity Counter System
let products = JSON.parse(localStorage.getItem('jastip_products')) || INITIAL_PRODUCTS;
let orders = JSON.parse(localStorage.getItem('jastip_orders')) || INITIAL_ORDERS;
let registeredUsers = JSON.parse(localStorage.getItem('jastip_registered_users')) || [
  { name: 'Rian Mahasiswa', email: 'rian.student@gmail.com', password: 'password123' }
];
let currentUser = JSON.parse(localStorage.getItem('jastip_current_user')) || null;

// Guest Session ID for Web Chat without Login
let guestChatId = localStorage.getItem('jastip_guest_chat_id');
if (!guestChatId) {
  guestChatId = 'chat-guest-' + Math.floor(1000 + Math.random() * 9000);
  localStorage.setItem('jastip_guest_chat_id', guestChatId);
}

let currentCategory = 'ALL';
let searchQuery = '';
let selectedDetailProduct = null;
let currentActiveOrderProduct = null;

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
const floatingChatBtn = document.getElementById('floatingChatBtn');
const chatPopupWidget = document.getElementById('chatPopupWidget');
const closeChatPopupBtn = document.getElementById('closeChatPopupBtn');

// Quantity Counter Elements
const orderQuantity = document.getElementById('orderQuantity');
const btnMinusQty = document.getElementById('btnMinusQty');
const btnPlusQty = document.getElementById('btnPlusQty');

// Dual Mode Chat Elements
const tabWebChatBtn = document.getElementById('tabWebChatBtn');
const tabWaChatBtn = document.getElementById('tabWaChatBtn');
const webChatContainer = document.getElementById('webChatContainer');
const waChatContainer = document.getElementById('waChatContainer');
const webChatForm = document.getElementById('webChatForm');
const webChatInput = document.getElementById('webChatInput');
const webChatMessages = document.getElementById('webChatMessages');

// Product Detail & Interactive Media Gallery Elements
const productDetailModal = document.getElementById('productDetailModal');
const detailMediaViewer = document.getElementById('detailMediaViewer');
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
  setupRealtimeWebChat();
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
      console.warn("Realtime cloud sync fallback:", e);
    }
  }
}

// Setup Realtime Live Web Chat Listener
function setupRealtimeWebChat() {
  const currentChatId = currentUser ? ('chat-user-' + currentUser.email.replace(/[^a-zA-Z0-9]/g, '')) : guestChatId;
  const activeName = currentUser ? currentUser.name : ('Tamu ' + guestChatId.replace('chat-guest-', ''));

  if (typeof db !== 'undefined' && db) {
    try {
      db.ref('live_chats/' + currentChatId).on('value', (snapshot) => {
        const chatData = snapshot.val();
        if (chatData && chatData.messages && webChatMessages) {
          renderWebChatMessages(chatData.messages);
        }
      });
    } catch (e) {
      console.warn("Realtime chat listener error:", e);
    }
  }

  if (tabWebChatBtn && tabWaChatBtn && webChatContainer && waChatContainer) {
    tabWebChatBtn.addEventListener('click', () => {
      tabWebChatBtn.classList.add('active');
      tabWaChatBtn.classList.remove('active');
      webChatContainer.style.display = 'flex';
      waChatContainer.style.display = 'none';
    });

    tabWaChatBtn.addEventListener('click', () => {
      tabWaChatBtn.classList.add('active');
      tabWebChatBtn.classList.remove('active');
      waChatContainer.style.display = 'flex';
      webChatContainer.style.display = 'none';
    });
  }

  if (webChatForm && webChatInput) {
    webChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = webChatInput.value.trim();
      if (!text) return;

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const newMsg = { sender: 'user', text: text, time: timeStr };

      if (typeof db !== 'undefined' && db) {
        db.ref('live_chats/' + currentChatId).once('value', (snapshot) => {
          let chatObj = snapshot.val() || { id: currentChatId, user_name: activeName, messages: [] };
          chatObj.user_name = activeName;
          if (!chatObj.messages) chatObj.messages = [];
          chatObj.messages.push(newMsg);

          db.ref('live_chats/' + currentChatId).set(chatObj);
        });
      }

      webChatInput.value = '';
    });
  }
}

function renderWebChatMessages(messages) {
  if (!webChatMessages) return;
  webChatMessages.innerHTML = '';

  messages.forEach(m => {
    const msgDiv = document.createElement('div');
    const isUser = m.sender === 'user';
    msgDiv.className = isUser ? 'chat-bubble-user' : 'chat-bubble-admin';
    msgDiv.innerHTML = `
      <div>${m.text}</div>
      <span style="font-size: 0.7rem; display: block; text-align: right; margin-top: 4px; opacity: 0.8;">${m.time || ''}</span>
    `;
    webChatMessages.appendChild(msgDiv);
  });

  webChatMessages.scrollTop = webChatMessages.scrollHeight;
}

// Clean Card Rendering
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

    const hasVideo = p.media_items && p.media_items.some(m => m.type === 'video');

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrapper" onclick="openProductDetailModal('${p.id}')" style="cursor: pointer;">
        <img src="${p.image_url}" alt="${p.title}" class="product-img">
        <span class="category-tag ${tagClass}">${tagText}</span>
        ${hasVideo ? '<span style="position: absolute; bottom: 12px; right: 12px; background: rgba(15,23,42,0.85); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; backdrop-filter: blur(8px);">🎬 Video Ada</span>' : ''}
      </div>
      <div class="product-content">
        <h3 class="product-title" onclick="openProductDetailModal('${p.id}')" style="cursor: pointer;">${p.title}</h3>
        
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
            <span>Total Satuan:</span>
            <span>${formatRupiah(totalCost)}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; justify-content: center; width: 100%; margin-top: auto;">
          <button class="btn btn-secondary" style="flex: 1; justify-content: center; padding: 0.75rem 0.5rem; font-size: 0.82rem;" onclick="openProductDetailModal('${p.id}')">
            🔍 Detail & Media
          </button>
          <button class="btn btn-primary" style="flex: 1; justify-content: center; padding: 0.75rem 0.5rem; font-size: 0.82rem;" onclick="openOrderModal('${p.id}')">
            🛒 Titip Barang
          </button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

function renderMediaInViewer(mediaItem) {
  if (!detailMediaViewer) return;
  detailMediaViewer.innerHTML = '';

  if (mediaItem.type === 'video') {
    const videoElem = document.createElement('video');
    videoElem.src = mediaItem.url;
    videoElem.controls = true;
    videoElem.autoplay = true;
    videoElem.loop = true;
    videoElem.muted = true;
    videoElem.style.cssText = 'width: 100%; height: 100%; object-fit: contain; background: #000000;';
    detailMediaViewer.appendChild(videoElem);
  } else {
    const imgElem = document.createElement('img');
    imgElem.src = mediaItem.url;
    imgElem.alt = 'Foto Produk';
    imgElem.style.cssText = 'width: 100%; height: 100%; object-fit: cover; transition: all 0.3s ease;';
    detailMediaViewer.appendChild(imgElem);
  }
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

  let mediaList = prod.media_items && prod.media_items.length > 0 ? prod.media_items : [{ type: 'image', url: prod.image_url }];
  
  renderMediaInViewer(mediaList[0]);

  galleryThumbnailsWrapper.innerHTML = '';
  mediaList.forEach((item, idx) => {
    const thumbBox = document.createElement('div');
    thumbBox.style.cssText = `position: relative; width: 72px; height: 72px; flex-shrink: 0; border-radius: 14px; overflow: hidden; cursor: pointer; border: 3px solid ${idx === 0 ? '#4f46e5' : '#e2e8f0'}; transition: all 0.2s ease; background: #f1f5f9;`;
    
    if (item.type === 'video') {
      thumbBox.innerHTML = `
        <video src="${item.url}" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"></video>
        <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(79,70,229,0.9); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">▶</span>
      `;
    } else {
      thumbBox.innerHTML = `<img src="${item.url}" alt="Foto ${idx+1}" style="width: 100%; height: 100%; object-fit: cover;">`;
    }

    thumbBox.addEventListener('click', () => {
      renderMediaInViewer(item);
      Array.from(galleryThumbnailsWrapper.children).forEach(c => c.style.borderColor = '#e2e8f0');
      thumbBox.style.borderColor = '#4f46e5';
    });

    galleryThumbnailsWrapper.appendChild(thumbBox);
  });

  openModal(productDetailModal);
};

window.openOrderModal = function(id) {
  closeModal(productDetailModal);
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  currentActiveOrderProduct = prod;
  document.getElementById('orderProductId').value = prod.id;
  document.getElementById('modalProductTitle').textContent = prod.title;
  
  if (orderQuantity) orderQuantity.value = 1;
  updateModalCalculatedPrice();

  if (currentUser) {
    document.getElementById('orderUserName').value = currentUser.name;
  }

  openModal(orderModal);
};

function updateModalCalculatedPrice() {
  if (!currentActiveOrderProduct) return;
  const qty = parseInt(orderQuantity.value) || 1;
  const unitPrice = currentActiveOrderProduct.price_original + currentActiveOrderProduct.jastip_fee;
  const totalPrice = unitPrice * qty;
  document.getElementById('modalProductPrice').textContent = formatRupiah(totalPrice);
}

function setupEventListeners() {
  // Quantity Counter Event Listeners
  if (btnMinusQty && btnPlusQty && orderQuantity) {
    btnMinusQty.addEventListener('click', () => {
      let currentVal = parseInt(orderQuantity.value) || 1;
      if (currentVal > 1) {
        orderQuantity.value = currentVal - 1;
        updateModalCalculatedPrice();
      }
    });

    btnPlusQty.addEventListener('click', () => {
      let currentVal = parseInt(orderQuantity.value) || 1;
      if (currentVal < 99) {
        orderQuantity.value = currentVal + 1;
        updateModalCalculatedPrice();
      }
    });
  }

  document.querySelectorAll('.category-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.category-pills .pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      renderProducts();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  if (detailOrderWaBtn) {
    detailOrderWaBtn.addEventListener('click', () => {
      if (selectedDetailProduct) {
        openOrderModal(selectedDetailProduct.id);
      }
    });
  }

  if (floatingChatBtn && chatPopupWidget) {
    floatingChatBtn.addEventListener('click', () => {
      chatPopupWidget.classList.toggle('active');
    });
  }

  if (closeChatPopupBtn && chatPopupWidget) {
    closeChatPopupBtn.addEventListener('click', () => {
      chatPopupWidget.classList.remove('active');
    });
  }

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const prodId = document.getElementById('orderProductId').value;
      const qty = parseInt(document.getElementById('orderQuantity').value) || 1;
      const userName = document.getElementById('orderUserName').value;
      const userWa = document.getElementById('orderUserWa').value;
      const notes = document.getElementById('orderNotes').value;

      const prod = products.find(p => p.id === prodId);
      if (!prod) return;

      const unitCost = prod.price_original + prod.jastip_fee;
      const totalCost = unitCost * qty;
      const orderNum = 'JST-DEL-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(100 + Math.random() * 900);

      const newOrder = {
        id: 'ord-' + Date.now(),
        order_number: orderNum,
        product_id: prod.id,
        product_title: prod.title + ` (x${qty})`,
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

      const adminPhone = '6281234567890';
      const textMsg = `Halo Admin JastipKampus IT Del! 👋%0ASaya ingin memesan jastip barang berikut:%0A%0A📦 *Barang Titipan*: ${encodeURIComponent(prod.title)}%0A📊 *Jumlah Porsi / Beli*: ${qty} pcs%0A📑 *No. Invoice*: ${orderNum}%0A💰 *Total Bayar*: ${encodeURIComponent(formatRupiah(totalCost))}%0A👤 *Nama Pemesan*: ${encodeURIComponent(userName)}%0A📱 *No. WA*: ${encodeURIComponent(userWa)}%0A📍 *Catatan Asrama / COD*: ${encodeURIComponent(notes)}%0A%0AMohon diproses ya Admin IT Del, terima kasih! 🙏`;
      
      window.open(`https://wa.me/${adminPhone}?text=${textMsg}`, '_blank');
      alert(`✅ Pesanan Berhasil dibuat!\n\nNomor Invoice: ${orderNum}\nJumlah: ${qty} Pcs/Porsi\nTotal: ${formatRupiah(totalCost)}\n\nAnda akan diarahkan ke WhatsApp Admin untuk mengonfirmasi pengiriman.`);
    });
  }

  document.querySelectorAll('.modal-close, .closeModalBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(orderModal);
      closeModal(authModal);
      closeModal(myOrdersModal);
      closeModal(productDetailModal);
    });
  });

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
        setupRealtimeWebChat();
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
      alert(`🎉 Pendaftaran Akun Berhasil!\n\nSelamat datang di JastipKampus IT Del, ${name}!`);
      setupRealtimeWebChat();
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value;
      const newPass = document.getElementById('forgotNewPassword').value;
      const confirmPass = document.getElementById('forgotConfirmPassword').value;

      const userIndex = registeredUsers.findIndex(u => u.email === email);
      if (userIndex === -1) {
        alert('❌ Email tidak ditemukan! Pastikan email yang Anda masukkan sudah terdaftar.');
        return;
      }

      if (newPass !== confirmPass) {
        alert('❌ Konfirmasi kata sandi tidak cocok! Mohon periksa kembali.');
        return;
      }

      if (newPass.length < 4) {
        alert('❌ Kata sandi baru terlalu pendek! Minimal 4 karakter.');
        return;
      }

      registeredUsers[userIndex].password = newPass;
      localStorage.setItem('jastip_registered_users', JSON.stringify(registeredUsers));

      if (currentUser && currentUser.email === email) {
        currentUser.password = newPass;
        localStorage.setItem('jastip_current_user', JSON.stringify(currentUser));
      }

      alert(`🎉 Kata Sandi Berhasil Diperbarui!\n\nKata sandi akun (${email}) telah diubah. Silakan masuk dengan kata sandi baru Anda.`);
      
      document.getElementById('forgotNewPassword').value = '';
      document.getElementById('forgotConfirmPassword').value = '';
      document.getElementById('loginEmail').value = email;
      showAuthView('login');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      currentUser = null;
      localStorage.removeItem('jastip_current_user');
      updateUserAuthUI();
      alert('🔒 Anda telah keluar dari akun.');
      setupRealtimeWebChat();
    });
  }

  if (myOrdersNavBtn) {
    myOrdersNavBtn.addEventListener('click', renderMyOrders);
  }
}

window.openWaTopic = function(topicText) {
  const adminPhone = '6281234567890';
  const msg = encodeURIComponent(`Halo Admin CS JastipKampus IT Del! 👋%0ASaya ingin menanyakan perihal: *${topicText}*.%0A%0AMohon bantuannya ya Min, terima kasih! 🙏`);
  if (chatPopupWidget) chatPopupWidget.classList.remove('active');
  window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
};

function showAuthView(view) {
  loginForm.style.display = 'none';
  registerForm.style.display = 'none';
  forgotForm.style.display = 'none';

  if (view === 'login') {
    authModalTitle.textContent = '🔑 Masuk ke JastipKampus IT Del';
    loginForm.style.display = 'block';
  } else if (view === 'register') {
    authModalTitle.textContent = '📝 Daftar Akun Baru';
    registerForm.style.display = 'block';
  } else if (view === 'forgot') {
    authModalTitle.textContent = '🔒 Lupa / Ubah Kata Sandi';
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
      card.style.cssText = 'background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem 1.1rem; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;';
      card.innerHTML = `
        <div>
          <span style="font-size: 0.78rem; font-weight: 700; color: #4f46e5; background: #e0e7ff; padding: 3px 10px; border-radius: 6px;">${o.order_number}</span>
          <h4 style="font-size: 1rem; font-weight: 800; margin-top: 6px; color: #0f172a;">${o.product_title}</h4>
          <span style="font-size: 0.9rem; color: #059669; font-weight: 700; display: block; margin-top: 2px;">${formatRupiah(o.total_amount)}</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
          <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>
          <button class="btn btn-secondary" style="padding: 0.4rem 0.85rem; font-size: 0.78rem; border-radius: 8px; background: #25d366; color: white; border: none; font-weight: 700;" onclick="chatAdminAboutOrder('${o.order_number}', '${o.product_title}')">
            💬 Chat Admin Pesanan
          </button>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }
  openModal(myOrdersModal);
}

window.chatAdminAboutOrder = function(orderNum, prodTitle) {
  const adminPhone = '6281234567890';
  const msg = encodeURIComponent(`Halo Admin JastipKampus IT Del! 👋%0ASaya ingin menanyakan status pesanan saya:%0A%0A📑 *No. Invoice*: ${orderNum}%0A📦 *Barang*: ${prodTitle}%0A%0AMohon info status pengirimannya ya Admin, terima kasih! 🙏`);
  window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
};

function openModal(modal) { if (modal) modal.classList.add('active'); }
function closeModal(modal) { if (modal) modal.classList.remove('active'); }
