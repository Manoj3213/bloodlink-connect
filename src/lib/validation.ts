import { BLOOD_GROUPS, type BloodGroup } from '../types';

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 72) return 'Password must be less than 72 characters';
  return null;
}

export function validateName(name: string): string | null {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 100) return 'Name must be less than 100 characters';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return null; // Optional field
  const phoneRegex = /^[\d\s\-+()]{7,20}$/;
  if (!phoneRegex.test(phone)) return 'Invalid phone number format';
  return null;
}

export function validateBloodGroup(bloodGroup: string): string | null {
  if (!bloodGroup) return 'Blood group is required';
  if (!BLOOD_GROUPS.includes(bloodGroup as BloodGroup)) {
    return 'Invalid blood group';
  }
  return null;
}

export function validateCity(city: string): string | null {
  if (!city || !city.trim()) return 'City is required';
  if (city.trim().length < 2) return 'City must be at least 2 characters';
  if (city.trim().length > 100) return 'City must be less than 100 characters';
  return null;
}

export function validateAge(age: number): string | null {
  if (age < 18) return 'You must be at least 18 years old';
  if (age > 65) return 'Maximum age is 65 years';
  return null;
}

export function validateWeight(weight: number): string | null {
  if (weight < 50) return 'Weight must be at least 50kg to donate blood';
  if (weight > 300) return 'Please enter a valid weight';
  return null;
}

export function validateUnitsRequired(units: number): string | null {
  if (!units || units < 1) return 'At least 1 unit is required';
  if (units > 20) return 'Maximum 20 units allowed per request';
  return null;
}

export function validateHospitalName(name: string): string | null {
  if (!name || !name.trim()) return 'Hospital name is required';
  if (name.trim().length < 3) return 'Hospital name must be at least 3 characters';
  return null;
}

export function validateContactPerson(name: string): string | null {
  if (!name || !name.trim()) return 'Contact person name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}

export function validateContactPhone(phone: string): string | null {
  if (!phone || !phone.trim()) return 'Contact phone is required';
  const phoneRegex = /^[\d\s\-+()]{7,20}$/;
  if (!phoneRegex.test(phone)) return 'Invalid phone number format';
  return null;
}

export function validatePatientName(name: string): string | null {
  if (!name || !name.trim()) return 'Patient name is required';
  if (name.trim().length < 2) return 'Patient name must be at least 2 characters';
  return null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getFirstError(errors: ValidationErrors): string | null {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
}
