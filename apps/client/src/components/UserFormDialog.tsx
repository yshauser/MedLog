import React, { useState, useEffect } from 'react';
import { useAuth, User, Family } from '../Users/AuthContext';

interface Props {
  editingUser?: User | null;
  onClose: () => void;
}

const UserFormDialog = ({ editingUser, onClose }: Props) => {
  const { user: currentUser, users, families, addUser, updateUser } = useAuth();
  const isEdit = !!editingUser;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user' as User['role'],
    familyId: '',
    familyName: '',
  });
  const [showNewFamilyInput, setShowNewFamilyInput] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        username: editingUser.username,
        email: editingUser.email || '',
        role: editingUser.role,
        familyId: editingUser.familyId || '',
        familyName: '',
      });
    } else {
      setFormData({ username: '', email: '', role: 'user', familyId: '', familyName: '' });
    }
    setShowNewFamilyInput(false);
    setError('');
  }, [editingUser]);

  const getAvailableRoles = (): User['role'][] => {
    if (currentUser?.role === 'owner') return ['owner', 'user'];
    if (showNewFamilyInput) return ['owner'];
    return ['owner', 'admin', 'user'];
  };

  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      setError('שם משתמש הוא שדה חובה');
      return;
    }
    if (!isEdit && users.some(u => u.username === formData.username)) {
      setError('שם משתמש כבר קיים');
      return;
    }
    if (!isEdit && currentUser?.role === 'admin' && !showNewFamilyInput && !formData.familyId) {
      setError('יש לבחור משפחה');
      return;
    }

    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await updateUser(formData.username, {
          email: formData.email.trim() || undefined,
          role: formData.role,
          familyId: formData.familyId || undefined,
        });
      } else {
        await addUser({
          username: formData.username,
          role: formData.role,
          email: formData.email.trim() || undefined,
          familyId: showNewFamilyInput ? undefined : formData.familyId,
          familyName: showNewFamilyInput ? formData.familyName : undefined,
          kidOrder: undefined,
        });
      }
      onClose();
    } catch (err: any) {
      console.error('UserFormDialog save error:', err);
      setError(err.message || 'שמירה נכשלה');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? 'עריכת משתמש' : 'הוספת משתמש'}
        </h2>

        {/* Username */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="שם משתמש"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            disabled={isEdit}
            className="w-full p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <input
            type="email"
            placeholder="אימייל (Google, אופציונלי)"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Role */}
        <div className="mb-3">
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
            className="w-full p-2 border rounded"
          >
            {getAvailableRoles().map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Family — admin only */}
        {currentUser?.role === 'admin' && (
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="newFamilyCheck"
                checked={showNewFamilyInput}
                onChange={(e) => setShowNewFamilyInput(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="newFamilyCheck">משפחה חדשה</label>
            </div>
            {showNewFamilyInput ? (
              <input
                type="text"
                placeholder="שם משפחה חדש"
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                className="w-full p-2 border rounded"
              />
            ) : (
              <select
                value={formData.familyId}
                onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">בחר משפחה</option>
                {families.map((family: Family) => (
                  <option key={family.id} value={family.id}>{family.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {saving ? 'שומר...' : isEdit ? 'שמור' : 'הוסף'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormDialog;
