import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "@/config/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { generateCustomerId } from "@/utils/idGenerator";

export const useCustomerStore = defineStore("customers", () => {
  // State
  const customers = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const customersByName = computed(() => {
    return (searchTerm) => {
      if (!searchTerm) return customers.value;
      return customers.value.filter(
        (c) =>
          c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.telepon?.includes(searchTerm)
      );
    };
  });

  const getCustomerById = computed(() => {
    return (id) => customers.value.find((c) => c.id === id);
  });

  // Actions
  const fetchCustomers = async () => {
    try {
      loading.value = true;
      error.value = null;

      const q = query(collection(db, "customers"), orderBy("nama"));
      const querySnapshot = await getDocs(q);

      customers.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addCustomer = async (customerData) => {
    try {
      loading.value = true;
      error.value = null;

      // Generate customer ID in P000001 format
      const customerId = await generateCustomerId();

      const customerWithId = {
        ...customerData,
        id: customerId,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Use the generated ID as the document ID
      const docRef = doc(db, "customers", customerId);
      await addDoc(docRef, customerWithId);

      const newCustomer = { ...customerWithId };
      customers.value.push(newCustomer);

      // Sort customers by name
      customers.value.sort((a, b) => a.nama.localeCompare(b.nama));

      return newCustomer;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      loading.value = true;
      error.value = null;

      const updatedData = {
        ...customerData,
        updated_at: new Date(),
      };

      await updateDoc(doc(db, "customers", id), updatedData);

      const index = customers.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        customers.value[index] = { id, ...updatedData };
        // Sort customers by name
        customers.value.sort((a, b) => a.nama.localeCompare(b.nama));
      }

      return { id, ...updatedData };
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      loading.value = true;
      error.value = null;

      await deleteDoc(doc(db, "customers", id));
      customers.value = customers.value.filter((c) => c.id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // Real-time subscription
  const subscribeToCustomers = () => {
    const q = query(collection(db, "customers"), orderBy("nama"));

    return onSnapshot(
      q,
      (snapshot) => {
        customers.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      },
      (err) => {
        error.value = err.message;
      }
    );
  };

  return {
    // State
    customers,
    loading,
    error,

    // Getters
    customersByName,
    getCustomerById,

    // Actions
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    clearError,
    subscribeToCustomers,
  };
});
