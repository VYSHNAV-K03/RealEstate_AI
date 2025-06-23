import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import DoctorRegisterPage from "./pages/DoctorRegisterPage";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/Admin";
import DoctorPanel from "./pages/DoctorPanel";
import Profile from "./pages/Profile";
import AttritionExplainer from "./pages/Dashboard";
import FraudPredictionForm from "./pages/FraudPredictionForm";
import Patient from "./pages/Patient";

const App = () => {
  return (
    <Router>
      <div className="bg-custom vh-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-doctor" element={<DoctorRegisterPage />} />
          <Route path="/dashboard" element={<FraudPredictionForm />} />

          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/doctor" element={<DoctorPanel />} />
          <Route path="/patient" element={<Patient />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
