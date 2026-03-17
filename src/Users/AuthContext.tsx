import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getDocs, collection, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

interface UserData {
  username: string;
  role: 'owner' | 'admin' | 'user';
}
export interface User extends UserData {
  familyId: string;
  kidOrder: string[] | undefined;
  email?: string;
  authProvider?: 'google' | 'test';
}
export interface Family {
  id: string;
  name: string;
  ownerId: string; //username of the owner (TBD change to list)
}

interface AuthContextType {
  user: User | null;
  users: User[];
  families: Family[];
  login: (username: string) => { success: boolean, message?: string };
  loginWithGoogle: () => Promise<{ success: boolean, message?: string }>;
  logout: () => Promise<void>;
  addUser: (user: Omit<User, 'familyId'> & { familyId?: string, familyName?: string }) => Promise<void>;
  updateUser: (username: string, fields: Partial<Pick<User, 'email' | 'role' | 'familyId'>>) => Promise<void>;
  getUserFamily: (username: string) => Family | undefined;
  getCurrentUserFamily: () => Family | undefined;
  removeUser: (username: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load families from Firestore
        const familiesSnapshot = await getDocs(collection(db, 'families'));
        const familiesData: Family[] = familiesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          ownerId: doc.data().ownerId
        }));

        // Load users from Firestore
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData: User[] = usersSnapshot.docs.map(doc => ({
          username: doc.data().username,
          role: doc.data().role,
          familyId: doc.data().familyId,
          kidOrder: doc.data().kidOrder as string[] | undefined,
          email: doc.data().email as string | undefined,
          authProvider: doc.data().authProvider as 'google' | 'test' | undefined
        }));

        // Check if "Admin Family" exists
        let adminFamilyId = '';
        const adminFamily = familiesData.find(f => f.name === "Admin Family");
        if (!adminFamily) {
          // Create "Admin Family" if it doesn't exist
          adminFamilyId = 'admin-family'; // Fixed ID for default family
          const adminFamilyRef = doc(db, 'families', adminFamilyId);
          await setDoc(adminFamilyRef, {
            name: "Admin Family",
            ownerId: 'admin' // The admin user will be the owner
          });
          familiesData.push({ id: adminFamilyId, name: "Admin Family", ownerId: 'admin' });
        } else {
          adminFamilyId = adminFamily.id;
        }

        // Check if "admin" user exists
        const adminUser = usersData.find(u => u.username === 'admin');
        if (!adminUser) {
          // Create "admin" user if it doesn't exist (requires auth — will be retried on first Google login)
          // No-op here: admin doc will be created on first authenticated write
        }

        setFamilies(familiesData);
        setUsers(usersData);

        setInitialized(true);
      } catch (error) {
        console.error('Error loading data from Firestore:', error);
        setFamilies([]);
        setUsers([]);
        setInitialized(true);
      }
    };

    loadData();
  }, []);

  // Ref to hold the latest usersData for use inside onAuthStateChanged closure
  const [loadedUsersRef, setLoadedUsersRef] = React.useState<User[]>([]);

  useEffect(() => {
    setLoadedUsersRef(users);
  }, [users]);

  useEffect(() => {
    // Restore test user session from localStorage (Google users are handled by onAuthStateChanged)
    const lastUser = localStorage.getItem('lastUser');
    if (lastUser) {
      try {
        const storedUser = JSON.parse(lastUser);
        if (storedUser.authProvider !== 'google') {
          const userStillExists = users.some(u => u.username === storedUser.username);
          if (userStillExists) {
            const freshUserData = users.find(u => u.username === storedUser.username);
            setUser(freshUserData || null);
          } else {
            localStorage.removeItem('lastUser');
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('lastUser');
      }
    }
  // Only run once after users are first loaded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser?.email) {
        // Look up by email in current users list
        const matched = loadedUsersRef.find(u => u.email === firebaseUser.email);
        if (matched) {
          setUser(matched);
        }
        // If not matched yet, onAuthStateChanged may fire before loadData finishes;
        // the initialized effect above will handle it on re-load.
      }
    });
    return () => unsubscribe();
  }, [loadedUsersRef]);

  useEffect(() => {
    if (user) {
      // Only persist test users to localStorage; Google users are restored via onAuthStateChanged
      if (user.authProvider !== 'google') {
        localStorage.setItem('lastUser', JSON.stringify(user));
      }
    } else {
      localStorage.removeItem('lastUser');
    }
  }, [user]);

  const getUserFamily = (username: string) => {
    const userRecord = users.find(u => u.username === username);
    if (userRecord) {
      const family = families.find(f => f.id === userRecord.familyId);
      return (family);
    }
    return undefined;
  };

  const getCurrentUserFamily = () => {
    if (user) {
      return families.find(f => f.id === user.familyId);
    }
    return undefined;
  };

  const login = (username: string): { success: boolean, message?: string } => {
    // Find user by username (test users only — Google users use loginWithGoogle)
    const foundUser = users.find(u => u.username === username);

    if (foundUser) {
      setUser(foundUser);
      return { success: true };
    }

    return {
      success: false,
      message: 'משתמש לא נמצא'
    };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean, message?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      // Try to match by email in current users list
      let matched = users.find(u => u.email === email);

      // If admin has no email yet, patch it now (we are authenticated)
      if (!matched) {
        const adminCandidate = users.find(u => u.username === 'admin' && !u.email);
        if (adminCandidate && email === 'yshauser@gmail.com') {
          const adminUserRef = doc(db, 'users', 'admin');
          await setDoc(adminUserRef, { email: 'yshauser@gmail.com', authProvider: 'google' }, { merge: true });
          const patched: User = { ...adminCandidate, email: 'yshauser@gmail.com', authProvider: 'google' };
          setUsers(prev => prev.map(u => u.username === 'admin' ? patched : u));
          matched = patched;
        }
      }

      if (matched) {
        setUser(matched);
        return { success: true };
      }
      // Signed in to Google but no matching app user
      await signOut(auth);
      return { success: false, message: `החשבון ${email} אינו רשום. פנה למנהל.` };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return { success: false, message: error.message || 'כניסה עם Google נכשלה' };
    }
  };

  const logout = async () => {
    if (user?.authProvider === 'google') {
      try { await signOut(auth); } catch (e) { console.error('signOut error', e); }
    }
    setUser(null);
  };

  const addUser = async (newUser: Omit<User, 'familyId'> & { familyId?: string, familyName?: string }) => {
    console.log('Auth addUser start', { newUser });
    // Prevent duplicate usernames
    if (users.some(u => u.username === newUser.username)) {
      return;
    };

    let familyId = newUser.familyId;
    let updatedFamilies = [...families];
    console.log('Auth addUser family data', { familyId, updatedFamilies })

    // If current user is owner, associate new user with owner's family
    if (user?.role === 'owner') {
      familyId = user.familyId;
      console.log('user is owner - set family id same as of the user');
    }
    // If admin is creating a user and specified a new family name
    else if (user?.role === 'admin' && newUser.familyName && !familyId) {
      console.log('admin adds user');
      const newFamilyId = Date.now().toString();
      const newFamily: Family = {
        id: newFamilyId,
        name: newUser.familyName,
        ownerId: newUser.username // The new user will be the owner
      };
      
      // Add family to Firestore
      const familyRef = doc(db, 'families', newFamilyId);
      await setDoc(familyRef, newFamily);

      updatedFamilies = [...families, newFamily];
      console.log('admin creates family', { newFamily, updatedFamilies });
      setFamilies(updatedFamilies);
      familyId = newFamilyId;
    }

    if (familyId) {
      const userToAdd: User = {
        username: newUser.username,
        role: newUser.role,
        familyId: familyId,
        kidOrder: [],
        email: newUser.email,
        authProvider: newUser.email ? 'google' : 'test'
      };

      // If this user is an owner and we're creating a new family, update the family's ownerId
      if (newUser.role === 'owner' && newUser.familyName) {
        updatedFamilies = updatedFamilies.map(f => {
          if (f.id === familyId) {
            return { ...f, ownerId: newUser.username };
          }
          return f;
        });
        console.log('owner creates family', { updatedFamilies });
        setFamilies(updatedFamilies);
      }

      // Add user to Firestore
      const userRef = doc(db, 'users', newUser.username);
      await setDoc(userRef, userToAdd);

      // Update local state
      setUsers([...users, userToAdd]);
      setFamilies(updatedFamilies);
      console.log('auth addUser end', { families, updatedFamilies, users });
    }
  };

  const updateUser = async (username: string, fields: Partial<Pick<User, 'email' | 'role' | 'familyId'>>) => {
    const userRef = doc(db, 'users', username);
    const updateData: Record<string, any> = {};
    if (fields.email !== undefined) {
      updateData.email = fields.email;
      updateData.authProvider = fields.email ? 'google' : 'test';
    }
    if (fields.role !== undefined) updateData.role = fields.role;
    if (fields.familyId !== undefined) updateData.familyId = fields.familyId;

    await setDoc(userRef, updateData, { merge: true });

    // If role changed to owner, update family.ownerId
    if (fields.role === 'owner' && fields.familyId) {
      const familyRef = doc(db, 'families', fields.familyId);
      await setDoc(familyRef, { ownerId: username }, { merge: true });
      setFamilies(prev => prev.map(f => f.id === fields.familyId ? { ...f, ownerId: username } : f));
    }

    setUsers(prev => prev.map(u => {
      if (u.username !== username) return u;
      const updated = { ...u, ...fields };
      if (fields.email !== undefined) {
        updated.authProvider = fields.email ? 'google' : 'test';
      }
      return updated;
    }));
  };

  const removeUser = async (username: string) => {
    try {
      // Delete user from Firestore
      const userRef = doc(db, 'users', username);
      await deleteDoc(userRef);

      // Update local state
      const updatedUsers = users.filter(u => u.username !== username);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  if (!initialized) {
    return null; // Or a loading spinner
  }
  // console.log ('auth ', {user, users, families})
  return (
    <AuthContext.Provider value={{
      user, users, families,
      login, loginWithGoogle, logout, addUser, updateUser, getUserFamily, getCurrentUserFamily, removeUser,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
