import express from "express";
import {
  getTimers,
  createTimer,
  updateTimer,
  deleteTimer
} from "../controllers/timer.controller.js";

const router = express.Router();

router.get("/", getTimers);
router.post("/", createTimer);
router.put("/:id", updateTimer);
router.delete("/:id", deleteTimer);

export default router;
