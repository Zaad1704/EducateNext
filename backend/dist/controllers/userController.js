"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User")); // Import the User model
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select('-password'); // Find all users, exclude password
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getUsers = getUsers;
