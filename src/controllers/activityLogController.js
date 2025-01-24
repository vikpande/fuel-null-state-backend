import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Add an Activity Log
export const addActivityLog = async (req, res) => {
  const { actionType, actionBy, collectionItemId, collectionItemOfferId } =
    req.body;

  try {
    const newActivityLog = await prisma.activityLog.create({
      data: {
        actionType,
        actionBy,
        collectionItemId,
        collectionItemOfferId,
      },
    });
    res.status(201).json(newActivityLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List Activity Logs with filtering, sorting, and pagination
export const listActivityLogs = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "actionDateTime",
    sortOrder = "desc",
    actionType,
    actionBy,
  } = req.query;

  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const filters = {};

  if (actionType) {
    filters.actionType = actionType;
  }

  if (actionBy) {
    filters.actionBy = actionBy;
  }

  try {
    const items = await prisma.activityLog.findMany({
      where: filters,
      skip: skip,
      take: take,
      orderBy: {
        [sortBy]: sortOrder === "asc" ? "asc" : "desc",
      },
      include: {
        collectionItem: true,
        collectionItemOffer: true,
      },
    });

    const totalCount = await prisma.activityLog.count({ where: filters });

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
