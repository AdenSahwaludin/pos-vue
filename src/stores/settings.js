import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Get all settings
  const getSettings = async () => {
    try {
      loading.value = true
      const docRef = doc(db, 'settings', 'app_settings')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        settings.value = docSnap.data()
      } else {
        // Create default settings
        const defaultSettings = {
          store: {
            nama_toko: 'CV Sari Bumi Sakti',
            alamat: '',
            telepon: '',
            email: ''
          },
          tax: {
            pajak_default: 11,
            mata_uang: 'IDR',
            auto_calculate_tax: true
          },
          receipt: {
            header_text: 'Terima kasih telah berbelanja',
            footer_text: 'Barang yang sudah dibeli tidak dapat dikembalikan',
            show_logo: true,
            auto_print: false
          },
          system: {
            language: 'id',
            timezone: 'Asia/Jakarta',
            session_timeout: 60,
            auto_backup: true
          }
        }
        
        await setDoc(docRef, defaultSettings)
        settings.value = defaultSettings
      }
      
      return settings.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update specific settings category
  const updateSettings = async (category, data) => {
    try {
      loading.value = true
      const docRef = doc(db, 'settings', 'app_settings')
      
      await updateDoc(docRef, {
        [category]: data,
        updated_at: new Date()
      })
      
      // Update local state
      settings.value[category] = data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Backup database
  const backupDatabase = async () => {
    try {
      loading.value = true
      
      // Get all collections data
      const collections = ['users', 'customers', 'categories', 'products', 'transactions', 'transaction_details', 'payments']
      const backupData = {}
      
      for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName))
        backupData[collectionName] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      }
      
      // Create backup record
      const backupRecord = {
        created_at: new Date(),
        collections: collections,
        total_records: Object.values(backupData).reduce((sum, arr) => sum + arr.length, 0),
        file_size: JSON.stringify(backupData).length
      }
      
      await setDoc(doc(db, 'backups', `backup_${Date.now()}`), backupRecord)
      
      // Download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Optimize database
  const optimizeDatabase = async () => {
    try {
      loading.value = true
      
      // This is a placeholder for database optimization
      // In a real Firebase implementation, optimization would involve:
      // - Cleaning up unused data
      // - Updating indexes
      // - Compacting data structures
      
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Log optimization record
      await setDoc(doc(db, 'system_logs', `optimize_${Date.now()}`), {
        action: 'database_optimization',
        timestamp: new Date(),
        status: 'completed'
      })
      
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear old data (older than 6 months)
  const clearOldData = async () => {
    try {
      loading.value = true
      
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      // Clear old transactions
      const oldTransactionsQuery = query(
        collection(db, 'transactions'),
        where('tanggal', '<', Timestamp.fromDate(sixMonthsAgo))
      )
      
      const oldTransactions = await getDocs(oldTransactionsQuery)
      let deletedCount = 0
      
      for (const transactionDoc of oldTransactions.docs) {
        // Delete transaction details first
        const detailsQuery = query(
          collection(db, 'transaction_details'),
          where('transaction_id', '==', transactionDoc.id)
        )
        const details = await getDocs(detailsQuery)
        
        for (const detail of details.docs) {
          await deleteDoc(detail.ref)
        }
        
        // Delete payments
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('transaction_id', '==', transactionDoc.id)
        )
        const payments = await getDocs(paymentsQuery)
        
        for (const payment of payments.docs) {
          await deleteDoc(payment.ref)
        }
        
        // Delete transaction
        await deleteDoc(transactionDoc.ref)
        deletedCount++
      }
      
      // Log cleanup record
      await setDoc(doc(db, 'system_logs', `cleanup_${Date.now()}`), {
        action: 'data_cleanup',
        timestamp: new Date(),
        deleted_transactions: deletedCount,
        cutoff_date: sixMonthsAgo
      })
      
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    settings,
    loading,
    error,
    getSettings,
    updateSettings,
    backupDatabase,
    optimizeDatabase,
    clearOldData,
    clearError
  }
})
