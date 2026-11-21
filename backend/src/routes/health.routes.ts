
import { Router } from "express";
import prisma from "../config/database.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "OK",
      message: "CertiFlow API and database are working",
      database: "Connected"
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      database: "Disconnected"
    });
  }
});

export default router;
