import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  updateDoc,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Kid, LogEntry, Medicine, TaskEntry } from '../types';

// Generic function to get all documents from a collection
export const getCollection = async <T>(collectionName: string): Promise<T[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });
    return data;
  } catch (error) {
    console.error(`Error getting ${collectionName} collection:`, error);
    throw error;
  }
};

export const getFamilyNameByFamilyId = async (familyId: string): Promise<string | undefined> => {
  try {
    const q = query(collection(db, 'families'), where('id', '==', familyId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming family name is stored in a field called 'name'
      return querySnapshot.docs[0].data().name as string;
    } else {
      console.log(`No family found with id: ${familyId}`);
      return undefined;
    }
  } catch (error) {
    console.error('Error getting family name by familyId:', error);
    throw error;
  }
};

// Generic function to add a document to a collection
export const addDocument = async <T extends { id?: string }>(
  collectionName: string,
  data: T
): Promise<string> => {
  try {
    // If the document has an ID, use it, otherwise let Firestore generate one
    let docRef;
    if (data.id) {
      docRef = doc(db, collectionName, data.id);
      await setDoc(docRef, data);
      return data.id;
    } else {
      docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    }
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to update a document in a collection
export const updateDocument = async <T>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data as any);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to delete a document from a collection
export const deleteDocument = async (
  collectionName: string, 
  id: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

// Function to update multiple documents in a batch
export const batchUpdate = async <T extends { id: string }>(
  collectionName: string,
  documents: T[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    documents.forEach((document) => {
      const docRef = doc(db, collectionName, document.id);
      batch.set(docRef, document);
    });
    
    await batch.commit();
  } catch (error) {
    console.error(`Error batch updating documents in ${collectionName}:`, error);
    throw error;
  }
};

// Specific functions for each collection
export const getKids = async (): Promise<Kid[]> => {
  return getCollection<Kid>('kids');
};

export const getKidsByFamily = async (familyId: string): Promise<Kid[]> => {
  try {
    const q = query(collection(db, 'kids'), where('familyId', '==', familyId));
    const querySnapshot = await getDocs(q);
    const kids: Kid[] = [];
    querySnapshot.forEach((doc) => {
      kids.push({ id: doc.id, ...doc.data() } as Kid);
    });
    return kids;
  } catch (error) {
    console.error('Error getting kids by family:', error);
    throw error;
  }
};



export const addKid = async (kid: Kid): Promise<string> => {
  console.log ('addKid', {kid});
  return addDocument<Kid>('kids', kid);
};

export const updateKid = async (id: string, data: Partial<Kid>): Promise<void> => {
  console.log ('updateKid', {id, data});
  return updateDocument<Kid>('kids', id, data);
};

export const deleteKid = async (id: string): Promise<void> => {
  console.log ('deleteKid', {id});
  return deleteDocument('kids', id);
};

export const updateKidsOrder = async (kids: Kid[]): Promise<void> => {
  return batchUpdate<Kid>('kids', kids);
};

export const getMedicines = async (): Promise<Medicine[]> => {
  return getCollection<Medicine>('medicines');
};

export const addMedicine = async (medicine: Medicine): Promise<string> => {
  return addDocument<Medicine>('medicines', medicine);
};

export const updateMedicine = async (id: string, data: Partial<Medicine>): Promise<void> => {
  return updateDocument<Medicine>('medicines', id, data);
};

export const deleteMedicine = async (id: string): Promise<void> => {
  return deleteDocument('medicines', id);
};

export const getTasks = async (): Promise<TaskEntry[]> => {
  return getCollection<TaskEntry>('tasks');
};

export const addTask = async (task: TaskEntry): Promise<string> => {
  return addDocument<TaskEntry>('tasks', task);
};

export const updateTask = async (id: string, data: Partial<TaskEntry>): Promise<void> => {
  return updateDocument<TaskEntry>('tasks', id, data);
};

export const deleteTask = async (id: string): Promise<void> => {
  return deleteDocument('tasks', id);
};

export const getLogs = async (): Promise<LogEntry[]> => {
  return getCollection<LogEntry>('logs');
};

export const addLog = async (log: LogEntry): Promise<string> => {
  return addDocument<LogEntry>('logs', log);
};

export const updateLog = async (id: string, data: Partial<LogEntry>): Promise<void> => {
  return updateDocument<LogEntry>('logs', id, data);
};

export const deleteLog = async (id: string): Promise<void> => {
  return deleteDocument('logs', id);
};

export const updateUserKidOrder = async (userId: string, kidOrder: string[]): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { kidOrder });
  } catch (error) {
    console.error('Error updating user kid order:', error);
    throw error;
  }
};
