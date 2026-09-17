export interface Contact {
  resourceName: string;
  names?: { displayName: string }[];
  emailAddresses?: { value: string }[];
  phoneNumbers?: { value: string }[];
}

export interface EmergencyEvent {
  id: string;
  timestamp: string;
  actions: string[];
  location?: string;
}

export interface UserProfile {
  fullName: string;
  phone: string;
  address: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  medications: string;
  height?: string;
  weight?: string;
  dailySteps?: string;
  stepHistory?: { day: string; steps: number }[];
}
