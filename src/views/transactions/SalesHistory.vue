<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center">
          <v-icon size="32" color="primary" class="mr-3">mdi-history</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">Riwayat Penjualan</h1>
            <p class="text-body-1 text-grey-darken-1 mb-0">Riwayat semua transaksi penjualan</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card elevation="2" rounded="lg" class="mb-4">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="dateFrom"
              label="Dari Tanggal"
              type="date"
              outlined
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="dateTo"
              label="Sampai Tanggal"
              type="date"
              outlined
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              label="Status"
              :items="statusOptions"
              outlined
              dense
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              color="primary"
              :loading="loading"
              @click="fetchSalesHistory"
              block
              size="large"
            >
              <v-icon class="mr-2">mdi-magnify</v-icon>
              Filter
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Sales History Table -->
    <v-card elevation="2" rounded="lg">
      <v-card-title class="bg-primary text-white">
        <v-icon class="mr-2">mdi-history</v-icon>
        Riwayat Penjualan
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="salesHistory"
        :loading="loading"
        item-key="id"
        class="elevation-0"
        :items-per-page="10"
      >
        <template v-slot:item.tanggal="{ item }">
          {{ formatDate(item.tanggal) }}
        </template>
        
        <template v-slot:item.total="{ item }">
          {{ formatCurrency(item.total) }}
        </template>
        
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="small"
            color="primary"
            @click="viewDetails(item)"
            class="mr-1"
          >
            <v-icon size="16">mdi-eye</v-icon>
          </v-btn>
          
          <v-btn
            icon
            size="small"
            color="success"
            @click="printReceipt(item)"
          >
            <v-icon size="16">mdi-printer</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Transaction Details Dialog -->
    <v-dialog v-model="detailDialog" max-width="600px">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-receipt</v-icon>
          Detail Transaksi
        </v-card-title>
        
        <v-card-text class="pa-4" v-if="selectedTransaction">
          <v-row>
            <v-col cols="6">
              <strong>ID Transaksi:</strong> {{ selectedTransaction.id }}
            </v-col>
            <v-col cols="6">
              <strong>Tanggal:</strong> {{ formatDate(selectedTransaction.tanggal) }}
            </v-col>
            <v-col cols="6">
              <strong>Total:</strong> {{ formatCurrency(selectedTransaction.total) }}
            </v-col>
            <v-col cols="6">
              <strong>Status:</strong> {{ selectedTransaction.status }}
            </v-col>
          </v-row>
          
          <v-divider class="my-3"></v-divider>
          
          <h4 class="mb-2">Detail Produk:</h4>
          <v-table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detail in transactionDetails" :key="detail.id">
                <td>{{ detail.product?.nama || detail.product_name || 'Produk tidak ditemukan' }}</td>
                <td>{{ detail.jumlah }}</td>
                <td>Rp {{ formatCurrency(detail.harga_satuan) }}</td>
                <td>Rp {{ formatCurrency(detail.jumlah * detail.harga_satuan) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="detailDialog = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTransactionStore } from '@/stores/transactions'

const transactionStore = useTransactionStore()

// Data
const loading = ref(false)
const detailDialog = ref(false)
const selectedTransaction = ref(null)
const transactionDetails = ref([])

// Filters
const dateFrom = ref('')
const dateTo = ref('')
const statusFilter = ref('')

// Computed
const salesHistory = computed(() => transactionStore.transactions)

// Table headers
const headers = [
  { title: 'ID Transaksi', key: 'id', sortable: true },
  { title: 'Tanggal', key: 'tanggal', sortable: true },
  { title: 'Total', key: 'total', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'center' }
]

// Options
const statusOptions = [
  'selesai',
  'pending',
  'batal'
]

// Methods
const fetchSalesHistory = async () => {
  try {
    loading.value = true
    await transactionStore.fetchTransactions()
  } catch (error) {
    console.error('Error fetching sales history:', error)
  } finally {
    loading.value = false
  }
}

const viewDetails = async (transaction) => {
  selectedTransaction.value = transaction
  try {
    transactionDetails.value = await transactionStore.getTransactionDetails(transaction.id)
  } catch (error) {
    console.error('Error fetching transaction details:', error)
  }
  detailDialog.value = true
}

const printReceipt = (transaction) => {
  // Create clean print window
  const printWindow = window.open('', '_blank', 'width=300,height=600')
  
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Struk Pembayaran</title>
      <style>
        body { font-family: monospace; font-size: 12px; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .row { display: flex; justify-content: space-between; margin: 5px 0; }
        .total { font-weight: bold; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h3>CV SARI BUMI SAKTI</h3>
        <p>Struk Pembayaran</p>
      </div>
      
      <div class="divider"></div>
      
      <div class="row">
        <span>No. Transaksi:</span>
        <span>${transaction.id}</span>
      </div>
      <div class="row">
        <span>Tanggal:</span>
        <span>${formatDate(transaction.tanggal)}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="row total">
        <span>TOTAL:</span>
        <span>${formatCurrency(transaction.total)}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="header">
        <p>Terima kasih atas kunjungan Anda</p>
        <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
      </div>
    </body>
    </html>
  `
  
  printWindow.document.write(receiptHTML)
  printWindow.document.close()
  
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}

const formatDate = (date) => {
  if (!date) return '-'
  if (date.seconds) {
    return new Date(date.seconds * 1000).toLocaleDateString('id-ID')
  }
  return new Date(date).toLocaleDateString('id-ID')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'selesai': return 'success'
    case 'pending': return 'warning'
    case 'batal': return 'error'
    default: return 'grey'
  }
}

// Lifecycle
onMounted(() => {
  fetchSalesHistory()
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>
