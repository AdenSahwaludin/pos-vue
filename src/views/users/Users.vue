<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Manajemen Pengguna</h1>
          <v-btn color="primary" @click="showUserDialog = true">
            <v-icon class="mr-2">mdi-plus</v-icon>
            Tambah Pengguna
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Search -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Cari pengguna..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="roleFilter"
          :items="roleItems"
          label="Filter Role"
          variant="outlined"
          clearable
        ></v-select>
      </v-col>
    </v-row>

    <!-- Users Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.nama="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.nama }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.email }}
            </div>
          </div>
        </template>

        <template v-slot:item.role="{ item }">
          <v-chip :color="getRoleColor(item.role)" size="small">
            {{ getRoleLabel(item.role) }}
          </v-chip>
        </template>

        <template v-slot:item.terakhir_login="{ item }">
          {{ formatDate(item.terakhir_login) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="small"
            @click="editUser(item)"
            :disabled="item.id === authStore.user?.id"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            color="error"
            @click="deleteUser(item)"
            :disabled="item.id === authStore.user?.id"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- User Dialog -->
    <v-dialog v-model="showUserDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-account-multiple</v-icon>
          {{ editingUser ? "Edit Pengguna" : "Tambah Pengguna" }}
        </v-card-title>

        <v-card-text>
          <v-form ref="userForm" v-model="userValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userData.nama"
                  label="Nama Lengkap"
                  :rules="[(v) => !!v || 'Nama wajib diisi']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userData.email"
                  label="Email"
                  type="email"
                  :rules="[
                    (v) => !!v || 'Email wajib diisi',
                    (v) => /.+@.+\..+/.test(v) || 'Email harus valid',
                    (v) => !isDuplicateEmail(v) || 'Email sudah digunakan',
                  ]"
                  variant="outlined"
                  required
                  :disabled="!!editingUser"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userData.telepon"
                  label="Nomor Telepon"
                  :rules="[(v) => !!v || 'Nomor telepon wajib diisi']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="userData.role"
                  :items="roleSelectItems"
                  label="Role"
                  :rules="[(v) => !!v || 'Role wajib dipilih']"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" v-if="!editingUser">
                <v-text-field
                  v-model="userData.password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="[
                    (v) => !!v || 'Password wajib diisi',
                    (v) =>
                      (v && v.length >= 6) || 'Password minimal 6 karakter',
                  ]"
                  variant="outlined"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-alert
              v-if="editingUser"
              type="info"
              density="compact"
              class="mb-3"
            >
              Password tidak dapat diubah melalui form ini. Pengguna dapat
              mengubah password melalui fitur reset password.
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="outlined" @click="cancelUserDialog"> Batal </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="saveUser"
            :loading="loading"
            :disabled="!userValid"
          >
            {{ editingUser ? "Update" : "Simpan" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6"> Konfirmasi Hapus </v-card-title>
        <v-card-text>
          Apakah Anda yakin ingin menghapus pengguna "{{ userToDelete?.nama }}"?
          <br /><br />
          <v-alert type="warning" density="compact">
            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
            terkait pengguna.
          </v-alert>
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
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { auth, db } from "@/config/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  deleteUser as deleteAuthUser,
} from "firebase/auth";

const authStore = useAuthStore();

// Table data
const search = ref("");
const roleFilter = ref("");
const users = ref([]);
const loading = ref(false);

const headers = [
  { title: "Nama & Email", key: "nama" },
  { title: "Telepon", key: "telepon" },
  { title: "Role", key: "role" },
  { title: "Terakhir Login", key: "terakhir_login" },
  { title: "Aksi", key: "actions", sortable: false },
];

// Dialog data
const showUserDialog = ref(false);
const showDeleteDialog = ref(false);
const userForm = ref(null);
const userValid = ref(false);
const editingUser = ref(null);
const userToDelete = ref(null);
const showPassword = ref(false);

const defaultUserData = {
  nama: "",
  email: "",
  telepon: "",
  role: "",
  password: "",
};

const userData = ref({ ...defaultUserData });

const roleItems = [
  { title: "Semua Role", value: "" },
  { title: "Admin", value: "admin" },
  { title: "Kasir", value: "kasir" },
];

const roleSelectItems = [
  { title: "Admin", value: "admin" },
  { title: "Kasir", value: "kasir" },
];

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value;

  if (search.value) {
    filtered = filtered.filter(
      (user) =>
        user.nama.toLowerCase().includes(search.value.toLowerCase()) ||
        user.email.toLowerCase().includes(search.value.toLowerCase()) ||
        user.telepon.includes(search.value)
    );
  }

  if (roleFilter.value) {
    filtered = filtered.filter((user) => user.role === roleFilter.value);
  }

  return filtered;
});

// Methods
const formatDate = (timestamp) => {
  if (!timestamp) return "Belum pernah login";
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

const getRoleColor = (role) => {
  switch (role) {
    case "admin":
      return "primary";
    case "kasir":
      return "success";
    default:
      return "grey";
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case "admin":
      return "Admin";
    case "kasir":
      return "Kasir";
    default:
      return "Unknown";
  }
};

const fetchUsers = async () => {
  try {
    loading.value = true;
    const querySnapshot = await getDocs(collection(db, "users"));
    users.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    loading.value = false;
  }
};

const isDuplicateEmail = (email) => {
  if (!email) return false;

  const existing = users.value.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.id !== editingUser.value?.id
  );

  return !!existing;
};

const editUser = (user) => {
  editingUser.value = user;
  userData.value = { ...user };
  delete userData.value.password; // Remove password for editing
  showUserDialog.value = true;
};

const deleteUser = (user) => {
  userToDelete.value = user;
  showDeleteDialog.value = true;
};

const cancelUserDialog = () => {
  showUserDialog.value = false;
  editingUser.value = null;
  userData.value = { ...defaultUserData };
  showPassword.value = false;
};

const saveUser = async () => {
  const { valid } = await userForm.value.validate();

  if (valid) {
    try {
      loading.value = true;

      if (editingUser.value) {
        // Update existing user
        const updateData = {
          nama: userData.value.nama,
          telepon: userData.value.telepon,
          role: userData.value.role,
        };

        await updateDoc(doc(db, "users", editingUser.value.id), updateData);
        const index = users.value.findIndex(
          (u) => u.id === editingUser.value.id
        );
        if (index !== -1) {
          users.value[index] = { ...users.value[index], ...updateData };
        }
      } else {
        // Create new user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.value.email,
          userData.value.password
        );

        const newUserData = {
          nama: userData.value.nama,
          email: userData.value.email,
          telepon: userData.value.telepon,
          role: userData.value.role,
          terakhir_login: null,
        };

        await addDoc(collection(db, "users"), {
          ...newUserData,
          uid: userCredential.user.uid,
        });

        users.value.push({
          id: userCredential.user.uid,
          ...newUserData,
        });
      }

      cancelUserDialog();
    } catch (error) {
      console.error("Save user failed:", error);
      // Handle specific Firebase errors here
      if (error.code === "auth/email-already-in-use") {
        alert("Email sudah digunakan");
      } else {
        alert("Gagal menyimpan pengguna: " + error.message);
      }
    } finally {
      loading.value = false;
    }
  }
};

const confirmDelete = async () => {
  try {
    loading.value = true;

    // Delete from Firestore
    await deleteDoc(doc(db, "users", userToDelete.value.id));

    // Remove from local array
    users.value = users.value.filter((u) => u.id !== userToDelete.value.id);

    showDeleteDialog.value = false;
    userToDelete.value = null;
  } catch (error) {
    console.error("Delete user failed:", error);
    alert("Gagal menghapus pengguna: " + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
