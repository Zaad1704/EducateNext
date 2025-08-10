"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpenses = exports.addExpense = void 0;
const Expense_1 = __importDefault(require("../models/Expense"));
const mongoose_1 = require("mongoose");
const addExpense = async (req, res) => {
    const { date, category, amount, description, receiptUrl, status } = req.body;
    const institutionId = req.user?.institutionId;
    const recordedBy = req.user?.id; // The authenticated user is the one recording
    if (!date || !category || !amount || !description || !institutionId || !recordedBy) {
        return res.status(400).json({ message: 'Please provide date, category, amount, description, and ensure user is authenticated.' });
    }
    // Validate status enum if provided
    const validStatuses = ['approved', 'pending', 'rejected'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    try {
        if (!mongoose_1.Types.ObjectId.isValid(institutionId)) {
            return res.status(400).json({ message: 'Invalid institution ID format' });
        }
        if (!mongoose_1.Types.ObjectId.isValid(recordedBy)) {
            return res.status(400).json({ message: 'Invalid recordedBy user ID format' });
        }
        const newExpense = new Expense_1.default({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            recordedBy: new mongoose_1.Types.ObjectId(recordedBy),
            date: new Date(date),
            category,
            amount,
            description,
            receiptUrl,
            status: status || 'pending', // Default to pending if not provided
        });
        const expense = await newExpense.save();
        res.status(201).json({
            message: 'Expense added successfully',
            expense,
        });
    }
    catch (error) {
        console.error('Error adding expense:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addExpense = addExpense;
const getExpenses = async (req, res) => {
    const institutionId = req.user?.institutionId;
    const { category, startDate, endDate, status } = req.query; // Filters
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        const query = { institutionId: new mongoose_1.Types.ObjectId(institutionId) };
        if (category)
            query.category = category;
        if (status)
            query.status = status;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
                query.date.$gte.setUTCHours(0, 0, 0, 0);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
                query.date.$lte.setUTCHours(23, 59, 59, 999);
            }
        }
        const expenses = await Expense_1.default.find(query)
            .populate('recordedBy', 'name email') // Populate user who recorded
            .sort({ date: -1 });
        res.status(200).json(expenses);
    }
    catch (error) {
        console.error('Error fetching expenses:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getExpenses = getExpenses;
