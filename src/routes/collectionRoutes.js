import express from "express";
import {
  getAllCollections,
  getUserCollections,
  getCollectionById,
  createCollection,
} from "../controllers/collectionController.js";

const router = express.Router();

router.get("/", getAllCollections);
router.get("/:id/collection-by-id", getCollectionById);
router.get("/user-collections", getUserCollections);
router.post("/", createCollection);
export default router;
