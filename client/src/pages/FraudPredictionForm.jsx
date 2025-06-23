import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../axiosInstance";

function FraudPredictionForm() {
  const [claims, setClaims] = useState([]);
  const [serviceCode, setServiceCode] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  console.log(claims);

  // Fetch Claims
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await axiosInstance.get("/patient/claims");
        setClaims(response.data);
      } catch (err) {
        console.error("Error fetching claims:", err);
        setError("Failed to fetch claims");
      }
    };

    fetchClaims();
  }, []);

  // Handle Verification
  const handleVerify = async (claim) => {
    setServiceCode(claim.serviceDescription);
    setPaidAmount(claim.amount);
    setError(null);
    setPrediction(null);

    try {
      const response = await axiosInstance.post(
        "http://localhost:5000/predict",
        {
          service_description: claim.serviceDescription,
          paid_amount: claim.amount,
        }
      );

      const predictionResult = response.data;
      setPrediction(predictionResult);

      // Update Claim Status
      await axiosInstance.put(`/patient/claims/${claim._id}`, {
        status: predictionResult["HCPCS"].prediction,
      });

      // Fetch updated claims
      const updatedClaims = await axiosInstance.get("/patient/claims");
      setClaims(updatedClaims.data);
    } catch (err) {
      console.error("Error verifying claim:", err);
      setError("Failed to verify claim. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center text-primary mb-4">Fraud Detection System</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <h4>Claims</h4>
          {claims.map((claim) => (
            <div key={claim._id} className="card mb-3 p-3 shadow-sm">
              <p>
                <strong>Patient ID:</strong> {claim.userId._id}
              </p>
              <p>
                <strong>Patient Name:</strong> {claim.userId.username}
              </p>

              <p>
                <strong>Hospital:</strong> {claim.hospitalName}
              </p>
              <p>
                <strong>Service:</strong> {claim.serviceDescription}
              </p>
              <p>
                <strong>Amount:</strong> ${claim.amount}
              </p>
              <p>
                <strong>Status:</strong> {claim.status || "Pending"}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => handleVerify(claim)}
              >
                Verify
              </button>
            </div>
          ))}
        </div>

        <div className="col-md-6">
          {prediction && (
            <div className="card shadow-sm p-4">
              <h4 className="text-success">Prediction Result:</h4>
              <p>
                <strong>Service Code:</strong>{" "}
                {prediction["HCPCS"].service_code || "N/A"}
              </p>
              <p>
                <strong>Prediction:</strong>{" "}
                {prediction["HCPCS"].prediction || "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FraudPredictionForm;
