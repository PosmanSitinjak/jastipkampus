// Initial Data Store & Multi-Admin Credentials for JastipKampus

const INITIAL_ADMINS = [
  { id: 'adm-1', username: 'admin1', password: 'password123', name: 'Admin 1 (Super)' },
  { id: 'adm-2', username: 'admin2', password: 'password123', name: 'Admin 2 (Operasional)' }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Gudeg Kaleng Bu Tjitro (Ayam & Telur)',
    main_category: 'MAKANAN_MINUMAN',
    sub_category: 'Makanan Khas',
    price_original: 38000,
    jastip_fee: 7000,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    media_items: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
      { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-person-preparing-a-dish-41529-large.mp4' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' }
    ],
    weight: '300 Gram',
    expiry_shelf_life: '12 Bulan (Kemasan Kaleng Hampa Udara)',
    source_store: 'Pusat Oleh-oleh Gudeg Bu Tjitro 1925',
    description: 'Gudeg kuliner khas Jogja praktis dalam kemasan kaleng higienis siap makan. Berisi daging ayam kampung suwir, telur bebek utuh, tahu, krecek, dan areh gurih khas.'
  },
  {
    id: 'prod-2',
    title: 'Bakpia Kukus Tugu Jogja (Cokelat)',
    main_category: 'MAKANAN_MINUMAN',
    sub_category: 'Makanan Khas',
    price_original: 38000,
    jastip_fee: 7000,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    media_items: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
      { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-delicious-freshly-baked-bread-43093-large.mp4' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80' }
    ],
    weight: '500 Gram (Isi 10 Pcs)',
    expiry_shelf_life: '7 Hari Suhu Ruang / 14 Hari di Kulkas',
    source_store: 'Official Store Bakpia Kukus Tugu Jogja Stasiun Lempuyangan',
    description: 'Bakpia kukus tekstur lembut dengan isian cokelat lumer manis gurih. Sangat cocok untuk cemilan belajar malam di kost atau oleh-oleh.'
  },
  {
    id: 'prod-3',
    title: 'Kopi Kenangan Mantan (Literan 1L)',
    main_category: 'MAKANAN_MINUMAN',
    sub_category: 'Minuman Kekinian',
    price_original: 85000,
    jastip_fee: 10000,
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    media_items: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80' },
      { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-iced-coffee-into-a-glass-41530-large.mp4' }
    ],
    weight: '1.000 ml (1 Liter)',
    expiry_shelf_life: '3 Hari Dalam Lemari Es',
    source_store: 'Kopi Kenangan Ruko Kaliurang UGM',
    description: 'Kopi susu gula aren kekinian kemasan botol 1 Liter hemat. Pas diminum bareng teman kelompok tugas kuliah.'
  },
  {
    id: 'prod-4',
    title: 'Buku Kalkulus Purcell Edisi 9 (Bahasa Indonesia)',
    main_category: 'PERALATAN_KULIAH',
    sub_category: 'Buku Kuliah',
    price_original: 175000,
    jastip_fee: 15000,
    stock: 5,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    media_items: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80' }
    ],
    weight: '1.200 Gram (Hardcover)',
    expiry_shelf_life: 'Garansi Cetakan Original Kertas HVS',
    source_store: 'Toko Buku Togamas Gejayan',
    description: 'Buku teks wajib matakuliah Kalkulus untuk mahasiswa tingkat pertama Fakultas Teknik, MIPA, & Pertanian.'
  },
  {
    id: 'prod-5',
    title: 'Set Alat Gambar Teknik Rotring & Jangka Precision',
    main_category: 'PERALATAN_KULIAH',
    sub_category: 'Alat Lab / Praktikum',
    price_original: 240000,
    jastip_fee: 20000,
    stock: 3,
    image_url: 'https://images.unsplash.com/photo-1585336261026-875a60a1c92f?auto=format&fit=crop&w=800&q=80',
    media_items: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1585336261026-875a60a1c92f?auto=format&fit=crop&w=800&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80' }
    ],
    weight: '450 Gram (Box Set Stainless)',
    expiry_shelf_life: 'Tahan Lama & Anti Karat',
    source_store: 'Toko Alat Tulis & Teknik Pelangi UGM',
    description: 'Perlengkapan lengkap jangka presisi tinggi dan pena rapido Rotring untuk tugas Gambar Teknik dan Arsitektur.'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ord-101',
    order_number: 'JST-20260629-001',
    product_id: 'prod-2',
    product_title: 'Bakpia Kukus Tugu Jogja (Cokelat)',
    user_name: 'Rian Mahasiswa',
    user_email: 'rian.student@gmail.com',
    user_wa: '081298765432',
    total_amount: 45000,
    status: 'DIBELI',
    delivery_notes: 'COD Kantin Teknik UGM jam 13.00',
    created_at: '2026-06-29 10:15'
  }
];
