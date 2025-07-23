import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (location.pathname === "/login") setMode("login");
    else setMode("register");
  }, [location.pathname]);

  const handleToggle = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccess(false);
    setEmail("");
    setPassword("");
    navigate(newMode === "register" ? "/register" : "/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const endpoint = mode === "register"
      ? `${API_BASE}/users/register/`
      : `${API_BASE}/users/login/`;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (mode === "register") {
        if (res.status === 201) {
          setSuccess(true);
          setTimeout(() => handleToggle("login"), 1000);
        } else {
          const msg = await res.text();
          setError(msg);
        }
      } else {
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("jwt", data.jwtToken);
          localStorage.setItem("userId", data.userId);
          navigate("/fetchKeys");
        } else {
          const msg = await res.text();
          setError(msg);
        }
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6" aria-label="Application title">macrofirm</h1>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md" role="main" aria-label="Authentication form">
        <div className="flex justify-center mb-4" role="tablist" aria-label="Authentication mode selection">
          <button
            className={`px-4 py-2 rounded-l ${mode === "register" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => handleToggle("register")}
            role="tab"
            aria-selected={mode === "register"}
            aria-label="Switch to registration mode"
          >
            Register
          </button>
          <button
            className={`px-4 py-2 rounded-r ${mode === "login" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => handleToggle("login")}
            role="tab"
            aria-selected={mode === "login"}
            aria-label="Switch to login mode"
          >
            Login
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label={`${mode} form`}>
          <input
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-label="Email address"
          />
          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-label="Password"
  
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            aria-label={`${mode === "register" ? "Register" : "Login"} with email and password`}
          >
            {mode === "register" ? "Register" : "Login"}
          </button>
        </form>
        {error && (
          <div 
            className="text-red-500 mt-2" 
            id="error-message"
            role="alert"
            aria-live="polite"
            aria-label="Error message"
          >
            {error}
          </div>
        )}
        {success && (
          <div 
            className="text-green-600 mt-2"
            role="alert"
            aria-live="polite"
            aria-label="Success message"
          >
            Registration successful! Redirecting to login...
          </div>
        )}
        {mode === "register" ? (
          <button 
            className="mt-4 text-blue-500 underline" 
            onClick={() => handleToggle("login")}
            aria-label="Switch to login mode - already have an account"
          >
            Already have an account? Login
          </button>
        ) : (
          <button 
            className="mt-4 text-blue-500 underline" 
            onClick={() => handleToggle("register")}
            aria-label="Switch to registration mode - don't have an account"
          >
            Don't have an account? Register
          </button>
        )}
      </div>
    </div>
  );
} 