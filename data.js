// Initial Sample Data tailored specifically for Institut Teknologi Del (IT Del)
const INITIAL_PRODUCTS = [
  {
    id: "del-prod-1",
    title: "Mie Gomak Khas Laguboti (Kuantitas Segar)",
    main_category: "MAKANAN_MINUMAN",
    sub_category: "Makanan Khas Tobasa",
    price_original: 12000,
    jastip_fee: 3000,
    image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    description: "Mie Gomak rempah andaliman khas Laguboti segar hangat, sangat cocok untuk sarapan atau ganjal perut saat praktikum malam di IT Del.",
    source_store: "Warung Khas Balige/Laguboti",
    weight: "350 gram",
    expiry_shelf_life: "Segar Dimakan Hari Ini",
    media_items: [
      { type: "image", url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80" }
    ]
  },
  {
    id: "del-prod-2",
    title: "Kue Lapet & Ombusombus Porsea (1 Paket)",
    main_category: "MAKANAN_MINUMAN",
    sub_category: "Cemilan Tradisional",
    price_original: 15000,
    jastip_fee: 3000,
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    description: "Kue tradisional beras gula merah hangat khas Porsea. Cemilan favorit mahasiswa IT Del untuk teman nugas kelompok di Asrama.",
    source_store: "Pusat Oleh-Oleh Porsea",
    weight: "500 gram",
    expiry_shelf_life: "Segar 2 Hari",
    media_items: [
      { type: "image", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" }
    ]
  },
  {
    id: "del-prod-3",
    title: "Kit Starter Arduino & Component Lab Elektro",
    main_category: "PERALATAN_KULIAH",
    sub_category: "Alat Praktikum Lab",
    price_original: 145000,
    jastip_fee: 10000,
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description: "Kit praktikum komponen elektronik starter Arduino Uno R3 lengkap dengan kabel jumper, resistor, breadboard untuk tugas lab mahasiswa IT Del.",
    source_store: "Toko Komponen Elektro Balige",
    weight: "400 gram",
    expiry_shelf_life: "Garansi Fungsi Alat 100%",
    media_items: [
      { type: "image", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80" }
    ]
  },
  {
    id: "del-prod-4",
    title: "Buku Algoritma & Struktur Data C++ / Python",
    main_category: "PERALATAN_KULIAH",
    sub_category: "Buku Teks Akademik",
    price_original: 85000,
    jastip_fee: 5000,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    description: "Buku referensi cetak Algoritma & Struktur Data edisi lengkap bahasa C++ & Python. Sangat direkomendasikan untuk mahasiswa prodi Informatika & Sistem Informasi IT Del.",
    source_store: "Toko Buku Akademik Balige",
    weight: "600 gram",
    expiry_shelf_life: "Buku Baru Segel",
    media_items: [
      { type: "image", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80" }
    ]
  }
];

const INITIAL_ORDERS = [
  {
    id: "ord-del-1",
    order_number: "JST-DEL-20260629-01",
    product_id: "del-prod-1",
    product_title: "Mie Gomak Khas Laguboti (Kuantitas Segar)",
    user_name: "Budi Tobing",
    user_email: "rian.student@gmail.com",
    user_wa: "081267890123",
    total_amount: 15000,
    status: "PENDING",
    delivery_notes: "COD Depan Kantin Asrama Silo IT Del jam 12.30 WIB",
    created_at: "29/06/2026, 12.30.00"
  }
];
