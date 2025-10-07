import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../axiosInstance";

const BrokerPanel = () => {
  const [plots, setPlots] = useState([]);
  const [form, setForm] = useState({
    area_type: "",
    availability: "",
    location: "",
    size: "",
    society: "",
    total_sqft: "",
    bath: "",
    balcony: "",
    price: "",
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchPlots();
  }, []);

  const fetchPlots = async () => {
    try {
      const res = await axios.get(apiUrl + "api/broker/plots/get");
      setPlots(res.data);
    } catch (error) {
      console.error("Error fetching plots:", error);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => setImages([...e.target.files]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    images.forEach((img) => formData.append("images", img));

    try {
      await axios.post(apiUrl + "api/broker/plots/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Property added successfully!");
      setForm({
        area_type: "",
        availability: "",
        location: "",
        size: "",
        society: "",
        total_sqft: "",
        bath: "",
        balcony: "",
        price: "",
      });
      setImages([]);
      fetchPlots();
    } catch (error) {
      console.error("Error adding plot:", error);
    }
  };

  // 🗑️ Delete plot function
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(apiUrl + `api/broker/plots/delete/${id}`);
        alert("🗑️ Property deleted successfully!");
        fetchPlots(); // refresh list
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("❌ Failed to delete property");
      }
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4 fw-bold">Broker Panel</h2>

      {/* Add Property Form */}
      <div className="card mb-5 shadow">
        <div className="card-header bg-primary text-white">
          Add New Property
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            {[
              "area_type",
              "availability",
              "location",
              "size",
              "society",
              "total_sqft",
              "bath",
              "balcony",
              "price",
            ].map((field) => (
              <div className="col-md-6" key={field}>
                <label className="form-label text-capitalize">{field}</label>
                <input
                  type={
                    ["bath", "balcony", "price", "total_sqft"].includes(field)
                      ? "number"
                      : "text"
                  }
                  className="form-control"
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <div className="col-md-12">
              <label className="form-label">Property Images</label>
              <input
                type="file"
                className="form-control"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <div className="col-12 text-center">
              <button type="submit" className="btn btn-success px-5">
                Add Property
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Display All Added Properties */}
      <div className="card shadow">
        <div className="card-header bg-secondary text-white">
          Added Properties
        </div>
        <div className="card-body">
          {plots.length === 0 ? (
            <p className="text-center text-muted">No properties added yet.</p>
          ) : (
            <div className="row">
              {plots.map((plot) => (
                <div className="col-md-4 mb-4" key={plot._id}>
                  <div className="card h-100">
                    {plot.images && plot.images.length > 0 && (
                      <img
                        src={`${apiUrl + plot.images[0]}`}
                        alt={`${apiUrl + plot.images[0]}`}
                        className="card-img-top"
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title text-primary fw-semibold">
                        {plot.society || "Unnamed Property"}
                      </h5>
                      <p className="card-text">
                        <strong>Location:</strong> {plot.location} <br />
                        <strong>Area Type:</strong> {plot.area_type} <br />
                        <strong>Availability:</strong> {plot.availability}{" "}
                        <br />
                        <strong>Size:</strong> {plot.size} sqft <br />
                        <strong>Area:</strong> {plot.total_sqft} sqft <br />
                        <strong>Bathrooms:</strong> {plot.bath} <br />
                        <strong>Balconies:</strong> {plot.balcony} <br />
                        <strong>Price:</strong> ₹{plot.price} Lakhs
                      </p>
                      <button
                        className="btn btn-danger w-100 mt-2"
                        onClick={() => handleDelete(plot._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerPanel;
