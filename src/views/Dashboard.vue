<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Dashboard</h1>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card color="primary">
          <v-card-text class="text-white">
            <div class="d-flex align-center">
              <div>
                <div class="text-h6">Penjualan Hari Ini</div>
                <div class="text-h4">Rp {{ formatCurrency(todaySales) }}</div>
              </div>
              <v-spacer></v-spacer>
              <v-icon size="48">mdi-currency-usd</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="success">
          <v-card-text class="text-white">
            <div class="d-flex align-center">
              <div>
                <div class="text-h6">Transaksi Hari Ini</div>
                <div class="text-h4">{{ todayTransactionsCount }}</div>
              </div>
              <v-spacer></v-spacer>
              <v-icon size="48">mdi-receipt</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="warning">
          <v-card-text class="text-white">
            <div class="d-flex align-center">
              <div>
                <div class="text-h6">Produk Stok Rendah</div>
                <div class="text-h4">{{ lowStockCount }}</div>
              </div>
              <v-spacer></v-spacer>
              <v-icon size="48">mdi-alert</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="info">
          <v-card-text class="text-white">
            <div class="d-flex align-center">
              <div>
                <div class="text-h6">Total Produk</div>
                <div class="text-h4">{{ totalProducts }}</div>
              </div>
              <v-spacer></v-spacer>
              <v-icon size="48">mdi-package-variant</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts and Quick Actions -->
    <v-row class="mt-4">
      <!-- Recent Transactions -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-clock-outline</v-icon>
            Transaksi Terbaru
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="transactionHeaders"
              :items="recentTransactions"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.total="{ item }">
                Rp {{ formatCurrency(item.total) }}
              </template>
              <template v-slot:item.tanggal="{ item }">
                {{ formatDate(item.tanggal) }}
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">
                  {{ item.status }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Aksi Cepat
          </v-card-title>
          <v-card-text>
            <v-btn
              color="primary"
              block
              size="large"
              class="mb-3"
              @click="$router.push('/pos')"
            >
              <v-icon class="mr-2">mdi-cash-register</v-icon>
              Buat Transaksi Baru
            </v-btn>

            <v-btn
              color="secondary"
              block
              size="large"
              class="mb-3"
              @click="$router.push('/products')"
            >
              <v-icon class="mr-2">mdi-package-variant</v-icon>
              Kelola Produk
            </v-btn>

            <v-btn
              color="success"
              block
              size="large"
              class="mb-3"
              @click="$router.push('/customers')"
            >
              <v-icon class="mr-2">mdi-account-group</v-icon>
              Kelola Pelanggan
            </v-btn>

            <v-btn
              v-if="authStore.isAdmin"
              color="info"
              block
              size="large"
              @click="$router.push('/reports')"
            >
              <v-icon class="mr-2">mdi-chart-line</v-icon>
              Lihat Laporan
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Low Stock Alert -->
        <v-card v-if="lowStockProducts.length > 0" class="mt-4">
          <v-card-title class="text-warning">
            <v-icon class="mr-2">mdi-alert</v-icon>
            Peringatan Stok Rendah
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="product in lowStockProducts"
                :key="product.id"
              >
                <v-list-item-title>{{ product.nama }}</v-list-item-title>
                <v-list-item-subtitle>
                  Stok: {{ product.stok }} (Min: {{ product.batas_stok }})
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTransactionStore } from "@/stores/transactions";
import { useProductStore } from "@/stores/products";

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const productStore = useProductStore();

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
  // Load data
  await Promise.all([
    transactionStore.fetchTransactions(),
    productStore.fetchProducts(),
    productStore.fetchCategories(),
  ]);
});
</script>
