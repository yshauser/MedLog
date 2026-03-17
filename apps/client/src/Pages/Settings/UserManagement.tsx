//src/pages/Settings/UserManagement.tsx
import React, { useState } from 'react';
import { useAuth, User } from '../../Users/AuthContext';
import { Pencil, Trash } from 'lucide-react';
import UserFormDialog from '../../components/UserFormDialog';
import RegistrationReview from '../../components/RegistrationReview';

type TabType = 'users' | 'registrations';

export const UserManagement = () => {
  const { user, users, getUserFamily, removeUser: contextRemoveUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('users');
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
    <div className="p-3">
      <h1 className="text-xl mb-4">ניהול משתמשים</h1>

      {/* Tabs - only show for admin */}
      {user.role === 'admin' && (
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            משתמשים
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'registrations'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            בקשות הרשמה
          </button>
        </div>
      )}

      {/* Registration Requests Tab */}
      {activeTab === 'registrations' && user.role === 'admin' ? (
        <RegistrationReview />
      ) : (
        <>
          {/* Users Tab */}
          <div className="flex items-center justify-between mb-4">
            {user.role !== 'user' && (
              <button
                onClick={handleAdd}
                className="bg-blue-500 text-white px-4 py-2 rounded ml-auto"
              >
                הוסף משתמש
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-emerald-50">
            {user.role === 'admin' && <th className="border p-1.5 whitespace-nowrap">משפחה</th>}
            <th className="border p-1.5 whitespace-nowrap">שם</th>
            <th className="border p-1.5 whitespace-nowrap">תפקיד</th>
            {showEmailColumn && <th className="border p-1.5 whitespace-nowrap">אימייל</th>}
            <th className="border p-1.5 whitespace-nowrap">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredUsers().map((userItem) => (
            <React.Fragment key={`user-${userItem.username}`}>
              <tr className="border">
                {user.role === 'admin' && (
                  <td className="border p-1.5 whitespace-nowrap">
                    {getUserFamily(userItem.username)?.name || 'N/A'}
                  </td>
                )}
                <td className="border p-1.5 whitespace-nowrap">{userItem.username}</td>
                <td className="border p-1.5 whitespace-nowrap">{userItem.role}</td>
                {showEmailColumn && (
                  <td className="border p-1.5 max-w-[120px] truncate text-xs text-gray-600" title={userItem.email || ''}>
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
      </div>

          {dialogOpen && (
            <UserFormDialog
              editingUser={editingUser}
              onClose={handleCloseDialog}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UserManagement;
