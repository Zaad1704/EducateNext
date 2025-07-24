// Grading service for GPA and grade calculations

export const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
};

export const calculateGPA = (percentage: number): number => {
  if (percentage >= 90) return 4.0;
  if (percentage >= 80) return 3.7;
  if (percentage >= 70) return 3.3;
  if (percentage >= 60) return 3.0;
  if (percentage >= 50) return 2.7;
  if (percentage >= 40) return 2.3;
  if (percentage >= 33) return 2.0;
  return 0.0;
};

export const calculateWeightedGPA = (grades: Array<{gpa: number, weightage: number}>): number => {
  const totalWeighted = grades.reduce((sum, grade) => sum + (grade.gpa * grade.weightage), 0);
  const totalWeightage = grades.reduce((sum, grade) => sum + grade.weightage, 0);
  return totalWeightage > 0 ? totalWeighted / totalWeightage : 0;
};

export const calculateClassRank = async (studentGPA: number, classroomId: string, academicYear: string, semester: string) => {
  // This would typically involve querying all students in the class and comparing GPAs
  // Implementation would depend on your specific ranking algorithm
  return 1; // Placeholder
};

export const getGradingScale = (institutionType: string = 'school') => {
  const scales = {
    school: {
      'A+': { min: 90, max: 100, gpa: 4.0, description: 'Outstanding' },
      'A': { min: 80, max: 89, gpa: 3.7, description: 'Excellent' },
      'B+': { min: 70, max: 79, gpa: 3.3, description: 'Very Good' },
      'B': { min: 60, max: 69, gpa: 3.0, description: 'Good' },
      'C+': { min: 50, max: 59, gpa: 2.7, description: 'Satisfactory' },
      'C': { min: 40, max: 49, gpa: 2.3, description: 'Acceptable' },
      'D': { min: 33, max: 39, gpa: 2.0, description: 'Below Average' },
      'F': { min: 0, max: 32, gpa: 0.0, description: 'Fail' },
    },
    university: {
      'A+': { min: 97, max: 100, gpa: 4.0, description: 'Outstanding' },
      'A': { min: 93, max: 96, gpa: 4.0, description: 'Excellent' },
      'A-': { min: 90, max: 92, gpa: 3.7, description: 'Very Good' },
      'B+': { min: 87, max: 89, gpa: 3.3, description: 'Good' },
      'B': { min: 83, max: 86, gpa: 3.0, description: 'Above Average' },
      'B-': { min: 80, max: 82, gpa: 2.7, description: 'Average' },
      'C+': { min: 77, max: 79, gpa: 2.3, description: 'Below Average' },
      'C': { min: 73, max: 76, gpa: 2.0, description: 'Poor' },
      'C-': { min: 70, max: 72, gpa: 1.7, description: 'Very Poor' },
      'D': { min: 60, max: 69, gpa: 1.0, description: 'Minimal Pass' },
      'F': { min: 0, max: 59, gpa: 0.0, description: 'Fail' },
    }
  };
  
  return scales[institutionType as keyof typeof scales] || scales.school;
};