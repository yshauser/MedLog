import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getDocs, collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface UserData {
  username: string;
  role: 'owner' | 'admin' | 'user';
}
interface User extends UserData {
  familyId: string;
  kidOrder: string[] | undefined;
}
interface Family {
  id: string;
  name: string;
  ownerId: string; //username of the owner (TBD change to list)
}

interface AuthContextType {
  user: User | null;
  users: User[];
  families: Family[];
  login: (username: string) => { success: boolean, message?: string };
  logout: () => void;
  addUser: (user: Omit<User, 'familyId'> & { familyId?: string, familyName?: string }) => Promise<void>;
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
          kidOrder: doc.data().kidOrder as string[] | undefined // Include kidOrder
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
          // Create "admin" user if it doesn't exist
          const adminUserRef = doc(db, 'users', 'admin');
          await setDoc(adminUserRef, {
            username: 'admin',
            role: 'admin',
            familyId: adminFamilyId,
            kidOrder: [] // Initialize kidOrder for admin
          });
          usersData.push({ username: 'admin', role: 'admin', familyId: adminFamilyId, kidOrder: [] });
        }

        setFamilies(familiesData);
        setUsers(usersData);

        // Try to restore last logged in user
        const lastUser = localStorage.getItem('lastUser');
        // console.log ('loading from local storage', localStorage.getItem('lastUser'), localStorage);
        if (lastUser) {
          try {
            const storedUser = JSON.parse(lastUser);
            // Check if user still exists in the loaded users data from Firebase
            const userStillExists = usersData.some(u => u.username === storedUser.username);
            if (userStillExists) {
              // Get the fresh user data from Firebase
              const freshUserData = usersData.find(u => u.username === storedUser.username);
              setUser(freshUserData || null);
            } else {
              // User no longer exists in Firebase, clear localStorage
              localStorage.removeItem('lastUser');
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('lastUser');
          }
      }

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

  useEffect(() => {
    if (user) {
      localStorage.setItem('lastUser', JSON.stringify(user));
      // console.log ('localStorage', localStorage.getItem('lastUser'), localStorage, user);
    } else {
      // console.log ('clearing last user', {user})
      const lastUser = localStorage.getItem('lastUser');
      // console.log ('loading from local storage', localStorage.getItem('lastUser'), localStorage);
      if (lastUser) {
        try {
          const storedUser = JSON.parse(lastUser);
          // Check if user still exists in the loaded users data from Firebase
            setUser(storedUser || null);
            // User no longer exists in Firebase, clear localStorage
            console.log ('clearing 2 last user')
            localStorage.removeItem('lastUser');

        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('lastUser');
        }
    }
      // localStorage.removeItem('lastUser');
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
    // Find user by username
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

  const logout = () => {
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
        kidOrder: [] // Initialize kidOrder for new users
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

  return (
    <AuthContext.Provider value={{
      user, users, families,
      login, logout, addUser, getUserFamily, getCurrentUserFamily, removeUser,
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
