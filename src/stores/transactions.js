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
import { generateTransactionDetailId } from "@/utils/idGenerator";

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
      // Check if we can add more quantity
      if (existingItem.jumlah + quantity <= existingItem.stok_tersedia) {
        existingItem.jumlah += quantity;
      }
    } else {
      cart.value.push({
        product_id: product.id,
        nama: product.nama,
        harga_satuan: product.harga,
        jumlah: quantity,
        stok_tersedia: product.stok,
        gambar: product.gambar,
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
      } else if (quantity <= item.stok_tersedia) {
        item.jumlah = quantity;
      }
      // If quantity exceeds stock, don't update
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

    // Get this month's transaction count for sequence
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);

    const q = query(
      collection(db, "transactions"),
      where("tanggal", ">=", startOfMonth),
      where("tanggal", "<=", endOfMonth)
    );

    const snapshot = await getDocs(q);
    const sequence = String(snapshot.size + 1).padStart(3, "0");

    // Format customer ID part - ensure it's in P000001 format
    let customerPart = "P000001"; // Default
    if (customerId) {
      // If customerId is already in correct format (P000001), use it
      if (/^P\d{6}$/.test(customerId)) {
        customerPart = customerId;
      } else {
        // Otherwise format it properly
        const numericId = parseInt(customerId.replace(/\D/g, "")) || 1;
        customerPart = `P${String(numericId).padStart(6, "0")}`;
      }
    }

    return `INV-${year}-${month}-${sequence}-${customerPart}`;
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
        // Generate auto-increment ID for transaction detail
        const detailId = await generateTransactionDetailId();

        const detailRef = doc(db, "transaction_details", String(detailId));
        batch.set(detailRef, {
          id: detailId,
          transaction_id: transactionId, // Use the generated transaction ID instead of document ID
          transaction_doc_id: transactionRef.id, // Store document ID for reference
          product_id: item.product_id,
          jumlah: item.jumlah,
          harga_satuan: item.harga_satuan,
          created_at: serverTimestamp(),
        });

        // Update product stock
        const productRef = doc(db, "products", item.product_id);
        // Get current stock from the original product data
        const currentStock = item.stok_tersedia;
        const newStock = currentStock - item.jumlah;
        batch.update(productRef, { stok: Math.max(0, newStock) });
      }

      // Create payment record
      const paymentRef = doc(collection(db, "payments"));

      // Generate proper payment ID: PAY-YYYYMMDD-0000001
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

      // Get today's payment count for sequence
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const paymentQuery = query(
        collection(db, "payments"),
        where("tanggal", ">=", startOfDay),
        where("tanggal", "<=", endOfDay)
      );

      const paymentSnapshot = await getDocs(paymentQuery);
      const paymentSequence = String(paymentSnapshot.size + 1).padStart(7, "0");
      const paymentId = `PAY-${dateStr}-${paymentSequence}`;

      batch.set(paymentRef, {
        id: paymentId,
        transaction_id: transactionId, // Use the generated transaction ID
        transaction_doc_id: transactionRef.id, // Store document ID for reference
        metode: paymentData.metode,
        jumlah: paymentData.jumlah,
        keterangan: paymentData.keterangan || null,
        tanggal: serverTimestamp(),
      });

      // Execute batch
      await batch.commit();

      // Update local state
      const newTransaction = {
        id: transactionId, // Use the generated transaction ID
        doc_id: transactionRef.id, // Store document ID for reference
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
      const details = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch product information for each detail
      const detailsWithProducts = await Promise.all(
        details.map(async (detail) => {
          try {
            const productDoc = await getDoc(
              doc(db, "products", detail.product_id)
            );
            if (productDoc.exists()) {
              return {
                ...detail,
                product: productDoc.data(),
              };
            }
            return detail;
          } catch (err) {
            console.warn("Could not fetch product:", detail.product_id, err);
            return detail;
          }
        })
      );

      return detailsWithProducts;
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
