import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./App.css"; // ✅ Ensure you import the updated CSS

const App = () => {
  const webcamRef = useRef(null);
  const [result, setResult] = useState(null);
  const [postureType, setPostureType] = useState("squat");
  const [imageSrc, setImageSrc] = useState(null);
  const [fileInput, setFileInput] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
      setFileInput(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const captureAndAnalyze = async () => {
    const image = fileInput || webcamRef.current.getScreenshot();
    if (!image) return alert("Please upload or capture an image.");

    try {
      const response = await axios.post("http://localhost:5001/analyze", {
        image,
        postureType,
      });
      setResult(response.data);
    } catch (err) {
      console.error("❌ Analysis error:", err);
      alert("Failed to analyze posture. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">🧍‍♀️ Posture Detection</h1>

      <div className="section">
        <label htmlFor="postureSelect">🎯 Select Posture Type</label>
        <select
          id="postureSelect"
          value={postureType}
          onChange={(e) => setPostureType(e.target.value)}
        >
          <option value="squat">🏋️ Squat</option>
          <option value="desk">💺 Desk Sitting</option>
        </select>
      </div>

      <div className="section">
        <h3>📷 Capture from Webcam</h3>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam"
        />
      </div>

      <div className="section">
        <h3>📁 Upload an Image</h3>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imageSrc && (
          <img className="preview" src={imageSrc} alt="Preview" />
        )}
      </div>

      <button className="analyze-btn" onClick={captureAndAnalyze}>
        ✅ Analyze Posture
      </button>

      {result && (
        <div className="section">
          <h3>📊 Analysis Result</h3>
          <pre className="result-box">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
