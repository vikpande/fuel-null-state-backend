import express from "express";
import cors from "cors";

import collectionRoutes from "./routes/collectionRoutes.js";
import collectionItemRoutes from "./routes/collectionItemRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import collectionItemOfferRoutes from "./routes/collectionItemOfferRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the LunarMint Express API!" });
});

// Routes
app.use("/api/collections", collectionRoutes);
app.use("/api/collection-items", collectionItemRoutes);
app.use("/api/activity-log", activityLogRoutes);
app.use("/api/collection-item-offer", collectionItemOfferRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
