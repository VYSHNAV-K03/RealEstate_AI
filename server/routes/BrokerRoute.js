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

module.exports = router;
