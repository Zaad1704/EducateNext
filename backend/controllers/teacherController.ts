import { Request, Response } from 'express';

export const addTeacher = async (req: Request, res: Response) => {
  // Add teacher logic
  res.json({ message: 'Add teacher endpoint' });
};

export const listTeachers = async (req: Request, res: Response) => {
  // List teachers logic
  res.json({ message: 'List teachers endpoint' });
};