import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";

const Patient = () => {
  const [user] = useState(JSON.parse(localStorage.getItem("user")));
  const [claimData, setClaimData] = useState({
    hospitalName: "",
    serviceDescription: "",
    amount: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [claims, setClaims] = useState([]);

  console.log(claims);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClaimData({ ...claimData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { hospitalName, serviceDescription, amount } = claimData;

    try {
      const response = await axiosInstance.post("/patient/claims", {
        userId: user.id,
        hospitalName,
        serviceDescription,
        amount,
      });
      setMessage(response.data.message);
      setError("");
      setClaimData({ hospitalName: "", serviceDescription: "", amount: "" });
      fetchClaims(); // refresh claims after new submission
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setMessage("");
    }
  };

  const fetchClaims = async () => {
    try {
      const response = await axiosInstance.get(`/patient/claims/${user.id}`);
      console.log(response.data);

      setClaims(response.data || []);
    } catch (err) {
      setError("Failed to load claims.");
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchClaims();
    }
  }, [user]);

  return (
    <div className=" mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="mb-4 text-center">Enter Claim Details</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form
            onSubmit={handleSubmit}
            className="bg-light p-4 rounded shadow mb-5"
          >
            <div className="mb-3">
              <label className="form-label">Hospital Name</label>
              <input
                type="text"
                className="form-control"
                name="hospitalName"
                value={claimData.hospitalName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Service Description</label>
              <textarea
                className="form-control"
                name="serviceDescription"
                value={claimData.serviceDescription}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-control"
                name="amount"
                value={claimData.amount}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Submit Claim
            </button>
          </form>

          <h3 className="mb-3">Your Claims</h3>
          {claims.length === 0 ? (
            <p>No claims submitted yet.</p>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Hospital Name</th>
                  <th>Service Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim._id}>
                    <td>{claim.hospitalName}</td>
                    <td>{claim.serviceDescription}</td>
                    <td>${claim.amount}</td>
                    <td>{claim.status || "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Patient;
