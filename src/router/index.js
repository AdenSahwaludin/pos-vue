import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Import components
import Login from "@/views/auth/Login.vue";
import Dashboard from "@/views/Dashboard.vue";
import Products from "@/views/products/Products.vue";
import Categories from "@/views/categories/Categories.vue";
import Customers from "@/views/customers/Customers.vue";
import POS from "@/views/pos/POS.vue";
import Transactions from "@/views/transactions/Transactions.vue";
import SalesHistory from "@/views/transactions/SalesHistory.vue";
import Payments from "@/views/transactions/Payments.vue";
import Reports from "@/views/reports/Reports.vue";
import Users from "@/views/users/Users.vue";

// Admin components
import UserManagement from "@/views/admin/UserManagement.vue";
import AdminSettings from "@/views/admin/AdminSettings.vue";
import ImportData from "@/views/admin/ImportData.vue";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: "/pos",
    name: "POS",
    component: POS,
    meta: { requiresAuth: true },
  },
  {
    path: "/products",
    name: "Products",
    component: Products,
    meta: { requiresAuth: true },
  },
  {
    path: "/categories",
    name: "Categories",
    component: Categories,
    meta: { requiresAuth: true, adminOnly: true },
  },
  {
    path: "/customers",
    name: "Customers",
    component: Customers,
    meta: { requiresAuth: true },
  },
  {
    path: "/transactions",
    name: "Transactions",
    component: Transactions,
    meta: { requiresAuth: true },
  },
  {
    path: "/reports",
    name: "Reports",
    component: Reports,
    meta: { requiresAuth: true, adminOnly: true },
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
    meta: { requiresAuth: true, adminOnly: true },
  },
  // Admin routes
  {
    path: "/admin/users",
    name: "UserManagement",
    component: UserManagement,
    meta: { requiresAuth: true, adminOnly: true },
  },
  {
    path: "/admin/settings",
    name: "AdminSettings",
    component: AdminSettings,
    meta: { requiresAuth: true, adminOnly: true },
  },
  {
    path: "/admin/import-data",
    name: "ImportData",
    component: ImportData,
    meta: { requiresAuth: true, adminOnly: true },
  },
  // Additional transaction routes
  {
    path: "/sales-history",
    name: "SalesHistory",
    component: SalesHistory,
    meta: { requiresAuth: true },
  },
  {
    path: "/payments",
    name: "Payments",
    component: Payments,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const auth = getAuth();

  // Tunggu Firebase Authentication untuk memverifikasi status login
  const firebaseUser = await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

  // Update authStore dengan user yang terverifikasi
  if (firebaseUser) {
    // Jika belum ada user di store atau user ID berbeda, ambil data lengkap dari Firestore
    if (!authStore.user || authStore.user.id !== firebaseUser.uid) {
      try {
        await authStore.initializeAuth();
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    }
  } else {
    authStore.setUser(null);
  }

  // Route guard logic
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next("/"); // Redirect ke dashboard jika sudah login
  } else if (to.meta.adminOnly && !authStore.isAdmin) {
    // Redirect kasir ke dashboard jika mencoba akses halaman admin
    next("/");
  } else {
    next();
  }
});

export default router;
