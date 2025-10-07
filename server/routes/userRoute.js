const express = require("express");
const Plot = require("../models/plotModel");
const router = express.Router();

router.get("/plots/:id", async (req, res) => {
  try {
    const plot = await Plot.findById(req.params.id);
    if (!plot) return res.status(404).json({ message: "Plot not found" });
    res.json(plot);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plot", error });
  }
});

module.exports = router;
