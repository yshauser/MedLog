import React, { useState, useEffect } from 'react';
import { useAuth } from '../Users/AuthContext';
import { getRegistrationRequests, approveRegistration, rejectRegistration } from '../services/registrationService';
import { RegistrationRequest } from '../types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

type TabType = 'pending' | 'approved' | 'rejected';

const RegistrationReview = () => {
  const { user, addUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRegistrationRequests(activeTab);
      setRequests(data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    } catch (err: any) {
      console.error('Error loading registration requests:', err);
      setError(err.message || 'שגיאה בטעינת בקשות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const handleApprove = async (requestId: string) => {
    if (!user) return;
    
    setProcessingId(requestId);
    setError('');
    try {
      await approveRegistration(requestId, user.username, addUser);
      await loadRequests();
    } catch (err: any) {
      console.error('Error approving registration:', err);
      setError(err.message || 'שגיאה באישור הבקשה');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user || !rejectionReason.trim()) {
      setError('יש להזין סיבת דחייה');
      return;
    }

    setProcessingId(requestId);
    setError('');
    try {
      await rejectRegistration(requestId, rejectionReason, user.username);
      setRejectingId(null);
      setRejectionReason('');
      await loadRequests();
    } catch (err: any) {
      console.error('Error rejecting registration:', err);
      setError(err.message || 'שגיאה בדחיית הבקשה');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'ממתין';
      case 'approved':
        return 'אושר';
      case 'rejected':
        return 'נדחה';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">בקשות הרשמה</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pending'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ממתינות ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'approved'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          אושרו
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'rejected'
              ? 'border-b-2 border-red-500 text-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          נדחו
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">טוען...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          אין בקשות {getStatusText(activeTab)}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(request.status)}
                    <h3 className="font-semibold text-lg">{request.username}</h3>
                    <span className="text-sm text-gray-500">
                      ({getStatusText(request.status)})
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <span className="font-medium">אימייל:</span> {request.email}
                    </div>
                    <div>
                      <span className="font-medium">משפחה:</span> {request.familyName}
                    </div>
                    <div>
                      <span className="font-medium">תאריך:</span> {formatDate(request.timestamp)}
                    </div>
                    {request.reviewedBy && (
                      <div>
                        <span className="font-medium">נבדק על ידי:</span> {request.reviewedBy}
                      </div>
                    )}
                  </div>

                  {request.notes && (
                    <div className="text-sm bg-gray-50 p-2 rounded mt-2">
                      <span className="font-medium">הערות:</span> {request.notes}
                    </div>
                  )}

                  {request.rejectionReason && (
                    <div className="text-sm bg-red-50 p-2 rounded mt-2 text-red-700">
                      <span className="font-medium">סיבת דחייה:</span> {request.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Actions for Pending Requests */}
                {request.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    {rejectingId === request.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="סיבת דחייה"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="p-2 border rounded text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                          >
                            {processingId === request.id ? 'מעבד...' : 'אשר דחייה'}
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason('');
                            }}
                            className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                          >
                            ביטול
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={processingId === request.id}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                        >
                          {processingId === request.id ? 'מאשר...' : 'אשר'}
                        </button>
                        <button
                          onClick={() => setRejectingId(request.id)}
                          disabled={processingId === request.id}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          דחה
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegistrationReview;
