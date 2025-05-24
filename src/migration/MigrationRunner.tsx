import React, { useState } from 'react';
import { runMigration } from './dataMigration'; // Adjust import path

const MigrationRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleMigration = async () => {
    setIsRunning(true);
    setStatus('Starting migration...');
    setError('');

    try {
      await runMigration();
      setStatus('Migration completed successfully! You can now remove this component.');
    } catch (err) {
      setError(`Migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatus('');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Firestore Data Migration</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          This will migrate your medicines.json data to Firestore. 
          Run this only once, then remove this component.
        </p>
      </div>

      {status && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
          <p className="text-blue-800">{status}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleMigration}
        disabled={isRunning}
        className={`w-full py-2 px-4 rounded font-medium ${
          isRunning
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isRunning ? 'Migrating...' : 'Start Migration'}
      </button>

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Warning:</strong> Make sure your Firestore rules allow writes before running this migration.</p>
      </div>
    </div>
  );
};

export default MigrationRunner;