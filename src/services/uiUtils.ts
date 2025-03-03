export class timeAndDateFormatter{
    static formatHourInput = (input: string) => {
        // Remove any non-digit characters
        const digits = input.replace(/\D/g, '');
        
        if (digits.length <= 2) {
        return digits;
        }

        // Format as HH:mm
        const hours = digits.slice(0, 2);
        const minutes = digits.slice(2, 4);
        return `${hours}:${minutes}`;
    };

    // Validate hour format
    static validateHourFormat = (hour: string) => {
        const [hours, minutes] = hour.split(':').map(Number);
        return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
    };

    // Convert date string to Date object for DatePicker
    static stringToDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(2000 + year, month - 1, day);
    };
    // Convert Date object to string format
    static dateToString = (date: Date | null) => {
        if (!date) return '';
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
    };

    static formatDateForUI = (dateStr: string): string => {
        if (!dateStr) return '';
        let date: Date;
        if (dateStr.includes('/')) {
          // If date is in DD/MM/YYYY format
          const [day, month, year] = dateStr.split('/');
          date = new Date(Number(year), Number(month) - 1, Number(day));
        } else {
          // If date is in other format
          date = new Date(dateStr);
        }
        // console.log ('in fd2ui', {dateStr,date});
        if (isNaN(date.getTime())) return '';
      
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
      
        return `${day}/${month}/${year}`;     
      };

      static  formatDateForCalc = (dateStr: string): string => {
        if (!dateStr) return '';
        let date: Date;
        if (dateStr.includes('/')) {
          // If date is in DD/MM/YYYY format
          const [day, month, year] = dateStr.split('/');
          date = new Date(Number(year), Number(month) - 1, Number(day));
        } else {
          // If date is in other format
          date = new Date(dateStr);
        }
        // console.log ('in fd2calc', {dateStr,date});
        if (isNaN(date.getTime())) return '';
        return date.toString();
      };
}