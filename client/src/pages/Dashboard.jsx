import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap styles

export default function AttritionExplainer() {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [index, setIndex] = useState("");
  const [reasons, setReasons] = useState([]);
  const [similarEmployees, setSimilarEmployees] = useState([]);
  const [Attrition, setAttrition] = useState();
  const [showDetails, setShowDetails] = useState(false); // Control showing details

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || index === "") {
      alert("Please select a file and enter an employee index");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("index", index);

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImage(`data:image/png;base64,${response.data.explanation_image}`);
      setHtmlContent(response.data.explanation_html);
      setSimilarEmployees(response.data.similar_employees || []);
      setAttrition(response.data.attrition);
      setReasons(response.data.reasons);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process the file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Employee Attrition Explainer</h1>

      {/* File and Index Input */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <input type="file" accept=".csv" onChange={handleFileChange} className="form-control mb-3" />
          <input
            type="number"
            placeholder="Enter Employee Index"
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            className="form-control mb-3"
          />
          <button
            onClick={handleUpload}
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Processing..." : "Upload and Analyze"}
          </button>
        </div>
      </div>

      {/* Show Attrition Message */}
      {Attrition ? (
        <div className="alert alert-danger text-center mt-3">
          Attrition Detected! Click below to view details.
        </div>
      )
        : (
          <div className="alert alert-success text-center mt-3">
            No Attrition Detected.
          </div>
        )
      }

      {/* Show Details Button when Attrition is true */}
      {Attrition && (
        <div className="text-center mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`btn ${showDetails ? "btn-secondary" : "btn-info"}`}
          >
            {showDetails ? "Hide Reasons & Details" : "Show Reasons & Details"}
          </button>
        </div>
      )}

      {/* Show Details Section */}
      {showDetails && (
        <div className="mt-5">
          {/* Explanation Section */}
          {htmlContent && (
            <div className="card mb-4 shadow">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">LIME Explanation</h5>
              </div>
              <div className="card-body">
                <iframe
                  style={{ width: "100%", height: "400px" }}
                  srcDoc={htmlContent}
                  className="w-100 border rounded"
                  title="LIME Explanation"
                />
              </div>
            </div>
          )}

          {/* Reasons for Attrition */}
          <div className="card mb-4 shadow">
            <div className="card-header bg-warning">
              <h5 className="mb-0">Top Reasons for Attrition</h5>
            </div>
            <div className="card-body">
              <ul className="list-group">
                {reasons.map((item, index) => (
                  <li key={index} className="list-group-item">
                    <strong>{item[0]}:</strong> {item[1].toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Similar Employees Section */}
          {similarEmployees.length > 0 && (
            <div className="row">
              <h5 className="mb-3">Top Similar Employees</h5>
              {similarEmployees.map((emp, index) => (
                <div key={index} className="col-md-4 mb-3">
                  <div className="card shadow h-100">
                    <div className="card-body">
                      <h6 className="card-title text-center">Employee {index + 1}</h6>
                      <p><strong>Age:</strong> {Math.round(Number(emp.Age) * 100)}</p>
                      <p><strong>Monthly Income:</strong> ₹{Math.round(Number(emp.MonthlyIncome) * 100000)}</p>
                      <p><strong>Similarity:</strong> {Math.round(Number(emp.similarity) * 100)}%</p>
                      <p>
                        <strong>Attrition Status:</strong>{" "}
                        {Math.round(Number(emp.Attrition_Yes) * 100) === 0 ? (
                          <span className="badge bg-success">No</span>
                        ) : (
                          <span className="badge bg-danger">Yes</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
