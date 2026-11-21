
import { Router } from "express";
import prisma from "../config/database.js";

const router = Router();

const validRoles = [
  "TRAINING_CENTER_ADMIN",
  "DISTRICT_OFFICER",
  "QUALITY_OFFICER",
  "STATE_ADMIN"
];

// CREATE USER
// POST /api/users/create
router.post("/create", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        message: "Name, email and role are required"
      });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        role
      }
    });

    return res.status(201).json({
      message: "User created successfully",
      data: user
    });

  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      message: "Failed to create user"
    });
  }
});

// GET ALL USERS
// GET /api/users
router.get("/", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "asc"
      }
    });

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users
    });

  } catch (error) {
    console.error("Fetch users error:", error);

    return res.status(500).json({
      message: "Failed to fetch users"
    });
  }
});

export default router;
