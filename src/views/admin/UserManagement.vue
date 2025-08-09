<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center">
          <v-icon size="32" color="primary" class="mr-3"
            >mdi-account-multiple</v-icon
          >
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">
              Manajemen User
            </h1>
            <p class="text-body-1 text-grey-darken-1 mb-0">
              Kelola pengguna sistem kasir
            </p>
          </div>
        </div>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          size="large"
          @click="openAddDialog"
          elevation="2"
        >
          <v-icon size="20" class="mr-2">mdi-plus</v-icon>
          Tambah User
        </v-btn>
      </v-col>
    </v-row>

    <!-- Users Table -->
    <v-card elevation="2" rounded="lg">
      <v-card-title class="bg-grey-lighten-5">
        <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
        Daftar Pengguna
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        item-key="id"
        class="elevation-0"
      >
        <template v-slot:item.role="{ item }">
          <v-chip
            :color="item.role === 'admin' ? 'error' : 'primary'"
            size="small"
            class="text-capitalize"
          >
            {{ item.role }}
          </v-chip>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="item.status === 'aktif' ? 'success' : 'grey'"
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
            @click="editUser(item)"
            class="mr-1"
          >
            <v-icon size="16">mdi-pencil</v-icon>
          </v-btn>

          <v-btn
            v-if="item.role !== 'admin'"
            icon
            size="small"
            color="error"
            @click="deleteUser(item)"
          >
            <v-icon size="16">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit User Dialog -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">{{ isEdit ? "mdi-pencil" : "mdi-plus" }}</v-icon>
          {{ isEdit ? "Edit User" : "Tambah User" }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="userForm" v-model="formValid">
            <v-text-field
              v-model="formData.nama"
              label="Nama Lengkap"
              :rules="[rules.required]"
              outlined
              dense
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formData.email"
              label="Email"
              type="email"
              :rules="[rules.required, rules.email]"
              outlined
              dense
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-if="!isEdit"
              v-model="formData.password"
              label="Password"
              type="password"
              :rules="[rules.required, rules.minLength]"
              outlined
              dense
              class="mb-3"
            ></v-text-field>

            <v-select
              v-model="formData.role"
              label="Role"
              :items="roleOptions"
              item-title="text"
              item-value="value"
              :rules="[rules.required]"
              outlined
              dense
              class="mb-3"
            ></v-select>

            <v-select
              v-model="formData.status"
              label="Status"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              :rules="[rules.required]"
              outlined
              dense
            ></v-select>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog">
            Batal
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!formValid"
            @click="saveUser"
          >
            {{ isEdit ? "Update" : "Simpan" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon class="mr-2">mdi-delete</v-icon>
          Hapus User
        </v-card-title>

        <v-card-text class="pa-4">
          <p>
            Apakah Anda yakin ingin menghapus user
            <strong>{{ selectedUser?.nama }}</strong
            >?
          </p>
          <p class="text-caption text-error">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Batal
          </v-btn>
          <v-btn color="error" :loading="deleting" @click="confirmDelete">
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

// Data
const dialog = ref(false);
const deleteDialog = ref(false);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const formValid = ref(false);
const selectedUser = ref(null);

const formData = ref({
  nama: "",
  email: "",
  password: "",
  role: "kasir",
  status: "aktif",
});

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

// Computed
const isEdit = computed(() => !!selectedUser.value);
const users = computed(() => userStore.users);

// Table headers
const headers = [
  { title: "Nama", key: "nama", sortable: true },
  { title: "Email", key: "email", sortable: true },
  { title: "Role", key: "role", sortable: true },
  { title: "Status", key: "status", sortable: true },
  { title: "Aksi", key: "actions", sortable: false, align: "center" },
];

// Options
const roleOptions = [
  { text: "Kasir", value: "kasir" },
  { text: "Admin", value: "admin" },
];

const statusOptions = [
  { text: "Aktif", value: "aktif" },
  { text: "Nonaktif", value: "nonaktif" },
];

// Validation rules
const rules = {
  required: (value) => !!value || "Field ini wajib diisi",
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || "Email tidak valid";
  },
  minLength: (value) =>
    (value && value.length >= 6) || "Password minimal 6 karakter",
};

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true;
    await userStore.fetchUsers();
  } catch (error) {
    showSnackbar("Gagal memuat data user", "error");
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  selectedUser.value = null;
  formData.value = {
    nama: "",
    email: "",
    password: "",
    role: "kasir",
    status: "aktif",
  };
  dialog.value = true;
};

const editUser = (user) => {
  selectedUser.value = user;
  formData.value = {
    nama: user.nama,
    email: user.email,
    password: "",
    role: user.role,
    status: user.status,
  };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  selectedUser.value = null;
  formData.value = {
    nama: "",
    email: "",
    password: "",
    role: "kasir",
    status: "aktif",
  };
};

const saveUser = async () => {
  try {
    saving.value = true;

    if (isEdit.value) {
      await userStore.updateUser(selectedUser.value.id, formData.value);
      showSnackbar("User berhasil diupdate", "success");
    } else {
      await userStore.createUser(formData.value);
      showSnackbar("User berhasil ditambahkan", "success");
    }

    closeDialog();
    await fetchUsers();
  } catch (error) {
    showSnackbar(error.message || "Gagal menyimpan user", "error");
  } finally {
    saving.value = false;
  }
};

const deleteUser = (user) => {
  selectedUser.value = user;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  try {
    deleting.value = true;
    await userStore.deleteUser(selectedUser.value.id);
    showSnackbar("User berhasil dihapus", "success");
    deleteDialog.value = false;
    await fetchUsers();
  } catch (error) {
    showSnackbar(error.message || "Gagal menghapus user", "error");
  } finally {
    deleting.value = false;
  }
};

const showSnackbar = (message, color = "success") => {
  snackbar.value = {
    show: true,
    message,
    color,
  };
};

// Lifecycle
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-data-table {
  border-radius: 0 0 12px 12px;
}
</style>
