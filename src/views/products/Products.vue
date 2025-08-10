<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Manajemen Produk</h1>
          <v-btn
            color="primary"
            @click="showProductDialog = true"
            v-if="authStore.isAdmin"
          >
            <v-icon class="mr-2">mdi-plus</v-icon>
            Tambah Produk
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Cari produk..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="categoryFilter"
          :items="categoryFilterItems"
          label="Filter Kategori"
          variant="outlined"
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="stockFilter"
          :items="stockFilterItems"
          label="Filter Stok"
          variant="outlined"
          clearable
        ></v-select>
      </v-col>
    </v-row>

    <!-- Products Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        :loading="productStore.loading"
        :search="search"
        class="elevation-1"
      >
        <template v-slot:item.gambar="{ item }">
          <v-avatar size="40">
            <v-img
              :src="item.gambar || '/placeholder-product.jpg'"
              :alt="item.nama"
            ></v-img>
          </v-avatar>
        </template>

        <template v-slot:item.nama="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.nama }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ getCategoryName(item.category_id) }}
            </div>
          </div>
        </template>

        <template v-slot:item.harga="{ item }">
          Rp {{ formatCurrency(item.harga) }}
        </template>

        <template v-slot:item.biaya_produk="{ item }">
          Rp {{ formatCurrency(item.biaya_produk) }}
        </template>

        <template v-slot:item.stok="{ item }">
          <v-chip :color="getStockColor(item)" size="small">
            {{ item.stok }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="small"
            @click="editProduct(item)"
            v-if="authStore.isAdmin"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            color="error"
            @click="deleteProduct(item)"
            v-if="authStore.isAdmin"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Product Dialog -->
    <v-dialog v-model="showProductDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-package-variant</v-icon>
          {{ editingProduct ? "Edit Produk" : "Tambah Produk" }}
        </v-card-title>

        <v-card-text>
          <v-form ref="productForm" v-model="productValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="productData.nama"
                  label="Nama Produk"
                  :rules="[(v) => !!v || 'Nama produk wajib diisi']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="productData.category_id"
                  :items="productStore.categories"
                  item-title="nama"
                  item-value="id"
                  label="Kategori"
                  :rules="[(v) => !!v || 'Kategori wajib dipilih']"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="productData.harga"
                  label="Harga Jual"
                  type="number"
                  :rules="[
                    (v) => !!v || 'Harga wajib diisi',
                    (v) => v > 0 || 'Harga harus lebih dari 0',
                  ]"
                  variant="outlined"
                  prefix="Rp"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="productData.biaya_produk"
                  label="Biaya Produk"
                  type="number"
                  :rules="[
                    (v) => !!v || 'Biaya produk wajib diisi',
                    (v) => v > 0 || 'Biaya produk harus lebih dari 0',
                  ]"
                  variant="outlined"
                  prefix="Rp"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="productData.stok"
                  label="Stok"
                  type="number"
                  :rules="[(v) => v >= 0 || 'Stok tidak boleh negatif']"
                  variant="outlined"
                  min="0"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="productData.batas_stok"
                  label="Batas Stok Minimum"
                  type="number"
                  :rules="[(v) => v >= 0 || 'Batas stok tidak boleh negatif']"
                  variant="outlined"
                  min="0"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="productData.nomor_bpom"
                  label="Nomor BPOM (Opsional)"
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-file-input
                  v-model="productData.gambarFile"
                  label="Upload Gambar Produk (Opsional)"
                  variant="outlined"
                  accept="image/png,image/jpg,image/jpeg,image/webp"
                  prepend-icon="mdi-camera"
                  show-size
                  hint="Format yang didukung: PNG, JPG, JPEG, WebP (Max: 5MB)"
                  @update:model-value="handleImageUpload"
                ></v-file-input>

                <!-- Image Preview -->
                <div v-if="imagePreview || productData.gambar" class="mt-3">
                  <v-img
                    :src="imagePreview || productData.gambar"
                    max-width="200"
                    max-height="200"
                    class="mx-auto"
                    contain
                  >
                    <template v-slot:placeholder>
                      <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                      >
                        <v-progress-circular
                          indeterminate
                          color="grey lighten-5"
                        ></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="outlined" @click="cancelProductDialog"> Batal </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="saveProduct"
            :loading="productStore.loading"
            :disabled="!productValid"
          >
            {{ editingProduct ? "Update" : "Simpan" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6"> Konfirmasi Hapus </v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus produk "{{
            productToDelete?.nama
          }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="showDeleteDialog = false">
            Batal
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="productStore.loading"
          >
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useProductStore } from "@/stores/products";

const authStore = useAuthStore();
const productStore = useProductStore();

// Table data
const search = ref("");
const categoryFilter = ref(null);
const stockFilter = ref(null);

const headers = [
  { title: "Gambar", key: "gambar", sortable: false },
  { title: "Nama Produk", key: "nama" },
  { title: "Harga Jual", key: "harga" },
  { title: "Biaya Produk", key: "biaya_produk" },
  { title: "Stok", key: "stok" },
  { title: "BPOM", key: "nomor_bpom" },
  { title: "Aksi", key: "actions", sortable: false },
];

// Dialog data
const showProductDialog = ref(false);
const showDeleteDialog = ref(false);
const productForm = ref(null);
const productValid = ref(false);
const editingProduct = ref(null);
const productToDelete = ref(null);

const defaultProductData = {
  nama: "",
  category_id: "",
  harga: 0,
  biaya_produk: 0,
  stok: 0,
  batas_stok: 5,
  nomor_bpom: "",
  gambar: "",
  gambarFile: null,
};

const productData = ref({ ...defaultProductData });
const imagePreview = ref(null);

// Computed properties
const categoryFilterItems = computed(() => [
  { title: "Semua Kategori", value: null },
  ...productStore.categories.map((cat) => ({
    title: cat.nama,
    value: cat.id,
  })),
]);

const stockFilterItems = [
  { title: "Semua Stok", value: null },
  { title: "Stok Tersedia", value: "available" },
  { title: "Stok Rendah", value: "low" },
  { title: "Stok Habis", value: "empty" },
];

const filteredProducts = computed(() => {
  let products = productStore.products;

  if (categoryFilter.value) {
    products = products.filter((p) => p.category_id === categoryFilter.value);
  }

  if (stockFilter.value) {
    switch (stockFilter.value) {
      case "available":
        products = products.filter((p) => p.stok > p.batas_stok);
        break;
      case "low":
        products = products.filter((p) => p.stok > 0 && p.stok <= p.batas_stok);
        break;
      case "empty":
        products = products.filter((p) => p.stok === 0);
        break;
    }
  }

  return products;
});

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

const getCategoryName = (categoryId) => {
  const category = productStore.categories.find((c) => c.id === categoryId);
  return category ? category.nama : "Tidak ada kategori";
};

const getStockColor = (product) => {
  if (product.stok === 0) return "error";
  if (product.stok <= product.batas_stok) return "warning";
  return "success";
};

const editProduct = (product) => {
  editingProduct.value = product;
  productData.value = { ...product };
  imagePreview.value = product.gambar || null;
  showProductDialog.value = true;
};

const deleteProduct = (product) => {
  productToDelete.value = product;
  showDeleteDialog.value = true;
};

const cancelProductDialog = () => {
  showProductDialog.value = false;
  editingProduct.value = null;
  productData.value = { ...defaultProductData };
  imagePreview.value = null;
};

const handleImageUpload = (files) => {
  console.log('Files received:', files); // Debug log
  
  if (!files || (Array.isArray(files) && files.length === 0)) {
    imagePreview.value = null;
    return;
  }

  // Get the first file from array or single file
  const selectedFile = Array.isArray(files) ? files[0] : files;
  
  if (!selectedFile) {
    imagePreview.value = null;
    return;
  }

  console.log('Selected file:', selectedFile); // Debug log
  console.log('File type:', selectedFile.type); // Debug log
  console.log('File size:', selectedFile.size); // Debug log
  
  // Validate file size (5MB max)
  if (selectedFile.size > 5 * 1024 * 1024) {
    alert('Ukuran file terlalu besar. Maksimal 5MB.');
    productData.value.gambarFile = null;
    imagePreview.value = null;
    return;
  }

  // Validate file type - be more flexible with MIME types
  const allowedTypes = [
    'image/png', 
    'image/jpg', 
    'image/jpeg', 
    'image/webp',
    'image/PNG',
    'image/JPG',
    'image/JPEG',
    'image/WEBP'
  ];
  
  // Also check file extension as fallback
  const fileName = selectedFile.name.toLowerCase();
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!allowedTypes.includes(selectedFile.type) && !hasValidExtension) {
    console.log('File type detected:', selectedFile.type);
    console.log('File name:', selectedFile.name);
    alert(`Format file tidak didukung. File type: ${selectedFile.type}. Gunakan PNG, JPG, JPEG, atau WebP.`);
    productData.value.gambarFile = null;
    imagePreview.value = null;
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.onerror = (error) => {
    console.error('Error reading file:', error);
    alert('Error membaca file gambar.');
  };
  reader.readAsDataURL(selectedFile);
};

const uploadImageToStorage = async (file) => {
  if (!file) return null;
  
  try {
    // Convert file to base64 for simple storage
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

const saveProduct = async () => {
  const { valid } = await productForm.value.validate();

  if (valid) {
    try {
      let imageUrl = productData.value.gambar;
      
      // Upload new image if file is selected
      if (productData.value.gambarFile) {
        const file = Array.isArray(productData.value.gambarFile) 
          ? productData.value.gambarFile[0] 
          : productData.value.gambarFile;
        
        if (file) {
          imageUrl = await uploadImageToStorage(file);
        }
      }

      const productToSave = {
        ...productData.value,
        gambar: imageUrl || productData.value.gambar,
      };
      
      // Remove the file property before saving to database
      delete productToSave.gambarFile;

      if (editingProduct.value) {
        await productStore.updateProduct(
          editingProduct.value.id,
          productToSave
        );
      } else {
        await productStore.addProduct(productToSave);
      }

      cancelProductDialog();
    } catch (error) {
      console.error("Save product failed:", error);
    }
  }
};

const confirmDelete = async () => {
  try {
    await productStore.deleteProduct(productToDelete.value.id);
    showDeleteDialog.value = false;
    productToDelete.value = null;
  } catch (error) {
    console.error("Delete product failed:", error);
  }
};

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories(),
  ]);
});
</script>
