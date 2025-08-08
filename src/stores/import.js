import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'

export const useImportStore = defineStore('import', () => {
  const loading = ref(false)
  const error = ref(null)

  // Import products and categories
  const importProducts = async (file) => {
    try {
      loading.value = true
      const text = await file.text()
      const data = JSON.parse(text)
      
      const batch = writeBatch(db)
      let productCount = 0
      let categoryCount = 0
      
      // Import categories first
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          const categoryRef = doc(collection(db, 'categories'))
          batch.set(categoryRef, {
            nama: category.nama,
            deskripsi: category.deskripsi || '',
            gambar: category.gambar || '',
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          })
          categoryCount++
        }
      }
      
      // Import products
      if (data.products && Array.isArray(data.products)) {
        for (const product of data.products) {
          const productRef = doc(collection(db, 'products'))
          batch.set(productRef, {
            nama: product.nama,
            kategori: product.kategori,
            harga: product.harga,
            stok: product.stok,
            deskripsi: product.deskripsi || '',
            gambar: product.gambar || '',
            barcode: product.barcode || '',
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          })
          productCount++
        }
      }
      
      await batch.commit()
      
      // Log import
      await logImport('products', file.name, 'success', productCount + categoryCount, 
        `Imported ${productCount} products and ${categoryCount} categories`)
      
      return { count: productCount, categories: categoryCount }
    } catch (err) {
      await logImport('products', file?.name || 'unknown', 'error', 0, err.message)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Import customers
  const importCustomers = async (file) => {
    try {
      loading.value = true
      const text = await file.text()
      const customers = JSON.parse(text)
      
      const batch = writeBatch(db)
      let count = 0
      
      for (const customer of customers) {
        const customerRef = doc(collection(db, 'customers'))
        batch.set(customerRef, {
          nama: customer.nama,
          email: customer.email || '',
          telepon: customer.telepon || '',
          alamat: customer.alamat || '',
          tanggal_bergabung: customer.tanggal_bergabung ? new Date(customer.tanggal_bergabung) : serverTimestamp(),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        })
        count++
      }
      
      await batch.commit()
      
      // Log import
      await logImport('customers', file.name, 'success', count, `Imported ${count} customers`)
      
      return { count }
    } catch (err) {
      await logImport('customers', file?.name || 'unknown', 'error', 0, err.message)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Import transactions
  const importTransactions = async (file) => {
    try {
      loading.value = true
      const text = await file.text()
      const transactions = JSON.parse(text)
      
      const batch = writeBatch(db)
      let count = 0
      
      for (const transaction of transactions) {
        const transactionRef = doc(collection(db, 'transactions'))
        const transactionId = transactionRef.id
        
        // Create main transaction
        batch.set(transactionRef, {
          customer_id: transaction.customer_id || null,
          tanggal: transaction.tanggal ? new Date(transaction.tanggal) : serverTimestamp(),
          total: transaction.total,
          status: 'selesai',
          catatan: transaction.notes || '',
          diskon: transaction.diskon || 0,
          pajak: transaction.pajak || 0,
          biaya_pengiriman: transaction.biaya_pengiriman || 0,
          created_at: serverTimestamp()
        })
        
        // Create transaction details
        if (transaction.items && Array.isArray(transaction.items)) {
          for (const item of transaction.items) {
            const detailRef = doc(collection(db, 'transaction_details'))
            batch.set(detailRef, {
              transaction_id: transactionId,
              product_id: item.product_id,
              jumlah: item.quantity,
              harga_satuan: item.price,
              created_at: serverTimestamp()
            })
          }
        }
        
        count++
      }
      
      await batch.commit()
      
      // Log import
      await logImport('transactions', file.name, 'success', count, `Imported ${count} transactions`)
      
      return { count }
    } catch (err) {
      await logImport('transactions', file?.name || 'unknown', 'error', 0, err.message)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Import payments
  const importPayments = async (file) => {
    try {
      loading.value = true
      const text = await file.text()
      const payments = JSON.parse(text)
      
      const batch = writeBatch(db)
      let count = 0
      
      for (const payment of payments) {
        const paymentRef = doc(collection(db, 'payments'))
        batch.set(paymentRef, {
          transaction_id: payment.transaction_id,
          metode: payment.metode,
          jumlah: payment.jumlah,
          tanggal: payment.tanggal ? new Date(payment.tanggal) : serverTimestamp(),
          keterangan: payment.keterangan || '',
          created_at: serverTimestamp()
        })
        count++
      }
      
      await batch.commit()
      
      // Log import
      await logImport('payments', file.name, 'success', count, `Imported ${count} payments`)
      
      return { count }
    } catch (err) {
      await logImport('payments', file?.name || 'unknown', 'error', 0, err.message)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get import history
  const getImportHistory = async () => {
    try {
      const q = query(collection(db, 'import_history'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Log import activity
  const logImport = async (type, filename, status, recordsCount, message) => {
    try {
      await addDoc(collection(db, 'import_history'), {
        type,
        filename,
        status,
        records_count: recordsCount,
        message,
        created_at: serverTimestamp()
      })
    } catch (err) {
      console.error('Failed to log import:', err)
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    loading,
    error,
    importProducts,
    importCustomers,
    importTransactions,
    importPayments,
    getImportHistory,
    clearError
  }
})
