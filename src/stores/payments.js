import { defineStore } from "pinia";
import { ref } from "vue";
import { db } from "@/config/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";

export const usePaymentStore = defineStore("payments", () => {
  const payments = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Fetch all payments
  const fetchPayments = async () => {
    try {
      loading.value = true;
      const q = query(collection(db, "payments"), orderBy("tanggal", "desc"));
      const querySnapshot = await getDocs(q);

      payments.value = querySnapshot.docs.map((doc) => ({
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

  // Create new payment
  const createPayment = async (paymentData) => {
    try {
      loading.value = true;

      const payment = {
        transaction_id: paymentData.transaction_id,
        metode: paymentData.metode,
        jumlah: parseFloat(paymentData.jumlah),
        keterangan: paymentData.keterangan || "",
        tanggal: serverTimestamp(),
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "payments"), payment);

      // Add to local state
      payments.value.unshift({
        id: docRef.id,
        ...payment,
        tanggal: new Date(),
      });

      return docRef.id;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update payment
  const updatePayment = async (id, paymentData) => {
    try {
      loading.value = true;

      const updateData = {
        metode: paymentData.metode,
        jumlah: parseFloat(paymentData.jumlah),
        keterangan: paymentData.keterangan || "",
        updated_at: serverTimestamp(),
      };

      await updateDoc(doc(db, "payments", id), updateData);

      // Update local state
      const index = payments.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        payments.value[index] = { ...payments.value[index], ...updateData };
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete payment
  const deletePayment = async (id) => {
    try {
      loading.value = true;
      await deleteDoc(doc(db, "payments", id));

      // Remove from local state
      payments.value = payments.value.filter((p) => p.id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get payments by transaction ID
  const getPaymentsByTransaction = async (transactionId) => {
    try {
      const q = query(
        collection(db, "payments"),
        where("transaction_id", "==", transactionId),
        orderBy("tanggal", "desc")
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

  // Get payment statistics
  const getPaymentStats = async (dateFrom, dateTo) => {
    try {
      let q = collection(db, "payments");

      if (dateFrom && dateTo) {
        q = query(
          collection(db, "payments"),
          where("tanggal", ">=", dateFrom),
          where("tanggal", "<=", dateTo)
        );
      }

      const querySnapshot = await getDocs(q);
      const paymentsData = querySnapshot.docs.map((doc) => doc.data());

      const stats = {
        total_payments: paymentsData.length,
        total_amount: paymentsData.reduce(
          (sum, payment) => sum + payment.jumlah,
          0
        ),
        by_method: {},
      };

      // Group by payment method
      paymentsData.forEach((payment) => {
        if (!stats.by_method[payment.metode]) {
          stats.by_method[payment.metode] = {
            count: 0,
            amount: 0,
          };
        }
        stats.by_method[payment.metode].count++;
        stats.by_method[payment.metode].amount += payment.jumlah;
      });

      return stats;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentsByTransaction,
    getPaymentStats,
    clearError,
  };
});
