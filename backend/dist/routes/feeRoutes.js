"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/feeRoutes.ts
const express_1 = require("express");
const feeController_1 = require("../controllers/feeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
// Only Accountants and Administrators can create fee bills
router.post('/', authMiddleware_1.authMiddleware, (0, rbac_1.authorize)(['Accountant', 'Administrator']), feeController_1.createFeeBill);
// Accountants and Administrators can get fee bills; Students/Parents might get their own later
router.get('/', authMiddleware_1.authMiddleware, (0, rbac_1.authorize)(['Accountant', 'Administrator']), feeController_1.getFeeBills);
exports.default = router;
