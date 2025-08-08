import { db } from '@/config/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

/**
 * Generate Customer ID in format P000001, P000002, etc.
 */
export const generateCustomerId = async () => {
  try {
    // Get the last customer ID to determine the next sequence
    const q = query(
      collection(db, "customers"),
      orderBy("id", "desc"),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    let nextSequence = 1;
    
    if (!snapshot.empty) {
      const lastDoc = snapshot.docs[0];
      const lastId = lastDoc.data().id || lastDoc.id;
      
      // Extract number from P000001 format
      const match = lastId.match(/P(\d+)/);
      if (match) {
        nextSequence = parseInt(match[1]) + 1;
      }
    }
    
    // Ensure we don't exceed P999999
    if (nextSequence > 999999) {
      throw new Error('Maximum customer ID limit reached (P999999)');
    }
    
    return `P${String(nextSequence).padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generating customer ID:', error);
    return `P${String(Date.now()).slice(-6)}`;  // Fallback
  }
};

/**
 * Generate User ID in format 001-ADN, 002-JHN, etc.
 * @param {string} fullName - Full name of the user
 */
export const generateUserId = async (fullName) => {
  try {
    // Get the last user ID to determine the next sequence
    const q = query(
      collection(db, "users"),
      orderBy("id", "desc"),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    let nextSequence = 1;
    
    if (!snapshot.empty) {
      const lastDoc = snapshot.docs[0];
      const lastId = lastDoc.data().id || lastDoc.id;
      
      // Extract number from 001-ADN format
      const match = lastId.match(/(\d+)-/);
      if (match) {
        nextSequence = parseInt(match[1]) + 1;
      }
    }
    
    // Generate initials from full name
    const nameParts = fullName.trim().split(' ');
    let initials = '';
    
    if (nameParts.length === 1) {
      // If only one name, take first 3 characters
      initials = nameParts[0].substring(0, 3).toUpperCase();
    } else {
      // Take first letter of each word, max 3 letters
      for (let i = 0; i < Math.min(nameParts.length, 3); i++) {
        if (nameParts[i].length > 0) {
          initials += nameParts[i][0].toUpperCase();
        }
      }
    }
    
    // Pad initials to 3 characters if needed
    initials = initials.padEnd(3, 'X');
    
    const sequenceStr = String(nextSequence).padStart(3, '0');
    return `${sequenceStr}-${initials}`;
  } catch (error) {
    console.error('Error generating user ID:', error);
    // Fallback
    const timestamp = Date.now().toString().slice(-3);
    const initials = fullName.substring(0, 3).toUpperCase().padEnd(3, 'X');
    return `${timestamp}-${initials}`;
  }
};

/**
 * Generate EAN-13 barcode for product ID
 * @param {string} categoryId - Category identifier
 */
export const generateProductEAN13 = async (categoryId = '001') => {
  try {
    // EAN-13 format: 3 digits country code + 4 digits manufacturer + 5 digits product + 1 check digit
    // We'll use: 890 (Indonesia) + category (padded to 4) + sequence (5 digits) + check digit
    
    const countryCode = '890';  // Indonesia
    const manufacturerCode = String(categoryId).padStart(4, '0');
    
    // Get next product sequence for this category
    const q = query(
      collection(db, "products"),
      where("category_id", "==", categoryId),
      orderBy("id", "desc"),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    let nextSequence = 1;
    
    if (!snapshot.empty) {
      const lastDoc = snapshot.docs[0];
      const lastId = lastDoc.data().id || lastDoc.id;
      
      // Extract sequence from EAN-13
      if (lastId.length === 13) {
        const sequencePart = lastId.substring(7, 12);
        nextSequence = parseInt(sequencePart) + 1;
      }
    }
    
    // Ensure sequence doesn't exceed 5 digits (99999)
    if (nextSequence > 99999) {
      nextSequence = 1; // Reset sequence
    }
    
    const productCode = String(nextSequence).padStart(5, '0');
    const baseCode = countryCode + manufacturerCode + productCode;
    
    // Calculate check digit using EAN-13 algorithm
    let sum = 0;
    for (let i = 0; i < baseCode.length; i++) {
      const digit = parseInt(baseCode[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return baseCode + checkDigit;
  } catch (error) {
    console.error('Error generating EAN-13:', error);
    // Fallback: generate a random EAN-13
    const timestamp = Date.now().toString();
    const baseCode = '890' + timestamp.slice(-9);
    
    let sum = 0;
    for (let i = 0; i < baseCode.length; i++) {
      const digit = parseInt(baseCode[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return baseCode + checkDigit;
  }
};

/**
 * Validate EAN-13 barcode
 * @param {string} ean13 - EAN-13 code to validate
 */
export const validateEAN13 = (ean13) => {
  if (!ean13 || ean13.length !== 13 || !/^\d{13}$/.test(ean13)) {
    return false;
  }
  
  const baseCode = ean13.substring(0, 12);
  const checkDigit = parseInt(ean13[12]);
  
  let sum = 0;
  for (let i = 0; i < baseCode.length; i++) {
    const digit = parseInt(baseCode[i]);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  
  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  return calculatedCheckDigit === checkDigit;
};

/**
 * Generate next auto-increment ID for categories
 */
export const generateCategoryId = async () => {
  try {
    const q = query(
      collection(db, "categories"),
      orderBy("id", "desc"),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    let nextId = 1;
    
    if (!snapshot.empty) {
      const lastDoc = snapshot.docs[0];
      const lastId = parseInt(lastDoc.data().id || lastDoc.id);
      if (!isNaN(lastId)) {
        nextId = lastId + 1;
      }
    }
    
    return nextId;
  } catch (error) {
    console.error('Error generating category ID:', error);
    return Date.now(); // Fallback to timestamp
  }
};

/**
 * Generate transaction detail ID (auto-increment)
 */
export const generateTransactionDetailId = async () => {
  try {
    const q = query(
      collection(db, "transaction_details"),
      orderBy("id", "desc"),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    let nextId = 1;
    
    if (!snapshot.empty) {
      const lastDoc = snapshot.docs[0];
      const lastId = parseInt(lastDoc.data().id || lastDoc.id);
      if (!isNaN(lastId)) {
        nextId = lastId + 1;
      }
    }
    
    return nextId;
  } catch (error) {
    console.error('Error generating transaction detail ID:', error);
    return Date.now(); // Fallback to timestamp
  }
};
