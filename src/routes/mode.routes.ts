import { Router } from "express";
import { updateMode, updateManualDirection } from "../controllers/mode.controller";

export const modeRouter = Router();

modeRouter.post("/mode", updateMode);
modeRouter.post("/manual-direction", updateManualDirection);
