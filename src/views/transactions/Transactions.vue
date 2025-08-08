<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Riwayat Transaksi</h1>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-text-field
          v-model="search"
          label="Cari transaksi..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="statusFilter"
          :items="statusItems"
          label="Status"
          variant="outlined"
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="startDate"
          label="Tanggal Mulai"
          type="date"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="endDate"
          label="Tanggal Akhir"
          type="date"
          variant="outlined"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Transactions Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredTransactions"
        :loading="transactionStore.loading"
        class="elevation-1"
        :items-per-page="10"
      >
        <template v-slot:item.id="{ item }">
          <div class="font-weight-medium text-primary">{{ item.id }}</div>
        </template>

        <template v-slot:item.tanggal="{ item }">
          {{ formatDate(item.tanggal) }}
        </template>

        <template v-slot:item.customer_id="{ item }">
          {{ getCustomerName(item.customer_id) }}
        </template>

        <template v-slot:item.total="{ item }">
          <div class="font-weight-medium">
            Rp {{ formatCurrency(item.total) }}
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small">
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon size="small" @click="viewTransactionDetails(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            v-if="authStore.isAdmin && item.status !== 'dibatalkan'"
            icon
            size="small"
            color="warning"
            @click="cancelTransaction(item)"
          >
            <v-icon>mdi-cancel</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Transaction Details Dialog -->
    <v-dialog v-model="showDetailsDialog" max-width="800px">
      <v-card v-if="selectedTransaction">
        <v-card-title>
          <v-icon class="mr-2">mdi-receipt</v-icon>
          Detail Transaksi {{ selectedTransaction.id }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list density="compact">
                <v-list-item>
                  <v-list-item-title>Kasir</v-list-item-title>
                  <v-list-item-subtitle>{{
                    getUserName(selectedTransaction.user_id)
                  }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Pelanggan</v-list-item-title>
                  <v-list-item-subtitle>{{
                    getCustomerName(selectedTransaction.customer_id)
                  }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Tanggal</v-list-item-title>
                  <v-list-item-subtitle>{{
                    formatDate(selectedTransaction.tanggal)
                  }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Status</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="getStatusColor(selectedTransaction.status)"
                      size="small"
                    >
                      {{ selectedTransaction.status }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="6">
              <v-list density="compact">
                <v-list-item v-if="selectedTransaction.diskon">
                  <v-list-item-title>Diskon</v-list-item-title>
                  <v-list-item-subtitle
                    >Rp
                    {{
                      formatCurrency(selectedTransaction.diskon)
                    }}</v-list-item-subtitle
                  >
                </v-list-item>
                <v-list-item v-if="selectedTransaction.pajak">
                  <v-list-item-title>Pajak</v-list-item-title>
                  <v-list-item-subtitle
                    >Rp
                    {{
                      formatCurrency(selectedTransaction.pajak)
                    }}</v-list-item-subtitle
                  >
                </v-list-item>
                <v-list-item v-if="selectedTransaction.biaya_pengiriman">
                  <v-list-item-title>Biaya Pengiriman</v-list-item-title>
                  <v-list-item-subtitle
                    >Rp
                    {{
                      formatCurrency(selectedTransaction.biaya_pengiriman)
                    }}</v-list-item-subtitle
                  >
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="text-h6">Total</v-list-item-title>
                  <v-list-item-subtitle class="text-h6 font-weight-bold">
                    Rp {{ formatCurrency(selectedTransaction.total) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- Transaction Items -->
          <h3 class="mb-3">Item Pembelian</h3>
          <v-data-table
            :headers="detailHeaders"
            :items="transactionDetails"
            :loading="loadingDetails"
            density="compact"
            hide-default-footer
          >
            <template v-slot:item.product_name="{ item }">
              {{ item.product?.nama || item.product_name || 'Produk tidak ditemukan' }}
            </template>

            <template v-slot:item.harga_satuan="{ item }">
              Rp {{ formatCurrency(item.harga_satuan) }}
            </template>

            <template v-slot:item.subtotal="{ item }">
              Rp {{ formatCurrency(item.harga_satuan * item.jumlah) }}
            </template>
          </v-data-table>

          <v-divider class="my-4"></v-divider>

          <!-- Payment Info -->
          <h3 class="mb-3">Informasi Pembayaran</h3>
          <v-data-table
            :headers="paymentHeaders"
            :items="paymentDetails"
            :loading="loadingPayments"
            density="compact"
            hide-default-footer
          >
            <template v-slot:item.jumlah="{ item }">
              Rp {{ formatCurrency(item.jumlah) }}
            </template>

            <template v-slot:item.tanggal="{ item }">
              {{ formatDate(item.tanggal) }}
            </template>
          </v-data-table>

          <div v-if="selectedTransaction.catatan" class="mt-4">
            <h4>Catatan:</h4>
            <p>{{ selectedTransaction.catatan }}</p>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="outlined" @click="printReceipt">
            <v-icon class="mr-2">mdi-printer</v-icon>
            Cetak Struk
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showDetailsDialog = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel Confirmation Dialog -->
    <v-dialog v-model="showCancelDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6"> Batalkan Transaksi </v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin membatalkan transaksi "{{
            transactionToCancel?.id
          }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="showCancelDialog = false">
            Tidak
          </v-btn>
          <v-btn
            color="error"
            @click="confirmCancel"
            :loading="transactionStore.loading"
          >
            Ya, Batalkan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTransactionStore } from "@/stores/transactions";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const authStore = useAuthStore();
const transactionStore = useTransactionStore();

// Filters
const search = ref("");
const statusFilter = ref("");
const startDate = ref("");
const endDate = ref("");

// Dialog states
const showDetailsDialog = ref(false);
const showCancelDialog = ref(false);
const selectedTransaction = ref(null);
const transactionToCancel = ref(null);
const transactionDetails = ref([]);
const paymentDetails = ref([]);
const loadingDetails = ref(false);
const loadingPayments = ref(false);

// Demo data for users and customers
const users = ref([]);
const customers = ref([]);

const statusItems = [
  { title: "Selesai", value: "selesai" },
  { title: "Menunggu", value: "menunggu" },
  { title: "Dibatalkan", value: "dibatalkan" },
];

const headers = [
  { title: "ID Transaksi", key: "id" },
  { title: "Tanggal", key: "tanggal" },
  { title: "Pelanggan", key: "customer_id", sortable: false },
  { title: "Total", key: "total" },
  { title: "Status", key: "status" },
  { title: "Aksi", key: "actions", sortable: false },
];

const detailHeaders = [
  { title: "Produk", key: "product_name" },
  { title: "Harga Satuan", key: "harga_satuan" },
  { title: "Jumlah", key: "jumlah" },
  { title: "Subtotal", key: "subtotal" },
];

const paymentHeaders = [
  { title: "ID Pembayaran", key: "id" },
  { title: "Metode", key: "metode" },
  { title: "Jumlah", key: "jumlah" },
  { title: "Tanggal", key: "tanggal" },
  { title: "Keterangan", key: "keterangan" },
];

// Computed properties
const filteredTransactions = computed(() => {
  let transactions = transactionStore.transactions;

  // Filter by search
  if (search.value) {
    transactions = transactions.filter((t) =>
      t.id.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  // Filter by status
  if (statusFilter.value) {
    transactions = transactions.filter((t) => t.status === statusFilter.value);
  }

  // Filter by date range
  if (startDate.value) {
    transactions = transactions.filter((t) => {
      const transDate = new Date(t.tanggal.seconds * 1000);
      return transDate >= new Date(startDate.value);
    });
  }

  if (endDate.value) {
    transactions = transactions.filter((t) => {
      const transDate = new Date(t.tanggal.seconds * 1000);
      return transDate <= new Date(endDate.value + "T23:59:59");
    });
  }

  return transactions;
});

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

const getUserName = (userId) => {
  const user = users.value.find((u) => u.id === userId);
  return user ? user.nama : "Unknown User";
};

const getCustomerName = (customerId) => {
  if (!customerId) return "Walk-in Customer";
  const customer = customers.value.find((c) => c.id === customerId);
  return customer ? customer.nama : "Unknown Customer";
};

const viewTransactionDetails = async (transaction) => {
  selectedTransaction.value = transaction;
  showDetailsDialog.value = true;

  // Load transaction details
  await loadTransactionDetails(transaction.id);
  await loadPaymentDetails(transaction.id);
};

const loadTransactionDetails = async (transactionId) => {
  try {
    loadingDetails.value = true;
    transactionDetails.value = await transactionStore.getTransactionDetails(transactionId);
  } catch (error) {
    console.error("Error loading transaction details:", error);
  } finally {
    loadingDetails.value = false;
  }
};

const loadPaymentDetails = async (transactionId) => {
  try {
    loadingPayments.value = true;
    const q = query(
      collection(db, "payments"),
      where("transaction_id", "==", transactionId)
    );
    const querySnapshot = await getDocs(q);
    paymentDetails.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error loading payment details:", error);
  } finally {
    loadingPayments.value = false;
  }
};

const cancelTransaction = (transaction) => {
  transactionToCancel.value = transaction;
  showCancelDialog.value = true;
};

const confirmCancel = async () => {
  try {
    await transactionStore.updateTransactionStatus(
      transactionToCancel.value.id,
      "dibatalkan"
    );
    showCancelDialog.value = false;
    transactionToCancel.value = null;
  } catch (error) {
    console.error("Cancel transaction failed:", error);
  }
};

const printReceipt = () => {
  // Implement receipt printing logic
  window.print();
};

const fetchUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    users.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const fetchCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "customers"));
    customers.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
};

onMounted(async () => {
  const userOnly = !authStore.isAdmin;
  await Promise.all([
    transactionStore.fetchTransactions(userOnly),
    fetchUsers(),
    fetchCustomers(),
  ]);
});
</script>
