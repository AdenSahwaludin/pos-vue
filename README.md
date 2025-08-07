# 🏪 POS System CV Sari Bumi Sakti

Aplikasi web sistem informasi kasir (Point of Sale) yang komprehensif untuk CV Sari Bumi Sakti, perusahaan yang berfokus pada produksi dan penjualan minyak herbal tradisional.

## 🎯 Fitur Utama

### 👥 Manajemen Pengguna & Otorisasi

- ✅ Sistem login/logout dengan Firebase Authentication
- ✅ Otorisasi berbasis peran (Admin & Kasir)
- ✅ Protected routes berdasarkan role

### 📦 Manajemen Data

- ✅ **Pelanggan**: CRUD pelanggan dengan pencarian real-time
- ✅ **Kategori Produk**: Manajemen kategori produk
- ✅ **Produk**: CRUD produk dengan upload gambar, notifikasi stok minimum

### 🛒 Sistem Point of Sale (POS)

- ✅ Interface kasir yang intuitif dengan keranjang belanja
- ✅ Pencarian dan filter produk real-time
- ✅ Perhitungan otomatis (subtotal, diskon, pajak)
- ✅ Validasi stok otomatis
- ✅ Multiple metode pembayaran (tunai/non-tunai)
- ✅ Generate struk transaksi

### 📊 Laporan & Analytics (Admin)

- ✅ Dashboard dengan statistik penjualan real-time
- ✅ Grafik tren penjualan (harian/bulanan/tahunan)
- ✅ Fitur filter laporan berdasarkan periode
- ✅ Export laporan ke Excel dan PDF
- ✅ Analisis performa kasir dan pelanggan teratas

## 🛠️ Teknologi Stack

### Frontend

- **Vue.js 3** dengan Composition API
- **Vuetify 3** untuk UI framework yang responsif
- **Pinia** untuk state management
- **Vue Router** untuk navigasi SPA

### Backend & Database

- **Firebase Firestore** untuk database NoSQL real-time
- **Firebase Authentication** untuk manajemen pengguna
- **Firebase Storage** untuk penyimpanan file

### Libraries & Tools

- **jsPDF** untuk export PDF
- **SheetJS (xlsx)** untuk export Excel
- **@vueuse/core** untuk Vue utilities
- **Vite** sebagai build tool

## 🗃️ Database Schema

### Collections Firestore:

1. **users**

   - `id`, `nama`, `email`, `telepon`, `role`, `terakhir_login`

2. **customers**

   - `id`, `nama`, `email`, `telepon`, `kota`, `alamat`

3. **categories**

   - `id`, `nama`

4. **products**

   - `id`, `category_id`, `nama`, `gambar`, `nomor_bpom`, `harga`, `biaya_produk`, `stok`, `batas_stok`

5. **transactions**

   - `id`, `user_id`, `customer_id`, `tanggal`, `total`, `status`, `catatan`, `diskon`, `pajak`

6. **transaction_details**

   - `id`, `transaction_id`, `product_id`, `jumlah`, `harga_satuan`

7. **payments**
   - `id`, `transaction_id`, `metode`, `jumlah`, `keterangan`, `tanggal`

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm atau yarn
- Firebase account

### Installation

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd pos-ta
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup Firebase**

   - Buat project baru di [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy konfigurasi Firebase ke `src/config/firebase.js`

4. **Update Firebase Config**

   ```javascript
   // src/config/firebase.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id",
   };
   ```

5. **Setup Firestore Rules**

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

6. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```

## 👤 Demo Accounts

Setelah setup, buat user demo di Firebase Authentication:

- **Admin**: admin@saribumi.com / admin123
- **Kasir**: kasir@saribumi.com / kasir123

## 🎨 Fitur UI/UX

- ✅ **Responsive Design**: Mendukung desktop, tablet, dan mobile
- ✅ **Material Design**: Menggunakan Vuetify 3
- ✅ **Dark/Light Theme**: Support tema gelap dan terang
- ✅ **Progressive Web App**: Dapat diinstall sebagai aplikasi
- ✅ **Real-time Updates**: Sinkronisasi data real-time dengan Firestore

## 📱 Role-Based Access

### Admin (Full Access)

- ✅ Manajemen semua data (CRUD users, products, categories, customers)
- ✅ Akses semua transaksi dan pembayaran
- ✅ Laporan lengkap dan analytics
- ✅ Export data dan laporan

### Kasir (Limited Access)

- ✅ Fokus pada transaksi penjualan (POS)
- ✅ Manajemen pelanggan
- ✅ View data produk (read-only)
- ✅ Riwayat transaksi pribadi
- ✅ Cetak struk

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Project Structure

```
src/
├── components/          # Reusable components
├── views/              # Page components
│   ├── auth/           # Authentication pages
│   ├── pos/            # Point of Sale
│   ├── products/       # Product management
│   ├── categories/     # Category management
│   ├── customers/      # Customer management
│   ├── transactions/   # Transaction history
│   ├── reports/        # Reports & analytics
│   └── users/          # User management
├── stores/             # Pinia stores
├── router/             # Vue Router config
├── config/             # Firebase config
└── assets/             # Static assets
```

## 🚀 Deployment

### Firebase Hosting

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login and initialize**

   ```bash
   firebase login
   firebase init hosting
   ```

3. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Other Platforms

- **Vercel**: Langsung connect dengan repository GitHub
- **Netlify**: Drag & drop folder `dist` setelah build

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

Untuk pertanyaan dan dukungan:

- Email: support@saribumi.com
- Documentation: [Wiki](./wiki)

---

**CV Sari Bumi Sakti** - Minyak Herbal Tradisional Berkualitas

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
