<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Point of Sale</h1>
      </v-col>
    </v-row>

    <v-row>
      <!-- Product Selection -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-package-variant</v-icon>
            Pilih Produk
            <v-spacer></v-spacer>
            <v-text-field
              v-model="searchQuery"
              label="Cari produk..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              style="max-width: 300px"
              clearable
            ></v-text-field>
          </v-card-title>

          <v-card-text>
            <!-- Category Filter -->
            <v-chip-group v-model="selectedCategory" class="mb-4">
              <v-chip :value="null" variant="outlined" filter> Semua </v-chip>
              <v-chip
                v-for="category in productStore.categories"
                :key="category.id"
                :value="category.id"
                variant="outlined"
                filter
              >
                {{ category.nama }}
              </v-chip>
            </v-chip-group>

            <!-- Product Grid -->
            <v-row>
              <v-col
                v-for="product in filteredProducts"
                :key="product.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  class="product-card"
                  :class="{ 'out-of-stock': product.stok <= 0 }"
                  @click="addToCart(product)"
                  :disabled="product.stok <= 0"
                >
                  <v-img
                    :src="product.gambar || '/placeholder-product.jpg'"
                    height="150"
                    cover
                  >
                    <v-chip
                      v-if="product.stok <= 0"
                      color="error"
                      class="ma-2"
                      size="small"
                    >
                      Stok Habis
                    </v-chip>
                  </v-img>

                  <v-card-title class="text-subtitle-1">
                    {{ product.nama }}
                  </v-card-title>

                  <v-card-text>
                    <div class="text-h6 text-primary">
                      Rp {{ formatCurrency(product.harga) }}
                    </div>
                    <div class="text-caption">Stok: {{ product.stok }}</div>
                    <div v-if="product.nomor_bpom" class="text-caption">
                      BPOM: {{ product.nomor_bpom }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Cart -->
      <v-col cols="12" md="4">
        <v-card sticky>
          <v-card-title>
            <v-icon class="mr-2">mdi-cart</v-icon>
            Keranjang ({{ transactionStore.cartItemCount }})
          </v-card-title>

          <v-card-text style="max-height: 400px; overflow-y: auto">
            <div
              v-if="transactionStore.cart.length === 0"
              class="text-center text-medium-emphasis"
            >
              <v-icon size="64" class="mb-2">mdi-cart-outline</v-icon>
              <div>Keranjang kosong</div>
            </div>

            <v-list v-else density="compact">
              <v-list-item
                v-for="item in transactionStore.cart"
                :key="item.product_id"
              >
                <template v-slot:prepend>
                  <v-avatar size="40">
                    <v-icon>mdi-package</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title>{{ item.nama }}</v-list-item-title>
                <v-list-item-subtitle>
                  Rp {{ formatCurrency(item.harga_satuan) }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="d-flex align-center">
                    <v-btn
                      icon
                      size="small"
                      @click="updateQuantity(item.product_id, item.jumlah - 1)"
                    >
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>

                    <span class="mx-2">{{ item.jumlah }}</span>

                    <v-btn
                      icon
                      size="small"
                      @click="updateQuantity(item.product_id, item.jumlah + 1)"
                      :disabled="item.jumlah >= item.stok_tersedia"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>

                    <v-btn
                      icon
                      size="small"
                      color="error"
                      class="ml-2"
                      @click="removeFromCart(item.product_id)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-divider></v-divider>

          <!-- Cart Summary -->
          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <span>Subtotal:</span>
              <span class="font-weight-bold">
                Rp {{ formatCurrency(transactionStore.cartTotal) }}
              </span>
            </div>

            <v-text-field
              v-model.number="discount"
              label="Diskon (Rp)"
              type="number"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-tag"
              min="0"
              :max="transactionStore.cartTotal"
            ></v-text-field>

            <v-text-field
              v-model.number="tax"
              label="Pajak (Rp)"
              type="number"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-percent"
              min="0"
            ></v-text-field>

            <v-divider class="my-3"></v-divider>

            <div class="d-flex justify-space-between text-h6">
              <span>Total:</span>
              <span class="font-weight-bold">
                Rp {{ formatCurrency(finalTotal) }}
              </span>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn
              color="error"
              variant="outlined"
              @click="clearCart"
              :disabled="transactionStore.cart.length === 0"
              block
              class="mb-2"
            >
              <v-icon class="mr-2">mdi-delete</v-icon>
              Kosongkan
            </v-btn>

            <v-btn
              color="primary"
              @click="showPaymentDialog = true"
              :disabled="transactionStore.cart.length === 0"
              block
              size="large"
            >
              <v-icon class="mr-2">mdi-cash</v-icon>
              Bayar
            </v-btn>
          </v-card-actions>
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
              item-title="nama"
              item-value="id"
              label="Pelanggan (Opsional)"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              clearable
              class="mb-3"
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
              prepend-inner-icon="mdi-currency-usd"
              variant="outlined"
              :rules="[
                (v) => !!v || 'Jumlah bayar wajib diisi',
                (v) => v >= finalTotal || 'Jumlah bayar tidak mencukupi',
              ]"
              class="mb-3"
            ></v-text-field>

            <!-- Change -->
            <v-text-field
              :model-value="change"
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

// Demo customers (in real app, this would come from a store)
const customers = ref([
  { id: "1", nama: "John Doe" },
  { id: "2", nama: "Jane Smith" },
  { id: "3", nama: "Ahmad Rahman" },
]);

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

const addToCart = (product) => {
  if (product.stok > 0) {
    transactionStore.addToCart(product, 1);
  }
};

const updateQuantity = (productId, quantity) => {
  transactionStore.updateCartQuantity(productId, quantity);
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
  // Implement receipt printing logic
  window.print();
};

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories(),
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
.product-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-card.out-of-stock {
  opacity: 0.6;
  cursor: not-allowed;
}

.product-card.out-of-stock:hover {
  transform: none;
}

.sticky {
  position: sticky;
  top: 20px;
}
</style>
