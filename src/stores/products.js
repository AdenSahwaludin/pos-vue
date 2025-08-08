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
import { generateProductEAN13, generateCategoryId } from "@/utils/idGenerator";

export const useProductStore = defineStore("products", () => {
  // State
  const products = ref([]);
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const productsByCategory = computed(() => {
    return (categoryId) =>
      products.value.filter((p) => p.category_id === categoryId);
  });

  const lowStockProducts = computed(() => {
    return products.value.filter((p) => p.stok <= p.batas_stok);
  });

  const searchProducts = computed(() => {
    return (searchTerm) => {
      if (!searchTerm) return products.value;
      return products.value.filter(
        (p) =>
          p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nomor_bpom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };
  });

  // Actions - Categories
  const fetchCategories = async () => {
    try {
      loading.value = true;
      const querySnapshot = await getDocs(collection(db, "categories"));
      categories.value = querySnapshot.docs.map((doc) => ({
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

  const addCategory = async (categoryData) => {
    try {
      // Generate auto-increment ID for category
      const categoryId = await generateCategoryId();
      
      const categoryWithId = {
        ...categoryData,
        id: categoryId,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Use the generated ID as the document ID
      const docRef = doc(db, "categories", String(categoryId));
      await addDoc(docRef, categoryWithId);
      
      const newCategory = { ...categoryWithId };
      categories.value.push(newCategory);
      return newCategory;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      await updateDoc(doc(db, "categories", id), categoryData);
      const index = categories.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        categories.value[index] = { id, ...categoryData };
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      categories.value = categories.value.filter((c) => c.id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  // Actions - Products
  const fetchProducts = async () => {
    try {
      loading.value = true;
      const querySnapshot = await getDocs(collection(db, "products"));
      products.value = querySnapshot.docs.map((doc) => ({
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

  const addProduct = async (productData) => {
    try {
      // Generate EAN-13 barcode for product ID
      const ean13Id = await generateProductEAN13(productData.category_id);
      
      const productWithId = {
        ...productData,
        id: ean13Id,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Use the generated EAN-13 as the document ID
      const docRef = doc(db, "products", ean13Id);
      await addDoc(docRef, productWithId);
      
      const newProduct = { ...productWithId };
      products.value.push(newProduct);
      return newProduct;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      await updateDoc(doc(db, "products", id), productData);
      const index = products.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        products.value[index] = { id, ...productData };
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      products.value = products.value.filter((p) => p.id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const updateProductStock = async (id, newStock) => {
    try {
      await updateDoc(doc(db, "products", id), { stok: newStock });
      const index = products.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        products.value[index].stok = newStock;
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    products,
    categories,
    loading,
    error,
    productsByCategory,
    lowStockProducts,
    searchProducts,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    clearError,
  };
});
