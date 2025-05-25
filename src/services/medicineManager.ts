import {SuspensionMedicine, CapletMedicine, GranulesMedicine, Medicine} from '../types';
import { getMedicines, getCollection } from './firestoreService';

interface DefaultUnits {
  suspension: string;
  caplets: string;
  granules: string;
  weight: string;
  age: string;
}

interface Metadata {
  defaultUnits: DefaultUnits;
}

interface Alias {
  name: string;
  hebName: string;
  company: string;
}

// Active ingredient related interfaces
interface DailyDose {
  adult: string;
  pediatric: string;
}

interface ActiveIngredient {
  alternativeNames: string[];
  category: string;
  maxDailyDose: DailyDose;
}

interface TargetAudience {
  audience: string;
}

// Main data structure interfaces
interface MedicinesData {
  suspension: SuspensionMedicine[];
  caplets: CapletMedicine[];
  granules: GranulesMedicine[];
}

interface MedicineDataFile {
  version: string;
  lastUpdated: string;
  metadata: Metadata;
  medicines: MedicinesData;
  activeIngredients: Record<string, ActiveIngredient>;
  targetAudience: Record<string, TargetAudience>;
}

// Medicine group for UI organization
export interface MedicineGroup {
  name: string;
  data: Medicine[];
}

export class MedicineManager {
  private static medicineGroups: MedicineGroup[] = [];
  private static activeIngredients: Record<string, ActiveIngredient> = {};
  private static targetAudience: Record<string, TargetAudience> = {};
  private static metadata: Metadata | null = null;

  static async initialize(): Promise<void> {
    try {
      // Get medicines from Firestore
      const medicines = await getMedicines();
      
      // Get metadata document from Firestore
      const metadataCollection = await getCollection<any>('metadata');
      const metadataDoc = metadataCollection.find(doc => doc.id === 'medicineMetadata');
      
      if (metadataDoc) {
        this.metadata = metadataDoc.defaultUnits ? { defaultUnits: metadataDoc.defaultUnits } : null;
        this.activeIngredients = metadataDoc.activeIngredients || {};
        this.targetAudience = metadataDoc.targetAudience || {};
      }
      
      console.log('MedicineManager from Firestore', { medicines, metadata: this.metadata });

      // Group medicines by type
      const suspensionMeds = medicines.filter(med => med.type === 'suspension');
      const capletMeds = medicines.filter(med => med.type === 'caplets');
      const granuleMeds = medicines.filter(med => med.type === 'granules');
      
      // Initialize medicine groups
      this.medicineGroups = [
        ...suspensionMeds.map(med => ({
          name: med.hebName,
          data: [med]
        })),
        ...capletMeds.map(med => ({
          name: med.hebName,
          data: [med]
        })),
        ...granuleMeds.map(med => ({
          name: med.hebName,
          data: [med]
        }))
      ];
    } catch (error) {
      console.error('Failed to load medicines data:', error);
      throw error;
    }
  }

  static getMedicineGroups(): MedicineGroup[] {
    return this.medicineGroups;
  }

  static getActiveIngredients(): Record<string, ActiveIngredient> {
    return this.activeIngredients;
  }

  static getTargetAudience(): Record<string, TargetAudience> {
    return this.targetAudience;
  }

  static getMetadata(): Metadata | null {
    return this.metadata;
  }

  static findMedicineByName(name: string): Medicine | undefined {
    for (const group of this.medicineGroups) {
      if (group.name === name && group.data.length > 0) {
        return group.data[0];
      }
    }
    return undefined;
  }

  static findMedicinesByActiveIngredient(ingredient: string): Medicine[] {
    return this.medicineGroups
      .flatMap(group => group.data)
      .filter(medicine => medicine.activeIngredient === ingredient);
  }

  static findMedicinesByTargetAudience (audience: string): MedicineGroup[] {
    console.log ('in targetAudience', {audience});
    if (audience === 'kids') {audience = 'ילדים'} else if (audience === 'adults'){audience = 'מבוגרים'}
    const requested = this.medicineGroups.filter(group => group.data.some(medicine => medicine.targetAudience === audience));
    const all = this.medicineGroups.filter(group => group.data.some(medicine => medicine.targetAudience === 'כולם'));
    console.log ('after targetAudience', {requested,all});
    return [...requested, ...all];
  }

  static findMedicinesGroupsByType(type: string): MedicineGroup[] {
    console.log ('in find by type', {type});
    return this.medicineGroups.filter(group => group.data.some(med => med.type === type));
  }

  static calculateDosage(medicineName: string, kidWeight: number | undefined, kidAge: number | undefined): string {
    const medicineGroup = this.medicineGroups.find(group => group.name === medicineName);

    if (medicineGroup) {
      const medicine = medicineGroup.data[0];
      if (!medicine) return '';

      if (medicine.type === 'suspension') {
        const entry = medicine.entries.find(
          e => (kidWeight as number) >= e.w_low && (kidWeight as number) <= e.w_high
        );
        if (entry?.dos) {
          return `${entry.dos} מ"ל`;
        }
        return 'תרופה לא תואמת גיל/משקל';
      } else if (medicine.type === 'caplets') {
        const entry = medicine.entries.find(
          e => (kidAge as number) >= e.age_low && (!e.age_high || (kidAge as number) <= e.age_high)
        );
        if (entry?.dos_low) {
          if (!entry.dos_high || entry.dos_high === entry.dos_low) {
            return `${entry.dos_low} קפליות`;
          }
          return `${entry.dos_low}-${entry.dos_high} קפליות`;
        }
        return 'תרופה לא תואמת גיל/משקל';
      } else if (medicine.type === 'granules') {
        const entry = medicine.entries.find(
          e => (kidAge as number) >= e.age_low && (!e.age_high || (kidAge as number) <= e.age_high)
        );
        if (entry?.dos_low) {
          if (!entry.dos_high || entry.dos_high === entry.dos_low) {
            return `${entry.dos_low} אריזת גרנולות`;
          }
          return `${entry.dos_low}-${entry.dos_high} אריזות גרנולות`;
        }
        return 'תרופה לא תואמת גיל/משקל';
      }    }
    return '';
  }

  static hasEqualValues(data: Medicine[], key1: string, key2: string): boolean {
    if (data.length === 0) return false;

    const firstItem = data[0];

    if (firstItem.type === "suspension") {
      return data.every(item => {
        const suspensionItem = item as SuspensionMedicine;

        if (key1 === "w_low" && key2 === "w_high") {
          return suspensionItem.entries.every(entry => entry[key1] === entry[key2]);
        }

        if (key1 === "perDay_low" && key2 === "perDay_high") {
          return suspensionItem.entries.every(entry => entry[key1] === entry[key2]);
        }

        return true;
      });
    } else if (firstItem.type === "caplets") {
      return data.every(item => {
        const capletItem = item as CapletMedicine;

        if (key1 === "dos_low" && key2 === "dos_high") {
          return capletItem.entries.every(entry => entry[key1] === entry[key2]);
        }

        return true;
      });
    } else if (firstItem.type === "granules") {
      return data.every(item => {
        const granulesItem = item as GranulesMedicine;

        if (key1 === "dos_low" && key2 === "dos_high") {
          return granulesItem.entries.every(entry => entry[key1] === entry[key2]);
        }

        return true;
      });
    }

    return false;
  }
}
