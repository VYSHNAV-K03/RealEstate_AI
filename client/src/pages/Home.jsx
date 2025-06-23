import React, { useEffect } from 'react';
import axios from 'axios';
import backgroundImage from '../assets/img.jpg'


const Home = () => {
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get('http://localhost:7000');
        console.log(response.data); // Should output 'Server is running on port 6000'
      } catch (error) {
        console.error('Error connecting to server:', error);
      }
    };

    checkServer();
  }, []);

  return (
    <div
    className="d-flex justify-content-center align-items-center text-center"
    style={{ backgroundImage: `url("${backgroundImage}")`, backgroundSize: 'cover',height: '92%' ,color: 'white' }}
  >
    <div>
      <h1 className="display-4 fw-bold">Healthcare Fraud Detection AI</h1>
      <p className="">
      Welcome to Healthcare Fraud Detection AI, your trusted platform for insurance monitoring using AI technology.
      </p>
    </div>
  </div>
  );
};

export default Home;
