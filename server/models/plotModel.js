const mongoose = require("mongoose");

// Schema
const plotSchema = new mongoose.Schema({
  area_type: String,
  availability: String,
  location: String,
  size: String,
  society: String,
  total_sqft: String,
  bath: Number,
  balcony: Number,
  price: Number,
  images: [String],
});

const Plot = mongoose.model("Plot", plotSchema);

module.exports = Plot;
