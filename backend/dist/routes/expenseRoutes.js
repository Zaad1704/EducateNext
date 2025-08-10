"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/expenseRoutes.ts
const express_1 = require("express");
const expenseController_1 = require("../controllers/expenseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
// Only Accountants and Administrators can add expenses
router.post('/', authMiddleware_1.authMiddleware, (0, rbac_1.authorize)(['Accountant', 'Administrator']), expenseController_1.addExpense);
// Accountants and Administrators can get expenses
router.get('/', authMiddleware_1.authMiddleware, (0, rbac_1.authorize)(['Accountant', 'Administrator']), expenseController_1.getExpenses);
exports.default = router;
