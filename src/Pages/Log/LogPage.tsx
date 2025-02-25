import React, { useState, useMemo, useEffect } from 'react';
import { Trash2, Edit2, CheckCircle, XCircle, ArrowUpDown, Download, Upload, Save, FileX } from 'lucide-react';
import { LogManager } from '../../services/logManager';
import { LogEntry } from '../../types';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { timeAndDateFormatter } from '../../services/uiUtils';

interface LogPageProps {
  logData: LogEntry[];
  setLogData: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

export const LogPage: React.FC<LogPageProps> = ({ logData, setLogData }) => {
  const [filters, setFilters] = useState({ date: '', name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedEntry, setEditedEntry] = useState<LogEntry | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loadOption, setLoadOption] = useState('week'); // Default to week

  // Initial load of logs
    useEffect(() => {
      const fetchLogs = async () => {
        const loadedLogs = await LogManager.loadLogs();
        console.log ('Page-Logs use effect loaded logs', {loadedLogs, logData});
          // Combine existing logData with loadedLogs and remove duplicates based on 'id'
          const combinedLogsMap = new Map();
          [...logData, ...loadedLogs].forEach(log => combinedLogsMap.set(log.id, log));
          const combinedLogs = Array.from(combinedLogsMap.values());
          const filteredData = filterLogsByDate(combinedLogs, loadOption);
          setLogData(filteredData);
          
          const nameExists = filteredData.some(entry => entry.kidName === filters.name);
          if (!nameExists) {setFilters(prev => ({...prev, name: ''}));} // name: '' appears in the UI with the label הכל
        console.log ('Page-Logs use effect loaded filtered logs', {loadOption,filteredData});
      };
      fetchLogs().catch(error => console.error('Error in useEffect fetchLogs:', error));
    }, [loadOption]);

  // Sort and filter the data
  const sortedAndFilteredData = useMemo(() => {
    let filteredData = [...logData].filter(entry => {
      const dateMatch = !filters.date || entry.logDate.includes(filters.date);
      // const nameMatch = !filters.name || entry.kidName.toLowerCase().includes(filters.name.toLowerCase());
      const nameMatch = !filters.name || entry.kidName === filters.name;
      return dateMatch && nameMatch;
    });
    // console.log ('in sortedAndFilteredData', filteredData);
    return filteredData.sort((a, b) => {
      const dateA = new Date(`20${a.logDate.split('/').reverse().join('/')} ${a.logHour}`);
      const dateB = new Date(`20${b.logDate.split('/').reverse().join('/')} ${b.logHour}`);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });
  }, [logData, filters, sortOrder]);

  const filterLogsByDate = (logs: LogEntry[], option: string) => {
    const now = new Date();
    const getDateFromLog = (log: LogEntry) => {
      const [day, month, year] = log.logDate.split('/');
      const [hours, minutes] = log.logHour.split(':');
      return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    };

    return logs.filter(log => {
      const logDate = getDateFromLog(log);
      const diffHours = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);
      switch (option) {
        case '24h': return diffHours <= 24;
        case '48h': return diffHours <= 48;
        case 'week':return diffHours <= 168; // 7 days * 24 hours
        case 'all': return true;
        default:    return true;
      }
    });
  };

  // delete entry from table in page
  const handleDelete = (id: string) => {
      console.log ('Log delete', {logData});
      LogManager.deleteLog(id);
      setLogData(prevData =>prevData.filter(entry => entry.id !== id));
      
  };

  // edit entry from table in page
  const handleEdit = (id: string) => {
    console.log ('Log edit', logData);
    const entryToEdit = logData.find(entry => entry.id === id);
    if (entryToEdit) {
      setEditingId(id);
      setEditedEntry({ ...entryToEdit });
    }
  };

  // save changes of table's entry in page
  const handleSave = async (id: string) => {
    console.log ('Log save', logData);
    if (!editedEntry) return;

    // Validate hour format
    if (!timeAndDateFormatter.validateHourFormat(editedEntry.logHour)) {
      alert('שעה לא תקינה. אנא הזן שעה בפורמט תקין (לדוגמה: 09:30)');
      return;
    }
    // save update with all entries to file, 
    // but update to presentation (setLogData) only the loaded table
    const loadedLogs = await LogManager.loadLogs();
    const updatedLogs = loadedLogs.map(entry => entry.id === id ? { ...editedEntry, id } : entry);
    setLogData(logData.map(entry => entry.id === id ? { ...editedEntry, id } : entry)); 
    console.log ('Log save editedEntry', {updatedLogs});
    try {
      await LogManager.saveLogs(updatedLogs); // Persist data to file
      setEditingId(null);
      setEditedEntry(null);
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  // revert changes of table's entry in page
  const handleCancel = () => {
    console.log ('Log cancel', logData);
    setEditingId(null);
    setEditedEntry(null);
  };

  const handleExport = () => {
    console.log ('Log export', logData);
    LogManager.exportLog(logData);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Handle hour input change with automatic formatting
  const handleHourChange = (value: string) => {
    const formattedHour = timeAndDateFormatter.formatHourInput(value);
    setEditedEntry((prev: LogEntry|null) => prev ? { ...prev, logHour: formattedHour } : null);
  };
  
  // Handle date change with null check
  const handleDateChange = (date: Date | null) => {
    setEditedEntry((prev: LogEntry | null) => {
      if (!prev) return null;
      return {
        ...prev,
        logDate: date ? timeAndDateFormatter.dateToString(date) : prev.logDate
      };
    });
  };

  return (
    <main className="flex-1 flex flex-col p-5 bg-white overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-emerald-600 mb-6 text-center">יומן</h1>
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            <Download size={20} />
            יצא לקובץ
          </button>
      </div>

      {/* Filters */}
      <div className="mb-4 justify-center items-center flex gap-4">
        <label className="ml-2">
          הצג: 
          <select value={loadOption} 
            className="p-2 border rounded text-right mr-2"
            onChange={(e) => setLoadOption(e.target.value)}
            >
            <option value="all">הכל</option>
            <option value="week">שבוע</option>
            <option value="24h">24 שעות</option>
            <option value="48h">48 שעות</option>
          </select>
        </label>
        <label className="ml-2">
          סנן לפי שם:
          <select
            className="p-2 border rounded text-right mr-2"
            value={filters.name}
            onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
            >
            <option value="">הכל</option>
            {Array.from(new Set(logData.map(entry => entry.kidName))) // Extract unique names
              .map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
            ))}
          </select>
        </label>

      </div>

      {sortedAndFilteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">
                  <div className="flex items-center justify-center gap-2">
                    תאריך ושעה
                    <button onClick={toggleSortOrder} className="hover:text-emerald-600">
                      <ArrowUpDown size={16} />
                    </button>
                  </div>
                </th>
                <th className="border border-gray-300 p-2">שם</th>
                <th className="border border-gray-300 p-2">חום</th>
                <th className="border border-gray-300 p-2">תרופה</th>
                <th className="border border-gray-300 p-2">מינון</th>
                <th className="border border-gray-300 p-2">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredData.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  {editingId === entry.id ? (
                    // Edit mode row
                    <>
                      <td className="border border-gray-300 p-2">
                        <div className="flex gap-2">
                          {/* <input
                            type="text"
                            className="p-1 border rounded w-24 text-right"
                            value={editedEntry?.logDate}
                            onChange={e => setEditedEntry(prev => prev ? { ...prev, logDate: e.target.value } : null)}
                          /> */}
                          <DatePicker
                            selected = {timeAndDateFormatter.stringToDate(editedEntry?.logDate || '')}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yy"
                            className="p-1 border rounded w-24 text-right"
                            />
                          <input
                            type="text"
                            className="p-1 border rounded w-16 text-right"
                            value={editedEntry?.logHour}
                            // onChange={e => setEditedEntry(prev => prev ? { ...prev, logHour: e.target.value } : null)}
                            onChange={e => handleHourChange(e.target.value)}
                            placeholder='HH:mm'
                          />
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="p-1 border rounded w-full text-right"
                          value={editedEntry?.kidName}
                          onChange={e => setEditedEntry(prev => prev ? { ...prev, kidName: e.target.value } : null)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="p-1 border rounded w-full text-right"
                          value={editedEntry?.temperature}
                          onChange={e => setEditedEntry(prev => prev ? { ...prev, temperature: e.target.value } : null)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="p-1 border rounded w-full text-right"
                          value={editedEntry?.selectedMedicine}
                          onChange={e => setEditedEntry(prev => prev ? { ...prev, selectedMedicine: e.target.value } : null)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="p-1 border rounded w-full text-right"
                          value={editedEntry?.actualDosage}
                          onChange={e => setEditedEntry(prev => prev ? { ...prev, actualDosage: e.target.value } : null)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleSave(entry.id)} className="text-emerald-600 hover:text-emerald-700">
                            <CheckCircle size={20} />
                          </button>
                          <button onClick={handleCancel} className="text-red-600 hover:text-red-700">
                            <XCircle size={20} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View mode row
                    <>
                      <td className="border border-gray-300 p-2 text-center">{entry.logDate} {entry.logHour}</td>
                      <td className="border border-gray-300 p-2 text-center">{entry.kidName}</td>
                      <td className="border border-gray-300 p-2 text-center">{entry.temperature}</td>
                      <td className="border border-gray-300 p-2 text-center">{entry.selectedMedicine}</td>
                      <td className="border border-gray-300 p-2 text-center">{entry.actualDosage}</td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(entry.id)} className="text-blue-600 hover:text-blue-700">
                            <Edit2 size={20} />
                          </button>
                          <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500">לא נמצאו רשומות</div>
      )}
    </main>
  );
};

export default LogPage; 