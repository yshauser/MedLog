import React, { useState, useEffect } from 'react';
import { TaskEntry, DailyTakes } from '../../types';
import { timeAndDateFormatter } from '../../services/uiUtils';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarCheck, X } from 'lucide-react';
import './TaskCalendar.css';

interface DailyTakesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    timesPerDay: number;
    existingTakes?:boolean[];
    onConfirm: (takes: boolean[]) => void;
  }
  
const DailyTakesDialog: React.FC<DailyTakesDialogProps> = ({
    isOpen,
    onClose,
    timesPerDay,
    existingTakes,
    onConfirm,
    }) => {
    
        const [checkedTakes, setCheckedTakes] = useState<boolean[]>(existingTakes||new Array(timesPerDay).fill(false));
  
        useEffect (() => {
            if (existingTakes){
                setCheckedTakes(existingTakes);
            }else{
                setCheckedTakes(new Array(timesPerDay).fill(false));
            }
        },[existingTakes,timesPerDay]);


    if (!isOpen) return null;
  
    const handleCheckboxChange = (index: number) => {
      const newCheckedTakes = [...checkedTakes];
      newCheckedTakes[index] = !newCheckedTakes[index];
      setCheckedTakes(newCheckedTakes);
    };
  
    const handleConfirm = () => {
      onConfirm(checkedTakes);
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">נטילה יומית</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-3">
            {Array.from({ length: timesPerDay }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">נטילה {index + 1}</span>
                <input
                  type="checkbox"
                  checked={checkedTakes[index]}
                  onChange={() => handleCheckboxChange(index)}
                  className="h-5 w-5 text-blue-600"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              אישור
            </button>
          </div>
        </div>
      </div>
    );
  };


interface CalendarProps {
  task: TaskEntry;
  onClose: () => void;
  onUpdateTask: (taskId: string, updatedData: Partial<TaskEntry>) => Promise<void>;
}
// interface DateTakesMap {
//     [key: string]: number;
// }

const TaskCalendar: React.FC<CalendarProps> = ({ task, onClose, onUpdateTask }) => {
//   const [selectedDates, setSelectedDates] = useState<string[]>([]);
//   const [selectedDates, setSelectedDates] = useState<DateTakesMap>({});
  const [takesHistory, setTakesHistory] = useState<DailyTakes[]>(task.takesHistory||[]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');

  const startDate = new Date(timeAndDateFormatter.formatDateForCalc(task.taskStartDate));
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (task.taskDays)); // Subtract 1 to include start date
    // console.log ('start/end', startDate,endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

    const getTakesFromDate = (dateStr: string): boolean[] | undefined => {
        const dayRecord = takesHistory.find(record => record.date === dateStr);
        return dayRecord?.takes;
    }

    const handleDateClick = (arg: { date: Date; dateStr: string }) => {
        const clickedDate = new Date(arg.dateStr);
        clickedDate.setHours(0, 0, 0, 0);

        // Prevent selecting future dates or  dates outside the valid range
        if (clickedDate > today || clickedDate < startDate || clickedDate > endDate) {
            return;
        }

        if (task.timesPerDay > 1) {
            setCurrentDate(arg.dateStr);
            setIsDialogOpen(true);
        } else {
            // Toggle single take for dates with timesPerDay = 1
            const existingTakesIndex = takesHistory.findIndex(record => record.date === arg.dateStr);
            const newTakesHistory = [...takesHistory];
            if (existingTakesIndex >= 0){
                newTakesHistory.splice(existingTakesIndex, 1);
            }else{
                newTakesHistory.push({
                    date: arg.dateStr,
                    takes: [true]
                });
            }
            setTakesHistory(newTakesHistory);
            saveTakesHistory(newTakesHistory);
        }
    };

    const handleDialogConfirm = async (takes: boolean[]) => {
        const newTakesHistory = [...takesHistory];
        const existingTakesIndex = newTakesHistory.findIndex(record => record.date === currentDate);

        if (takes.some(take => take)){
            if (existingTakesIndex >=0){
                newTakesHistory[existingTakesIndex] = {date: currentDate, takes};
            }else{
                newTakesHistory.push({date: currentDate, takes});
            }
        } else if (existingTakesIndex >=0) {
            newTakesHistory.splice(existingTakesIndex, 1);
        }
        setTakesHistory(newTakesHistory);
        await saveTakesHistory(newTakesHistory);
    };

    const saveTakesHistory = async (newTakesHistory: DailyTakes[]) => {
        try {
            await onUpdateTask(task.id, {
              ...task,
              takesHistory: newTakesHistory
            });
        } catch (error) {
            console.error('Error saving takes history:', error);
            // Optionally add error handling UI
        }
    };

    // Create a function to style disabled dates
    const dayCellClassNames = (arg: { date: Date }) => {
        const cellDate = new Date(arg.date);
        cellDate.setHours(0, 0, 0, 0);
        // Add classes for date validation
        const classes: string[] = [];
        if (cellDate > today) {
            classes.push('future-date-disabled');
        }
        if (cellDate < startDate || cellDate > endDate) {
            classes.push('out-of-range-disabled');
        }

        return classes.join(' ');
    };

    const renderEventContent = (eventInfo: any) => {
        const takes = getTakesFromDate(eventInfo.event.startStr);
        if (!takes) return null;
        return (
          <div className="flex items-center justify-center gap-1">
            {takes.map((take, index) => (
              take ? <CalendarCheck key={index} size={16} className="text-green-500" />:null
            ))}
          </div>
        );
    };

  const events = takesHistory.map(({date,takes}) => ({
    date,
    takes,
    display: takes.some(take => take) ? 'auto' : 'background',
    backgroundColor: takes.some(take => take) ? 'transparent' :' #e2e8f0'
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">בחר תאריך</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"          >
            סגור
          </button>
        </div>
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            selectable={true}
            selectConstraint={{
              start: startDate,
              end: Math.min(endDate.getTime(), today.getTime())
            }}
            validRange={{
              start: startDate,
              end: endDate
            }}
            dateClick={handleDateClick}
            events={events}
            eventContent={renderEventContent}
            // headerToolbar={{
            //   left: 'prev,next today',
            //   center: 'title',
            //   right: ''
            // }}
            height="auto"
            dayCellClassNames={dayCellClassNames}
          />
        </div>
      </div>
      <DailyTakesDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        timesPerDay={task.timesPerDay}
        existingTakes={getTakesFromDate(currentDate)}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
};

export default TaskCalendar;