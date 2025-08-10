"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstitutions = exports.createInstitution = void 0;
const Institution_1 = __importDefault(require("../models/Institution")); // Import the Institution model
const mongoose_1 = require("mongoose");
const createInstitution = async (req, res) => {
    const { name, branding } = req.body;
    // The owner will come from the authenticated user's ID
    const owner = req.user?.id; // Assuming req.user is populated by authMiddleware
    if (!name || !branding || !branding.companyName || !owner) {
        return res.status(400).json({ message: 'Please enter all required fields: name, branding.companyName, and ensure user is authenticated.' });
    }
    try {
        const newInstitution = new Institution_1.default({
            name,
            owner: new mongoose_1.Types.ObjectId(owner),
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
    }
    catch (error) {
        console.error('Error creating institution:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createInstitution = createInstitution;
const getInstitutions = async (req, res) => {
    try {
        const institutions = await Institution_1.default.find(); // Find all institutions
        res.status(200).json(institutions);
    }
    catch (error) {
        console.error('Error fetching institutions:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getInstitutions = getInstitutions;
