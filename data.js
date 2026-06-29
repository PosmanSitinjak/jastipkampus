// Data Awal Katalog JastipKampus
const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    title: "Bakpia Kukus Tugu Jogja (Cokelat)",
    main_category: "MAKANAN_MINUMAN",
    sub_category: "Makanan Khas",
    description: "Bakpia kukus lembut khas Yogyakarta rasa cokelat lumer. Isi 10 pcs/pack. Tahan 5 hari.",
    price_original: 38000,
    jastip_fee: 7000,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "prod-2",
    title: "Kopi Kenangan Mantan (Literan)",
    main_category: "MAKANAN_MINUMAN",
    sub_category: "Minuman",
    description: "Kopi susu kekinian botol 1 Liter. Segar untuk menemani lembur tugas kuliah & nugas kelompok.",
    price_original: 85000,
    jastip_fee: 10000,
    stock: 8,
    image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "prod-3",
    title: "Buku Kalkulus Purcell Edisi 9 (Bahasa Indonesia)",
    main_category: "PERALATAN_KULIAH",
    sub_category: "Buku Literatur",
    description: "Buku teks wajib mahasiswa teknik & MIPA. Cetakan original fisik berkualitas tinggi.",
    price_original: 175000,
    jastip_fee: 15000,
    stock: 5,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "prod-4",
    title: "Set Alat Gambar Teknik Rotring & Jangka Precision",
    main_category: "PERALATAN_KULIAH",
    sub_category: "Alat Teknik",
    description: "Perlengkapan wajib praktikum gambar teknik / arsitektur. Lengkap dengan busur & penggaris segitiga.",
    price_original: 240000,
    jastip_fee: 20000,
    stock: 4,
    image_url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "prod-5",
    title: "Pisang Goreng Madu Bu Nanik (Paket 5 Pcs)",
    main_category: "MAKANAN_MINUMAN",
    sub_category: "Snack Kuliner",
    description: "Kuliner legendaris Jakarta. Pisang goreng karamel madu hitam renyah manis alami.",
    price_original: 45000,
    jastip_fee: 8000,
    stock: 12,
    image_url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281327?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "prod-6",
    title: "Jas Laboratorium Kimia / Biologi (Size L)",
    main_category: "PERALATAN_KULIAH",
    sub_category: "Alat Lab",
    description: "Jas praktikum bahan katun oxford tebal lengan panjang. Standar keselamatan lab kampus.",
    price_original: 95000,
    jastip_fee: 10000,
    stock: 10,
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80"
  }
];

const INITIAL_ORDERS = [
  {
    id: "ord-101",
    order_number: "JST-20260629-001",
    user_name: "Rian Mahasiswa",
    user_email: "rian.student@gmail.com",
    user_wa: "081298765432",
    product_title: "Bakpia Kukus Tugu Jogja (Cokelat)",
    quantity: 2,
    price_original: 38000,
    jastip_fee: 7000,
    total_amount: 90000,
    status: "DIBELI",
    delivery_notes: "COD Kantin Teknik UGM jam 13.00",
    created_at: "2026-06-29T08:30:00Z"
  }
];

const INITIAL_ADMINS = [
  {
    id: "admin-1",
    username: "admin1",
    password: "admin123",
    name: "Admin 1",
    role: "Super Admin"
  },
  {
    id: "admin-2",
    username: "admin2",
    password: "admin123",
    name: "Admin 2",
    role: "Admin Operasional"
  }
];

// Synchronize Cloud Database Auto-Seeder
function syncCloudDatabaseInitial() {
  if (typeof db !== 'undefined' && db) {
    db.ref('products').once('value', snapshot => {
      if (!snapshot.exists()) {
        db.ref('products').set(INITIAL_PRODUCTS);
        db.ref('orders').set(INITIAL_ORDERS);
        console.log("🔥 Auto-seeded initial catalog data to Firebase Cloud!");
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', syncCloudDatabaseInitial);
