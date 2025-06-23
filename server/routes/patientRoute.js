const express = require("express");
const ClaimModel = require("../models/ClaimModel");
const router = express.Router();

// POST /claims - Create a new claim
router.post("/claims", async (req, res) => {
  const { userId, hospitalName, serviceDescription, amount } = req.body;

  if (!userId || !hospitalName || !serviceDescription || !amount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newClaim = new ClaimModel({
      userId,
      hospitalName,
      serviceDescription,
      amount,
    });

    await newClaim.save();
    res.status(201).json({ message: "Claim submitted successfully." });
  } catch (error) {
    console.error("Error creating claim:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// GET /claims/:userId - Get claims for a user
router.get("/claims/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const claims = await ClaimModel.find({ userId });
    res.status(200).json(claims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Fetch All Claims
router.get("/claims", async (req, res) => {
  try {
    const claims = await ClaimModel.find().populate("userId");
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: "Error fetching claims" });
  }
});

// Update Claim Status
router.put("/claims/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const claim = await ClaimModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.json({ message: "Claim status updated", claim });
  } catch (err) {
    res.status(500).json({ message: "Error updating claim status" });
  }
});

module.exports = router;
