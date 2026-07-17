export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface HealthPassportData {
  fullName: string;
  dob: string;
  bloodGroup: string;
  gender: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  allergies: string[];
  chronicConditions: string[];
  pastSurgeries: string;
  activeMedications: Medication[];
  primaryDoctorName: string;
  primaryDoctorPhone: string;
  insuranceProvider: string;
  insurancePolicyNum: string;
}
