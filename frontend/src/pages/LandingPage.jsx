import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function LandingPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/login");
    }
  }, [navigate]);

  const handleGenerate = async () => {
    setError("");
    setKey("");
    setLoading(true);
    const jwt = localStorage.getItem("jwt");
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`${API_BASE}/fetchKeys/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
        body: JSON.stringify({ userId: Number(userId) }),
      });
      if (res.ok) {
        const data = await res.json();
        setKey(data.key);
      } else {
        const msg = await res.text();
        setError(msg);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">hello world</h2>
        <button
          className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 mb-4"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Key"}
        </button>
        {key && (
          <div className="bg-green-100 text-green-800 p-4 rounded w-full text-center font-mono text-lg">
            {key}
          </div>
        )}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
} 