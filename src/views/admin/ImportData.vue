<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center">
          <v-icon size="32" color="primary" class="mr-3">mdi-database-import</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">Import Data</h1>
            <p class="text-body-1 text-grey-darken-1 mb-0">Import data dari file JSON</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Import Options -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-package-variant</v-icon>
            Import Produk & Kategori
          </v-card-title>
          
          <v-card-text class="pa-4">
            <p class="text-body-2 mb-4">
              Import data produk dan kategori dari file JSON. Format file harus sesuai dengan template yang disediakan.
            </p>
            
            <v-file-input
              v-model="productFile"
              label="Pilih File JSON Produk"
              accept=".json"
              prepend-icon="mdi-file-document"
              outlined
              dense
              class="mb-3"
              :clearable="false"
            ></v-file-input>
            
            <v-row class="mb-3">
              <v-col cols="6">
                <v-btn
                  color="info"
                  variant="outlined"
                  @click="downloadProductTemplate"
                  block
                  size="small"
                >
                  <v-icon class="mr-2" size="16">mdi-download</v-icon>
                  Download Template
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  color="primary"
                  :loading="importingProduct"
                  :disabled="!productFile"
                  @click="importProducts"
                  block
                  size="small"
                >
                  <v-icon class="mr-2" size="16">mdi-upload</v-icon>
                  Import Data
                </v-btn>
              </v-col>
            </v-row>
            
            <v-alert
              v-if="productResult.show"
              :type="productResult.type"
              class="mb-0"
              dense
            >
              {{ productResult.message }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="bg-success text-white">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            Import Pelanggan
          </v-card-title>
          
          <v-card-text class="pa-4">
            <p class="text-body-2 mb-4">
              Import data pelanggan dari file JSON. Format file harus sesuai dengan template yang disediakan.
            </p>
            
            <v-file-input
              v-model="customerFile"
              label="Pilih File JSON Pelanggan"
              accept=".json"
              prepend-icon="mdi-file-document"
              outlined
              dense
              class="mb-3"
              :clearable="false"
            ></v-file-input>
            
            <v-row class="mb-3">
              <v-col cols="6">
                <v-btn
                  color="info"
                  variant="outlined"
                  @click="downloadCustomerTemplate"
                  block
                  size="small"
                >
                  <v-icon class="mr-2" size="16">mdi-download</v-icon>
                  Download Template
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  color="success"
                  :loading="importingCustomer"
                  :disabled="!customerFile"
                  @click="importCustomers"
                  block
                  size="small"
                >
                  <v-icon class="mr-2" size="16">mdi-upload</v-icon>
                  Import Data
                </v-btn>
              </v-col>
            </v-row>
            
            <v-alert
              v-if="customerResult.show"
              :type="customerResult.type"
              class="mb-0"
              dense
            >
              {{ customerResult.message }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="bg-warning text-white">
            <v-icon class="mr-2">mdi-receipt</v-icon>
            Import Transaksi
          </v-card-title>
          
          <v-card-text class="pa-4">
            <p class="text-body-2 mb-4">
              Import data transaksi dari file JSON. Pastikan data produk dan pelanggan sudah tersedia.
            </p>
            
            <v-file-input
              v-model="transactionFile"
              label="Pilih File JSON Transaksi"
              accept=".json"
              prepend-icon="mdi-file-document"
              outlined
              dense
              class="mb-3"
              :clearable="false"
            ></v-file-input>
            
            <v-row class="mb-3">
              <v-col cols="6">
                <v-btn
                  color="info"
                  variant="outlined"
                  @click="downloadTransactionTemplate"
                  block
                  size="small"
                >
                  <v-icon class="mr-2" size="16">mdi-download</v-icon>
                  Download Template
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  color="warning"
                  :loading="importingTransaction"
                  :disabled="!transactionFile"
                  @click="importTransactions"
                  block
                  size="small"
                >
                  <v-icon class="mr-2" size="16">mdi-upload</v-icon>
                  Import Data
                </v-btn>
              </v-col>
            </v-row>
            
            <v-alert
              v-if="transactionResult.show"
              :type="transactionResult.type"
              class="mb-0"
              dense
            >
              {{ transactionResult.message }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="bg-info text-white">
            <v-icon class="mr-2">mdi-credit-card</v-icon>
            Import Pembayaran
          </v-card-title>
          
          <v-card-text class="pa-4">
            <p class="text-body-2 mb-4">
              Import data pembayaran dari file JSON. Pastikan data transaksi sudah tersedia.
            </p>
            
            <v-file-input
              v-model="paymentFile"
              label="Pilih File JSON Pembayaran"
              accept=".json"
              prepend-icon="mdi-file-document"
              outlined
              dense
              class="mb-3"
              :clearable="false"
            ></v-file-input>
            
            <v-row class="mb-3">
              <v-col cols="6">
                <v-btn
                  color="info"
                  variant="outlined"
                  @click="downloadPaymentTemplate"
                  block
                  size="small"
                >
                  <v-icon class="mr-2" size="16">mdi-download</v-icon>
                  Download Template
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  color="info"
                  :loading="importingPayment"
                  :disabled="!paymentFile"
                  @click="importPayments"
                  block
                  size="small"
                >
                  <v-icon class="mr-2" size="16">mdi-upload</v-icon>
                  Import Data
                </v-btn>
              </v-col>
            </v-row>
            
            <v-alert
              v-if="paymentResult.show"
              :type="paymentResult.type"
              class="mb-0"
              dense
            >
              {{ paymentResult.message }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Import History -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="bg-grey-darken-1 text-white">
            <v-icon class="mr-2">mdi-history</v-icon>
            Riwayat Import
          </v-card-title>
          
          <v-data-table
            :headers="historyHeaders"
            :items="importHistory"
            :loading="loadingHistory"
            item-key="id"
            class="elevation-0"
          >
            <template v-slot:item.type="{ item }">
              <v-chip
                :color="getTypeColor(item.type)"
                size="small"
              >
                {{ getTypeLabel(item.type) }}
              </v-chip>
            </template>
            
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="item.status === 'success' ? 'success' : 'error'"
                size="small"
              >
                {{ item.status === 'success' ? 'Berhasil' : 'Gagal' }}
              </v-chip>
            </template>
            
            <template v-slot:item.created_at="{ item }">
              {{ formatDateTime(item.created_at) }}
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useImportStore } from '@/stores/import'

const importStore = useImportStore()

// File refs
const productFile = ref(null)
const customerFile = ref(null)
const transactionFile = ref(null)
const paymentFile = ref(null)

// Loading states
const importingProduct = ref(false)
const importingCustomer = ref(false)
const importingTransaction = ref(false)
const importingPayment = ref(false)
const loadingHistory = ref(false)

// Results
const productResult = ref({ show: false, type: 'success', message: '' })
const customerResult = ref({ show: false, type: 'success', message: '' })
const transactionResult = ref({ show: false, type: 'success', message: '' })
const paymentResult = ref({ show: false, type: 'success', message: '' })

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const importHistory = ref([])

// Table headers
const historyHeaders = [
  { title: 'Tanggal', key: 'created_at', sortable: true },
  { title: 'Jenis Data', key: 'type', sortable: true },
  { title: 'File', key: 'filename', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Jumlah Record', key: 'records_count', sortable: true },
  { title: 'Keterangan', key: 'message', sortable: false }
]

// Methods
const importProducts = async () => {
  if (!productFile.value) return
  
  try {
    importingProduct.value = true
    const result = await importStore.importProducts(productFile.value)
    
    productResult.value = {
      show: true,
      type: 'success',
      message: `Berhasil import ${result.count} produk dan ${result.categories} kategori`
    }
    
    showSnackbar('Data produk berhasil diimport')
    loadImportHistory()
  } catch (error) {
    productResult.value = {
      show: true,
      type: 'error',
      message: error.message || 'Gagal import data produk'
    }
    showSnackbar('Gagal import data produk', 'error')
  } finally {
    importingProduct.value = false
  }
}

const importCustomers = async () => {
  if (!customerFile.value) return
  
  try {
    importingCustomer.value = true
    const result = await importStore.importCustomers(customerFile.value)
    
    customerResult.value = {
      show: true,
      type: 'success',
      message: `Berhasil import ${result.count} pelanggan`
    }
    
    showSnackbar('Data pelanggan berhasil diimport')
    loadImportHistory()
  } catch (error) {
    customerResult.value = {
      show: true,
      type: 'error',
      message: error.message || 'Gagal import data pelanggan'
    }
    showSnackbar('Gagal import data pelanggan', 'error')
  } finally {
    importingCustomer.value = false
  }
}

const importTransactions = async () => {
  if (!transactionFile.value) return
  
  try {
    importingTransaction.value = true
    const result = await importStore.importTransactions(transactionFile.value)
    
    transactionResult.value = {
      show: true,
      type: 'success',
      message: `Berhasil import ${result.count} transaksi`
    }
    
    showSnackbar('Data transaksi berhasil diimport')
    loadImportHistory()
  } catch (error) {
    transactionResult.value = {
      show: true,
      type: 'error',
      message: error.message || 'Gagal import data transaksi'
    }
    showSnackbar('Gagal import data transaksi', 'error')
  } finally {
    importingTransaction.value = false
  }
}

const importPayments = async () => {
  if (!paymentFile.value) return
  
  try {
    importingPayment.value = true
    const result = await importStore.importPayments(paymentFile.value)
    
    paymentResult.value = {
      show: true,
      type: 'success',
      message: `Berhasil import ${result.count} pembayaran`
    }
    
    showSnackbar('Data pembayaran berhasil diimport')
    loadImportHistory()
  } catch (error) {
    paymentResult.value = {
      show: true,
      type: 'error',
      message: error.message || 'Gagal import data pembayaran'
    }
    showSnackbar('Gagal import data pembayaran', 'error')
  } finally {
    importingPayment.value = false
  }
}

// Template downloads
const downloadProductTemplate = () => {
  const template = {
    categories: [
      {
        nama: "Minyak Herbal",
        deskripsi: "Kategori minyak herbal tradisional",
        gambar: ""
      }
    ],
    products: [
      {
        nama: "Minyak Kayu Putih",
        kategori: "Minyak Herbal",
        harga: 25000,
        stok: 100,
        deskripsi: "Minyak kayu putih asli",
        gambar: "",
        barcode: "1234567890123"
      }
    ]
  }
  
  downloadJSON(template, 'template_produk.json')
}

const downloadCustomerTemplate = () => {
  const template = [
    {
      nama: "John Doe",
      email: "john@example.com",
      telepon: "08123456789",
      alamat: "Jl. Contoh No. 123",
      tanggal_bergabung: "2024-01-01"
    }
  ]
  
  downloadJSON(template, 'template_pelanggan.json')
}

const downloadTransactionTemplate = () => {
  const template = [
    {
      customer_email: "john@example.com",
      tanggal: "2024-01-01T10:00:00Z",
      items: [
        {
          product_name: "Minyak Kayu Putih",
          quantity: 2,
          price: 25000
        }
      ],
      total: 50000,
      payment_method: "cash",
      notes: ""
    }
  ]
  
  downloadJSON(template, 'template_transaksi.json')
}

const downloadPaymentTemplate = () => {
  const template = [
    {
      transaction_id: "TRX-2024-001",
      metode: "cash",
      jumlah: 50000,
      tanggal: "2024-01-01T10:00:00Z",
      keterangan: "Pembayaran tunai"
    }
  ]
  
  downloadJSON(template, 'template_pembayaran.json')
}

const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const loadImportHistory = async () => {
  try {
    loadingHistory.value = true
    importHistory.value = await importStore.getImportHistory()
  } catch (error) {
    showSnackbar('Gagal memuat riwayat import', 'error')
  } finally {
    loadingHistory.value = false
  }
}

const getTypeColor = (type) => {
  const colors = {
    products: 'primary',
    customers: 'success',
    transactions: 'warning',
    payments: 'info'
  }
  return colors[type] || 'grey'
}

const getTypeLabel = (type) => {
  const labels = {
    products: 'Produk',
    customers: 'Pelanggan',
    transactions: 'Transaksi',
    payments: 'Pembayaran'
  }
  return labels[type] || type
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('id-ID')
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Lifecycle
onMounted(() => {
  loadImportHistory()
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-data-table {
  border-radius: 0 0 12px 12px;
}
</style>
