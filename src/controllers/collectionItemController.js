import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// List all items for a specific collection
export async function listCollectionItems(req, res) {
  const { collectionId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
    search,
    ...attributes
  } = req.query;

  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const filters = {
    collectionId: parseInt(collectionId),
    status: {
      in: ["MINT", "LIST"],
    },
  };

  if (search) {
    filters.name = {
      contains: search.toLowerCase(),
    };
  }

  if (Object.keys(attributes).length > 0) {
    filters.collectionItemAttributes = {
      some: {
        OR: Object.entries(attributes).map(([key, value]) => ({
          AND: [{ traitType: key }, { traitValue: { in: value.split(",") } }],
        })),
      },
    };
  }

  try {
    const items = await prisma.collectionItem.findMany({
      where: filters,
      skip: skip,
      take: take,
      orderBy: {
        [sortBy]: sortOrder === "asc" ? "asc" : "desc",
      },
      include: {
        collection: true,
        collectionItemAttributes: false,
        collectionItemCreators: false,
        collectionItemOffers: false,
        activityLog: false,
      },
    });

    const totalCount = await prisma.collectionItem.count({
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
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getCollectionItemById(req, res) {
  try {
    const collectionItem = await prisma.collectionItem.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        collection: true,
        collectionItemAttributes: true,
        collectionItemCreators: false,
        collectionItemOffers: true,
        activityLog: false,
      },
    });
    if (!collectionItem)
      return res.status(404).json({ message: "Collection item not found" });
    res.json(collectionItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserOwnedItems(req, res) {
  const {
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
    ownerAddress = "",
    search,
  } = req.query;

  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const filters = {
    currentOwner: ownerAddress,
    status: {
      in: ["MINT", "LIST", "SELL"],
    },
  };

  if (search) {
    filters.name = {
      contains: search.toLowerCase(),
    };
  }

  try {
    const items = await prisma.collectionItem.findMany({
      where: filters,
      skip: skip,
      take: take,
      orderBy: {
        [sortBy]: sortOrder === "asc" ? "asc" : "desc",
      },
      include: {
        collection: true,
        collectionItemAttributes: false,
        collectionItemCreators: false,
        collectionItemOffers: false,
        activityLog: false,
      },
    });

    const totalCount = await prisma.collectionItem.count({
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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Add a new collection item
export async function addCollectionItem(req, res) {
  try {
    const {
      collectionId,
      name,
      description,
      externalUrl,
      image,
      metadata_url,
      symbol,
      amount,
      status,
    } = req.body;

    const newItem = await prisma.collectionItem.create({
      data: {
        collectionId: parseInt(collectionId),
        name,
        description,
        externalUrl,
        image,
        metadata_url,
        symbol,
        amount: amount ? parseFloat(amount) : null, // Handle decimal values
        status,
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Add a new collection item with attrubutes and creators
export async function createFullCollectionItem(req, res) {
  try {
    const { collectionItemData } = req.body;

    // Create collection item
    const createdItem = await prisma.collectionItem.create({
      data: {
        collectionId: collectionItemData.collectionId,
        name: collectionItemData.name,
        description: collectionItemData.description
          ? collectionItemData.description
          : null,
        externalUrl: collectionItemData.externalUrl
          ? collectionItemData.externalUrl
          : null,
        image: collectionItemData.image ? collectionItemData.image : null,
        metadata_url: collectionItemData.metadata_url
          ? collectionItemData.metadata_url
          : null,
        symbol: collectionItemData.symbol ? collectionItemData.symbol : null,
        amount: collectionItemData.amount ? collectionItemData.amount : null,
        status: "MINT",
        tokenAddress: collectionItemData.tokenAddress
          ? collectionItemData.tokenAddress
          : null,
        mintAddress: collectionItemData.mintAddress
          ? collectionItemData.mintAddress
          : null,
        initialOwner: collectionItemData.initialOwner
          ? collectionItemData.initialOwner
          : null,
        currentOwner: collectionItemData.currentOwner
          ? collectionItemData.currentOwner
          : null,
      },
    });

    // Save collection attributes
    if (
      collectionItemData.attributes &&
      collectionItemData.attributes.length > 0
    ) {
      for (let attribute of collectionItemData.attributes) {
        await prisma.collectionItemAttributes.create({
          data: {
            collectionItemId: createdItem.id,
            traitType: attribute.traitType,
            traitValue: attribute.traitValue,
          },
        });
      }
    }

    // Save collection creators
    if (collectionItemData.creators && collectionItemData.creators.length > 0) {
      for (let creator of collectionItemData.creators) {
        await prisma.collectionItemCreators.create({
          data: {
            collectionItemId: createdItem.id,
            address: creator.address,
            share: creator.share,
          },
        });
      }
    }

    res.status(201).json({ message: "Collection data saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCollectionSummary(req, res) {
  try {
    const summary = await prisma.collectionItem.aggregate({
      _count: {
        id: true, // Total items
      },
      _sum: {
        amount: true, // Sum of amounts
      },
    });

    const uniqueOwners = await prisma.collectionItem.groupBy({
      by: ["currentOwner"], // Group by currentOwner
      _count: {
        currentOwner: true,
      },
    });

    const uniqueOwnersCount = uniqueOwners.length;

    res.status(200).json({
      totalItems: summary._count.id,
      uniqueOwners: uniqueOwnersCount,
      totalAmount: summary._sum?.amount || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
}

export async function getCollectionAttributes(req, res) {
  try {
    const data = await prisma.collectionItemAttributes.groupBy({
      by: ["traitType", "traitValue"],
      _count: {
        traitValue: true,
      },
    });

    const formattedData = Object.values(
      data.reduce((acc, item) => {
        if (!acc[item.traitType]) {
          acc[item.traitType] = {
            key: {
              value: item.traitType,
              count: 0,
            },
            values: [],
          };
        }

        acc[item.traitType].key.count += item._count.traitValue;

        acc[item.traitType].values.push({
          value: item.traitValue,
          count: item._count.traitValue,
        });

        return acc;
      }, {})
    );

    res.status(200).json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
}

export async function updateListCollectionItem(req, res) {
  const { id } = req.params;
  const { amount, escrowAccount } = req.body;

  try {
    const existingItem = await prisma.collectionItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "CollectionItem not found" });
    }

    const updatedItem = await prisma.collectionItem.update({
      where: { id: parseInt(id) },
      data: {
        amount,
        escrowAccount,
        status: "LIST",
      },
    });

    res.status(200).json({
      message: "CollectionItem updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating CollectionItem:", error);
    res.status(500).json({ error: "Failed to update CollectionItem" });
  }
}

export async function updateBuyCollectionItem(req, res) {
  const { id } = req.params;
  const { currentOwner, tokenAddress } = req.body;

  try {
    const existingItem = await prisma.collectionItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "CollectionItem not found" });
    }

    const updatedItem = await prisma.collectionItem.update({
      where: { id: parseInt(id) },
      data: {
        currentOwner,
        tokenAddress,
        escrowAccount: null,
        status: "SELL",
      },
    });

    res.status(200).json({
      message: "CollectionItem updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating CollectionItem:", error);
    res.status(500).json({ error: "Failed to update CollectionItem" });
  }
}
