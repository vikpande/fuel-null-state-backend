import express from "express";
import {
  listCollectionItems,
  getCollectionItemById,
  getUserOwnedItems,
  addCollectionItem,
  createFullCollectionItem,
  getCollectionSummary,
  getCollectionAttributes,
  updateListCollectionItem,
  updateBuyCollectionItem,
} from "../controllers/collectionItemController.js";

const router = express.Router();

// List all items for a specific collection
router.get("/:collectionId/items", listCollectionItems);

// Get single item by id
router.get("/:id/item-single", getCollectionItemById);

// Get all owned items for a specific user
router.get("/get-user-owned-items", getUserOwnedItems);

// Add a new collection item
router.post("/item", addCollectionItem);

// Add a new collection item with attrubutes and creators
router.post("/create-full-item", createFullCollectionItem);

// Get collection summary
router.get("/get-collection-summary", getCollectionSummary);

router.get("/get-collection-attributes", getCollectionAttributes);

router.put("/:id/update-list-collection-item", updateListCollectionItem);

router.put("/:id/update-buy-collection-item", updateBuyCollectionItem);

export default router;
