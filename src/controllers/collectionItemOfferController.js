import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Add a new CollectionItemOffer
export const addCollectionItemOffer = async (req, res) => {
  const { collectionItemId, offerCreatedBy, amount, offerTokenAccount } =
    req.body;

  try {
    const newOffer = await prisma.collectionItemOffers.create({
      data: {
        collectionItemId,
        offerCreatedBy,
        offerTokenAccount,
        amount,
      },
    });
    res.status(201).json(newOffer);
  } catch (error) {
    console.error("Error adding CollectionItemOffer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// List CollectionItemOffers with filtering, sorting, and pagination
export const listCollectionItemOffers = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdDate",
    sortOrder = "desc",
    collectionItemId,
    offerCreatedBy,
    isAccepted,
  } = req.query;

  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const filters = {};

  if (collectionItemId) {
    filters.collectionItemId = parseInt(collectionItemId, 10);
  }

  if (offerCreatedBy) {
    filters.offerCreatedBy = { contains: offerCreatedBy };
  }

  if (isAccepted !== undefined) {
    filters.isAccepted = isAccepted === "true";
  }

  try {
    const items = await prisma.collectionItemOffers.findMany({
      where: filters,
      skip: skip,
      take: take,
      orderBy: {
        [sortBy]: sortOrder === "asc" ? "asc" : "desc",
      },
      include: {
        collectionItem: true,
        activityLog: true,
      },
    });

    const totalCount = await prisma.collectionItemOffers.count({
      where: filters,
    });

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCount / take),
        totalCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserOffers = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdDate",
    sortOrder = "desc",
    currentOwner,
    collectionItemId,
    offerCreatedBy,
    isAccepted,
  } = req.query;

  if (!currentOwner) {
    return res
      .status(400)
      .json({ error: "The 'currentOwner' parameter is required." });
  }

  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const filters = {};

  if (collectionItemId) {
    filters.collectionItemId = parseInt(collectionItemId, 10);
  }

  if (offerCreatedBy) {
    filters.offerCreatedBy = { contains: offerCreatedBy };
  }

  if (isAccepted !== undefined) {
    filters.isAccepted = isAccepted === "true";
  }

  try {
    const items = await prisma.collectionItemOffers.findMany({
      where: {
        ...filters,
        ...(currentOwner && {
          collectionItem: {
            currentOwner: currentOwner, // Filter by currentOwner
          },
        }),
      },
      skip: skip,
      take: take,
      orderBy: {
        [sortBy]: sortOrder === "asc" ? "asc" : "desc",
      },
      include: {
        collectionItem: true,
        activityLog: false,
      },
    });

    const totalCount = await prisma.collectionItemOffers.count({
      where: {
        ...filters,
        ...(currentOwner && {
          collectionItem: {
            currentOwner: currentOwner, // Filter by currentOwner
          },
        }),
      },
    });

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCount / take),
        totalCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export async function acceptOffer(req, res) {
  const { id } = req.params;
  const { tokenAddress } = req.body;

  try {
    const existingItem = await prisma.collectionItemOffers.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "CollectionItemOffer not found" });
    }

    const updatedItemOffer = await prisma.collectionItemOffers.update({
      where: { id: parseInt(id) },
      data: {
        isAccepted: true,
      },
    });

    const updatedItem = await prisma.collectionItem.update({
      where: { id: parseInt(updatedItemOffer.collectionItemId) },
      data: {
        currentOwner: updatedItemOffer.offerCreatedBy,
        tokenAddress,
        escrowAccount: null,
        status: "SELL",
      },
    });

    res.status(200).json({
      message: "CollectionItemOffer accepted successfully",
      data: updatedItemOffer,
    });
  } catch (error) {
    console.error("Error accepting CollectionItemOffer:", error);
    res.status(500).json({ error: "Failed to accept CollectionItemOffer" });
  }
}
