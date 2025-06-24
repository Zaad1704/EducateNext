// Service for generating unique student/teacher IDs

import Student from '../models/Student';
import Teacher from '../models/Teacher';

export async function generateStudentId(institutionId: string, admissionYear: number): Promise<string> {
  // Example implementation: "25-001-001"
  // Find the last sequence for this institution and year, increment
  // For demo: just return a static string
  return `${admissionYear.toString().slice(-2)}-001-001`;
}

export async function generateTeacherId(institutionId: string): Promise<string> {
  // Example implementation for staff ID
  return `EMP-${Math.floor(Math.random() * 10000)}`;
}