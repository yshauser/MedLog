import { Kid } from '../types.ts';
interface KidData {
  [key: string]: string | number | undefined;
}
interface UpdateStatus {
  color: string;
  isOutdated: boolean;
}

export class KidManager {
  static async loadKids(): Promise<Kid[]> {
    try {
      const response = await fetch('/db/kids.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load kids file. Status: ${response.status}`);
      }

      const data: Omit<Kid, 'age'>[] = await response.json();
      console.log ('kid manager load ', {data});

      return data.map(kid => ({
        ...kid,
        age: kid.birthDate ? calculateAge(kid.birthDate) : undefined,
      }));

    } catch (error) {
      console.error('Error loading kids:', error);
      return [];
    }
  }

  static checkLastUpdatedStatus(age: number | undefined, lastUpdated: string | undefined): UpdateStatus {
    if (!age ) {
      return { color: 'text-gray-500', isOutdated: false };
    }
    if (!lastUpdated) {
      return { color: 'text-red-500', isOutdated: true };
    }

    // Convert from dd/mm/yyyy to yyyy-mm-dd for correct Date parsing
    const [day, month, year] = lastUpdated.split('/');
    const lastUpdateDate = new Date(`${year}-${month}-${day}`); // yyyy-mm-dd format
    const today = new Date();
    const monthsSinceUpdate = (today.getFullYear() - lastUpdateDate.getFullYear()) * 12 + 
      (today.getMonth() - lastUpdateDate.getMonth());

     const isOutdated = 
      age > 3 ? monthsSinceUpdate >= 12 : // One year for kids over 3
      age > 1 ? monthsSinceUpdate >= 6 : // Half year for kids between 1 and 3
                monthsSinceUpdate >= 1;  // every month for kids under 1
    // console.log ('LastUpdated Status', {isOutdated, age, monthsSinceUpdate, lastUpdated, lastUpdateDate});
    return {
      color: isOutdated ? 'text-red-500' : 'text-gray-500',
      isOutdated
    };
  }
}

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const [day, month, year] = birthDate.split('/').map((part) => parseInt(part));
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  const monthsAfterBirthday = (today.getMonth() - birth.getMonth() + 12) % 12;
  let roundedAge = age;
  if (age >= 2) {
    if (monthsAfterBirthday >= 9) {
      roundedAge = age + 1;
    } else if (monthsAfterBirthday == 0){
      if (day > today.getDate()){
        roundedAge = age+1;
      }
      else {
        roundedAge = age;
      }
    } else if (monthsAfterBirthday <= 3) {
      roundedAge = age;
    } else {
      roundedAge = age + 0.5;
    }
  } else if (age < 2) {
    roundedAge = monthsAfterBirthday;
  }
  // console.log ('calculateAge', {birthDate, age, roundedAge, monthsAfterBirthday})
  return roundedAge;
};

export const updateDateYearTo4digits = (date: string):string =>{
  if (!date) {throw new Error ("Invalid date format");}

  const [day, month, year] = date.split("/"); // Assume date format is DD/MM/YY or DD/MM/YYYY
  if (!day || !month || !year) {throw new Error("Invalid date format");}

  const currentYear = new Date().getFullYear(); // Get the current year as a 4-digit number
  const currentYearLast2Digits = currentYear % 100; // Get the last 2 digits of the current year

  let updatedYear: string;

  if (year.length === 4) {
    updatedYear = year; // If year already has 4 digits, return it as is
  } else if (year.length === 2) {
    const yearNumber = parseInt(year, 10); // Convert the year string to a number
    updatedYear = yearNumber > currentYearLast2Digits ? `19${year}` : `20${year}`;
  } else {
    throw new Error('Invalid year format'); // Handle invalid input (not 2 or 4 digits)
  }
  return `${day}/${month}/${updatedYear}`;
}
