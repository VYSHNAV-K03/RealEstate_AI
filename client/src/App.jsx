import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminPanel from "./pages/Admin";
import Profile from "./pages/Profile";
import BrokerRegisterPage from "./pages/BrokerRegisterPage";
import BrokerPanel from "./pages/Broker";
import PlotDetails from "./pages/PlotDetails";

const App = () => {
  return (
    <Router>
      <div className="bg-custom vh-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-doctor" element={<BrokerRegisterPage />} />

          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/broker" element={<BrokerPanel />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/plot/:id" element={<PlotDetails />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
