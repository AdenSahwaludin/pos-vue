import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/stores/auth";

// Create Vuetify instance with herbal-inspired theme
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#2E7D32", // Deep Green (daun herbal)
          secondary: "#558B2F", // Light Green (batang tanaman)
          accent: "#8BC34A", // Fresh Green (tunas muda)
          surface: "#F1F8E9", // Very light green background
          background: "#FAFAFA", // Almost white
          error: "#D32F2F",
          info: "#0288D1",
          success: "#388E3C",
          warning: "#F57C00",
          // Custom herbal colors
          herbal: "#4CAF50",
          natural: "#689F38",
          earth: "#8D6E63",
          leaf: "#66BB6A",
        },
      },
      dark: {
        colors: {
          primary: "#4CAF50", // Lighter green for dark mode
          secondary: "#8BC34A",
          accent: "#C8E6C9",
          surface: "#1B5E20",
          background: "#0D47A1",
          error: "#F44336",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FF9800",
          herbal: "#66BB6A",
          natural: "#9CCC65",
          earth: "#A1887F",
          leaf: "#81C784",
        },
      },
    },
    variations: {
      colors: ['primary', 'secondary', 'accent'],
      lighten: 3,
      darken: 3,
    },
  },
  defaults: {
    VCard: {
      elevation: 2,
      rounded: 'lg',
    },
    VBtn: {
      rounded: 'lg',
      style: 'text-transform: none; font-weight: 500;',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VDataTable: {
      density: 'comfortable',
    },
  },
});

// Create Pinia store
const pinia = createPinia();

// Create and mount app
const app = createApp(App);

app.use(pinia);

// Load user dari localStorage jika ada
const authStore = useAuthStore();
authStore.loadUser();

app.use(router);
app.use(vuetify);

app.mount("#app");
