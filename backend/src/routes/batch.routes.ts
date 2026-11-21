
import { Router } from "express";
import prisma from "../config/database.js";

const router = Router();

// 1. CREATE BATCH
router.post("/create", async (req, res) => {
  try {
    const { batchName, centerId } = req.body;

    if (!batchName || !centerId) {
      return res.status(400).json({
        message: "Batch name and center ID are required"
      });
    }

    const center = await prisma.user.findUnique({
      where: { id: Number(centerId) }
    });

    if (!center || center.role !== "TRAINING_CENTER_ADMIN") {
      return res.status(400).json({
        message: "Invalid training centre user"
      });
    }

    const batch = await prisma.batch.create({
      data: {
        batchName: batchName.trim(),
        centerId: center.id
      },
      include: {
        center: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { candidates: true }
        }
      }
    });

    return res.status(201).json({
      message: "Batch created successfully",
      data: batch
    });

  } catch (error) {
    console.error("Create batch error:", error);
    return res.status(500).json({
      message: "Failed to create batch"
    });
  }
});

// 2. GET ALL BATCHES
router.get("/", async (req, res) => {
  try {
    const centerId = req.query.centerId
      ? Number(req.query.centerId)
      : undefined;

    if (
      centerId !== undefined &&
      (!Number.isInteger(centerId) || centerId <= 0)
    ) {
      return res.status(400).json({
        message: "Invalid center ID"
      });
    }

    const batches = await prisma.batch.findMany({
      where: centerId ? { centerId } : {},
      include: {
        center: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { candidates: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({
      message: "Batches fetched successfully",
      data: batches
    });

  } catch (error) {
    console.error("Fetch batches error:", error);
    return res.status(500).json({
      message: "Failed to fetch batches"
    });
  }
});

// 3. GET ONE BATCH
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid batch ID"
      });
    }

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        center: true,
        candidates: true,
        approvals: true
      }
    });

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found"
      });
    }

    return res.status(200).json({
      data: batch
    });

  } catch (error) {
    console.error("Fetch batch error:", error);
    return res.status(500).json({
      message: "Failed to fetch batch"
    });
  }
});




// POST /api/batches/:id/candidates
// Only the training centre that owns the batch can add candidates

router.post("/:id/candidates", async (req, res) => {
  try {
    const batchId = Number(req.params.id);
    const { centerId, candidateName, email, phone, courseName, completionDate } = req.body;

    if (!Number.isInteger(batchId) || batchId <= 0) {
      return res.status(400).json({ message: "Invalid batch ID" });
    }

    if (!centerId || !candidateName || !phone || !courseName) {
      return res.status(400).json({
        message: "Center ID, candidate name, phone and course name are required"
      });
    }

    // Check whether the selected user is a training centre
    const center = await prisma.user.findUnique({
      where: { id: Number(centerId) }
    });

    if (!center || center.role !== "TRAINING_CENTER_ADMIN") {
      return res.status(403).json({
        message: "Only training centres can add candidates"
      });
    }

    // Check whether this batch belongs to that training centre
    const batch = await prisma.batch.findUnique({
      where: { id: batchId }
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (batch.centerId !== center.id) {
      return res.status(403).json({
        message: "You cannot add candidates to another centre's batch"
      });
    }

    const candidate = await prisma.candidate.create({
      data: {
        batchId,
        candidateName: String(candidateName).trim(),
        email: email ? String(email).trim() : null,
        phone: String(phone).trim(),
        courseName: String(courseName).trim(),
        completionDate: completionDate ? new Date(completionDate) : null
      }
    });

    return res.status(201).json({
      message: "Candidate added successfully",
      data: candidate
    });

  } catch (error) {
    console.error("Add candidate error:", error);
    return res.status(500).json({
      message: "Failed to add candidate"
    });
  }
});



// POST /api/batches/:id/candidates
// Only the training centre that owns the batch can add candidates

router.post("/:id/candidates", async (req, res) => {
  try {
    const batchId = Number(req.params.id);
    const { centerId, candidateName, email, phone, courseName, completionDate } = req.body;

    if (!Number.isInteger(batchId) || batchId <= 0) {
      return res.status(400).json({ message: "Invalid batch ID" });
    }

    if (!centerId || !candidateName || !phone || !courseName) {
      return res.status(400).json({
        message: "Center ID, candidate name, phone and course name are required"
      });
    }

    // Check whether the selected user is a training centre
    const center = await prisma.user.findUnique({
      where: { id: Number(centerId) }
    });

    if (!center || center.role !== "TRAINING_CENTER_ADMIN") {
      return res.status(403).json({
        message: "Only training centres can add candidates"
      });
    }

    // Check whether this batch belongs to that training centre
    const batch = await prisma.batch.findUnique({
      where: { id: batchId }
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (batch.centerId !== center.id) {
      return res.status(403).json({
        message: "You cannot add candidates to another centre's batch"
      });
    }

    const candidate = await prisma.candidate.create({
      data: {
        batchId,
        candidateName: String(candidateName).trim(),
        email: email ? String(email).trim() : null,
        phone: String(phone).trim(),
        courseName: String(courseName).trim(),
        completionDate: completionDate ? new Date(completionDate) : null
      }
    });

    return res.status(201).json({
      message: "Candidate added successfully",
      data: candidate
    });

  } catch (error) {
    console.error("Add candidate error:", error);
    return res.status(500).json({
      message: "Failed to add candidate"
    });
  }
});



router.post("/candidates/:candidateId/decision", async (req, res) => {
  try {
    const candidateId = Number(req.params.candidateId);
    const { officerId, decision, comments } = req.body;

    const validStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "SENT_BACK",
    ];

    if (!Number.isInteger(candidateId) || candidateId <= 0) {
      return res.status(400).json({ message: "Invalid candidate ID" });
    }

    if (!validStatuses.includes(decision)) {
      return res.status(400).json({ message: "Invalid candidate status" });
    }

    const officer = await prisma.user.findUnique({
      where: { id: Number(officerId) },
    });

    if (!officer || officer.role !== "DISTRICT_OFFICER") {
      return res.status(403).json({
        message: "Only District Officers can change candidate status",
      });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: decision },
    });

    return res.status(200).json({
      message: "Candidate status updated successfully",
      data: updatedCandidate,
    });
  } catch (error) {
    console.error("Candidate status update error:", error);
    return res.status(500).json({
      message: "Failed to update candidate status",
    });
  }
});


export default router;
