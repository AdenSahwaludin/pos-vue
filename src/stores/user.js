import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where
} from 'firebase/firestore'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { generateUserId } from '@/utils/idGenerator'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all users
  const fetchUsers = async () => {
    try {
      loading.value = true
      const q = query(collection(db, 'users'), orderBy('nama'))
      const querySnapshot = await getDocs(q)
      
      users.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new user
  const createUser = async (userData) => {
    try {
      loading.value = true
      
      // Generate user ID in format 001-ADN
      const userId = await generateUserId(userData.nama);
      
      // Create user in Firebase Auth
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      )
      
      // Create user document in Firestore
      const userDoc = {
        id: userId,
        nama: userData.nama,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        firebase_uid: userCredential.user.uid,
        created_at: new Date(),
        updated_at: new Date()
      }
      
      // Use the generated ID as the document ID
      const docRef = doc(db, 'users', userId);
      await addDoc(docRef, userDoc);
      
      // Refresh users list
      await fetchUsers()
      
      return { id: userId, ...userDoc };
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update user
  const updateUser = async (id, userData) => {
    try {
      loading.value = true
      
      const updateData = {
        nama: userData.nama,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        updated_at: new Date()
      }
      
      await updateDoc(doc(db, 'users', id), updateData)
      
      // Refresh users list
      await fetchUsers()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete user
  const deleteUser = async (id) => {
    try {
      loading.value = true
      await deleteDoc(doc(db, 'users', id))
      
      // Refresh users list
      await fetchUsers()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get user by email
  const getUserByEmail = async (email) => {
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email)
      )
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return {
          id: doc.id,
          ...doc.data()
        }
      }
      return null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserByEmail,
    clearError
  }
})
