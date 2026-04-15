import { 
  collection, 
  getDocs, 
  getDocsFromCache,
  doc, 
  getDoc,
  setDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Kid, LogEntry, Medicine, TaskEntry } from '../types';

// Recursively remove undefined fields so Firestore doesn't reject them
const stripUndefined = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    ) as T;
  }
  return obj;
};

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
    const familyDoc = await getDoc(doc(db, 'families', familyId));
    if (familyDoc.exists()) {
      return familyDoc.data().name as string;
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
    const clean = stripUndefined(data);
    if (clean.id) {
      docRef = doc(db, collectionName, clean.id);
      await setDoc(docRef, clean);
      return clean.id;
    } else {
      docRef = await addDoc(collection(db, collectionName), clean);
      return docRef.id;
    }
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to update a document in a collection.
// Uses setDoc with merge:true instead of updateDoc because updateDoc
// can hang offline when the document isn't in the local cache.
export const updateDocument = async <T>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, stripUndefined(data), { merge: true });
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

// Function to update multiple documents individually.
// Uses individual setDoc calls instead of writeBatch.commit() because
// batch commits do not resolve offline (they wait for server ack),
// while individual setDoc calls resolve immediately from local cache.
export const batchUpdate = async <T extends { id: string }>(
  collectionName: string,
  documents: T[]
): Promise<void> => {
  try {
    await Promise.all(
      documents.map((document) => {
        const docRef = doc(db, collectionName, document.id);
        return setDoc(docRef, stripUndefined(document));
      })
    );
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

export const getTasksByFamily = async (familyId: string): Promise<TaskEntry[]> => {
  try {
    const q = query(collection(db, 'tasks'), where('familyId', '==', familyId));
    const querySnapshot = await getDocs(q);
    const tasks: TaskEntry[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as TaskEntry);
    });
    return tasks;
  } catch (error) {
    console.error('Error getting tasks by family:', error);
    throw error;
  }
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

export const getLogsFromCache = async (): Promise<LogEntry[]> => {
  try {
    const querySnapshot = await getDocsFromCache(collection(db, 'logs'));
    const data: LogEntry[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as LogEntry);
    });
    return data;
  } catch (error) {
    console.error('Error getting logs from cache:', error);
    return [];
  }
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
    await setDoc(userRef, { kidOrder }, { merge: true });
  } catch (error) {
    console.error('Error updating user kid order:', error);
    throw error;
  }
};
