import { Request, Response } from 'express';

export const getUsers = async (req: Request, res: Response) => {
  // List users
  res.json({ message: 'List users endpoint' });
};