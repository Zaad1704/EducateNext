// backend/controllers/studentController.ts
import { Request, Response } from 'express';
import Student from '../models/Student'; // Import Student model
import { generateStudentId } from '../services/idGeneratorService'; // Import ID generator service
import { Types } from 'mongoose'; // For ObjectId validation

export const addStudent = async (req: Request, res: Response) => {
  const { name, admissionYear, classroomId, contactEmail, contactPhone, dateOfBirth, guardianInfo, emergencyContacts, medicalNotes, photoUrl, govtIdNumber, govtIdImageUrlFront, govtIdImageUrlBack } = req.body;
  const institutionId = req.user?.institutionId; // Get institutionId from authenticated user

  // Basic validation (adjust as needed for required fields)
  if (!name || !admissionYear || !classroomId || !contactEmail || !dateOfBirth || !institutionId) {
    return res.status(400).json({ message: 'Please enter all required student fields: name, admissionYear, classroomId, contactEmail, dateOfBirth, and ensure user is authenticated.' });
  }

  try {
    // Validate ObjectId formats
    if (!Types.ObjectId.isValid(classroomId)) {
        return res.status(400).json({ message: 'Invalid classroom ID format' });
    }
    if (!Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({ message: 'Invalid institution ID format' });
    }

    // Generate unique student ID
    const generatedId = await generateStudentId(institutionId, admissionYear);

    const newStudent = new Student({
      name,
      generatedId,
      admissionYear,
      institutionId: new Types.ObjectId(institutionId),
      classroomId: new Types.ObjectId(classroomId),
      contactEmail,
      contactPhone,
      dateOfBirth: new Date(dateOfBirth), // Convert to Date object
      guardianInfo: guardianInfo || [],
      emergencyContacts: emergencyContacts || [],
      medicalNotes,
      photoUrl,
      govtIdNumber,
      govtIdImageUrlFront,
      govtIdImageUrlBack,
    });

    const student = await newStudent.save();
    res.status(201).json({
      message: 'Student added successfully',
      student: {
        id: student._id,
        name: student.name,
        generatedId: student.generatedId,
        admissionYear: student.admissionYear,
        institutionId: student.institutionId,
        classroomId: student.classroomId,
      },
    });

  } catch (error: any) {
    console.error('Error adding student:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const listStudents = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId; // Filter students by authenticated user's institution

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    const students = await Student.find({ institutionId: new Types.ObjectId(institutionId) })
                                  .populate('classroomId', 'name') // Populate classroom name
                                  .select('-guardianInfo -emergencyContacts -medicalNotes -govtIdNumber -govtIdImageUrlFront -govtIdImageUrlBack -__v'); // Exclude sensitive/large fields by default

    res.status(200).json(students);
  } catch (error: any) {
    console.error('Error listing students:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
