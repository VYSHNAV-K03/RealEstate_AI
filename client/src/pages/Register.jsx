import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { username, email, password, phone } = formData;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const phoneRegex = /^[0-9]{10}$/;
    if (!username) return "Username is required.";
    if (!emailRegex.test(email)) return "Enter a valid email address.";
    if (password.length < 6)
      return "Password must be at least 6 characters long.";
    if (!phoneRegex.test(phone)) return "Enter a valid 10-digit phone number.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    try {
      const response = await axiosInstance.post("/register/user", formData);
      setMessage(response.data.message);
      setError("");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setMessage("");
    }
  };

  return (
    <div className="d-flex vh-100">
      <div className="w-50 d-flex align-items-center justify-content-center text-white">
        <img
          src="/images/register.svg"
          alt="Register"
          className="img-fluid"
          style={{ maxWidth: "80%" }}
        />
      </div>
      <div className="w-50 d-flex flex-column justify-content-center align-items-center bg-light p-5">
        <h2 className="mb-4">Register As a Patient</h2>
        {message && <div className="alert alert-success w-100">{message}</div>}
        {error && <div className="alert alert-danger w-100">{error}</div>}
        <form onSubmit={handleSubmit} className="w-75">
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">
              Phone
            </label>
            <input
              type="text"
              className="form-control"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Register
          </button>
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={() => navigate("/register-doctor")}
          >
            Register as Insurance Officer
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
