// backend/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User'; // Import the User model

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password'); // Find all users, exclude password
    res.status(200).json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
