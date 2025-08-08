<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center">
          <v-icon size="32" color="primary" class="mr-3">mdi-credit-card</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">Manajemen Pembayaran</h1>
            <p class="text-body-1 text-grey-darken-1 mb-0">Kelola pembayaran dan transaksi pending</p>
          </div>
        </div>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          size="large"
          @click="openAddPaymentDialog"
          elevation="2"
        >
          <v-icon size="20" class="mr-2">mdi-plus</v-icon>
          Tambah Pembayaran
        </v-btn>
      </v-col>
    </v-row>

    <!-- Pending Transactions -->
    <v-card elevation="2" rounded="lg" class="mb-4">
      <v-card-title class="bg-warning text-white">
        <v-icon class="mr-2">mdi-clock-alert</v-icon>
        Transaksi Pending
      </v-card-title>
      
      <v-data-table
        :headers="pendingHeaders"
        :items="pendingTransactions"
        :loading="loadingPending"
        item-key="id"
        class="elevation-0"
      >
        <template v-slot:item.tanggal="{ item }">
          {{ formatDate(item.tanggal) }}
        </template>
        
        <template v-slot:item.total="{ item }">
          {{ formatCurrency(item.total) }}
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            color="success"
            size="small"
            @click="processPayment(item)"
            class="mr-2"
          >
            <v-icon size="16" class="mr-1">mdi-credit-card</v-icon>
            Bayar
          </v-btn>
          
          <v-btn
            color="error"
            size="small"
            @click="cancelTransaction(item)"
          >
            <v-icon size="16" class="mr-1">mdi-cancel</v-icon>
            Batal
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- All Payments -->
    <v-card elevation="2" rounded="lg">
      <v-card-title class="bg-primary text-white">
        <v-icon class="mr-2">mdi-credit-card-multiple</v-icon>
        Riwayat Pembayaran
      </v-card-title>
      
      <v-data-table
        :headers="paymentHeaders"
        :items="payments"
        :loading="loadingPayments"
        item-key="id"
        class="elevation-0"
        :items-per-page="10"
      >
        <template v-slot:item.tanggal="{ item }">
          {{ formatDate(item.tanggal) }}
        </template>
        
        <template v-slot:item.jumlah="{ item }">
          {{ formatCurrency(item.jumlah) }}
        </template>
        
        <template v-slot:item.metode="{ item }">
          <v-chip
            :color="getPaymentMethodColor(item.metode)"
            size="small"
          >
            {{ getPaymentMethodLabel(item.metode) }}
          </v-chip>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="small"
            color="primary"
            @click="viewPaymentDetails(item)"
          >
            <v-icon size="16">mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add Payment Dialog -->
    <v-dialog v-model="paymentDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-credit-card-plus</v-icon>
          Proses Pembayaran
        </v-card-title>
        
        <v-card-text class="pa-6" v-if="selectedTransaction">
          <div class="mb-4">
            <h4>Detail Transaksi</h4>
            <p><strong>ID:</strong> {{ selectedTransaction.id }}</p>
            <p><strong>Total:</strong> {{ formatCurrency(selectedTransaction.total) }}</p>
            <p><strong>Tanggal:</strong> {{ formatDate(selectedTransaction.tanggal) }}</p>
          </div>
          
          <v-divider class="mb-4"></v-divider>
          
          <v-form ref="paymentForm" v-model="paymentFormValid">
            <v-select
              v-model="paymentData.metode"
              label="Metode Pembayaran"
              :items="paymentMethods"
              item-title="text"
              item-value="value"
              :rules="[rules.required]"
              outlined
              dense
              class="mb-3"
            ></v-select>
            
            <v-text-field
              v-model="paymentData.jumlah"
              label="Jumlah Pembayaran"
              type="number"
              :rules="[rules.required, rules.minAmount]"
              outlined
              dense
              class="mb-3"
              prefix="Rp"
            ></v-text-field>
            
            <v-textarea
              v-model="paymentData.keterangan"
              label="Keterangan (Opsional)"
              outlined
              dense
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="closePaymentDialog"
          >
            Batal
          </v-btn>
          <v-btn
            color="primary"
            :loading="processingPayment"
            :disabled="!paymentFormValid"
            @click="submitPayment"
          >
            Proses Pembayaran
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Payment Details Dialog -->
    <v-dialog v-model="detailDialog" max-width="500px">
      <v-card>
        <v-card-title class="bg-info text-white">
          <v-icon class="mr-2">mdi-information</v-icon>
          Detail Pembayaran
        </v-card-title>
        
        <v-card-text class="pa-4" v-if="selectedPayment">
          <v-row>
            <v-col cols="12">
              <strong>ID Pembayaran:</strong> {{ selectedPayment.id }}
            </v-col>
            <v-col cols="12">
              <strong>ID Transaksi:</strong> {{ selectedPayment.transaction_id }}
            </v-col>
            <v-col cols="6">
              <strong>Metode:</strong> {{ getPaymentMethodLabel(selectedPayment.metode) }}
            </v-col>
            <v-col cols="6">
              <strong>Jumlah:</strong> {{ formatCurrency(selectedPayment.jumlah) }}
            </v-col>
            <v-col cols="12">
              <strong>Tanggal:</strong> {{ formatDate(selectedPayment.tanggal) }}
            </v-col>
            <v-col cols="12" v-if="selectedPayment.keterangan">
              <strong>Keterangan:</strong> {{ selectedPayment.keterangan }}
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="detailDialog = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, onMounted, computed } from 'vue'
import { usePaymentStore } from '@/stores/payments'
import { useTransactionStore } from '@/stores/transactions'

const paymentStore = usePaymentStore()
const transactionStore = useTransactionStore()

// Data
const loadingPending = ref(false)
const loadingPayments = ref(false)
const processingPayment = ref(false)
const paymentDialog = ref(false)
const detailDialog = ref(false)
const paymentFormValid = ref(false)

const selectedTransaction = ref(null)
const selectedPayment = ref(null)

const paymentData = ref({
  metode: '',
  jumlah: 0,
  keterangan: ''
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Computed
const pendingTransactions = computed(() => 
  transactionStore.transactions.filter(t => t.status === 'pending')
)
const payments = computed(() => paymentStore.payments)

// Table headers
const pendingHeaders = [
  { title: 'ID Transaksi', key: 'id', sortable: true },
  { title: 'Tanggal', key: 'tanggal', sortable: true },
  { title: 'Total', key: 'total', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'center' }
]

const paymentHeaders = [
  { title: 'ID Transaksi', key: 'transaction_id', sortable: true },
  { title: 'Metode', key: 'metode', sortable: true },
  { title: 'Jumlah', key: 'jumlah', sortable: true },
  { title: 'Tanggal', key: 'tanggal', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'center' }
]

// Options
const paymentMethods = [
  { text: 'Tunai', value: 'cash' },
  { text: 'Transfer Bank', value: 'transfer' },
  { text: 'Kartu Kredit', value: 'credit_card' },
  { text: 'Kartu Debit', value: 'debit_card' },
  { text: 'E-Wallet', value: 'ewallet' }
]

// Validation rules
const rules = {
  required: value => !!value || 'Field ini wajib diisi',
  minAmount: value => (value > 0) || 'Jumlah harus lebih dari 0'
}

// Methods
const fetchData = async () => {
  try {
    loadingPending.value = true
    loadingPayments.value = true
    
    await Promise.all([
      transactionStore.fetchTransactions(),
      paymentStore.fetchPayments()
    ])
  } catch (error) {
    showSnackbar('Gagal memuat data', 'error')
  } finally {
    loadingPending.value = false
    loadingPayments.value = false
  }
}

const openAddPaymentDialog = () => {
  // This opens dialog to select pending transaction manually
  paymentDialog.value = true
}

const processPayment = (transaction) => {
  selectedTransaction.value = transaction
  paymentData.value = {
    metode: '',
    jumlah: transaction.total,
    keterangan: ''
  }
  paymentDialog.value = true
}

const closePaymentDialog = () => {
  paymentDialog.value = false
  selectedTransaction.value = null
  paymentData.value = {
    metode: '',
    jumlah: 0,
    keterangan: ''
  }
}

const submitPayment = async () => {
  try {
    processingPayment.value = true
    
    await paymentStore.createPayment({
      transaction_id: selectedTransaction.value.id,
      ...paymentData.value
    })
    
    // Update transaction status to completed
    await transactionStore.updateTransactionStatus(selectedTransaction.value.id, 'selesai')
    
    showSnackbar('Pembayaran berhasil diproses')
    closePaymentDialog()
    await fetchData()
  } catch (error) {
    showSnackbar('Gagal memproses pembayaran', 'error')
  } finally {
    processingPayment.value = false
  }
}

const cancelTransaction = async (transaction) => {
  try {
    await transactionStore.updateTransactionStatus(transaction.id, 'batal')
    showSnackbar('Transaksi berhasil dibatalkan')
    await fetchData()
  } catch (error) {
    showSnackbar('Gagal membatalkan transaksi', 'error')
  }
}

const viewPaymentDetails = (payment) => {
  selectedPayment.value = payment
  detailDialog.value = true
}

const getPaymentMethodColor = (method) => {
  switch (method) {
    case 'cash': return 'success'
    case 'transfer': return 'primary'
    case 'credit_card': return 'warning'
    case 'debit_card': return 'info'
    case 'ewallet': return 'purple'
    default: return 'grey'
  }
}

const getPaymentMethodLabel = (method) => {
  const methods = {
    cash: 'Tunai',
    transfer: 'Transfer',
    credit_card: 'Kartu Kredit',
    debit_card: 'Kartu Debit',
    ewallet: 'E-Wallet'
  }
  return methods[method] || method
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

const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>
