import express from "express";
import {
  addCollectionItemOffer,
  listCollectionItemOffers,
  getUserOffers,
  acceptOffer,
} from "../controllers/collectionItemOfferController.js";

const router = express.Router();

// Add a new CollectionItemOffer
router.post("/create", addCollectionItemOffer);

// List CollectionItemOffers with filters, sorting, and pagination
router.get("/list", listCollectionItemOffers);

// List CollectionItemOffers with filters, sorting, and pagination
router.get("/list", listCollectionItemOffers);

// Get all owned items for a specific user
router.get("/get-user-offers", getUserOffers);

router.put("/:id/accept-offer", acceptOffer);

export default router;
