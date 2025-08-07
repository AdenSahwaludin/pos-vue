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
  const isAdmin = computed(() => {
    const result = user.value?.role === "admin";
    console.log("isAdmin check:", { user: user.value, role: user.value?.role, isAdmin: result });
    return result;
  });
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
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          ...userDoc.data(),
        };
        
        user.value = userData;
        localStorage.setItem("user", JSON.stringify(userData));

        // Update last login
        await updateDoc(doc(db, "users", firebaseUser.uid), {
          terakhir_login: new Date(),
        });

        return userData;
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
              const userData = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                ...userDoc.data(),
              };
              user.value = userData;
              localStorage.setItem("user", JSON.stringify(userData));
            } else {
              console.error("User document does not exist.");
              user.value = null;
              localStorage.removeItem("user");
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
            user.value = null;
            localStorage.removeItem("user");
          }
        } else {
          user.value = null;
          localStorage.removeItem("user");
        }
        resolve(user.value);
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
      try {
        const userData = JSON.parse(savedUser);
        user.value = userData;
        console.log("User loaded from localStorage:", userData);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("user");
        user.value = null;
      }
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