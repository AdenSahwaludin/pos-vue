<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Manajemen Kategori</h1>
          <v-btn color="primary" @click="showCategoryDialog = true">
            <v-icon class="mr-2">mdi-plus</v-icon>
            Tambah Kategori
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Categories Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="productStore.categories"
        :loading="productStore.loading"
        class="elevation-1"
      >
        <template v-slot:item.nama="{ item }">
          <div class="font-weight-medium">{{ item.nama }}</div>
        </template>

        <template v-slot:item.product_count="{ item }">
          <v-chip size="small" color="primary">
            {{ getProductCount(item.id) }} produk
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon size="small" @click="editCategory(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            color="error"
            @click="deleteCategory(item)"
            :disabled="getProductCount(item.id) > 0"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Category Dialog -->
    <v-dialog v-model="showCategoryDialog" max-width="400px" persistent>
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-tag-multiple</v-icon>
          {{ editingCategory ? "Edit Kategori" : "Tambah Kategori" }}
        </v-card-title>

        <v-card-text>
          <v-form ref="categoryForm" v-model="categoryValid">
            <v-text-field
              v-model="categoryData.nama"
              label="Nama Kategori"
              :rules="[
                (v) => !!v || 'Nama kategori wajib diisi',
                (v) => !isDuplicateName(v) || 'Nama kategori sudah ada',
              ]"
              variant="outlined"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="outlined" @click="cancelCategoryDialog">
            Batal
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="saveCategory"
            :loading="productStore.loading"
            :disabled="!categoryValid"
          >
            {{ editingCategory ? "Update" : "Simpan" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6"> Konfirmasi Hapus </v-card-title>
        <v-card-text>
          <div class="mb-3">
            Apakah Anda yakin ingin menghapus kategori "{{
              categoryToDelete?.nama
            }}"?
          </div>
          <v-alert
            v-if="getProductCount(categoryToDelete?.id) > 0"
            type="warning"
            density="compact"
          >
            Kategori ini memiliki
            {{ getProductCount(categoryToDelete?.id) }} produk. Hapus semua
            produk terlebih dahulu.
          </v-alert>
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
            :disabled="getProductCount(categoryToDelete?.id) > 0"
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
import { useProductStore } from "@/stores/products";

const productStore = useProductStore();

// Table data
const headers = [
  { title: "Nama Kategori", key: "nama" },
  { title: "Jumlah Produk", key: "product_count", sortable: false },
  { title: "Aksi", key: "actions", sortable: false },
];

// Dialog data
const showCategoryDialog = ref(false);
const showDeleteDialog = ref(false);
const categoryForm = ref(null);
const categoryValid = ref(false);
const editingCategory = ref(null);
const categoryToDelete = ref(null);

const defaultCategoryData = {
  nama: "",
};

const categoryData = ref({ ...defaultCategoryData });

// Methods
const getProductCount = (categoryId) => {
  return productStore.products.filter((p) => p.category_id === categoryId)
    .length;
};

const isDuplicateName = (name) => {
  if (!name) return false;

  const existing = productStore.categories.find(
    (c) =>
      c.nama.toLowerCase() === name.toLowerCase() &&
      c.id !== editingCategory.value?.id
  );

  return !!existing;
};

const editCategory = (category) => {
  editingCategory.value = category;
  categoryData.value = { ...category };
  showCategoryDialog.value = true;
};

const deleteCategory = (category) => {
  categoryToDelete.value = category;
  showDeleteDialog.value = true;
};

const cancelCategoryDialog = () => {
  showCategoryDialog.value = false;
  editingCategory.value = null;
  categoryData.value = { ...defaultCategoryData };
};

const saveCategory = async () => {
  const { valid } = await categoryForm.value.validate();

  if (valid) {
    try {
      if (editingCategory.value) {
        await productStore.updateCategory(
          editingCategory.value.id,
          categoryData.value
        );
      } else {
        await productStore.addCategory(categoryData.value);
      }

      cancelCategoryDialog();
    } catch (error) {
      console.error("Save category failed:", error);
    }
  }
};

const confirmDelete = async () => {
  try {
    await productStore.deleteCategory(categoryToDelete.value.id);
    showDeleteDialog.value = false;
    categoryToDelete.value = null;
  } catch (error) {
    console.error("Delete category failed:", error);
  }
};

onMounted(async () => {
  await Promise.all([
    productStore.fetchCategories(),
    productStore.fetchProducts(),
  ]);
});
</script>
