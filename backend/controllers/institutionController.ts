// backend/controllers/institutionController.ts
import { Request, Response } from 'express';
import Institution from '../models/Institution'; // Import the Institution model
import { Types } from 'mongoose';

export const createInstitution = async (req: Request, res: Response) => {
  const { name, branding } = req.body;
  // The owner will come from the authenticated user's ID
  const owner = req.user?.id; // Assuming req.user is populated by authMiddleware

  if (!name || !branding || !branding.companyName || !owner) {
    return res.status(400).json({ message: 'Please enter all required fields: name, branding.companyName, and ensure user is authenticated.' });
  }

  try {
    const newInstitution = new Institution({
      name,
      owner: new Types.ObjectId(owner),
      status: 'active', // Default status
      branding: {
        companyName: branding.companyName,
        companyLogoUrl: branding.companyLogoUrl || '', // Optional logo URL
      },
    });

    const institution = await newInstitution.save();
    res.status(201).json({
      message: 'Institution created successfully',
      institution: {
        id: institution._id,
        name: institution.name,
        owner: institution.owner,
        branding: institution.branding,
      },
    });

  } catch (error: any) {
    console.error('Error creating institution:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getInstitutions = async (req: Request, res: Response) => {
  try {
    const institutions = await Institution.find(); // Find all institutions
    res.status(200).json(institutions);
  } catch (error: any) {
    console.error('Error fetching institutions:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
