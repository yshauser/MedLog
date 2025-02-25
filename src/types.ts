export interface LogEntry {
  id: string;
  logDate: string;
  logHour: string;
  kidName: string;
  temperature: string;
  selectedMedicine: string;
  actualDosage: string;
}

export interface Kid {
  id: string;
  name: string;
  birthDate?: string;
  age?: number;
  weight?: number;
  favoriteMedicine?: string;
  lastUpdated: string;
}

export interface DailyTakes {
  date: string;
  takes: boolean[];  // Array of booleans representing each take
}
export interface TaskEntry {
  id: string;
  taskUser: string;
  taskLabel: string;
  taskStartDate: string;
  taskEndDate?: string;
  taskDays: number;
  timesPerDay: number;
  timeInDay: string; // can be time, can be breakfast/lunch/supper, can be morning, noon, evening,...
  dose: number;
  doseUnits?: string;
  medicine: string;
  withFood?:string;  // yes,no,irrelevant
  comment?:string;
  takesHistory?:DailyTakes[];
}



export type TreatmentType = 'סבב טיפול' | 'תרופה קבועה';
export type Frequency = 'יומי' | 'שבועי';

////////////////////////////
//// Medicines   ///////////
////////////////////////////
// Core medicine-related types
export enum MedicineType {
  Suspension = "suspension",
  Caplets = "caplets",
  Granules = "granules",
  // Suppository = "suppository"
}

export enum TargetAudience {
  Kids = "kids",
  Adults = "adults",
  All = "all",
}

// Basic medicine interfaces
export interface MedicineBase {
  id: string;
  name: string;
  type: MedicineType;
  targetAudience: string;
  activeIngredient: string;
  hebName: string;
  aliases?: {
    name: string;
    hebName: string;
    company: string;
  }[];
}

export interface SuspensionEntry {
  w_low: number;
  w_high: number;
  dos: number;
  perDay_low: number;
  perDay_high: number;
  maxDay: number;
  maxDayPerKg: number;
}

export interface CapletEntry {
  age_low: number;
  age_high?: number;
  dos_low: number;
  dos_high: number;
  hoursInterval_low: number;
  hoursInterval_high: number;
  maxDay: number;
}

export interface GranulesEntry {
  age_low: number;
  age_high?: number;
  dos_low: number;
  dos_high: number;
  hoursInterval_low: number;
  hoursInterval_high: number;
  maxDay: number;
}

export interface SuspensionMedicine extends MedicineBase {
  type: MedicineType.Suspension;
  concentration: string;
  entries: SuspensionEntry[];
}

export interface CapletMedicine extends MedicineBase {
  type: MedicineType.Caplets;
  strength: string;
  entries: CapletEntry[];
}

export interface GranulesMedicine extends MedicineBase {
  type: MedicineType.Granules;
  strength: string;
  entries: GranulesEntry[];
}

export type Medicine = SuspensionMedicine | CapletMedicine | GranulesMedicine;