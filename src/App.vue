<template>
  <v-app>
    <!-- Mobile App Bar -->
    <v-app-bar
      v-if="authStore.isAuthenticated"
      app
      elevation="0"
      height="64"
      class="herbal-gradient"
    >
      <v-app-bar-nav-icon 
        @click="drawer = !drawer"
        color="white"
        class="d-md-none"
      ></v-app-bar-nav-icon>

      <v-toolbar-title class="text-white font-weight-bold d-flex align-center">
        <v-icon size="28" class="mr-2" color="white">mdi-leaf</v-icon>
        <span class="d-none d-sm-block">POS CV Sari Bumi Sakti</span>
        <span class="d-sm-none">SBS POS</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Desktop Navigation (Hidden on mobile) -->
      <div class="d-none d-md-flex align-center">
        <v-btn
          v-for="item in visibleNavigationItems"
          :key="item.title"
          :to="item.to"
          variant="text"
          color="white"
          class="mx-1"
          rounded="lg"
        >
          <v-icon size="20" class="mr-2">{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </div>

      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon size="40" v-bind="props" class="ml-2">
            <v-avatar size="36" color="rgba(255,255,255,0.2)">
              <v-icon color="white">mdi-account</v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-list class="rounded-lg">
          <v-list-item>
            <v-list-item-title class="font-weight-bold">{{ authStore.user?.nama }}</v-list-item-title>
            <v-list-item-subtitle class="text-capitalize">{{ authStore.user?.role }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="logout">
            <template v-slot:prepend>
              <v-icon color="error">mdi-logout</v-icon>
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-if="authStore.isAuthenticated"
      v-model="drawer"
      app
      temporary
      class="natural-gradient"
      width="280"
    >
      <!-- User Profile in Drawer -->
      <div class="pa-4 text-center herbal-gradient">
        <v-avatar size="64" color="rgba(255,255,255,0.2)" class="mb-3">
          <v-icon size="32" color="white">mdi-account</v-icon>
        </v-avatar>
        <div class="text-white font-weight-bold text-h6">{{ authStore.user?.nama }}</div>
        <div class="text-white text-body-2 text-capitalize opacity-80">{{ authStore.user?.role }}</div>
      </div>

      <v-list class="pa-0">
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          :disabled="item.adminOnly && !authStore.isAdmin"
          class="rounded-lg ma-2"
          color="primary"
        >
          <template v-slot:prepend>
            <v-icon color="primary">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Bottom Navigation for Mobile -->
    <v-bottom-navigation
      v-if="authStore.isAuthenticated && $vuetify.display.mobile"
      app
      grow
      height="68"
      class="glass-effect"
      elevation="8"
    >
      <v-btn
        v-for="item in bottomNavigationItems"
        :key="item.title"
        :to="item.to"
        :disabled="item.adminOnly && !authStore.isAdmin"
        stacked
        size="small"
        color="primary"
      >
        <v-icon size="24">{{ item.icon }}</v-icon>
        <span class="text-caption">{{ item.shortTitle || item.title }}</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- Main Content -->
    <v-main class="natural-gradient">
      <v-container 
        fluid 
        :class="{
          'pa-2': $vuetify.display.mobile,
          'pa-4': !$vuetify.display.mobile,
          'pb-20': $vuetify.display.mobile && authStore.isAuthenticated
        }"
      >
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const drawer = ref(false);

// Navigation items
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

// Visible navigation items for desktop (exclude admin-only if not admin)
const visibleNavigationItems = computed(() => {
  return navigationItems
    .filter(item => !item.adminOnly || authStore.isAdmin)
    .slice(0, 5); // Limit to 5 items for desktop
});

// Bottom navigation items for mobile (main features only)
const bottomNavigationItems = [
  { title: "Dashboard", shortTitle: "Home", icon: "mdi-view-dashboard", to: "/" },
  { title: "Point of Sale", shortTitle: "POS", icon: "mdi-cash-register", to: "/pos" },
  { title: "Produk", shortTitle: "Produk", icon: "mdi-package-variant", to: "/products" },
  { title: "Transaksi", shortTitle: "Transaksi", icon: "mdi-receipt", to: "/transactions" },
  { title: "Lainnya", shortTitle: "Menu", icon: "mdi-menu", action: "openDrawer" },
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
.herbal-gradient {
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
}

.natural-gradient {
  background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

.v-toolbar-title {
  font-weight: bold;
}

/* Enhanced mobile navigation */
.v-bottom-navigation .v-btn {
  border-radius: 12px;
  margin: 0 2px;
}

/* Improved avatar styling */
.v-avatar {
  border: 2px solid rgba(255, 255, 255, 0.2);
}
</style>
