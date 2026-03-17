import { collection, addDoc, getDocs, doc, updateDoc, query, where, Timestamp, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { RegistrationRequest } from '../types';
import { User, Family } from '../Users/AuthContext';

export const submitRegistration = async (data: {
  username: string;
  email: string;
  familyName: string;
  notes?: string;
}): Promise<void> => {
  const registrationData = {
    username: data.username.trim(),
    email: data.email.trim(),
    familyName: data.familyName.trim(),
    notes: data.notes?.trim() || '',
    status: 'pending' as const,
    timestamp: serverTimestamp(),
  };

  await addDoc(collection(db, 'registration_requests'), registrationData);
};

export const getRegistrationRequests = async (
  status?: 'pending' | 'approved' | 'rejected'
): Promise<RegistrationRequest[]> => {
  let q = query(collection(db, 'registration_requests'));
  
  if (status) {
    q = query(collection(db, 'registration_requests'), where('status', '==', status));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate() || new Date(),
    reviewedAt: doc.data().reviewedAt?.toDate(),
  })) as RegistrationRequest[];
};

export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const userDoc = await getDoc(doc(db, 'users', username));
  return !userDoc.exists();
};

export const approveRegistration = async (
  requestId: string,
  adminUsername: string,
  addUserFn: (user: Omit<User, 'familyId'> & { familyId?: string; familyName?: string }) => Promise<void>
): Promise<void> => {
  const requestDoc = await getDoc(doc(db, 'registration_requests', requestId));
  
  if (!requestDoc.exists()) {
    throw new Error('Registration request not found');
  }

  const requestData = requestDoc.data();
  
  const isAvailable = await checkUsernameAvailable(requestData.username);
  if (!isAvailable) {
    throw new Error('Username is no longer available');
  }

  await addUserFn({
    username: requestData.username,
    email: requestData.email,
    role: 'owner',
    familyName: requestData.familyName,
    kidOrder: undefined,
  });

  await updateDoc(doc(db, 'registration_requests', requestId), {
    status: 'approved',
    reviewedBy: adminUsername,
    reviewedAt: Timestamp.now(),
  });
};

export const rejectRegistration = async (
  requestId: string,
  reason: string,
  adminUsername: string
): Promise<void> => {
  await updateDoc(doc(db, 'registration_requests', requestId), {
    status: 'rejected',
    rejectionReason: reason,
    reviewedBy: adminUsername,
    reviewedAt: Timestamp.now(),
  });
};
