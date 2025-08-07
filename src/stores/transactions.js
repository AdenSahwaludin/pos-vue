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
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthStore } from "./auth";

export const useTransactionStore = defineStore("transactions", () => {
  // State
  const transactions = ref([]);
  const cart = ref([]);
  const currentTransaction = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const cartTotal = computed(() => {
    return cart.value.reduce(
      (total, item) => total + item.harga_satuan * item.jumlah,
      0
    );
  });

  const cartItemCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.jumlah, 0);
  });

  const todayTransactions = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions.value.filter((t) => {
      const transDate = new Date(t.tanggal.seconds * 1000);
      return transDate >= today;
    });
  });

  const todaySales = computed(() => {
    return todayTransactions.value.reduce((total, t) => total + t.total, 0);
  });

  // Actions - Cart Management
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.value.find(
      (item) => item.product_id === product.id
    );

    if (existingItem) {
      existingItem.jumlah += quantity;
    } else {
      cart.value.push({
        product_id: product.id,
        nama: product.nama,
        harga_satuan: product.harga,
        jumlah: quantity,
        stok_tersedia: product.stok,
      });
    }
  };

  const removeFromCart = (productId) => {
    cart.value = cart.value.filter((item) => item.product_id !== productId);
  };

  const updateCartQuantity = (productId, quantity) => {
    const item = cart.value.find((item) => item.product_id === productId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        item.jumlah = quantity;
      }
    }
  };

  const clearCart = () => {
    cart.value = [];
  };

  // Actions - Transactions
  const fetchTransactions = async (userOnly = false) => {
    try {
      loading.value = true;
      const authStore = useAuthStore();

      let q = collection(db, "transactions");

      if (userOnly && authStore.user) {
        q = query(
          collection(db, "transactions"),
          where("user_id", "==", authStore.user.id),
          orderBy("tanggal", "desc")
        );
      } else {
        q = query(collection(db, "transactions"), orderBy("tanggal", "desc"));
      }

      const querySnapshot = await getDocs(q);
      transactions.value = querySnapshot.docs.map((doc) => ({
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

  const generateTransactionId = async (customerId = null) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Get today's transaction count
    const todayCount = todayTransactions.value.length + 1;
    const invoiceNumber = String(todayCount).padStart(3, "0");

    const customerSuffix = customerId
      ? customerId.substring(0, 6).toUpperCase()
      : "GUEST";

    return `INV-${year}-${month}-${invoiceNumber}-${customerSuffix}`;
  };

  const createTransaction = async (transactionData, paymentData) => {
    try {
      loading.value = true;
      const authStore = useAuthStore();
      const batch = writeBatch(db);

      // Generate transaction ID
      const transactionId = await generateTransactionId(
        transactionData.customer_id
      );

      // Create transaction document
      const transactionRef = doc(collection(db, "transactions"));
      const transaction = {
        id: transactionId,
        user_id: authStore.user.id,
        customer_id: transactionData.customer_id || null,
        tanggal: serverTimestamp(),
        total: cartTotal.value,
        status: "selesai",
        catatan: transactionData.catatan || null,
        diskon: transactionData.diskon || 0,
        pajak: transactionData.pajak || 0,
        biaya_pengiriman: transactionData.biaya_pengiriman || 0,
      };

      batch.set(transactionRef, transaction);

      // Create transaction details
      for (const item of cart.value) {
        const detailRef = doc(collection(db, "transaction_details"));
        batch.set(detailRef, {
          transaction_id: transactionRef.id,
          product_id: item.product_id,
          jumlah: item.jumlah,
          harga_satuan: item.harga_satuan,
        });

        // Update product stock
        const productRef = doc(db, "products", item.product_id);
        const newStock = item.stok_tersedia - item.jumlah;
        batch.update(productRef, { stok: newStock });
      }

      // Create payment record
      const paymentRef = doc(collection(db, "payments"));
      const paymentId = `PAY-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${Date.now().toString().slice(-7)}`;
      batch.set(paymentRef, {
        id: paymentId,
        transaction_id: transactionRef.id,
        metode: paymentData.metode,
        jumlah: paymentData.jumlah,
        keterangan: paymentData.keterangan || null,
        tanggal: serverTimestamp(),
      });

      // Execute batch
      await batch.commit();

      // Update local state
      const newTransaction = {
        id: transactionRef.id,
        ...transaction,
        tanggal: new Date(),
      };

      transactions.value.unshift(newTransaction);
      currentTransaction.value = newTransaction;

      // Clear cart
      clearCart();

      return newTransaction;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTransactionStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "transactions", id), { status });
      const index = transactions.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        transactions.value[index].status = status;
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const getTransactionDetails = async (transactionId) => {
    try {
      const q = query(
        collection(db, "transaction_details"),
        where("transaction_id", "==", transactionId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    transactions,
    cart,
    currentTransaction,
    loading,
    error,
    cartTotal,
    cartItemCount,
    todayTransactions,
    todaySales,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    fetchTransactions,
    createTransaction,
    updateTransactionStatus,
    getTransactionDetails,
    clearError,
  };
});
