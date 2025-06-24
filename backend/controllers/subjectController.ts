import { Request, Response } from 'express';

export const createSubject = async (req: Request, res: Response) => {
  // Create subject logic
  res.json({ message: 'Create subject endpoint' });
};

export const listSubjects = async (req: Request, res: Response) => {
  // List subjects logic
  res.json({ message: 'List subjects endpoint' });
};