import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

export interface PlannerData {
  // Starting location (from home page)
  startingLocation: LocationData | null;
  
  // From planner screen
  location: LocationData | null; // Destination
  fromDate: Date | null;
  toDate: Date | null;
  numberOfPersons: string;
  
  // From budget screen
  budgetRange: string;
  travelStyles: string[];
  accommodationPreference: string;
}

interface PlannerContextType {
  plannerData: PlannerData;
  updatePlannerData: (data: Partial<PlannerData>) => void;
  resetPlannerData: () => void;
  savePlannerData: () => Promise<void>;
  loadPlannerData: () => Promise<void>;
}

const PLANNER_DATA_KEY = '@planner_data';

const defaultPlannerData: PlannerData = {
  startingLocation: null,
  location: null,
  fromDate: null,
  toDate: null,
  numberOfPersons: '', // Empty string, not 'single', so it shows as unselected
  budgetRange: '',
  travelStyles: [],
  accommodationPreference: '',
};

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [plannerData, setPlannerData] = useState<PlannerData>(defaultPlannerData);

  const updatePlannerData = (data: Partial<PlannerData>) => {
    setPlannerData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const resetPlannerData = () => {
    setPlannerData(defaultPlannerData);
    AsyncStorage.removeItem(PLANNER_DATA_KEY);
  };

  const savePlannerData = async () => {
    try {
      // Convert dates to ISO strings for storage
      const dataToSave = {
        ...plannerData,
        fromDate: plannerData.fromDate ? plannerData.fromDate.toISOString() : null,
        toDate: plannerData.toDate ? plannerData.toDate.toISOString() : null,
      };
      await AsyncStorage.setItem(PLANNER_DATA_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving planner data:', error);
    }
  };

  const loadPlannerData = async () => {
    try {
      const stored = await AsyncStorage.getItem(PLANNER_DATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.fromDate) {
          parsed.fromDate = new Date(parsed.fromDate);
        }
        if (parsed.toDate) {
          parsed.toDate = new Date(parsed.toDate);
        }
        setPlannerData(parsed);
      }
    } catch (error) {
      console.error('Error loading planner data:', error);
    }
  };

  return (
    <PlannerContext.Provider
      value={{
        plannerData,
        updatePlannerData,
        resetPlannerData,
        savePlannerData,
        loadPlannerData,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
}

