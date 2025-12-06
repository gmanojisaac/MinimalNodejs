"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modeRouter = void 0;
const express_1 = require("express");
const mode_controller_1 = require("../controllers/mode.controller");
exports.modeRouter = (0, express_1.Router)();
exports.modeRouter.post("/mode", mode_controller_1.updateMode);
exports.modeRouter.post("/manual-direction", mode_controller_1.updateManualDirection);
