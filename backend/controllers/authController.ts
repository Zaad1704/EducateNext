// backend/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User'; // Import the User model
import bcrypt from 'bcryptjs'; // We will use bcryptjs for password hashing
import Institution from '../models/Institution'; // Import Institution model for validation/linking
import { Types } from 'mongoose'; // For ObjectId type

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role, institutionId } = req.body;

  // Basic validation
  if (!name || !email || !password || !role || !institutionId) {
    return res.status(400).json({ message: 'Please enter all required fields: name, email, password, role, institutionId' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }

    // Check if institutionId is valid and exists
    if (!Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({ message: 'Invalid institution ID format' });
    }
    const institutionExists = await Institution.findById(institutionId);
    if (!institutionExists) {
        return res.status(400).json({ message: 'Institution not found' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      institutionId,
      status: 'active', // Default status as active upon registration
    });

    await user.save();

    // For now, let's just send a success message.
    // In a real app, you'd generate a JWT token here and send it back.
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
      },
    });

  } catch (error: any) {
    console.error('Error during user registration:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  // Login user implementation (will be implemented next)
  res.json({ message: "Login user endpoint" }); //
};
