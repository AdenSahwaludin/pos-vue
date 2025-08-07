<template>
  <div class="pos-container">
    <!-- Mobile Header -->
    <div class="d-md-none mb-4">
      <v-card class="glass-effect" rounded="xl">
        <v-card-title class="text-center py-3">
          <v-icon color="primary" size="24" class="mr-2">mdi-cash-register</v-icon>
          <span class="text-h6 font-weight-bold text-primary">Point of Sale</span>
        </v-card-title>
      </v-card>
    </div>

    <!-- Desktop Title -->
    <v-row class="d-none d-md-flex">
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon size="32" color="primary" class="mr-3">mdi-cash-register</v-icon>
          <h1 class="text-h4">Point of Sale</h1>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Product Selection -->
      <v-col cols="12" :md="transactionStore.cart.length > 0 ? 8 : 12">
        <v-card class="glass-effect" rounded="xl" elevation="8">
          <!-- Product Header -->
          <v-card-title class="pb-2">
            <div class="d-flex align-center w-100">
              <v-icon class="mr-2" color="primary">mdi-package-variant</v-icon>
              <span class="text-h6 font-weight-bold">Pilih Produk</span>
              <v-spacer></v-spacer>
              
              <!-- Search Field -->
              <v-text-field
                v-model="searchQuery"
                label="Cari produk..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                :style="{
                  'max-width': $vuetify.display.mobile ? '200px' : '300px'
                }"
                class="rounded-lg"
                clearable
              ></v-text-field>
            </div>
          </v-card-title>

          <v-card-text class="pt-0">
            <!-- Category Filter with enhanced chips -->
            <div class="mb-4">
              <v-chip-group 
                v-model="selectedCategory" 
                class="category-chips"
                show-arrows
              >
                <v-chip 
                  :value="null" 
                  variant="tonal" 
                  color="primary"
                  class="rounded-pill font-weight-medium"
                  filter
                > 
                  <v-icon start>mdi-view-grid</v-icon>
                  Semua 
                </v-chip>
                <v-chip
                  v-for="category in productStore.categories"
                  :key="category.id"
                  :value="category.id"
                  variant="tonal"
                  color="primary"
                  class="rounded-pill font-weight-medium"
                  filter
                >
                  <v-icon start size="16">mdi-tag</v-icon>
                  {{ category.nama }}
                </v-chip>
              </v-chip-group>
            </div>

            <!-- Product Grid with modern cards -->
            <div class="product-grid">
              <v-card
                v-for="product in filteredProducts"
                :key="product.id"
                class="product-card"
                :class="{
                  'product-card--out-of-stock': product.stok <= 0,
                  'product-card--clickable': product.stok > 0
                }"
                @click="product.stok > 0 && addToCart(product)"
                :disabled="product.stok <= 0"
                elevation="4"
                rounded="xl"
              >
                <!-- Product Image -->
                <div class="product-image-container">
                  <v-img
                    :src="product.gambar || '/placeholder-product.jpg'"
                    height="120"
                    cover
                    class="product-image"
                  >
                    <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-icon size="48" color="grey-lighten-2">mdi-image</v-icon>
                      </div>
                    </template>
                    
                    <!-- Stock Status Badge -->
                    <v-chip
                      v-if="product.stok <= 0"
                      color="error"
                      class="ma-2 stock-badge"
                      size="small"
                    >
                      <v-icon start size="16">mdi-close</v-icon>
                      Habis
                    </v-chip>
                    <v-chip
                      v-else-if="product.stok <= 5"
                      color="warning"
                      class="ma-2 stock-badge"
                      size="small"
                    >
                      <v-icon start size="16">mdi-alert</v-icon>
                      Sedikit
                    </v-chip>
                  </v-img>
                </div>

                <!-- Product Info -->
                <v-card-title class="pb-2">
                  <div class="product-name">{{ product.nama }}</div>
                </v-card-title>

                <v-card-text class="pt-0">
                  <div class="product-price text-h6 text-primary font-weight-bold">
                    Rp {{ formatCurrency(product.harga) }}
                  </div>
                  <div class="product-stock text-body-2 text-medium-emphasis">
                    Stok: {{ product.stok }}
                  </div>
                  <div v-if="product.nomor_bpom" class="text-caption text-medium-emphasis">
                    BPOM: {{ product.nomor_bpom }}
                  </div>
                </v-card-text>

                <!-- Add Button for desktop -->
                <v-card-actions class="d-none d-md-flex pt-0">
                  <v-btn
                    color="primary"
                    variant="tonal"
                    block
                    rounded="lg"
                    :disabled="product.stok <= 0"
                    @click.stop="addToCart(product)"
                  >
                    <v-icon start>mdi-plus</v-icon>
                    Tambah
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Cart -->
      <v-col cols="12" md="4">
        <v-card class="cart-card glass-effect" sticky rounded="xl" elevation="8">
          <!-- Cart Header -->
          <v-card-title class="cart-header pb-2">
            <div class="d-flex align-center w-100">
              <div class="cart-icon-wrapper">
                <v-icon color="white" size="20">mdi-cart</v-icon>
              </div>
              <div class="ml-3">
                <div class="text-h6 font-weight-bold text-white">Keranjang</div>
                <div class="text-caption text-white opacity-90">
                  {{ transactionStore.cartItemCount }} item{{ transactionStore.cartItemCount !== 1 ? 's' : '' }}
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-chip
                v-if="transactionStore.cartItemCount > 0"
                color="rgba(255,255,255,0.2)"
                variant="elevated"
                size="small"
                class="text-white font-weight-bold"
              >
                {{ transactionStore.cartItemCount }}
              </v-chip>
            </div>
          </v-card-title>

          <!-- Cart Items -->
          <v-card-text class="pa-0">
            <div class="cart-items-container" style="max-height: 400px; overflow-y: auto;">
              <!-- Empty Cart State -->
              <div
                v-if="transactionStore.cart.length === 0"
                class="empty-cart-state text-center pa-6"
              >
                <div class="empty-cart-icon">
                  <v-icon size="64" color="primary" class="mb-3">mdi-cart-outline</v-icon>
                </div>
                <div class="text-h6 text-medium-emphasis mb-2">Keranjang Kosong</div>
                <div class="text-body-2 text-medium-emphasis">
                  Pilih produk untuk memulai transaksi
                </div>
              </div>

              <!-- Cart Items List -->
              <div v-else class="pa-3">
                <v-card
                  v-for="item in transactionStore.cart"
                  :key="item.product_id"
                  class="cart-item-card mb-3 glass-effect"
                  elevation="2"
                  rounded="lg"
                >
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center">
                      <!-- Product Avatar -->
                      <v-avatar size="48" rounded="lg" class="cart-item-avatar">
                        <v-img
                          :src="item.gambar || '/placeholder-product.jpg'"
                          :alt="item.nama"
                        >
                          <template v-slot:placeholder>
                            <v-icon size="24" color="primary">mdi-package-variant</v-icon>
                          </template>
                        </v-img>
                      </v-avatar>

                      <!-- Product Info -->
                      <div class="flex-grow-1 ml-3">
                        <div class="text-subtitle-2 font-weight-bold text-primary">
                          {{ item.nama }}
                        </div>
                        <div class="text-body-2 text-medium-emphasis">
                          Rp {{ formatCurrency(item.harga_satuan) }} /item
                        </div>
                        <div class="text-body-2 font-weight-bold text-success">
                          Subtotal: Rp {{ formatCurrency(item.harga_satuan * item.jumlah) }}
                        </div>
                      </div>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="d-flex align-center justify-space-between mt-3">
                      <div class="quantity-controls d-flex align-center">
                        <v-btn
                          icon
                          variant="outlined"
                          size="x-small"
                          color="primary"
                          @click="updateQuantity(item.product_id, item.jumlah - 1)"
                          :disabled="item.jumlah <= 1"
                          class="quantity-btn"
                        >
                          <v-icon size="16">mdi-minus</v-icon>
                        </v-btn>

                        <v-chip
                          color="primary"
                          variant="elevated"
                          size="small"
                          class="mx-2 quantity-display font-weight-bold"
                        >
                          {{ item.jumlah }}
                        </v-chip>

                        <v-btn
                          icon
                          variant="outlined"
                          size="x-small"
                          color="primary"
                          @click="updateQuantity(item.product_id, item.jumlah + 1)"
                          :disabled="item.jumlah >= item.stok_tersedia"
                          class="quantity-btn"
                        >
                          <v-icon size="16">mdi-plus</v-icon>
                        </v-btn>
                      </div>

                      <!-- Remove Button -->
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        color="error"
                        @click="removeFromCart(item.product_id)"
                        class="remove-btn"
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-card-text>

          <!-- Cart Summary -->
          <div v-if="transactionStore.cart.length > 0">
            <v-divider class="mx-3"></v-divider>

            <v-card-text class="pa-4">
              <!-- Subtotal -->
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-body-1 text-medium-emphasis">Subtotal:</span>
                <span class="text-h6 font-weight-bold text-primary">
                  Rp {{ formatCurrency(transactionStore.cartTotal) }}
                </span>
              </div>

              <!-- Discount -->
              <v-text-field
                v-model.number="discount"
                label="Diskon (Rp)"
                type="number"
                variant="outlined"
                density="compact"
                rounded="lg"
                prepend-inner-icon="mdi-tag"
                min="0"
                :max="transactionStore.cartTotal"
                class="mb-2 modern-input"
                hide-details
              ></v-text-field>

              <!-- Tax -->
              <v-text-field
                v-model.number="tax"
                label="Pajak (Rp)"
                type="number"
                variant="outlined"
                density="compact"
                rounded="lg"
                prepend-inner-icon="mdi-percent"
                min="0"
                class="mb-3 modern-input"
                hide-details
              ></v-text-field>

              <!-- Final Total -->
              <div class="total-section pa-3 rounded-lg">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-h6 font-weight-bold">Total Bayar:</span>
                  <span class="text-h5 font-weight-bold text-success">
                    Rp {{ formatCurrency(finalTotal) }}
                  </span>
                </div>
              </div>
            </v-card-text>

            <!-- Action Buttons -->
            <v-card-actions class="pa-4 pt-0">
              <div class="w-100">
                <!-- Clear Cart Button -->
                <v-btn
                  color="error"
                  variant="outlined"
                  @click="clearCart"
                  :disabled="transactionStore.cart.length === 0"
                  block
                  rounded="xl"
                  class="mb-3 clear-cart-btn"
                  size="large"
                >
                  <v-icon class="mr-2">mdi-delete-sweep</v-icon>
                  Kosongkan Keranjang
                </v-btn>

                <!-- Payment Button -->
                <v-btn
                  color="primary"
                  @click="showPaymentDialog = true"
                  :disabled="transactionStore.cart.length === 0"
                  block
                  rounded="xl"
                  size="x-large"
                  elevation="4"
                  class="payment-btn font-weight-bold"
                >
                  <v-icon class="mr-2" size="24">mdi-cash-multiple</v-icon>
                  Proses Pembayaran
                </v-btn>
              </div>
            </v-card-actions>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Payment Dialog -->
    <v-dialog v-model="showPaymentDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-cash</v-icon>
          Pembayaran
        </v-card-title>

        <v-card-text>
          <v-form ref="paymentForm" v-model="paymentValid">
            <!-- Customer Selection -->
            <v-autocomplete
              v-model="selectedCustomer"
              :items="customers"
              :loading="loadingCustomers"
              item-title="nama"
              item-value="id"
              label="Pelanggan (Opsional)"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              clearable
              class="mb-3"
              no-data-text="Tidak ada data pelanggan"
            ></v-autocomplete>

            <!-- Payment Method -->
            <v-select
              v-model="paymentMethod"
              :items="paymentMethods"
              label="Metode Pembayaran"
              prepend-inner-icon="mdi-credit-card"
              variant="outlined"
              :rules="[(v) => !!v || 'Metode pembayaran wajib dipilih']"
              class="mb-3"
            ></v-select>

            <!-- Payment Amount -->
            <v-text-field
              v-model.number="paymentAmount"
              label="Jumlah Bayar"
              type="number"
              prepend-inner-icon="mdi-cash"
              prefix="Rp"
              variant="outlined"
              :rules="[
                (v) => !!v || 'Jumlah bayar wajib diisi',
                (v) => v >= finalTotal || 'Jumlah bayar tidak mencukupi',
              ]"
              class="mb-3"
            ></v-text-field>

            <!-- Change -->
            <v-text-field
              :model-value="`Rp ${formatCurrency(change)}`"
              label="Kembalian"
              prepend-inner-icon="mdi-cash-multiple"
              variant="outlined"
              readonly
              class="mb-3"
            ></v-text-field>

            <!-- Notes -->
            <v-textarea
              v-model="notes"
              label="Catatan (Opsional)"
              variant="outlined"
              rows="2"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="outlined" @click="cancelPayment"> Batal </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="processPayment"
            :loading="transactionStore.loading"
            :disabled="!paymentValid"
          >
            Proses Pembayaran
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Dialog -->
    <v-dialog v-model="showSuccessDialog" max-width="400px">
      <v-card>
        <v-card-text class="text-center pa-6">
          <v-icon size="64" color="success" class="mb-4"
            >mdi-check-circle</v-icon
          >
          <div class="text-h6 mb-2">Transaksi Berhasil!</div>
          <div class="text-body-2">ID Transaksi: {{ lastTransactionId }}</div>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="outlined" @click="printReceipt" block>
            <v-icon class="mr-2">mdi-printer</v-icon>
            Cetak Struk
          </v-btn>
        </v-card-actions>

        <v-card-actions>
          <v-btn color="primary" @click="showSuccessDialog = false" block>
            Selesai
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useProductStore } from "@/stores/products";
import { useTransactionStore } from "@/stores/transactions";
import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";

const productStore = useProductStore();
const transactionStore = useTransactionStore();

// Search and filter
const searchQuery = ref("");
const selectedCategory = ref(null);

// Cart and payment
const discount = ref(0);
const tax = ref(0);
const showPaymentDialog = ref(false);
const showSuccessDialog = ref(false);
const paymentForm = ref(null);
const paymentValid = ref(false);
const selectedCustomer = ref(null);
const paymentMethod = ref("");
const paymentAmount = ref(0);
const notes = ref("");
const lastTransactionId = ref("");

// Real customers from database
const customers = ref([]);
const loadingCustomers = ref(false);

const paymentMethods = [
  { title: "Tunai", value: "tunai" },
  { title: "Non Tunai", value: "non_tunai" },
];

// Computed properties
const filteredProducts = computed(() => {
  let products = productStore.products;

  if (selectedCategory.value) {
    products = products.filter((p) => p.category_id === selectedCategory.value);
  }

  if (searchQuery.value) {
    products = productStore.searchProducts(searchQuery.value);
  }

  return products;
});

const finalTotal = computed(() => {
  return Math.max(0, transactionStore.cartTotal - discount.value + tax.value);
});

const change = computed(() => {
  return Math.max(0, paymentAmount.value - finalTotal.value);
});

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

const fetchCustomers = async () => {
  try {
    loadingCustomers.value = true;
    const querySnapshot = await getDocs(collection(db, "customers"));
    customers.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
  } finally {
    loadingCustomers.value = false;
  }
};

const addToCart = (product) => {
  if (product.stok > 0) {
    transactionStore.addToCart(product, 1);
  }
};

const updateQuantity = (productId, quantity) => {
  if (quantity <= 0) {
    removeFromCart(productId);
  } else {
    transactionStore.updateCartQuantity(productId, quantity);
  }
};

const removeFromCart = (productId) => {
  transactionStore.removeFromCart(productId);
};

const clearCart = () => {
  transactionStore.clearCart();
};

const cancelPayment = () => {
  showPaymentDialog.value = false;
  resetPaymentForm();
};

const resetPaymentForm = () => {
  selectedCustomer.value = null;
  paymentMethod.value = "";
  paymentAmount.value = 0;
  notes.value = "";
};

const processPayment = async () => {
  const { valid } = await paymentForm.value.validate();

  if (valid) {
    try {
      const transactionData = {
        customer_id: selectedCustomer.value,
        catatan: notes.value,
        diskon: discount.value,
        pajak: tax.value,
      };

      const paymentData = {
        metode: paymentMethod.value,
        jumlah: paymentAmount.value,
        keterangan:
          paymentMethod.value === "non_tunai" ? "Pembayaran Non Tunai" : null,
      };

      const result = await transactionStore.createTransaction(
        transactionData,
        paymentData
      );

      lastTransactionId.value = result.id;
      showPaymentDialog.value = false;
      showSuccessDialog.value = true;

      // Reset form
      resetPaymentForm();
      discount.value = 0;
      tax.value = 0;
    } catch (error) {
      console.error("Payment failed:", error);
    }
  }
};

const printReceipt = () => {
  const cartItems = transactionStore.cart;
  const customer = customers.value.find(c => c.id === selectedCustomer.value);
  
  // Prepare receipt content
  const receiptContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Struk Pembayaran</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          margin: 0;
          padding: 20px;
          width: 300px;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
        }
        .company-name {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }
        .company-info {
          font-size: 10px;
          margin-bottom: 2px;
        }
        .transaction-info {
          margin-bottom: 15px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .items-table {
          width: 100%;
          margin-bottom: 15px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 11px;
        }
        .item-name {
          flex: 1;
          margin-right: 10px;
        }
        .item-qty {
          width: 40px;
          text-align: center;
        }
        .item-price {
          width: 70px;
          text-align: right;
        }
        .total-section {
          border-top: 2px dashed #000;
          padding-top: 10px;
          margin-top: 10px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .grand-total {
          font-weight: bold;
          font-size: 14px;
          border-top: 1px solid #000;
          padding-top: 5px;
          margin-top: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          border-top: 2px dashed #000;
          padding-top: 10px;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">CV SARI BUMI SAKTI</div>
        <div class="company-info">Herbal Oil & Natural Products</div>
        <div class="company-info">Jl. Herbal No. 123, Jakarta</div>
        <div class="company-info">Telp: (021) 1234-5678</div>
      </div>

      <div class="transaction-info">
        <div class="info-row">
          <span>ID Transaksi:</span>
          <span>${lastTransactionId.value}</span>
        </div>
        <div class="info-row">
          <span>Tanggal:</span>
          <span>${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}</span>
        </div>
        <div class="info-row">
          <span>Kasir:</span>
          <span>Admin</span>
        </div>
        ${customer ? `
        <div class="info-row">
          <span>Pelanggan:</span>
          <span>${customer.nama}</span>
        </div>` : ''}
      </div>

      <div class="items-table">
        <div class="item-row" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
          <div class="item-name">Produk</div>
          <div class="item-qty">Qty</div>
          <div class="item-price">Harga</div>
        </div>
        ${cartItems.map(item => `
        <div class="item-row">
          <div class="item-name">${item.nama}</div>
          <div class="item-qty">${item.jumlah}</div>
          <div class="item-price">Rp ${formatCurrency(item.harga_satuan)}</div>
        </div>
        <div class="item-row" style="font-size: 10px; color: #666;">
          <div class="item-name">@ Rp ${formatCurrency(item.harga_satuan)}</div>
          <div class="item-qty"></div>
          <div class="item-price">Rp ${formatCurrency(item.harga_satuan * item.jumlah)}</div>
        </div>
        `).join('')}
      </div>

      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>Rp ${formatCurrency(transactionStore.cartTotal)}</span>
        </div>
        ${discount.value > 0 ? `
        <div class="total-row">
          <span>Diskon:</span>
          <span>- Rp ${formatCurrency(discount.value)}</span>
        </div>` : ''}
        ${tax.value > 0 ? `
        <div class="total-row">
          <span>Pajak:</span>
          <span>Rp ${formatCurrency(tax.value)}</span>
        </div>` : ''}
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>Rp ${formatCurrency(finalTotal.value)}</span>
        </div>
        <div class="total-row">
          <span>Bayar:</span>
          <span>Rp ${formatCurrency(paymentAmount.value)}</span>
        </div>
        <div class="total-row">
          <span>Kembalian:</span>
          <span>Rp ${formatCurrency(change.value)}</span>
        </div>
      </div>

      <div class="footer">
        <div>*** TERIMA KASIH ***</div>
        <div>Barang yang sudah dibeli tidak dapat dikembalikan</div>
        <div>Simpan struk ini sebagai bukti pembelian</div>
      </div>
    </body>
    </html>
  `;

  // Open new window and print
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  printWindow.document.write(receiptContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories(),
    fetchCustomers(),
  ]);

  // Set default payment amount to total when dialog opens
  paymentAmount.value = finalTotal.value;
});

// Watch for cart total changes and update payment amount
computed(() => {
  if (showPaymentDialog.value) {
    paymentAmount.value = finalTotal.value;
  }
});
</script>

<style scoped>
/* POS Container */
.pos-container {
  padding: 0;
}

/* Product Cards */
.product-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.95);
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(46, 125, 50, 0.3);
  box-shadow: 0 8px 32px rgba(46, 125, 50, 0.15) !important;
}

.product-card--clickable {
  cursor: pointer;
}

.product-card--out-of-stock {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(158, 158, 158, 0.1);
}

.product-card--out-of-stock:hover {
  transform: none;
  border-color: transparent;
  box-shadow: none !important;
}

.product-image-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.product-image {
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.stock-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  backdrop-filter: blur(10px);
}

.product-name {
  font-size: 0.95rem;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  margin-top: 4px;
}

.product-stock {
  margin-top: 2px;
}

/* Category Chips */
.category-chips .v-chip {
  margin: 4px 8px 4px 0;
  transition: all 0.2s ease;
}

.category-chips .v-chip:hover {
  transform: translateY(-1px);
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 8px 0;
}

@media (max-width: 960px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
  }
  
  .product-name {
    font-size: 0.85rem;
  }
  
  .product-price {
    font-size: 1rem;
  }
}

/* Cart Styles */
.cart-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(46, 125, 50, 0.1);
}

.cart-header {
  background: linear-gradient(135deg, #2E7D32, #388E3C);
  margin: -1px -1px 0 -1px;
  border-radius: 16px 16px 0 0;
  padding: 16px 20px;
}

.cart-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.cart-items-container {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0 0 16px 16px;
}

.empty-cart-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-cart-icon {
  background: rgba(46, 125, 50, 0.1);
  padding: 20px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.cart-item-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(46, 125, 50, 0.1);
  transition: all 0.2s ease;
}

.cart-item-card:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(46, 125, 50, 0.2);
  box-shadow: 0 2px 12px rgba(46, 125, 50, 0.1);
}

.cart-item-avatar {
  border: 2px solid rgba(46, 125, 50, 0.2);
  background: rgba(46, 125, 50, 0.05);
}

.quantity-controls {
  background: rgba(46, 125, 50, 0.05);
  padding: 4px;
  border-radius: 20px;
}

.quantity-btn {
  border: 1px solid rgba(46, 125, 50, 0.3);
  background: rgba(255, 255, 255, 0.9);
}

.quantity-btn:hover {
  background: rgba(46, 125, 50, 0.1);
  border-color: rgba(46, 125, 50, 0.5);
}

.quantity-display {
  min-width: 40px;
  text-align: center;
  color: white !important;
  background: linear-gradient(135deg, #2E7D32, #388E3C) !important;
}

.remove-btn {
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336 !important;
}

.total-section {
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.1), rgba(85, 139, 47, 0.1));
  border: 1px solid rgba(46, 125, 50, 0.2);
  backdrop-filter: blur(10px);
}

.modern-input {
  background: rgba(255, 255, 255, 0.8);
}

.modern-input .v-field {
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.9);
}

.clear-cart-btn {
  border: 2px solid #f44336;
  transition: all 0.2s ease;
}

.clear-cart-btn:hover {
  background: rgba(244, 67, 54, 0.1);
  border-color: #d32f2f;
}

.payment-btn {
  background: linear-gradient(135deg, #2E7D32, #388E3C) !important;
  color: white !important;
  box-shadow: 0 4px 20px rgba(46, 125, 50, 0.3) !important;
  transition: all 0.3s ease;
}

.payment-btn:hover {
  background: linear-gradient(135deg, #1B5E20, #2E7D32) !important;
  box-shadow: 0 6px 28px rgba(46, 125, 50, 0.4) !important;
  transform: translateY(-2px);
}

/* Sticky positioning */
.sticky {
  position: sticky;
  top: 20px;
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .cart-card {
    margin-bottom: 20px;
  }
  
  .sticky {
    position: relative;
    top: auto;
  }
  
  .cart-header {
    padding: 12px 16px;
  }
  
  .cart-item-card {
    margin-bottom: 8px;
  }
  
  .quantity-controls {
    padding: 2px;
  }
  
  .quantity-display {
    min-width: 35px;
  }
}

@media (max-width: 600px) {
  .product-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .cart-items-container {
    max-height: 300px !important;
  }
  
  .cart-item-card .v-card-text {
    padding: 12px !important;
  }
  
  .cart-item-avatar {
    width: 40px !important;
    height: 40px !important;
  }
}

/* Glass Effect Enhancement */
.glass-effect {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Animation for cart items */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-item-card {
  animation: slideInUp 0.3s ease;
}

/* Pulse effect for cart count */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.cart-header .v-chip {
  animation: pulse 0.5s ease-in-out;
}
</style>
