import { Request, Response } from 'express';

export const createClassroom = async (req: Request, res: Response) => {
  // Create classroom logic
  res.json({ message: 'Create classroom endpoint' });
};

export const listClassrooms = async (req: Request, res: Response) => {
  // List classrooms logic
  res.json({ message: 'List classrooms endpoint' });
};