import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user"
};

const App = () => {
  const webcamRef = useRef(null);
  const [result, setResult] = useState(null);
  const [postureType, setPostureType] = useState("squat");
  const [imageSrc, setImageSrc] = useState(null);
  const [fileInput, setFileInput] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    try {
      const response = await axios.post("http://localhost:5001/analyze", {
        image: screenshot,
        postureType
      });
      setResult(response.data);
      if (!response.data.is_bad_posture) {
        toast.success("🎉 Posture is correct!");
      }
    } catch (err) {
      console.error("Error analyzing posture:", err);
      toast.error("❌ Failed to get response from backend.");
    }
  }, [postureType]);

  useEffect(() => {
    let interval;
    if (webcamActive) {
      interval = setInterval(() => {
        capture();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [webcamActive, capture]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setImageSrc(reader.result);
      setFileInput(reader.result);

      try {
        const response = await axios.post("http://localhost:5001/analyze", {
          image: reader.result,
          postureType,
        });
        setResult(response.data);
        if (!response.data.is_bad_posture) {
          toast.success("🎉 Posture is correct!");
        }
      } catch (err) {
        console.error("Error analyzing posture:", err);
        toast.error("❌ Failed to get response from backend.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="app-wrapper">
      <ToastContainer />

      <header className="header">
        <h1>🧍 AI Posture Checker</h1>
        <p>Analyze your squat or desk posture using AI-powered pose detection</p>
      </header>

      <main className="content">
        <div className="control-section">
          <label>Select Posture Type:</label>
          <select
            value={postureType}
            onChange={(e) => setPostureType(e.target.value)}
          >
            <option value="squat">Squat</option>
            <option value="desk">Desk Sitting</option>
          </select>
        </div>

        <div className="webcam-section">
          <button className="btn-primary" onClick={() => setWebcamActive(!webcamActive)}>
            {webcamActive ? "🛑 Stop Webcam" : "📷 Start Webcam"}
          </button>

          {webcamActive && (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="webcam-preview"
            />
          )}
        </div>

        <div className="upload-section">
          <h3>🖼️ Upload Image or Video</h3>
          <input type="file" accept="image/*,video/*" onChange={handleImageUpload} />
          {imageSrc && <img src={imageSrc} alt="Preview" className="image-preview" />}
        </div>

        {result && (
          <div className="result-section">
            <h3>📊 Result:</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} PostureAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
