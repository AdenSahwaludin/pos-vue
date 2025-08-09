<template>
  <div>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center">
          <v-icon size="32" color="primary" class="mr-3">mdi-cog</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">
              Pengaturan Admin
            </h1>
            <p class="text-body-1 text-grey-darken-1 mb-0">
              Konfigurasi sistem kasir
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- General Settings -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-store</v-icon>
            Pengaturan Toko
          </v-card-title>

          <v-card-text class="pa-4">
            <v-form ref="storeForm">
              <v-text-field
                v-model="storeSettings.nama_toko"
                label="Nama Toko"
                outlined
                dense
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="storeSettings.alamat"
                label="Alamat"
                outlined
                dense
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="storeSettings.telepon"
                label="No. Telepon"
                outlined
                dense
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="storeSettings.email"
                label="Email"
                type="email"
                outlined
                dense
                class="mb-3"
              ></v-text-field>

              <v-btn
                color="primary"
                :loading="savingStore"
                @click="saveStoreSettings"
                block
              >
                Simpan Pengaturan Toko
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Tax & Currency Settings -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="bg-success text-white">
            <v-icon class="mr-2">mdi-calculator</v-icon>
            Pengaturan Pajak & Mata Uang
          </v-card-title>

          <v-card-text class="pa-4">
            <v-form ref="taxForm">
              <v-text-field
                v-model="taxSettings.pajak_default"
                label="Pajak Default (%)"
                type="number"
                outlined
                dense
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="taxSettings.mata_uang"
                label="Mata Uang"
                outlined
                dense
                class="mb-3"
              ></v-text-field>

              <v-switch
                v-model="taxSettings.auto_calculate_tax"
                label="Hitung Pajak Otomatis"
                color="success"
                class="mb-3"
              ></v-switch>

              <v-btn
                color="success"
                :loading="savingTax"
                @click="saveTaxSettings"
                block
              >
                Simpan Pengaturan Pajak
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Receipt Settings -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="bg-info text-white">
            <v-icon class="mr-2">mdi-receipt</v-icon>
            Pengaturan Struk
          </v-card-title>

          <v-card-text class="pa-4">
            <v-form ref="receiptForm">
              <v-text-field
                v-model="receiptSettings.header_text"
                label="Teks Header Struk"
                outlined
                dense
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="receiptSettings.footer_text"
                label="Teks Footer Struk"
                outlined
                dense
                class="mb-3"
              ></v-text-field>

              <v-switch
                v-model="receiptSettings.show_logo"
                label="Tampilkan Logo di Struk"
                color="info"
                class="mb-3"
              ></v-switch>

              <v-switch
                v-model="receiptSettings.auto_print"
                label="Print Otomatis Setelah Transaksi"
                color="info"
                class="mb-3"
              ></v-switch>

              <v-btn
                color="info"
                :loading="savingReceipt"
                @click="saveReceiptSettings"
                block
              >
                Simpan Pengaturan Struk
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- System Settings -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="bg-warning text-white">
            <v-icon class="mr-2">mdi-cogs</v-icon>
            Pengaturan Sistem
          </v-card-title>

          <v-card-text class="pa-4">
            <v-form ref="systemForm">
              <v-select
                v-model="systemSettings.language"
                label="Bahasa"
                :items="languageOptions"
                outlined
                dense
                class="mb-3"
              ></v-select>

              <v-select
                v-model="systemSettings.timezone"
                label="Zona Waktu"
                :items="timezoneOptions"
                outlined
                dense
                class="mb-3"
              ></v-select>

              <v-text-field
                v-model="systemSettings.session_timeout"
                label="Session Timeout (menit)"
                type="number"
                outlined
                dense
                class="mb-3"
              ></v-text-field>

              <v-switch
                v-model="systemSettings.auto_backup"
                label="Backup Otomatis"
                color="warning"
                class="mb-3"
              ></v-switch>

              <v-btn
                color="warning"
                :loading="savingSystem"
                @click="saveSystemSettings"
                block
              >
                Simpan Pengaturan Sistem
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Database Actions -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="bg-error text-white">
            <v-icon class="mr-2">mdi-database</v-icon>
            Aksi Database
          </v-card-title>

          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="4">
                <v-btn
                  color="success"
                  :loading="backing"
                  @click="backupDatabase"
                  block
                  size="large"
                >
                  <v-icon class="mr-2">mdi-database-export</v-icon>
                  Backup Database
                </v-btn>
              </v-col>

              <v-col cols="12" md="4">
                <v-btn
                  color="warning"
                  :loading="optimizing"
                  @click="optimizeDatabase"
                  block
                  size="large"
                >
                  <v-icon class="mr-2">mdi-database-cog</v-icon>
                  Optimasi Database
                </v-btn>
              </v-col>

              <v-col cols="12" md="4">
                <v-btn
                  color="error"
                  :loading="clearing"
                  @click="confirmClearData"
                  block
                  size="large"
                >
                  <v-icon class="mr-2">mdi-database-remove</v-icon>
                  Hapus Data Lama
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Clear Data Confirmation Dialog -->
    <v-dialog v-model="clearDataDialog" max-width="400px">
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Konfirmasi Hapus Data
        </v-card-title>

        <v-card-text class="pa-4">
          <p>
            Apakah Anda yakin ingin menghapus data transaksi yang lebih lama
            dari 6 bulan?
          </p>
          <p class="text-caption text-error">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="clearDataDialog = false">
            Batal
          </v-btn>
          <v-btn color="error" :loading="clearing" @click="clearOldData">
            Ya, Hapus
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
import { ref, onMounted } from "vue";
import { useSettingsStore } from "@/stores/settings";

const settingsStore = useSettingsStore();

// Loading states
const savingStore = ref(false);
const savingTax = ref(false);
const savingReceipt = ref(false);
const savingSystem = ref(false);
const backing = ref(false);
const optimizing = ref(false);
const clearing = ref(false);
const clearDataDialog = ref(false);

// Settings data
const storeSettings = ref({
  nama_toko: "CV Sari Bumi Sakti",
  alamat: "",
  telepon: "",
  email: "",
});

const taxSettings = ref({
  pajak_default: 11,
  mata_uang: "IDR",
  auto_calculate_tax: true,
});

const receiptSettings = ref({
  header_text: "Terima kasih telah berbelanja",
  footer_text: "Barang yang sudah dibeli tidak dapat dikembalikan",
  show_logo: true,
  auto_print: false,
});

const systemSettings = ref({
  language: "id",
  timezone: "Asia/Jakarta",
  session_timeout: 60,
  auto_backup: true,
});

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

// Options
const languageOptions = [
  { title: "Bahasa Indonesia", value: "id" },
  { title: "English", value: "en" },
];

const timezoneOptions = [
  { title: "WIB (Asia/Jakarta)", value: "Asia/Jakarta" },
  { title: "WITA (Asia/Makassar)", value: "Asia/Makassar" },
  { title: "WIT (Asia/Jayapura)", value: "Asia/Jayapura" },
];

// Methods
const saveStoreSettings = async () => {
  try {
    savingStore.value = true;
    await settingsStore.updateSettings("store", storeSettings.value);
    showSnackbar("Pengaturan toko berhasil disimpan");
  } catch (error) {
    showSnackbar("Gagal menyimpan pengaturan toko", "error");
  } finally {
    savingStore.value = false;
  }
};

const saveTaxSettings = async () => {
  try {
    savingTax.value = true;
    await settingsStore.updateSettings("tax", taxSettings.value);
    showSnackbar("Pengaturan pajak berhasil disimpan");
  } catch (error) {
    showSnackbar("Gagal menyimpan pengaturan pajak", "error");
  } finally {
    savingTax.value = false;
  }
};

const saveReceiptSettings = async () => {
  try {
    savingReceipt.value = true;
    await settingsStore.updateSettings("receipt", receiptSettings.value);
    showSnackbar("Pengaturan struk berhasil disimpan");
  } catch (error) {
    showSnackbar("Gagal menyimpan pengaturan struk", "error");
  } finally {
    savingReceipt.value = false;
  }
};

const saveSystemSettings = async () => {
  try {
    savingSystem.value = true;
    await settingsStore.updateSettings("system", systemSettings.value);
    showSnackbar("Pengaturan sistem berhasil disimpan");
  } catch (error) {
    showSnackbar("Gagal menyimpan pengaturan sistem", "error");
  } finally {
    savingSystem.value = false;
  }
};

const backupDatabase = async () => {
  try {
    backing.value = true;
    await settingsStore.backupDatabase();
    showSnackbar("Backup database berhasil");
  } catch (error) {
    showSnackbar("Gagal backup database", "error");
  } finally {
    backing.value = false;
  }
};

const optimizeDatabase = async () => {
  try {
    optimizing.value = true;
    await settingsStore.optimizeDatabase();
    showSnackbar("Optimasi database berhasil");
  } catch (error) {
    showSnackbar("Gagal optimasi database", "error");
  } finally {
    optimizing.value = false;
  }
};

const confirmClearData = () => {
  clearDataDialog.value = true;
};

const clearOldData = async () => {
  try {
    clearing.value = true;
    await settingsStore.clearOldData();
    clearDataDialog.value = false;
    showSnackbar("Data lama berhasil dihapus");
  } catch (error) {
    showSnackbar("Gagal menghapus data lama", "error");
  } finally {
    clearing.value = false;
  }
};

const loadSettings = async () => {
  try {
    const settings = await settingsStore.getSettings();

    if (settings.store) {
      storeSettings.value = { ...storeSettings.value, ...settings.store };
    }
    if (settings.tax) {
      taxSettings.value = { ...taxSettings.value, ...settings.tax };
    }
    if (settings.receipt) {
      receiptSettings.value = { ...receiptSettings.value, ...settings.receipt };
    }
    if (settings.system) {
      systemSettings.value = { ...systemSettings.value, ...settings.system };
    }
  } catch (error) {
    showSnackbar("Gagal memuat pengaturan", "error");
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
  loadSettings();
});
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>
