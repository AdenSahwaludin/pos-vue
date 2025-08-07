import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { auth, db } from "@/config/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Set Firebase Auth persistence
const authInstance = getAuth();
setPersistence(authInstance, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to local");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const isKasir = computed(() => user.value?.role === "kasir");

  // Actions
  const login = async (email, password) => {
    try {
      loading.value = true;
      error.value = null;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (userDoc.exists()) {
        user.value = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          ...userDoc.data(),
        };

        // Update last login
        await updateDoc(doc(db, "users", firebaseUser.uid), {
          terakhir_login: new Date(),
        });

        return user.value;
      } else {
        throw new Error("User data not found");
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const initializeAuth = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              user.value = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                ...userDoc.data(),
              };
            } else {
              console.error("User document does not exist.");
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
          }
        } else {
          user.value = null;
        }
        resolve();
      });
    });
  };

  const setUser = (firebaseUser) => {
    if (firebaseUser) {
      user.value = firebaseUser;
      localStorage.setItem("user", JSON.stringify(firebaseUser));
    } else {
      user.value = null;
      localStorage.removeItem("user");
    }
  };

  const loadUser = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isKasir,
    login,
    logout,
    initializeAuth,
    setUser,
    loadUser,
    clearError,
  };
});