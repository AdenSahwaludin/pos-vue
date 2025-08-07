<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Manajemen Pelanggan</h1>
          <v-btn color="primary" @click="showCustomerDialog = true">
            <v-icon class="mr-2">mdi-plus</v-icon>
            Tambah Pelanggan
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Search -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Cari pelanggan..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Customers Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="customers"
        :loading="loading"
        :search="search"
        class="elevation-1"
      >
        <template v-slot:item.nama="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.nama }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.email || "Tidak ada email" }}
            </div>
          </div>
        </template>

        <template v-slot:item.kontak="{ item }">
          <div>
            <div>{{ item.telepon }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.kota }}</div>
          </div>
        </template>

        <template v-slot:item.alamat="{ item }">
          <div class="text-truncate" style="max-width: 200px">
            {{ item.alamat }}
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon size="small" @click="editCustomer(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" color="error" @click="deleteCustomer(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Customer Dialog -->
    <v-dialog v-model="showCustomerDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-account-group</v-icon>
          {{ editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan" }}
        </v-card-title>

        <v-card-text>
          <v-form ref="customerForm" v-model="customerValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="customerData.nama"
                  label="Nama Lengkap"
                  :rules="[(v) => !!v || 'Nama wajib diisi']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="customerData.email"
                  label="Email (Opsional)"
                  type="email"
                  :rules="[
                    (v) => !v || /.+@.+\..+/.test(v) || 'Email harus valid',
                    (v) =>
                      !v || !isDuplicateEmail(v) || 'Email sudah digunakan',
                  ]"
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="customerData.telepon"
                  label="Nomor Telepon"
                  :rules="[(v) => !!v || 'Nomor telepon wajib diisi']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="customerData.kota"
                  label="Kota"
                  :rules="[(v) => !!v || 'Kota wajib diisi']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="customerData.alamat"
                  label="Alamat Lengkap"
                  :rules="[(v) => !!v || 'Alamat wajib diisi']"
                  variant="outlined"
                  rows="3"
                  required
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="outlined" @click="cancelCustomerDialog">
            Batal
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="saveCustomer"
            :loading="loading"
            :disabled="!customerValid"
          >
            {{ editingCustomer ? "Update" : "Simpan" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6"> Konfirmasi Hapus </v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus pelanggan "{{
            customerToDelete?.nama
          }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="showDeleteDialog = false">
            Batal
          </v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="loading">
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/config/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

// Table data
const search = ref("");
const customers = ref([]);
const loading = ref(false);

const headers = [
  { title: "Nama", key: "nama" },
  { title: "Kontak", key: "kontak", sortable: false },
  { title: "Alamat", key: "alamat", sortable: false },
  { title: "Aksi", key: "actions", sortable: false },
];

// Dialog data
const showCustomerDialog = ref(false);
const showDeleteDialog = ref(false);
const customerForm = ref(null);
const customerValid = ref(false);
const editingCustomer = ref(null);
const customerToDelete = ref(null);

const defaultCustomerData = {
  nama: "",
  email: "",
  telepon: "",
  kota: "",
  alamat: "",
};

const customerData = ref({ ...defaultCustomerData });

// Methods
const fetchCustomers = async () => {
  try {
    loading.value = true;
    const querySnapshot = await getDocs(collection(db, "customers"));
    customers.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
  } finally {
    loading.value = false;
  }
};

const isDuplicateEmail = (email) => {
  if (!email) return false;

  const existing = customers.value.find(
    (c) =>
      c.email?.toLowerCase() === email.toLowerCase() &&
      c.id !== editingCustomer.value?.id
  );

  return !!existing;
};

const editCustomer = (customer) => {
  editingCustomer.value = customer;
  customerData.value = { ...customer };
  showCustomerDialog.value = true;
};

const deleteCustomer = (customer) => {
  customerToDelete.value = customer;
  showDeleteDialog.value = true;
};

const cancelCustomerDialog = () => {
  showCustomerDialog.value = false;
  editingCustomer.value = null;
  customerData.value = { ...defaultCustomerData };
};

const saveCustomer = async () => {
  const { valid } = await customerForm.value.validate();

  if (valid) {
    try {
      loading.value = true;

      if (editingCustomer.value) {
        await updateDoc(
          doc(db, "customers", editingCustomer.value.id),
          customerData.value
        );
        const index = customers.value.findIndex(
          (c) => c.id === editingCustomer.value.id
        );
        if (index !== -1) {
          customers.value[index] = {
            id: editingCustomer.value.id,
            ...customerData.value,
          };
        }
      } else {
        const docRef = await addDoc(
          collection(db, "customers"),
          customerData.value
        );
        customers.value.push({ id: docRef.id, ...customerData.value });
      }

      cancelCustomerDialog();
    } catch (error) {
      console.error("Save customer failed:", error);
    } finally {
      loading.value = false;
    }
  }
};

const confirmDelete = async () => {
  try {
    loading.value = true;
    await deleteDoc(doc(db, "customers", customerToDelete.value.id));
    customers.value = customers.value.filter(
      (c) => c.id !== customerToDelete.value.id
    );
    showDeleteDialog.value = false;
    customerToDelete.value = null;
  } catch (error) {
    console.error("Delete customer failed:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCustomers();
});
</script>
