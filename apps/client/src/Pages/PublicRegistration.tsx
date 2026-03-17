import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submitRegistration, checkUsernameAvailable } from '../services/registrationService';

const PublicRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    familyName: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'שם משתמש הוא שדה חובה';
    } else if (formData.username.length < 2 || formData.username.length > 20) {
      newErrors.username = 'שם משתמש חייב להיות בין 2-20 תווים';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'שם משתמש יכול להכיל רק אותיות באנגלית, מספרים וקו תחתון';
    } else {
      const available = await checkUsernameAvailable(formData.username);
      if (!available) {
        newErrors.username = 'שם משתמש כבר קיים במערכת';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }

    if (!formData.familyName.trim()) {
      newErrors.familyName = 'שם משפחה הוא שדה חובה';
    } else if (formData.familyName.length < 2 || formData.familyName.length > 50) {
      newErrors.familyName = 'שם משפחה חייב להיות בין 2-50 תווים';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitting(true);
    setErrors({});

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setSubmitting(false);
        return;
      }

      await submitRegistration(formData);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Registration submission error:', error);
      setErrors({ submit: error.message || 'שגיאה בשליחת הבקשה. נסה שוב.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">הבקשה נשלחה בהצלחה!</h2>
          <p className="text-gray-600 mb-6">
            תודה על ההרשמה. הבקשה שלך נשלחה למנהל המערכת לאישור.
            <br />
            תקבל הודעה לאימייל כאשר החשבון שלך יאושר.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">הרשמה למערכת MedLog</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">שם משתמש *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={`w-full p-2 border rounded ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="username"
              disabled={submitting}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">אימייל (Google) *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="example@gmail.com"
              disabled={submitting}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              האימייל ישמש לכניסה למערכת דרך Google Sign-In
            </p>
          </div>

          {/* Family Name */}
          <div>
            <label className="block text-sm font-medium mb-1">שם משפחה *</label>
            <input
              type="text"
              value={formData.familyName}
              onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
              className={`w-full p-2 border rounded ${errors.familyName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="משפחת כהן"
              disabled={submitting}
            />
            {errors.familyName && (
              <p className="text-red-500 text-sm mt-1">{errors.familyName}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">הערות (אופציונלי)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
              placeholder="מידע נוסף שתרצה לשתף..."
              disabled={submitting}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'שולח...' : 'שלח בקשה'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center text-sm text-gray-600">
          כבר יש לך חשבון?{' '}
          <Link to="/" className="text-blue-500 hover:underline">
            התחבר כאן
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicRegistration;
