// backend/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import Institution from '../models/Institution';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

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

    // Generate JWT token upon successful registration (optional, but good practice)
    const payload = {
        user: {
            id: user._id,
            role: user.role,
            institutionId: user.institutionId,
        },
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET || 'supersecretjwtkey', // Use JWT_SECRET from env or a fallback
        { expiresIn: '1h' }, // Token expires in 1 hour
        (err, token) => {
            if (err) {
                console.error('JWT signing error:', err);
                return res.status(500).json({ message: 'Error generating token' });
            }
            return res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    institutionId: user.institutionId,
                },
            });
        }
    );

  } catch (error: any) {
    console.error('Error during user registration:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields: email and password' });
  }

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password || ''); // user.password might be undefined if not set
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        institutionId: user.institutionId,
      },
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretjwtkey', // Use JWT_SECRET from env or a fallback
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }
        return res.json({
          message: 'Logged in successfully',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            institutionId: user.institutionId,
          },
        });
      }
    );
  } catch (error: any) {
    console.error('Error during user login:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
