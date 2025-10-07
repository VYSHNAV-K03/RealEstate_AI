import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../axiosInstance";

const PlotDetails = () => {
  const { id } = useParams();
  const [plot, setPlot] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => {
    const fetchPlot = async () => {
      try {
        const response = await axios.get(apiUrl + `api/user/plots/${id}`);
        setPlot(response.data);
      } catch (error) {
        console.error("Error fetching plot details:", error);
      }
    };
    fetchPlot();
  }, [id]);

  const handlePredict = async () => {
    if (!plot) return;

    setLoadingPrediction(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        location: plot.location,
        sqft: plot.total_sqft,
        bath: plot.bath,
        bhk: parseInt(plot.size.split(" ")[0]), // Extract number from "2 BHK"
      });
      setPredictedPrice(response.data.predicted_price_lakh);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Failed to get prediction");
    } finally {
      setLoadingPrediction(false);
    }
  };

  if (!plot) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Link to="/" className="btn btn-outline-secondary mb-3">
        ← Back to Home
      </Link>

      {/* 🖼️ Image Carousel */}
      <div
        id="plotCarousel"
        className="carousel slide mb-4"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {plot.images && plot.images.length > 0 ? (
            plot.images.map((img, index) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
                <img
                  src={`${apiUrl + img}`}
                  className="d-block w-100"
                  alt={`Plot ${index + 1}`}
                  style={{ height: "500px", objectFit: "cover" }}
                />
              </div>
            ))
          ) : (
            <div className="carousel-item active">
              <div
                className="bg-secondary text-white d-flex align-items-center justify-content-center"
                style={{ height: "500px" }}
              >
                No Images Available
              </div>
            </div>
          )}
        </div>

        {plot.images && plot.images.length > 1 && (
          <>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#plotCarousel"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#plotCarousel"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Next</span>
            </button>
          </>
        )}
      </div>

      {/* 🧱 Plot Details Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h3 className="fw-bold text-primary mb-3">
            {plot.location || "Unknown Location"}
          </h3>
          <p>
            <strong>Area Type:</strong> {plot.area_type}
          </p>
          <p>
            <strong>Availability:</strong> {plot.availability}
          </p>
          <p>
            <strong>Size:</strong> {plot.size}
          </p>
          <p>
            <strong>Society:</strong> {plot.society}
          </p>
          <p>
            <strong>Total Sqft:</strong> {plot.total_sqft}
          </p>
          <p>
            <strong>Bath:</strong> {plot.bath}
          </p>
          <p>
            <strong>Balcony:</strong> {plot.balcony}
          </p>
          <h4 className="text-success mt-3">
            ₹ {plot.price?.toLocaleString()}
          </h4>
        </div>
      </div>

      {/* 🧠 AI Price Prediction */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="card-title">AI Price Prediction</h5>
          <p className="text-muted">
            Click below to estimate the price of this plot using our trained ML
            model.
          </p>
          <button
            className="btn btn-primary"
            onClick={handlePredict}
            disabled={loadingPrediction}
          >
            {loadingPrediction ? "Predicting..." : "Predict Price"}
          </button>

          {predictedPrice && (
            <div className="alert alert-success mt-3">
              🏡 Estimated Price: <strong>₹ {predictedPrice} Lakhs</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlotDetails;
