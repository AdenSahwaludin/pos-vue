<template>
  <v-container fluid class="login-container">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="5" xl="4">
        <v-card class="login-card glass-effect" elevation="24" rounded="xl">
          <!-- Header Section -->
          <div class="login-header text-center pa-8">
            <div class="mb-4">
              <v-avatar size="80" color="rgba(46, 125, 50, 0.1)">
                <v-icon size="40" color="primary">mdi-leaf</v-icon>
              </v-avatar>
            </div>
            <div class="text-h4 font-weight-bold text-primary mb-2">
              CV Sari Bumi Sakti
            </div>
            <div class="text-h6 text-medium-emphasis mb-2">
              Sistem Point of Sale
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Herbal Oil & Natural Products
            </div>
          </div>

          <!-- Login Form -->
          <v-card-text class="pa-8">
            <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
              <div class="mb-6">
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="Email Address"
                  type="email"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  color="primary"
                  class="rounded-lg"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="password"
                  :rules="passwordRules"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  variant="outlined"
                  color="primary"
                  class="rounded-lg"
                  required
                ></v-text-field>
              </div>

              <v-alert
                v-if="authStore.error"
                type="error"
                class="mb-4 rounded-lg"
                border="start"
                elevation="2"
                closable
                @click:close="authStore.clearError"
              >
                {{ authStore.error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                size="x-large"
                :loading="authStore.loading"
                :disabled="!valid"
                class="text-white font-weight-bold"
                rounded="lg"
                elevation="2"
              >
                <v-icon class="mr-2">mdi-login</v-icon>
                Masuk ke Sistem
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-text class="pa-8 pt-0">
            <v-divider class="mb-4"></v-divider>
            <v-alert
              type="info"
              variant="tonal"
              class="rounded-lg"
              border="start"
            >
              <div class="text-body-2">
                <div class="font-weight-bold mb-2">Demo Akun:</div>
                <div class="mb-1">
                  <v-icon size="16" class="mr-2">mdi-shield-crown</v-icon>
                  <strong>Admin:</strong> admin@saribumi.com / admin123
                </div>
                <div>
                  <v-icon size="16" class="mr-2">mdi-cash-register</v-icon>
                  <strong>Kasir:</strong> kasir@saribumi.com / kasir123
                </div>
              </div>
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Footer -->
        <div class="text-center mt-6">
          <div class="text-body-2 text-white opacity-80">
            © 2025 CV Sari Bumi Sakti. Semua hak dilindungi.
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const form = ref(null);
const valid = ref(false);
const email = ref("");
const password = ref("");
const showPassword = ref(false);

const emailRules = [
  (v) => !!v || "Email wajib diisi",
  (v) => /.+@.+\..+/.test(v) || "Email harus valid",
];

const passwordRules = [
  (v) => !!v || "Password wajib diisi",
  (v) => (v && v.length >= 6) || "Password minimal 6 karakter",
];

const handleLogin = async () => {
  const { valid } = await form.value.validate();

  if (valid) {
    try {
      await authStore.login(email.value, password.value);
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #1b5e20 0%,
    #2e7d32 25%,
    #4caf50 50%,
    #66bb6a 75%,
    #81c784 100%
  );
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 20 Q50 10 80 20 Q90 50 80 80 Q50 90 20 80 Q10 50 20 20" fill="rgba(255,255,255,0.05)"/></svg>');
  animation: float 20s infinite linear;
  pointer-events: none;
}

@keyframes float {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.login-card {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-header {
  background: linear-gradient(
    135deg,
    rgba(241, 248, 233, 0.8),
    rgba(232, 245, 232, 0.9)
  );
  border-radius: 16px 16px 0 0;
  position: relative;
}

.login-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="10" cy="20" r="2" fill="rgba(76,175,80,0.1)"/><circle cx="80" cy="15" r="1.5" fill="rgba(46,125,50,0.1)"/><circle cx="30" cy="80" r="1" fill="rgba(139,195,74,0.1)"/><circle cx="70" cy="70" r="2.5" fill="rgba(102,187,106,0.1)"/></svg>');
  pointer-events: none;
}

.glass-effect {
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .login-card {
    margin: 16px;
    border-radius: 20px;
  }

  .login-header {
    padding: 24px !important;
  }

  .v-card-text {
    padding: 24px !important;
  }
}

/* Enhanced form styling */
.v-text-field {
  margin-bottom: 8px;
}

.v-text-field .v-field {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(46, 125, 50, 0.2);
}

.v-text-field--focused .v-field {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

/* Button enhancements */
.v-btn {
  background: linear-gradient(135deg, #4caf50, #66bb6a) !important;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}
</style>
