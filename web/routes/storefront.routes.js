import express from "express";
import { getStorefrontTimers } from "../controllers/timer.controller.js";

const router = express.Router();

router.get("/timers", getStorefrontTimers);

export default router;
