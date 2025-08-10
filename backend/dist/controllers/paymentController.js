"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStats = exports.deletePayment = exports.updatePayment = exports.getPaymentById = exports.createPayment = exports.getPayments = exports.recordPayment = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const FeeBill_1 = __importDefault(require("../models/FeeBill"));
const mongoose_1 = require("mongoose");
const recordPayment = async (req, res) => {
    const { feeBillId, amountPaid, paymentMethod, transactionId, receiptUrl } = req.body;
    const institutionId = req.user?.institutionId;
    if (!feeBillId || !amountPaid || !paymentMethod || !institutionId) {
        return res.status(400).json({ message: 'Please provide feeBillId, amountPaid, paymentMethod, and ensure user is authenticated.' });
    }
    try {
        if (!mongoose_1.Types.ObjectId.isValid(feeBillId)) {
            return res.status(400).json({ message: 'Invalid fee bill ID format' });
        }
        if (!mongoose_1.Types.ObjectId.isValid(institutionId)) {
            return res.status(400).json({ message: 'Invalid institution ID format' });
        }
        const feeBill = await FeeBill_1.default.findOne({ _id: feeBillId, institutionId: new mongoose_1.Types.ObjectId(institutionId) });
        if (!feeBill) {
            return res.status(404).json({ message: 'Fee bill not found or not in this institution.' });
        }
        // Record the payment
        const newPayment = new Payment_1.default({
            feeBillId: new mongoose_1.Types.ObjectId(feeBillId),
            studentId: feeBill.studentId, // Get studentId from feeBill
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            amountPaid,
            paymentMethod,
            transactionId,
            receiptUrl,
        });
        const payment = await newPayment.save();
        // Update the FeeBill status and add payment reference
        feeBill.payments.push(payment._id);
        // Recalculate paid amount and update status
        const totalPaid = (await Payment_1.default.aggregate([
            { $match: { feeBillId: feeBill._id } },
            { $group: { _id: null, total: { $sum: '$amountPaid' } } }
        ]))[0]?.total || 0;
        if (totalPaid >= feeBill.amount) {
            feeBill.status = 'paid';
        }
        else if (totalPaid > 0) {
            feeBill.status = 'partially_paid';
        }
        else {
            feeBill.status = 'pending'; // Should only happen if totalPaid is 0
        }
        await feeBill.save();
        res.status(201).json({
            message: 'Payment recorded successfully',
            payment,
            updatedFeeBillStatus: feeBill.status,
        });
    }
    catch (error) {
        console.error('Error recording payment:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.recordPayment = recordPayment;
const getPayments = async (req, res) => {
    const institutionId = req.user?.institutionId;
    const { studentId, feeBillId } = req.query; // Filters
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        const query = { institutionId: new mongoose_1.Types.ObjectId(institutionId) };
        if (studentId) {
            if (!mongoose_1.Types.ObjectId.isValid(studentId)) {
                return res.status(400).json({ message: 'Invalid student ID format' });
            }
            query.studentId = new mongoose_1.Types.ObjectId(studentId);
        }
        if (feeBillId) {
            if (!mongoose_1.Types.ObjectId.isValid(feeBillId)) {
                return res.status(400).json({ message: 'Invalid fee bill ID format' });
            }
            query.feeBillId = new mongoose_1.Types.ObjectId(feeBillId);
        }
        const payments = await Payment_1.default.find(query)
            .populate('studentId', 'name generatedId')
            .populate('feeBillId', 'amount dueDate status')
            .sort({ paymentDate: -1 });
        res.status(200).json(payments);
    }
    catch (error) {
        console.error('Error listing payments:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getPayments = getPayments;
const createPayment = async (req, res) => {
    return (0, exports.recordPayment)(req, res);
};
exports.createPayment = createPayment;
const getPaymentById = async (req, res) => {
    const { id } = req.params;
    const institutionId = req.user?.institutionId;
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid payment ID format' });
        }
        const payment = await Payment_1.default.findOne({
            _id: id,
            institutionId: new mongoose_1.Types.ObjectId(institutionId)
        })
            .populate('studentId', 'name generatedId')
            .populate('feeBillId', 'amount dueDate status');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json(payment);
    }
    catch (error) {
        console.error('Error getting payment:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getPaymentById = getPaymentById;
const updatePayment = async (req, res) => {
    const { id } = req.params;
    const institutionId = req.user?.institutionId;
    const updateData = req.body;
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid payment ID format' });
        }
        const payment = await Payment_1.default.findOneAndUpdate({ _id: id, institutionId: new mongoose_1.Types.ObjectId(institutionId) }, updateData, { new: true, runValidators: true }).populate('studentId', 'name generatedId')
            .populate('feeBillId', 'amount dueDate status');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json({
            message: 'Payment updated successfully',
            payment
        });
    }
    catch (error) {
        console.error('Error updating payment:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updatePayment = updatePayment;
const deletePayment = async (req, res) => {
    const { id } = req.params;
    const institutionId = req.user?.institutionId;
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid payment ID format' });
        }
        const payment = await Payment_1.default.findOneAndDelete({
            _id: id,
            institutionId: new mongoose_1.Types.ObjectId(institutionId)
        });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json({ message: 'Payment deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting payment:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deletePayment = deletePayment;
const getPaymentStats = async (req, res) => {
    const institutionId = req.user?.institutionId;
    const { startDate, endDate } = req.query;
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        const query = { institutionId: new mongoose_1.Types.ObjectId(institutionId) };
        if (startDate && endDate) {
            query.paymentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const stats = await Payment_1.default.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$amountPaid' },
                    averageAmount: { $avg: '$amountPaid' }
                }
            }
        ]);
        const paymentMethods = await Payment_1.default.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amountPaid' }
                }
            }
        ]);
        res.status(200).json({
            summary: stats[0] || { totalPayments: 0, totalAmount: 0, averageAmount: 0 },
            paymentMethods
        });
    }
    catch (error) {
        console.error('Error getting payment stats:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getPaymentStats = getPaymentStats;
