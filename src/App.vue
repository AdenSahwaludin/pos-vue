<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar
      v-if="authStore.isAuthenticated"
      app
      color="primary"
      dark
      elevation="1"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>
        <v-icon class="mr-2">mdi-cash-register</v-icon>
        POS CV Sari Bumi Sakti
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar size="32">
              <v-icon>mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>{{ authStore.user?.nama }}</v-list-item-title>
            <v-list-item-subtitle>{{
              authStore.user?.role
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="logout">
            <v-list-item-title>
              <v-icon class="mr-2">mdi-logout</v-icon>
              Logout
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-if="authStore.isAuthenticated"
      v-model="drawer"
      app
      temporary
    >
      <v-list>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          :disabled="item.adminOnly && !authStore.isAdmin"
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>

    <!-- Loading Overlay -->
    <v-overlay v-model="authStore.loading" class="align-center justify-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const drawer = ref(false);

const navigationItems = [
  { title: "Dashboard", icon: "mdi-view-dashboard", to: "/" },
  { title: "Point of Sale", icon: "mdi-cash-register", to: "/pos" },
  { title: "Produk", icon: "mdi-package-variant", to: "/products" },
  {
    title: "Kategori",
    icon: "mdi-tag-multiple",
    to: "/categories",
    adminOnly: true,
  },
  { title: "Pelanggan", icon: "mdi-account-group", to: "/customers" },
  { title: "Transaksi", icon: "mdi-receipt", to: "/transactions" },
  { title: "Laporan", icon: "mdi-chart-line", to: "/reports", adminOnly: true },
  {
    title: "Pengguna",
    icon: "mdi-account-multiple",
    to: "/users",
    adminOnly: true,
  },
];

const logout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

onMounted(async () => {
  await authStore.initializeAuth();
});
</script>

<style scoped>
.v-toolbar-title {
  font-weight: bold;
}
</style>
