"use strict";
// Service for generating unique student/teacher IDs
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStudentId = generateStudentId;
exports.generateTeacherId = generateTeacherId;
async function generateStudentId(institutionId, admissionYear) {
    // Example implementation: "25-001-001"
    // Find the last sequence for this institution and year, increment
    // For demo: just return a static string
    return `${admissionYear.toString().slice(-2)}-001-001`;
}
async function generateTeacherId(institutionId) {
    // Example implementation for staff ID
    return `EMP-${Math.floor(Math.random() * 10000)}`;
}
