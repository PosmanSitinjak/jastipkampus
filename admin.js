// Admin Portal State & Multi-Admin Authentication Logic
let products = JSON.parse(localStorage.getItem('jastip_products')) || INITIAL_PRODUCTS;
let orders = JSON.parse(localStorage.getItem('jastip_orders')) || INITIAL_ORDERS;
let registeredUsers = JSON.parse(localStorage.getItem('jastip_registered_users')) || [
  { name: 'Rian Mahasiswa', email: 'rian.student@gmail.com', password: 'password123' }
];
let adminAccounts = INITIAL_ADMINS;
let currentAdmin = JSON.parse(localStorage.getItem('jastip_current_admin')) || null;

function saveState() {
  localStorage.setItem('jastip_products', JSON.stringify(products));
  localStorage.setItem('jastip_orders', JSON.stringify(orders));
  localStorage.setItem('jastip_current_admin', JSON.stringify(currentAdmin));
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

// DOM Elements
const adminLoginGate = document.getElementById('adminLoginGate');
const adminMainDashboard = document.getElementById('adminMainDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminInfoLabel = document.getElementById('adminInfoLabel');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const productFormModal = document.getElementById('productFormModal');
const adminProdFileInput = document.getElementById('adminProdFileInput');
const adminProdImgBase64 = document.getElementById('adminProdImgBase64');
const imgPreviewWrapper = document.getElementById('imgPreviewWrapper');
const imgPreview = document.getElementById('imgPreview');

// Admin Tabs
const adminTabOverview = document.getElementById('adminTabOverview');
const adminTabProducts = document.getElementById('adminTabProducts');
const adminTabOrders = document.getElementById('adminTabOrders');
const adminTabUsers = document.getElementById('adminTabUsers');

const adminViewOverview = document.getElementById('adminViewOverview');
const adminViewProducts = document.getElementById('adminViewProducts');
const adminViewOrders = document.getElementById('adminViewOrders');
const adminViewUsers = document.getElementById('adminViewUsers');

document.addEventListener('DOMContentLoaded', () => {
  updateAdminAuthUI();
  setupAdminEventListeners();
});

function updateAdminAuthUI() {
  if (currentAdmin) {
    if (adminLoginGate) adminLoginGate.style.display = 'none';
    if (adminMainDashboard) adminMainDashboard.style.display = 'block';
    if (adminInfoLabel) {
      adminInfoLabel.style.display = 'inline-block';
      adminInfoLabel.textContent = `🔑 ${currentAdmin.name}`;
    }
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'inline-flex';
    switchAdminTab('overview');
    renderAdminDashboard();
  } else {
    if (adminLoginGate) adminLoginGate.style.display = 'block';
    if (adminMainDashboard) adminMainDashboard.style.display = 'none';
    if (adminInfoLabel) adminInfoLabel.style.display = 'none';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';
  }
}

function switchAdminTab(tabName) {
  const tabs = [adminTabOverview, adminTabProducts, adminTabOrders, adminTabUsers];
  const views = [adminViewOverview, adminViewProducts, adminViewOrders, adminViewUsers];

  tabs.forEach(t => t && t.classList.remove('active'));
  views.forEach(v => v && (v.style.display = 'none'));

  if (tabName === 'overview') {
    if (adminTabOverview) adminTabOverview.classList.add('active');
    if (adminViewOverview) adminViewOverview.style.display = 'block';
  } else if (tabName === 'products') {
    if (adminTabProducts) adminTabProducts.classList.add('active');
    if (adminViewProducts) adminViewProducts.style.display = 'block';
  } else if (tabName === 'orders') {
    if (adminTabOrders) adminTabOrders.classList.add('active');
    if (adminViewOrders) adminViewOrders.style.display = 'block';
  } else if (tabName === 'users') {
    if (adminTabUsers) adminTabUsers.classList.add('active');
    if (adminViewUsers) adminViewUsers.style.display = 'block';
  }
}

function setupAdminEventListeners() {
  // Tab Switching Handlers
  if (adminTabOverview) adminTabOverview.addEventListener('click', () => switchAdminTab('overview'));
  if (adminTabProducts) adminTabProducts.addEventListener('click', () => switchAdminTab('products'));
  if (adminTabOrders) adminTabOrders.addEventListener('click', () => switchAdminTab('orders'));
  if (adminTabUsers) adminTabUsers.addEventListener('click', () => switchAdminTab('users'));

  // Admin Login Form Handler
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedUsername = document.getElementById('adminAccountSelect').value;
      const inputPassword = document.getElementById('adminPasswordInput').value;

      const foundAdmin = adminAccounts.find(a => a.username === selectedUsername && a.password === inputPassword);
      if (foundAdmin) {
        currentAdmin = foundAdmin;
        saveState();
        updateAdminAuthUI();
        alert(`🔓 Login Admin Berhasil!\n\nSelamat datang, ${currentAdmin.name}.`);
      } else {
        alert('❌ Kata Sandi Admin Salah! Gunakan password: admin123');
      }
    });
  }

  // Admin Logout Handler
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      if (confirm('Keluar dari sesi Admin?')) {
        currentAdmin = null;
        saveState();
        updateAdminAuthUI();
      }
    });
  }

  // Add Product Button
  const addNewProductBtn = document.getElementById('addNewProductBtn');
  if (addNewProductBtn) {
    addNewProductBtn.addEventListener('click', () => {
      document.getElementById('productForm').reset();
      document.getElementById('adminProdId').value = '';
      adminProdImgBase64.value = '';
      imgPreviewWrapper.style.display = 'none';
      document.getElementById('productModalTitle').textContent = '➕ Tambah Produk Baru';
      openModal(productFormModal);
    });
  }

  // File Input Handler (Convert to Base64)
  if (adminProdFileInput) {
    adminProdFileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const base64String = event.target.result;
          adminProdImgBase64.value = base64String;
          imgPreview.src = base64String;
          imgPreviewWrapper.style.display = 'flex';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Modal Close Buttons
  document.querySelectorAll('.modal-close, .closeModalBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(productFormModal);
    });
  });

  // Form Submit
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', handleAdminProductSubmit);
  }
}

function renderAdminDashboard() {
  if (!currentAdmin) return;

  registeredUsers = JSON.parse(localStorage.getItem('jastip_registered_users')) || registeredUsers;
  orders = JSON.parse(localStorage.getItem('jastip_orders')) || orders;

  // Update Stats Widgets
  document.getElementById('statTotalItems').textContent = products.length + ' Items';
  document.getElementById('statTotalOrders').textContent = orders.length + ' Orders';
  document.getElementById('statTotalUsers').textContent = registeredUsers.length + ' Users';
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  document.getElementById('statTotalRevenue').textContent = formatRupiah(totalRevenue);

  // Render Registered Users Table with WhatsApp contact lookup
  const userTbody = document.getElementById('adminUserTableBody');
  if (userTbody) {
    userTbody.innerHTML = '';
    registeredUsers.forEach(u => {
      const userOrders = orders.filter(o => o.user_email === u.email || o.user_name === u.name);
      const userWa = userOrders.length > 0 ? userOrders[0].user_wa : '081298765432';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>👤 ${u.name}</strong></td>
        <td><span style="color: #60a5fa;">${u.email}</span></td>
        <td><span style="color: #34d399; font-weight: 600;">📱 ${userWa}</span></td>
        <td><strong>${userOrders.length} Pesanan</strong></td>
      `;
      userTbody.appendChild(tr);
    });
  }

  // Render Products Table
  const prodTbody = document.getElementById('adminProductTableBody');
  if (prodTbody) {
    prodTbody.innerHTML = '';
    products.forEach(p => {
      const totalCost = p.price_original + p.jastip_fee;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${p.image_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
        <td><strong>${p.title}</strong></td>
        <td>${p.main_category === 'MAKANAN_MINUMAN' ? '🍱 Makanan' : '📚 Peralatan'}</td>
        <td>${formatRupiah(p.price_original)}</td>
        <td>${formatRupiah(p.jastip_fee)}</td>
        <td><strong style="color: #34d399;">${formatRupiah(totalCost)}</strong></td>
        <td>
          <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.82rem;" onclick="editAdminProduct('${p.id}')">✏️ Edit</button>
          <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.82rem;" onclick="deleteAdminProduct('${p.id}')">🗑️ Hapus</button>
        </td>
      `;
      prodTbody.appendChild(tr);
    });
  }

  // Render Orders Table
  const orderTbody = document.getElementById('adminOrderTableBody');
  if (orderTbody) {
    orderTbody.innerHTML = '';
    orders.forEach(o => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: #60a5fa;">${o.order_number}</strong></td>
        <td><strong>${o.user_name}</strong><br><small style="color: var(--text-muted);">${o.user_wa}</small></td>
        <td>${o.product_title}</td>
        <td><strong style="color: #34d399;">${formatRupiah(o.total_amount)}</strong></td>
        <td>
          <select class="form-input" style="padding: 5px 8px; font-size: 0.85rem; width: auto;" onchange="updateOrderStatus('${o.id}', this.value)">
            <option value="PENDING" ${o.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
            <option value="DIBELI" ${o.status === 'DIBELI' ? 'selected' : ''}>DIBELI</option>
            <option value="DIKIRIM_COD" ${o.status === 'DIKIRIM_COD' ? 'selected' : ''}>DIKIRIM / COD</option>
            <option value="SELESAI" ${o.status === 'SELESAI' ? 'selected' : ''}>SELESAI</option>
          </select>
        </td>
        <td style="max-width: 220px; font-size: 0.85rem; color: var(--text-muted);">${o.delivery_notes}</td>
        <td>
          <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.82rem;" onclick="deleteAdminOrder('${o.id}')">🗑️</button>
        </td>
      `;
      orderTbody.appendChild(tr);
    });
  }
}

function handleAdminProductSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('adminProdId').value;
  const title = document.getElementById('adminProdTitle').value;
  const main_category = document.getElementById('adminProdMainCat').value;
  const sub_category = document.getElementById('adminProdSubCat').value;
  const price_original = parseFloat(document.getElementById('adminProdPrice').value);
  const jastip_fee = parseFloat(document.getElementById('adminProdFee').value);
  const description = document.getElementById('adminProdDesc').value;
  
  let image_url = adminProdImgBase64.value;
  if (!image_url) {
    if (id) {
      const existing = products.find(p => p.id === id);
      if (existing) image_url = existing.image_url;
    } else {
      image_url = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
    }
  }

  if (id) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], title, main_category, sub_category, price_original, jastip_fee, image_url, description };
    }
  } else {
    const newProd = {
      id: 'prod-' + Date.now(),
      title, main_category, sub_category, price_original, jastip_fee, stock: 10, image_url, description
    };
    products.unshift(newProd);
  }

  saveState();
  closeModal(productFormModal);
  renderAdminDashboard();
  alert('💾 Data Produk Berhasil Disimpan!');
}

window.editAdminProduct = function(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  document.getElementById('adminProdId').value = prod.id;
  document.getElementById('adminProdTitle').value = prod.title;
  document.getElementById('adminProdMainCat').value = prod.main_category;
  document.getElementById('adminProdSubCat').value = prod.sub_category;
  document.getElementById('adminProdPrice').value = prod.price_original;
  document.getElementById('adminProdFee').value = prod.jastip_fee;
  adminProdImgBase64.value = prod.image_url;
  document.getElementById('adminProdDesc').value = prod.description;

  imgPreview.src = prod.image_url;
  imgPreviewWrapper.style.display = 'flex';

  document.getElementById('productModalTitle').textContent = '✏️ Edit Produk';
  openModal(productFormModal);
};

window.deleteAdminProduct = function(id) {
  if (confirm('Hapus produk ini dari katalog?')) {
    products = products.filter(p => p.id !== id);
    saveState();
    renderAdminDashboard();
  }
};

window.updateOrderStatus = function(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveState();
    alert(`Status Pesanan ${order.order_number} Diperbarui menjadi: ${newStatus}`);
  }
};

window.deleteAdminOrder = function(orderId) {
  if (confirm('Hapus pesanan ini dari riwayat admin?')) {
    orders = orders.filter(o => o.id !== orderId);
    saveState();
    renderAdminDashboard();
  }
};

function openModal(modal) { if (modal) modal.classList.add('active'); }
function closeModal(modal) { if (modal) modal.classList.remove('active'); }
