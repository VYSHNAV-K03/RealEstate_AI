import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../axiosInstance";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [plots, setPlots] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const response = await axios.get(apiUrl + "api/broker/plots/get");
        setPlots(response.data);
      } catch (error) {
        console.error("Error fetching plots:", error);
      }
    };

    fetchPlots();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="d-flex flex-column justify-content-center align-items-center text-center text-white position-relative"
        style={{
          backgroundImage: `url("/images/homebg2.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "90vh",
        }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
        <div className="position-relative z-2 container">
          <a href="#plots" className="btn btn-primary btn-lg shadow">
            Explore Properties
          </a>
        </div>
      </section>

      {/* 🏡 Dynamic Plots Section */}
      <section id="plots" className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center fw-bold mb-4">Available Plots</h2>

          {plots.length === 0 ? (
            <p className="text-center text-muted">No plots available.</p>
          ) : (
            <div className="row g-4">
              {plots.map((plot) => (
                <div className="col-md-4" key={plot._id}>
                  <div className="card shadow-sm border-0 h-100">
                    {/* Image */}
                    {plot.images && plot.images.length > 0 ? (
                      <img
                        src={`${apiUrl + plot.images[0]}`}
                        className="card-img-top"
                        alt="Plot"
                        style={{ height: "250px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="bg-secondary d-flex align-items-center justify-content-center text-white"
                        style={{ height: "250px" }}
                      >
                        No Image
                      </div>
                    )}

                    {/* Details */}
                    <div className="card-body">
                      <h5 className="card-title text-primary fw-bold">
                        {plot.location || "Unknown Location"}
                      </h5>

                      <p className="card-text text-muted mb-1">
                        <strong>Society:</strong> {plot.society}
                      </p>

                      <p className="card-text text-muted mb-1">
                        <strong>Availability:</strong> {plot.availability}
                      </p>
                      <p className="card-text text-muted mb-1">
                        <strong>Area Type:</strong> {plot.area_type}
                      </p>
                      <p className="card-text text-muted mb-1">
                        <strong>Size:</strong> {plot.size}
                      </p>
                      <p className="card-text text-muted mb-1">
                        <strong>Total Sqft:</strong> {plot.total_sqft}
                      </p>
                      <p className="card-text text-muted mb-1">
                        <strong>Bath:</strong> {plot.bath}
                      </p>
                      <p className="card-text text-muted mb-1">
                        <strong>Balcony:</strong> {plot.balcony}
                      </p>
                      <p className="fw-bold text-success mt-2">
                        ₹ {plot.price?.toLocaleString()} Lakhs
                      </p>
                      <button
                        className="btn btn-outline-primary w-100 mt-2"
                        onClick={() => navigate(`/plot/${plot._id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-5 text-center">
        <div className="container">
          <h2 className="fw-bold mb-4">Why Choose Us?</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <i className="bi bi-house-heart fs-1 text-primary mb-3"></i>
                  <h5 className="fw-bold">Trusted Agents</h5>
                  <p className="text-muted">
                    Our agents are certified and experienced professionals who
                    guide you at every step.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <i className="bi bi-cash-stack fs-1 text-primary mb-3"></i>
                  <h5 className="fw-bold">Affordable Pricing</h5>
                  <p className="text-muted">
                    We offer competitive pricing and transparent deals for every
                    buyer and seller.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <i className="bi bi-geo-alt fs-1 text-primary mb-3"></i>
                  <h5 className="fw-bold">Prime Locations</h5>
                  <p className="text-muted">
                    Explore properties in top locations with high resale value
                    and excellent amenities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} RealEstatePro | All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

export default Home;
