// dataMigration.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import medicinesData from './medicines.json'; // Adjust path as needed

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyA0fMTn7yyQoYK8EKJIJLkknNXsrAuycp4",
  authDomain: "trufoti-aad54.firebaseapp.com",
  projectId: "trufoti-aad54",
  storageBucket: "trufoti-aad54.firebasestorage.app",
  messagingSenderId: "286518797333",
  appId: "1:286518797333:web:cab903542053a0ca741a1c",
  measurementId: "G-B3XL1K961N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface MedicineDocument {
  id: string;
  name: string;
  type: 'suspension' | 'caplets' | 'granules';
  targetAudience: string;
  activeIngredient: string;
  hebName: string;
  concentration?: string; // Optional
  strength?: string; // Optional
  entries: any[];
  aliases?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export async function migrateMedicinesToFirestore() {
  try {
    console.log('Starting migration...');
    
    // Create batches for efficient writes (Firestore limit is 500 operations per batch)
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;
    
    const allMedicines: MedicineDocument[] = [];
    
    // Helper function to clean object of undefined values
    const cleanObject = (obj: any): any => {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            cleaned[key] = cleanObject(value);
          } else {
            cleaned[key] = value;
          }
        }
      }
      return cleaned;
    };
    
    // Process each medicine type
    ['suspension', 'caplets', 'granules'].forEach(type => {
      const medicines = medicinesData.medicines[type as keyof typeof medicinesData.medicines];
      
      medicines.forEach((medicine: any) => {
        // Clean undefined values - Firestore doesn't accept undefined
        const medicineDoc: any = {
          id: medicine.id.toString(),
          name: medicine.name,
          type: type as 'suspension' | 'caplets' | 'granules',
          targetAudience: medicine.targetAudience,
          activeIngredient: medicine.activeIngredient,
          hebName: medicine.hebName,
          entries: medicine.entries,
          aliases: medicine.aliases || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Only add optional fields if they exist and are not undefined
        if (medicine.concentration !== undefined && medicine.concentration !== null) {
          medicineDoc.concentration = medicine.concentration;
        }
        if (medicine.strength !== undefined && medicine.strength !== null) {
          medicineDoc.strength = medicine.strength;
        }
        
        // Clean the entire object to remove any nested undefined values
        const cleanedDoc = cleanObject(medicineDoc);
        
        allMedicines.push(cleanedDoc as MedicineDocument);
      });
    });
    
    // Add medicines to batch
    for (const medicine of allMedicines) {
      const docRef = doc(collection(db, 'medicines'), medicine.id);
      currentBatch.set(docRef, medicine);
      operationCount++;
      
      // If we reach 500 operations, commit this batch and start a new one
      if (operationCount === 500) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    }
    
    // Add the last batch if it has operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }
    
    // Commit all batches
    for (let i = 0; i < batches.length; i++) {
      console.log(`Committing batch ${i + 1} of ${batches.length}...`);
      await batches[i].commit();
    }
    
    // Create metadata document
    const metadataDoc = {
      defaultUnits: medicinesData.metadata.defaultUnits,
      activeIngredients: medicinesData.activeIngredients,
      targetAudience: {}, // Add if you have target audience data
      version: medicinesData.version,
      lastUpdated: medicinesData.lastUpdated,
      migratedAt: new Date()
    };
    
    await setDoc(doc(db, 'metadata', 'medicineMetadata'), metadataDoc);
    
    console.log(`Successfully migrated ${allMedicines.length} medicines to Firestore!`);
    console.log('Metadata document created successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Function to run the migration
export async function runMigration() {
  try {
    await migrateMedicinesToFirestore();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}