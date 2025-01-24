import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create a new collection
export const createCollection = async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;
    const newCollection = await prisma.collection.create({
      data: { name, description, createdBy },
    });
    res.status(201).json(newCollection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all collections
export const getAllCollections = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
    search,
  } = req.query;

  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const filters = {};

  if (search) {
    filters.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  try {
    const collections = await prisma.collection.findMany({
      where: filters,
      skip: skip,
      take: take,
      orderBy: {
        [sortBy]: sortOrder === "asc" ? "asc" : "desc",
      },
    });

    const collectionsWithSummary = await Promise.all(
      collections.map(async (collection) => {
        const summary = await prisma.collectionItem.aggregate({
          where: {
            collectionId: collection.id,
          },
          _count: {
            id: true,
          },
          _sum: {
            amount: true,
          },
          _min: {
            amount: true,
          },
        });

        // Count items with status "LIST"
        const listItemsCount = await prisma.collectionItem.count({
          where: {
            collectionId: collection.id,
            status: "LIST",
          },
        });

        // Count items with status "SELL"
        const soldItemsCount = await prisma.collectionItem.count({
          where: {
            collectionId: collection.id,
            status: "SELL",
          },
        });

        const uniqueOwners = await prisma.collectionItem.groupBy({
          by: ["currentOwner"],
          where: {
            collectionId: collection.id,
          },
          _count: {
            currentOwner: true,
          },
        });

        const uniqueOwnersCount = uniqueOwners.length;

        return {
          ...collection,
          collectionItemCount: summary._count.id,
          listItemsCount,
          soldItemsCount,
          uniqueOwners: uniqueOwnersCount,
          totalAmount: summary._sum?.amount || 0,
          lowestAmount: summary._min?.amount || 0,
        };
      })
    );

    const totalCount = await prisma.collection.count({
      where: filters,
    });

    res.json({
      collections: collectionsWithSummary,
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

export const getUserCollections = async (req, res) => {
  const { createdBy } = req.query;

  if (!createdBy) {
    return res
      .status(400)
      .json({ error: "The 'createdBy' parameter is required." });
  }

  try {
    const collections = await prisma.collection.findMany({
      where: { createdBy: createdBy },
    });

    if (collections.length === 0) {
      return res
        .status(404)
        .json({ message: "No collections found for this user." });
    }

    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single collection by ID
export const getCollectionById = async (req, res) => {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!collection)
      return res.status(404).json({ message: "Collection not found" });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
