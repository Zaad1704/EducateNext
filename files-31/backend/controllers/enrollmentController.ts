import { Request, Response } from 'express';

export const enrollStudent = async (req: Request, res: Response) => {
  // Enroll student logic
  res.json({ message: 'Enroll student endpoint' });
};

export const listEnrollments = async (req: Request, res: Response) => {
  // List enrollments logic
  res.json({ message: 'List enrollments endpoint' });
};