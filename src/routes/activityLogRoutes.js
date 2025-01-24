import express from "express";
import {
  addActivityLog,
  listActivityLogs,
} from "../controllers/activityLogController.js";

const router = express.Router();

// Add an Activity Log
router.post("/create", addActivityLog);

// List Activity Logs with filters, sorting, and pagination
router.get("/list", listActivityLogs);

export default router;
