<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <v-card class="glass-effect herbal-gradient" rounded="xl" elevation="12">
        <v-card-text class="pa-6">
          <div class="d-flex align-center">
            <div class="dashboard-icon">
              <v-icon size="32" color="white">mdi-view-dashboard</v-icon>
            </div>
            <div class="ml-4">
              <h1 class="text-h4 font-weight-bold text-white mb-1">
                Dashboard
              </h1>
              <div class="text-subtitle-1 text-white opacity-90">
                Selamat datang, {{ authStore.user?.email || "Pengguna" }}
              </div>
            </div>
            <v-spacer></v-spacer>
            <div class="text-right">
              <div class="text-caption text-white opacity-80">
                {{ currentDate }}
              </div>
              <div class="text-h6 text-white font-weight-bold">
                {{ currentTime }}
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card glass-effect" rounded="xl" elevation="8">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon primary-gradient">
                <v-icon color="white" size="28">mdi-currency-usd</v-icon>
              </div>
              <div class="ml-3 flex-grow-1">
                <div class="text-body-2 text-medium-emphasis">
                  Penjualan Hari Ini
                </div>
                <div class="text-h5 font-weight-bold text-primary">
                  Rp {{ formatCurrency(todaySales) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card glass-effect" rounded="xl" elevation="8">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon success-gradient">
                <v-icon color="white" size="28">mdi-receipt</v-icon>
              </div>
              <div class="ml-3 flex-grow-1">
                <div class="text-body-2 text-medium-emphasis">
                  Transaksi Hari Ini
                </div>
                <div class="text-h5 font-weight-bold text-success">
                  {{ todayTransactionsCount }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card glass-effect" rounded="xl" elevation="8">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon warning-gradient">
                <v-icon color="white" size="28">mdi-alert</v-icon>
              </div>
              <div class="ml-3 flex-grow-1">
                <div class="text-body-2 text-medium-emphasis">
                  Produk Stok Rendah
                </div>
                <div class="text-h5 font-weight-bold text-warning">
                  {{ lowStockCount }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card glass-effect" rounded="xl" elevation="8">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon info-gradient">
                <v-icon color="white" size="28">mdi-package-variant</v-icon>
              </div>
              <div class="ml-3 flex-grow-1">
                <div class="text-body-2 text-medium-emphasis">Total Produk</div>
                <div class="text-h5 font-weight-bold text-info">
                  {{ totalProducts }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content -->
    <v-row>
      <!-- Recent Transactions -->
      <v-col cols="12" lg="8">
        <v-card class="glass-effect" rounded="xl" elevation="8">
          <v-card-title class="pb-2">
            <div class="d-flex align-center">
              <div class="section-icon primary-gradient">
                <v-icon color="white" size="20">mdi-clock-outline</v-icon>
              </div>
              <span class="ml-3 text-h6 font-weight-bold"
                >Transaksi Terbaru</span
              >
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="primary"
                @click="$router.push('/transactions')"
                class="rounded-lg"
              >
                Lihat Semua
                <v-icon end>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text class="pa-0">
            <v-data-table
              :headers="transactionHeaders"
              :items="recentTransactions"
              :items-per-page="5"
              class="modern-table"
              hide-default-footer
            >
              <template v-slot:item.id="{ item }">
                <span class="font-weight-medium text-primary">{{
                  item.id
                }}</span>
              </template>

              <template v-slot:item.total="{ item }">
                <span class="font-weight-bold text-success">
                  Rp {{ formatCurrency(item.total) }}
                </span>
              </template>

              <template v-slot:item.tanggal="{ item }">
                <span class="text-body-2">{{ formatDate(item.tanggal) }}</span>
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  variant="elevated"
                  class="font-weight-medium"
                >
                  {{ item.status }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Actions & Alerts -->
      <v-col cols="12" lg="4">
        <!-- Quick Actions -->
        <v-card class="glass-effect mb-4" rounded="xl" elevation="8">
          <v-card-title class="pb-2">
            <div class="d-flex align-center">
              <div class="section-icon success-gradient">
                <v-icon color="white" size="20">mdi-lightning-bolt</v-icon>
              </div>
              <span class="ml-3 text-h6 font-weight-bold">Aksi Cepat</span>
            </div>
          </v-card-title>

          <v-card-text>
            <div class="quick-actions">
              <v-btn
                color="primary"
                variant="elevated"
                block
                size="large"
                rounded="xl"
                class="mb-3 quick-action-btn"
                @click="$router.push('/pos')"
              >
                <v-icon class="mr-2">mdi-cash-register</v-icon>
                Buat Transaksi Baru
              </v-btn>

              <v-btn
                color="secondary"
                variant="tonal"
                block
                size="large"
                rounded="xl"
                class="mb-3 quick-action-btn"
                @click="$router.push('/products')"
              >
                <v-icon class="mr-2">mdi-package-variant</v-icon>
                Kelola Produk
              </v-btn>

              <v-btn
                color="success"
                variant="tonal"
                block
                size="large"
                rounded="xl"
                class="mb-3 quick-action-btn"
                @click="$router.push('/customers')"
              >
                <v-icon class="mr-2">mdi-account-group</v-icon>
                Kelola Pelanggan
              </v-btn>

              <v-btn
                v-if="authStore.isAdmin"
                color="info"
                variant="tonal"
                block
                size="large"
                rounded="xl"
                class="quick-action-btn"
                @click="$router.push('/reports')"
              >
                <v-icon class="mr-2">mdi-chart-line</v-icon>
                Lihat Laporan
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Low Stock Alert -->
        <v-card
          v-if="lowStockProducts.length > 0"
          class="glass-effect low-stock-alert"
          rounded="xl"
          elevation="8"
        >
          <v-card-title class="pb-2">
            <div class="d-flex align-center">
              <div class="section-icon warning-gradient">
                <v-icon color="white" size="20">mdi-alert</v-icon>
              </div>
              <div class="ml-3">
                <div class="text-h6 font-weight-bold">
                  Peringatan Stok Rendah
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ lowStockProducts.length }} produk perlu diperhatikan
                </div>
              </div>
            </div>
          </v-card-title>

          <v-card-text class="pa-3">
            <div class="low-stock-container">
              <v-card
                v-for="product in lowStockProducts.slice(0, 5)"
                :key="product.id"
                class="low-stock-item glass-effect mb-2"
                rounded="lg"
                variant="tonal"
                color="warning"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <v-avatar size="32" class="mr-3">
                      <v-img
                        :src="product.gambar || '/placeholder-product.jpg'"
                        :alt="product.nama"
                      >
                        <template v-slot:placeholder>
                          <v-icon size="18" color="warning"
                            >mdi-package-variant</v-icon
                          >
                        </template>
                      </v-img>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="text-subtitle-2 font-weight-medium">
                        {{ product.nama }}
                      </div>
                      <div class="text-caption text-warning">
                        Stok: {{ product.stok }} (Min: {{ product.batas_stok }})
                      </div>
                    </div>
                    <v-chip
                      color="warning"
                      size="x-small"
                      variant="elevated"
                      class="font-weight-bold"
                    >
                      {{ product.stok }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>

              <v-btn
                v-if="lowStockProducts.length > 5"
                variant="text"
                color="warning"
                size="small"
                block
                class="mt-2"
                @click="$router.push('/products')"
              >
                Lihat {{ lowStockProducts.length - 5 }} lainnya
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTransactionStore } from "@/stores/transactions";
import { useProductStore } from "@/stores/products";

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const productStore = useProductStore();

// Real-time clock
const currentTime = ref("");
const currentDate = ref("");
let timeInterval = null;

const updateDateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  currentDate.value = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const transactionHeaders = [
  { title: "ID", key: "id", sortable: false },
  { title: "Total", key: "total" },
  { title: "Tanggal", key: "tanggal" },
  { title: "Status", key: "status" },
];

// Computed properties
const todaySales = computed(() => transactionStore.todaySales);
const todayTransactionsCount = computed(
  () => transactionStore.todayTransactions.length
);
const lowStockCount = computed(() => productStore.lowStockProducts.length);
const totalProducts = computed(() => productStore.products.length);
const lowStockProducts = computed(() => productStore.lowStockProducts);
const recentTransactions = computed(() =>
  transactionStore.transactions.slice(0, 5)
);

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "selesai":
      return "success";
    case "menunggu":
      return "warning";
    case "dibatalkan":
      return "error";
    default:
      return "grey";
  }
};

onMounted(async () => {
  // Initialize clock
  updateDateTime();
  timeInterval = setInterval(updateDateTime, 1000);

  // Load data
  await Promise.all([
    transactionStore.fetchTransactions(),
    productStore.fetchProducts(),
    productStore.fetchCategories(),
  ]);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 0;
  background: linear-gradient(
    135deg,
    rgba(245, 245, 245, 0.1),
    rgba(238, 238, 238, 0.05)
  );
  min-height: calc(100vh - 64px);
}

.dashboard-header {
  background: linear-gradient(
    135deg,
    rgba(46, 125, 50, 0.05),
    rgba(85, 139, 47, 0.02)
  );
  border-radius: 20px;
  padding: 8px;
}

.dashboard-icon {
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.stats-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(46, 125, 50, 0.1);
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(46, 125, 50, 0.15) !important;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.primary-gradient {
  background: linear-gradient(135deg, #2e7d32, #388e3c);
}

.success-gradient {
  background: linear-gradient(135deg, #388e3c, #4caf50);
}

.warning-gradient {
  background: linear-gradient(135deg, #f57c00, #ff9800);
}

.info-gradient {
  background: linear-gradient(135deg, #0288d1, #03a9f4);
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.modern-table {
  border-radius: 0 !important;
}

.modern-table .v-data-table__wrapper {
  border-radius: 0;
}

.modern-table tbody tr {
  transition: all 0.2s ease;
}

.modern-table tbody tr:hover {
  background: rgba(46, 125, 50, 0.05) !important;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-action-btn {
  transition: all 0.3s ease;
  font-weight: 600;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(46, 125, 50, 0.2);
}

.low-stock-alert {
  border: 1px solid rgba(255, 152, 0, 0.2);
  background: linear-gradient(
    135deg,
    rgba(255, 243, 224, 0.8),
    rgba(255, 248, 225, 0.6)
  );
}

.low-stock-container {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 152, 0, 0.3) transparent;
}

.low-stock-container::-webkit-scrollbar {
  width: 4px;
}

.low-stock-container::-webkit-scrollbar-track {
  background: transparent;
}

.low-stock-container::-webkit-scrollbar-thumb {
  background: rgba(255, 152, 0, 0.3);
  border-radius: 2px;
}

.low-stock-item {
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 152, 0, 0.2);
}

.low-stock-item:hover {
  transform: translateX(4px);
  border-color: rgba(255, 152, 0, 0.4);
}

.glass-effect {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.herbal-gradient {
  background: linear-gradient(135deg, #2e7d32, #388e3c, #4caf50);
  color: white;
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .dashboard-container {
    padding: 16px 8px;
  }

  .dashboard-header .v-card-text {
    padding: 20px !important;
  }

  .dashboard-icon {
    padding: 8px;
  }

  .stats-icon {
    width: 40px;
    height: 40px;
  }

  .section-icon {
    width: 32px;
    height: 32px;
  }

  .quick-action-btn {
    font-size: 0.875rem;
  }
}

@media (max-width: 600px) {
  .dashboard-header .text-h4 {
    font-size: 1.5rem !important;
  }

  .stats-card .v-card-text {
    padding: 16px !important;
  }

  .stats-card .text-h5 {
    font-size: 1.2rem !important;
  }

  .modern-table {
    font-size: 0.875rem;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-card {
  animation: fadeInUp 0.6s ease forwards;
}

.stats-card:nth-child(2) {
  animation-delay: 0.1s;
}

.stats-card:nth-child(3) {
  animation-delay: 0.2s;
}

.stats-card:nth-child(4) {
  animation-delay: 0.3s;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.low-stock-item {
  animation: slideInRight 0.4s ease forwards;
}

.low-stock-item:nth-child(2) {
  animation-delay: 0.1s;
}

.low-stock-item:nth-child(3) {
  animation-delay: 0.2s;
}
</style>
