//src/pages/Settings/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { useAuth} from '../../Users/AuthContext';
import { Pencil, Trash } from 'lucide-react';


interface User {
  familyId?: string;
  username: string;
  role: 'owner' | 'admin' | 'user';
}


export const UserManagement = () => {
  const { user, users, families, addUser: contextAddUser, getUserFamily, removeUser: contextRemoveUser } = useAuth();
  const [newUser, setNewUser] = useState({ username: '', role: 'user', familyId: '', familyName: '' });
  const [showNewFamilyInput, setShowNewFamilyInput] = useState(false);
  const authContext = useAuth();

  // console.log("Auth Context:", authContext);
  // console.log ('user management', {user, users, families});

  // if (!user || (user.role !== 'admin'&& user.role !== 'owner' )) {
  if (!user ) {
    console.log ('users table', {user})
    return <div>גישה נדחתה</div>;
  }

  useEffect(() => {
    const availableRoles = getAvailableRoles();
    if (!availableRoles.includes(newUser.role)) {
      setNewUser({ ...newUser, role: availableRoles[0] }); // Set to the first available role
    }
  }, [showNewFamilyInput]); // Runs when showNewFamilyInput changes

  // Function to get available roles based on current user's role
  const getAvailableRoles = () => {
    if (user.role === 'owner') {
      return ['owner', 'user'];
    }
    if (showNewFamilyInput){
      return ['owner'];
    }
    return ['owner', 'admin', 'user'];
  };

  // Filter displayed users based on current user's role
  const getFilteredUsers = () => {
    if (user.role === 'owner') {
      // console.log ('getFilteredUsers - owner',{user},users.filter(u => 
      //   (u.role === 'owner' || u.role === 'user') &&u.familyId === user.familyId) );
      return users.filter(u => 
        (u.role === 'owner' || u.role === 'user') &&
        u.familyId === user.familyId
      );
    } else if (user.role === 'user') {
      return users.filter(u => 
        u.role === 'user' && u.familyId === user.familyId && u.username === user.username
      );
    }
    // console.log ('getFilteredUsers - else',{user, users} );
    return users;
  };

  const addUser = () => {
    // console.log ('UM add user', {newUser});
    if (!newUser.username.trim()) return;
    
    const userToAdd = { 
      username: newUser.username, 
      role: newUser.role as 'owner' | 'admin' | 'user',
      familyId: showNewFamilyInput ? undefined : newUser.familyId,
      familyName: showNewFamilyInput ? newUser.familyName : undefined
    };
    // console.log ('UM userToAdd', {userToAdd, families, showNewFamilyInput})

    contextAddUser(userToAdd);
    setNewUser({ username: '', role: 'user' , familyId: '', familyName: ''}); // Reset input
    setShowNewFamilyInput (false);
  };



  const removeUser = async (username: string) => {
    try {
      await contextRemoveUser(username);
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  };

  const updateUserRole = (id: number, role: 'owner' | 'admin' | 'user') => {
    // setUsers(users.map(user => user.id === id ? { ...user, role } : user));
    // setEditingUser(null);
  };

  return (
    <div className="p-6">
      {user.role != 'user' && (
          <>
        <h1 className="text-2xl mb-4">ניהול משתמשים</h1>
        <div className="space-y-2 mb-2">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="שם משתמש"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full p-2 border rounded"
                />
            </div>
            <div className="flex-1">
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                className="w-full p-2 border rounded"
                >
                {getAvailableRoles().map(role => (
                  <option key={`role-${role}`} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
          {user.role === 'admin' && (
            <>
              <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="checkbox"
                  checked={showNewFamilyInput}
                  onChange={(e) => setShowNewFamilyInput(e.target.checked)}
                  className="mr-2"
                  />
                  <label className="mr-2">משפחה חדשה</label>
                </div>
              {showNewFamilyInput ? (
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="שם משפחה חדש"
                    value={newUser.familyName}
                    onChange={(e) => setNewUser({ ...newUser, familyName: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <select
                    value={newUser.familyId}
                    onChange={(e) => setNewUser({ ...newUser, familyId: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">בחר משפחה</option>
                    {families.map(family => (
                      <option key={`family-${family.id}`} value={family.id}>
                        {family.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </>
          )}
        </div>
        <div className="flex justify-end space-x-2 mb-3">
          <button
            onClick={addUser} 
            className="bg-blue-500 text-white p-2"
            disabled={!newUser.username || (user.role === 'admin' && !showNewFamilyInput && !newUser.familyId)}
            >הוסף</button>
        </div>
      </> 
      )} 


      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {user.role === 'admin' && <th className="border p-2">משפחה</th>} 
            <th className="border p-2">שם</th>
            <th className="border p-2">תפקיד</th>
            <th className="border p-2">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredUsers().map((userItem) => (
            <tr key={`user-${userItem.username}`} className="border">
              {user.role === 'admin' && (
                <td className="border p-2">
                  {getUserFamily(userItem.username)?.name || 'N/A'}
                </td>
              )}
              <td className="border p-2">{userItem.username}</td>
              <td className="border p-2">{userItem.role}</td>
              {userItem.username !== 'admin' && userItem.username !== user.username && (
              <td className="border p-2">
                <div className="flex w-full h-full justify-center items-center gap-4 ">
                  <button onClick={() => console.log('Edit functionality to be implemented')}>
                    <Pencil size={16} className="text-blue-500" />
                  </button>
                  <button onClick={() => removeUser(userItem.username)}//console.log('Remove functionality to be implemented')
                  className="hover:text-red-700"
                  >
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
