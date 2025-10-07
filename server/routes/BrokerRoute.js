const express = require("express");
const Plot = require("../models/plotModel");
const upload = require("../middleware/fileConfig");
const router = express.Router();

// Routes
router.get("/plots/get", async (req, res) => {
  try {
    const plots = await Plot.find();
    res.json(plots);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plots" });
  }
});

router.post("/plots/add", upload.array("images", 5), async (req, res) => {
  try {
    const {
      area_type,
      availability,
      location,
      size,
      society,
      total_sqft,
      bath,
      balcony,
      price,
    } = req.body;

    const imagePaths = req.files.map((file) => `uploads/${file.filename}`);

    const newPlot = new Plot({
      area_type,
      availability,
      location,
      size,
      society,
      total_sqft,
      bath,
      balcony,
      price,
      images: imagePaths,
    });

    await newPlot.save();
    res.json({ message: "Plot added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving plot" });
  }
});

// 🗑️ Delete Plot by ID
router.delete("/plots/delete/:id", async (req, res) => {
  try {
    const plot = await Plot.findByIdAndDelete(req.params.id);
    if (!plot) {
      return res.status(404).json({ message: "Plot not found" });
    }
    res.json({ message: "Plot deleted successfully" });
  } catch (error) {
    console.error("Error deleting plot:", error);
    res.status(500).json({ message: "Server error while deleting plot" });
  }
});

module.exports = router;
