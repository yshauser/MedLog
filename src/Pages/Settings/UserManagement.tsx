//src/pages/Settings/UserManagement.tsx
import React, { useState } from 'react';
import { useAuth, User } from '../../Users/AuthContext';
import { Pencil, Trash } from 'lucide-react';
import UserFormDialog from '../../components/UserFormDialog';

export const UserManagement = () => {
  const { user, users, getUserFamily, removeUser: contextRemoveUser } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmDeleteUsername, setConfirmDeleteUsername] = useState<string | null>(null);

  if (!user) {
    return <div>גישה נדחתה</div>;
  }

  const getFilteredUsers = () => {
    if (user?.role === 'owner') {
      return users.filter(u =>
        (u.role === 'owner' || u.role === 'user') &&
        u.familyId === user.familyId
      );
    } else if (user?.role === 'user') {
      return users.filter(u =>
        u.role === 'user' && u.familyId === user.familyId && u.username === user.username
      );
    }
    return users;
  };

  const handleEdit = (userItem: User) => {
    setEditingUser(userItem);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteConfirm = async (username: string) => {
    try {
      await contextRemoveUser(username);
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
    setConfirmDeleteUsername(null);
  };

  const isEditable = (userItem: User) =>
    userItem.username !== 'admin' && userItem.username !== user.username;

  const showEmailColumn = user.role === 'admin';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl">ניהול משתמשים</h1>
        {user.role !== 'user' && (
          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            הוסף משתמש
          </button>
        )}
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {user.role === 'admin' && <th className="border p-2">משפחה</th>}
            <th className="border p-2">שם</th>
            <th className="border p-2">תפקיד</th>
            {showEmailColumn && <th className="border p-2">אימייל</th>}
            <th className="border p-2">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredUsers().map((userItem) => (
            <React.Fragment key={`user-${userItem.username}`}>
              <tr className="border">
                {user.role === 'admin' && (
                  <td className="border p-2">
                    {getUserFamily(userItem.username)?.name || 'N/A'}
                  </td>
                )}
                <td className="border p-2">{userItem.username}</td>
                <td className="border p-2">{userItem.role}</td>
                {showEmailColumn && (
                  <td className="border p-2 text-sm text-gray-600">
                    {userItem.email || '—'}
                  </td>
                )}
                <td className="border p-2">
                  {isEditable(userItem) ? (
                    <div className="flex w-full h-full justify-center items-center gap-4">
                      <button onClick={() => handleEdit(userItem)}>
                        <Pencil size={16} className="text-blue-500" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteUsername(userItem.username)}
                        className="hover:text-red-700"
                      >
                        <Trash size={16} className="text-red-500" />
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
              {confirmDeleteUsername === userItem.username && (
                <tr className="bg-red-50 border border-red-200">
                  <td colSpan={showEmailColumn ? (user.role === 'admin' ? 5 : 4) : (user.role === 'admin' ? 4 : 3)} className="p-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span>למחוק את <strong>{userItem.username}</strong>?</span>
                      <button
                        onClick={() => handleDeleteConfirm(userItem.username)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                      >
                        מחק
                      </button>
                      <button
                        onClick={() => setConfirmDeleteUsername(null)}
                        className="px-3 py-1 bg-gray-300 rounded text-xs"
                      >
                        ביטול
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {dialogOpen && (
        <UserFormDialog
          editingUser={editingUser}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
};

export default UserManagement;
