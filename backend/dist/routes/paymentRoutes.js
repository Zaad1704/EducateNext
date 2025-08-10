"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
// Apply auth middleware to all routes
router.use(authMiddleware_1.authMiddleware);
// Payment routes
router.post('/', paymentController_1.createPayment);
router.get('/', paymentController_1.getPayments);
router.get('/stats', paymentController_1.getPaymentStats);
router.get('/:id', paymentController_1.getPaymentById);
router.put('/:id', paymentController_1.updatePayment);
router.delete('/:id', paymentController_1.deletePayment);
exports.default = router;
