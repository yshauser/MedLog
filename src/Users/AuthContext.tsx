import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import rawUsersData  from './users.json';
// import { parseDate } from 'react-datepicker/dist/date_utils';

interface UserData {
  username: string;
  role: 'owner' | 'admin' | 'user';
}
interface User extends UserData{
  familyId: string;
}
interface FamilyData {
  id: string;
  name: string;
  ownerId: string; //username of the owner (TBD change to list)
  users: UserData[];
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
  login: (username: string) => {success: boolean, message?: string};
  logout: () => void;
  addUser: (user: Omit<User, 'familyId'> & {familyId?: string, familyName?: string}) => void;
  getUserFamily: (username: string) => Family | undefined;
  getCurrentUserFamily: () => Family | undefined;
  removeUser: (username: string) => Promise<void>;
}

// Validate and type the imported data
const validateRole = (role: string): role is UserData['role'] => {
  return ['owner', 'admin', 'user'].includes(role);
};

const validateUserData = (user: any): user is UserData => {
  return (
    typeof user === 'object' &&
    typeof user.username === 'string' &&
    typeof user.role === 'string' &&
    validateRole(user.role)
  );
};

const validateFamilyData = (family: any): family is FamilyData => {
  return (
    typeof family === 'object' &&
    typeof family.id === 'string' &&
    typeof family.name === 'string' &&
    typeof family.ownerId === 'string' &&
    Array.isArray(family.users) &&
    (!family.users || (Array.isArray(family.users) && family.users.every(validateUserData)))
  );
};


  const parsedData = typeof rawUsersData === 'string' ? JSON.parse(rawUsersData) : rawUsersData;
  const usersData: FamilyData[] = parsedData?.families && Array.isArray(parsedData.families)
    ? parsedData.families.filter(validateFamilyData)
    : [];
  console.log ('Auto load users', {rawUsersData, usersData, parsedData});
  

const processInitialData = (data: FamilyData[]) => {
  console.log ('processInitialData', {data});
  const processedFamilies: Family[] = [];
  const processedUsers: User[] = [];

  data.forEach((family) => {
    // Add family
    processedFamilies.push({
      id: family.id,
      name: family.name,
      ownerId: family.ownerId
    });

    // Add users with their family ID
    if (Array.isArray(family.users)){
      family.users.forEach((user) => {
        processedUsers.push({
          ...user,
          familyId: family.id
        });
      });
    }
  });

  return { families: processedFamilies, users: processedUsers };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);

  useEffect(()=> {
    if (!initialized){
      try {
          const {families: processedFamilies, users: processedUsers} = processInitialData(usersData);
          setFamilies(processedFamilies);
          setUsers(processedUsers);

          // Store the processed data
          localStorage.setItem('familyData', JSON.stringify({
            families: processedFamilies,
            users: processedUsers
          }));
          console.log ('initialized', {processedFamilies, processedUsers});

        // Try to restore last logged in user
        const lastUser = localStorage.getItem('lastUser');
        if (lastUser) {
          setUser(JSON.parse(lastUser));
        }

        setInitialized(true);
      }catch (error){
        console.error('Error initializing data:', error);
        // Fallback to empty state
        setFamilies([]);
        setUsers([]);
        setInitialized(true);
      }
    }
  },[initialized]);

  // Save changes to localStorage
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('familyData', JSON.stringify({ families, users }));
          // const saveUsers = async () => {
          //   await saveToFile(families, users);
          //   console.log ('users page use effect save users', {families, users});
          // };
          // saveUsers().catch(error => console.error('Error in useEffect save users:', error));
    }
  }, [families, users, initialized]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lastUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('lastUser');
    }
  }, [user]);
  
  const getUserFamily = (username: string) => {
    const userRecord = users.find(u => u.username === username);
    // console.log ('getUserFamily', {username, userRecord})
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

  const login = (username: string): {success: boolean, message?:string} => {
    // Find user by username
    const foundUser = users.find(u => u.username === username);
    
    if (foundUser) {
      setUser(foundUser);
      return {success:true};
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
    console.log ('Auth addUser start', {newUser})
    // Prevent duplicate usernames
    if (users.some(u => u.username === newUser.username)) {
      return;
    };

    let familyId = newUser.familyId;
    let updatedFamilies = [...families];
    console.log ('Auth addUser family data', {familyId, updatedFamilies})

    // If current user is owner, associate new user with owner's family
    if (user?.role === 'owner') {
      familyId = user.familyId;
      console.log ('user is owner - set family id same as of the user');
    } 
    // If admin is creating a user and specified a new family name
    else if (user?.role === 'admin' && newUser.familyName && !familyId) {
      console.log ('admin adds user' );
      const newFamilyId = Date.now().toString();
      const newFamily: Family = {
        id: newFamilyId,
        name: newUser.familyName,
        ownerId: newUser.role === 'owner' ? newUser.username : ''
      };
      updatedFamilies = [...families, newFamily];
      console.log ('admin creates family', {newFamily, updatedFamilies});
      setFamilies(updatedFamilies);
      familyId = newFamilyId;
    }

    if (familyId) {
      const userToAdd: User = {
        username: newUser.username,
        role: newUser.role,
        familyId: familyId
      };

      // If this user is an owner and we're creating a new family, update the family's ownerId
      if (newUser.role === 'owner' && newUser.familyName) {
        updatedFamilies = updatedFamilies.map(f => {
          if (f.id === familyId) {
            return { ...f, ownerId: newUser.username };
          }
          return f;
        });
        console.log ('owner creates family', {updatedFamilies});
        setFamilies(updatedFamilies);
      }
      
      const updatedUsers = [...users, userToAdd];
      setUsers([...users, userToAdd]);
      console.log ('auth addUser end', {families, updatedFamilies, updatedUsers});
      try{
        await saveToFile(updatedFamilies, updatedUsers);
      }catch (error){
        setUsers(users); //rollback on error
        throw error;
      }
    }
  };

  const saveToFile = async (families: Family[], users: User[] ) => {
   console.log ('in save to file', {families, users});
    try {
      // Build FamilyData structure
      const familyData: FamilyData[] = families.map((family) => ({
        id: family.id,
        name: family.name,
        ownerId: family.ownerId,
        users: users
          .filter(user => user.familyId === family.id)
          .map(user => ({
            username: user.username,
            role: user.role
        })), // Attach only matching users
      }));
      console.log("Formatted FamilyData:", familyData);


      const response = await fetch('/api/saveToJsonFile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'users',
          // data: familyData.flat(),
          data: familyData,
          type: 'users'
      }),
      });
      if (!response.ok) throw new Error('Failed to save user data');
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };
  
  const removeUser = async (username: string) => {
    const updatedUsers = users.filter(u => u.username !== username);
    setUsers(updatedUsers);
    
    try {
      await saveToFile( families, updatedUsers );
    } catch (error) {
      console.error('Error removing user:', error);
      // Rollback on error
      setUsers(users);
      throw error;
    }
  };

  if (!initialized) {
    return null; // Or a loading spinner
  }
  // console.log ('auth ', {user, users, families})
  return (
    <AuthContext.Provider value={{
      user, users, families,
      login, logout, addUser, getUserFamily, getCurrentUserFamily, removeUser
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
