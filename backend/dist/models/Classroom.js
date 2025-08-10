"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ClassroomSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    primaryTeacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    capacity: { type: Number, required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Classroom', ClassroomSchema);
