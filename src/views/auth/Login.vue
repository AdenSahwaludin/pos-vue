<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="text-center pa-6">
            <div class="text-h4 text-primary">
              <v-icon size="48" class="mr-2">mdi-cash-register</v-icon>
              <br />
              POS System
            </div>
            <div class="text-subtitle-1 mt-2">CV Sari Bumi Sakti</div>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                class="mb-3"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                class="mb-3"
                required
              ></v-text-field>

              <v-alert
                v-if="authStore.error"
                type="error"
                class="mb-3"
                dismissible
                @click:close="authStore.clearError"
              >
                {{ authStore.error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="authStore.loading"
                :disabled="!valid"
                class="mt-4"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-text class="text-center pa-6">
            <div class="text-caption text-medium-emphasis">
              Demo Accounts:
              <br />
              Admin: admin@saribumi.com / admin123
              <br />
              Kasir: kasir@saribumi.com / kasir123
            </div>
          </v-card-text>
        </v-card>
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
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.v-card {
  border-radius: 16px;
}
</style>
