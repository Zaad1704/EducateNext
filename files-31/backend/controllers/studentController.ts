import { Request, Response } from 'express';

export const addStudent = async (req: Request, res: Response) => {
  // Add student logic
  res.json({ message: 'Add student endpoint' });
};

export const listStudents = async (req: Request, res: Response) => {
  // List students logic
  res.json({ message: 'List students endpoint' });
};