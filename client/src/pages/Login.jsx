import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/login", formData);
      const user = response.data.user;

      if (!user.isVerified) {
        setError("User is not verified. Please verify your account first.");
        setMessage("");
        return;
      }

      setMessage(response.data.message);
      setError("");

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "broker") {
        navigate("/broker");
      } else {
        navigate("/");
      }
      location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setMessage("");
    }
  };

  return (
    <div className="d-flex">
      <div className="w-50 d-flex align-items-center justify-content-center text-white">
        <img
          src="/images/login.svg"
          alt="Login"
          className="img-fluid"
          style={{ maxWidth: "80%" }}
        />
      </div>
      <div className="w-50 d-flex flex-column justify-content-center align-items-center bg-light p-5">
        <h2 className="mb-4">Login</h2>
        {message && <div className="alert alert-success w-100">{message}</div>}
        {error && <div className="alert alert-danger w-100">{error}</div>}
        <form
          onSubmit={handleSubmit}
          className="w-75 shadow p-4 bg-white rounded"
        >
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
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
