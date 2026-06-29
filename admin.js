// Executive Admin Dashboard JS Logic with Realtime Firebase Sync & Live Chat Replier
let products = JSON.parse(localStorage.getItem('jastip_products')) || INITIAL_PRODUCTS;
let orders = JSON.parse(localStorage.getItem('jastip_orders')) || INITIAL_ORDERS;
let registeredUsers = JSON.parse(localStorage.getItem('jastip_registered_users')) || [
  { name: 'Rian Mahasiswa', email: 'rian.student@gmail.com', password: 'password123' }
];
let webChatsList = [];
let activeChatId = null;

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

// DOM Elements
const adminProductsTable = document.getElementById('adminProductsTable');
const adminOrdersTable = document.getElementById('adminOrdersTable');
const adminUsersTable = document.getElementById('adminUsersTable');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const openAddProductBtn = document.getElementById('openAddProductBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

// Chat Tab Elements
const adminChatInboxList = document.getElementById('adminChatInboxList');
const adminChatMessageThread = document.getElementById('adminChatMessageThread');
const activeChatUserName = document.getElementById('activeChatUserName');
const adminReplyChatForm = document.getElementById('adminReplyChatForm');
const adminReplyInput = document.getElementById('adminReplyInput');
const adminReplySendBtn = document.getElementById('adminReplySendBtn');

// Stat Elements
const statTotalProducts = document.getElementById('statTotalProducts');
const statTotalOrders = document.getElementById('statTotalOrders');
const statPendingOrders = document.getElementById('statPendingOrders');
const statTotalRevenue = document.getElementById('statTotalRevenue');

document.addEventListener('DOMContentLoaded', () => {
  initRealtimeCloudSync();
  renderDashboard();
  setupAdminEventListeners();
});

function initRealtimeCloudSync() {
  if (typeof db !== 'undefined' && db) {
    try {
      db.ref('products').on('value', (snapshot) => {
        const cloudData = snapshot.val();
        if (cloudData && Array.isArray(cloudData)) {
          products = cloudData;
          localStorage.setItem('jastip_products', JSON.stringify(products));
          renderDashboard();
        }
      });

      db.ref('orders').on('value', (snapshot) => {
        const cloudOrders = snapshot.val();
        if (cloudOrders && Array.isArray(cloudOrders)) {
          orders = cloudOrders;
          localStorage.setItem('jastip_orders', JSON.stringify(orders));
          renderDashboard();
        }
      });

      db.ref('live_chats').on('value', (snapshot) => {
        const cloudChatsObj = snapshot.val() || {};
        webChatsList = Object.values(cloudChatsObj);
        renderChatInbox();
        if (activeChatId) {
          const activeObj = webChatsList.find(c => c.id === activeChatId);
          if (activeObj) renderChatMessageThread(activeObj);
        }
      });
    } catch (e) {
      console.warn("Realtime cloud sync fallback:", e);
    }
  }
}

function renderDashboard() {
  renderStats();
  renderProductsTable();
  renderOrdersTable();
  renderChatInbox();
  renderUsersTable();
}

function renderStats() {
  if (statTotalProducts) statTotalProducts.textContent = products.length;
  if (statTotalOrders) statTotalOrders.textContent = orders.length;

  const pendingCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PROSES').length;
  if (statPendingOrders) statPendingOrders.textContent = pendingCount;

  const totalRev = orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  if (statTotalRevenue) statTotalRevenue.textContent = formatRupiah(totalRev);
}

function renderProductsTable() {
  if (!adminProductsTable) return;
  adminProductsTable.innerHTML = '';

  products.forEach(p => {
    const totalCost = p.price_original + p.jastip_fee;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <img src="${p.image_url}" alt="${p.title}" style="width: 54px; height: 54px; border-radius: 12px; object-fit: cover; border: 1px solid #cbd5e1;">
      </td>
      <td>
        <strong style="font-size: 0.95rem; color: #0f172a;">${p.title}</strong>
        <span style="display: block; font-size: 0.78rem; color: #64748b;">ID: ${p.id}</span>
      </td>
      <td><span class="status-badge" style="background: #f1f5f9; color: #334155; font-size: 0.76rem;">${p.sub_category || p.main_category}</span></td>
      <td style="font-weight: 600;">${formatRupiah(p.price_original)}</td>
      <td style="color: #4f46e5; font-weight: 700;">+ ${formatRupiah(p.jastip_fee)}</td>
      <td style="color: #059669; font-weight: 800;">${formatRupiah(totalCost)}</td>
      <td style="text-align: center;">
        <div style="display: flex; gap: 0.4rem; justify-content: center;">
          <button class="btn btn-secondary" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;" onclick="openEditProductModal('${p.id}')">✏️ Edit</button>
          <button class="btn btn-danger" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;" onclick="deleteProduct('${p.id}')">🗑️ Hapus</button>
        </div>
      </td>
    `;
    adminProductsTable.appendChild(tr);
  });
}

function renderOrdersTable() {
  if (!adminOrdersTable) return;
  adminOrdersTable.innerHTML = '';

  if (orders.length === 0) {
    adminOrdersTable.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 2rem;">Belum ada pesanan titipan yang masuk.</td></tr>`;
    return;
  }

  orders.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="invoice-badge">${o.order_number}</span></td>
      <td>
        <strong style="color: #0f172a;">${o.user_name}</strong>
        <span style="display: block; font-size: 0.76rem; color: #64748b;">${o.user_email || ''}</span>
      </td>
      <td style="font-weight: 700; color: #334155;">${o.product_title}</td>
      <td style="font-weight: 800; color: #059669;">${formatRupiah(o.total_amount)}</td>
      <td>
        <a href="https://wa.me/${o.user_wa.replace(/[^0-9]/g,'')}" target="_blank" style="color: #059669; font-weight: 700; text-decoration: none; background: #ecfdf5; padding: 4px 10px; border-radius: 8px; border: 1px solid #a7f3d0; display: inline-flex; align-items: center; gap: 4px;">
          📱 ${o.user_wa}
        </a>
      </td>
      <td style="max-width: 200px; font-size: 0.84rem; color: #475569;">${o.delivery_notes || '-'}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          <option value="PENDING" ${o.status === 'PENDING' ? 'selected' : ''}>⏳ PENDING</option>
          <option value="PROSES" ${o.status === 'PROSES' ? 'selected' : ''}>🚴 PROSES DIBELI</option>
          <option value="SELESAI" ${o.status === 'SELESAI' ? 'selected' : ''}>✅ SELESAI COD</option>
          <option value="BATAL" ${o.status === 'BATAL' ? 'selected' : ''}>❌ BATAL</option>
        </select>
      </td>
    `;
    adminOrdersTable.appendChild(tr);
  });
}

function renderChatInbox() {
  if (!adminChatInboxList) return;
  adminChatInboxList.innerHTML = '';

  if (webChatsList.length === 0) {
    adminChatInboxList.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 1.5rem;">Belum ada percakapan masuk dari pengunjung/mahasiswa.</div>`;
    return;
  }

  webChatsList.forEach(c => {
    const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : { text: 'Belum ada pesan', time: '' };
    const activeStyle = c.id === activeChatId ? 'border-color: #4f46e5; background: #eff6ff;' : 'border-color: #e2e8f0; background: #f8fafc;';
    
    const item = document.createElement('div');
    item.style.cssText = `padding: 0.85rem; border-radius: 12px; border: 2px solid; cursor: pointer; transition: all 0.2s ease; ${activeStyle}`;
    item.onclick = () => selectChatThread(c.id);
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <strong style="font-size: 0.92rem; color: #0f172a;">💬 ${c.user_name || 'Pengunjung Web'}</strong>
        <span style="font-size: 0.75rem; color: #64748b;">${lastMsg.time || ''}</span>
      </div>
      <p style="font-size: 0.82rem; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0;">
        ${lastMsg.sender === 'admin' ? '<strong>Anda:</strong> ' : ''}${lastMsg.text}
      </p>
    `;
    adminChatInboxList.appendChild(item);
  });
}

function selectChatThread(chatId) {
  activeChatId = chatId;
  renderChatInbox();

  const chat = webChatsList.find(c => c.id === chatId);
  if (!chat) return;

  activeChatUserName.textContent = `💬 Obrolan dengan: ${chat.user_name || 'Pengunjung Web'}`;
  adminReplyInput.disabled = false;
  adminReplySendBtn.disabled = false;

  renderChatMessageThread(chat);
}

function renderChatMessageThread(chat) {
  if (!adminChatMessageThread) return;
  adminChatMessageThread.innerHTML = '';

  if (!chat.messages || chat.messages.length === 0) {
    adminChatMessageThread.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 2rem;">Belum ada pesan.</div>`;
    return;
  }

  chat.messages.forEach(m => {
    const msgDiv = document.createElement('div');
    const isAdmin = m.sender === 'admin';
    msgDiv.style.cssText = `max-width: 80%; padding: 0.75rem 1rem; border-radius: 14px; font-size: 0.88rem; line-height: 1.45; ${isAdmin ? 'align-self: flex-end; background: #4f46e5; color: white; border-top-right-radius: 2px;' : 'align-self: flex-start; background: #f1f5f9; color: #0f172a; border-top-left-radius: 2px;'}`;
    msgDiv.innerHTML = `
      <div>${m.text}</div>
      <span style="font-size: 0.7rem; display: block; text-align: right; margin-top: 4px; opacity: 0.8;">${m.time || ''}</span>
    `;
    adminChatMessageThread.appendChild(msgDiv);
  });

  adminChatMessageThread.scrollTop = adminChatMessageThread.scrollHeight;
}

function renderUsersTable() {
  if (!adminUsersTable) return;
  adminUsersTable.innerHTML = '';

  registeredUsers.forEach((u, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td style="font-weight: 700; color: #0f172a;">👤 ${u.name}</td>
      <td style="color: #4338ca;">${u.email}</td>
      <td><span class="status-badge" style="background: #ecfdf5; color: #047857; font-weight: 700;">🟢 Aktif Terdaftar</span></td>
    `;
    adminUsersTable.appendChild(tr);
  });
}

function setupAdminEventListeners() {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');

      const targetTab = e.currentTarget.dataset.tab;
      e.currentTarget.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) targetContent.style.display = 'block';
    });
  });

  if (adminReplyChatForm) {
    adminReplyChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!activeChatId) return;

      const replyText = adminReplyInput.value.trim();
      if (!replyText) return;

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const replyMsg = { sender: 'admin', text: replyText, time: timeStr };

      if (typeof db !== 'undefined' && db) {
        db.ref('live_chats/' + activeChatId).once('value', (snapshot) => {
          let chatObj = snapshot.val();
          if (chatObj) {
            if (!chatObj.messages) chatObj.messages = [];
            chatObj.messages.push(replyMsg);
            db.ref('live_chats/' + activeChatId).set(chatObj);
          }
        });
      }

      adminReplyInput.value = '';
    });
  }

  const prodImageFile = document.getElementById('prodImageFile');
  if (prodImageFile) {
    prodImageFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          document.getElementById('prodImageUrl').value = event.target.result;
          document.getElementById('imagePreview').src = event.target.result;
          document.getElementById('imagePreviewContainer').style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (openAddProductBtn) {
    openAddProductBtn.addEventListener('click', () => {
      document.getElementById('editProductId').value = '';
      productForm.reset();
      document.getElementById('imagePreviewContainer').style.display = 'none';
      document.getElementById('productModalTitle').textContent = '➕ Tambah Barang Titipan Baru';
      openModal(productModal);
    });
  }

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('editProductId').value;
      const title = document.getElementById('prodTitle').value;
      const mainCat = document.getElementById('prodCategory').value;
      const subCat = document.getElementById('prodSubCat').value;
      const priceOrig = parseInt(document.getElementById('prodPriceOriginal').value) || 0;
      const fee = parseInt(document.getElementById('prodJastipFee').value) || 0;
      let imgUrl = document.getElementById('prodImageUrl').value;
      const desc = document.getElementById('prodDesc').value;

      if (!imgUrl) {
        imgUrl = mainCat === 'MAKANAN_MINUMAN' ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
      }

      if (editId) {
        const idx = products.findIndex(p => p.id === editId);
        if (idx !== -1) {
          products[idx] = { ...products[idx], title, main_category: mainCat, sub_category: subCat, price_original: priceOrig, jastip_fee: fee, image_url: imgUrl, description: desc };
        }
      } else {
        const newProd = {
          id: 'prod-' + Date.now(),
          title, main_category: mainCat, sub_category: subCat, price_original: priceOrig, jastip_fee: fee, image_url: imgUrl, description: desc,
          source_store: 'Toko Reseller Kampus', weight: 'Sesuai Kemasan', expiry_shelf_life: 'Garansi Segar'
        };
        products.unshift(newProd);
      }

      localStorage.setItem('jastip_products', JSON.stringify(products));
      if (typeof db !== 'undefined' && db) {
        try { db.ref('products').set(products); } catch(err) {}
      }

      closeModal(productModal);
      renderDashboard();
      alert('💾 Katalog Produk Berhasil Disimpan & Tersinkronisasi Cloud!');
    });
  }

  document.querySelectorAll('.modal-close, .closeModalBtn').forEach(b => {
    b.addEventListener('click', () => closeModal(productModal));
  });

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

window.openEditProductModal = function(id) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  document.getElementById('editProductId').value = p.id;
  document.getElementById('prodTitle').value = p.title;
  document.getElementById('prodCategory').value = p.main_category;
  document.getElementById('prodSubCat').value = p.sub_category || '';
  document.getElementById('prodPriceOriginal').value = p.price_original;
  document.getElementById('prodJastipFee').value = p.jastip_fee;
  document.getElementById('prodImageUrl').value = p.image_url;
  document.getElementById('prodDesc').value = p.description;

  document.getElementById('imagePreview').src = p.image_url;
  document.getElementById('imagePreviewContainer').style.display = 'block';

  document.getElementById('productModalTitle').textContent = '✏️ Edit Barang Katalog';
  openModal(productModal);
};

window.deleteProduct = function(id) {
  if (confirm('⚠️ Apakah Anda yakin ingin menghapus barang ini dari katalog?')) {
    products = products.filter(p => p.id !== id);
    localStorage.setItem('jastip_products', JSON.stringify(products));
    if (typeof db !== 'undefined' && db) {
      try { db.ref('products').set(products); } catch(err) {}
    }
    renderDashboard();
  }
};

window.updateOrderStatus = function(id, newStatus) {
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    orders[idx].status = newStatus;
    localStorage.setItem('jastip_orders', JSON.stringify(orders));
    if (typeof db !== 'undefined' && db) {
      try { db.ref('orders').set(orders); } catch(err) {}
    }
    renderStats();
    alert(`✅ Status Pesanan Invoice ${orders[idx].order_number} berhasil diperbarui menjadi ${newStatus}!`);
  }
};

function openModal(m) { if (m) m.classList.add('active'); }
function closeModal(m) { if (m) m.classList.remove('active'); }
