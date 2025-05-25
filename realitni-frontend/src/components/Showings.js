import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Showings() {
  const [showings, setShowings] = useState([]);
  const [month, setMonth] = useState(""); // Pro výběr měsíce, např. "2025-05"

  useEffect(() => {
    const url = month
      ? `http://localhost:3001/api/showings/list?month=${month}`
      : "http://localhost:3001/api/showings/list";
    console.log("Fetching URL:", url); // Debug log
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched data:", data); // Debug log
        setShowings(data.itemList || []);
      })
      .catch((error) => console.error("Error fetching showings:", error));
  }, [month]);

  return (
    <div className="container">
      <header
        style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}
      >
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "0.5rem" }}
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>ProperTea</h1>
        </Link>
      </header>
      <nav className="sub-nav" style={{ marginBottom: "2rem" }}>
        <Link
          to="/properties"
          style={{
            marginRight: "1rem",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Properties
        </Link>
        <Link
          to="/showings"
          style={{
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Showings
        </Link>
      </nav>

      <h2>All Showings</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Select Month (YYYY-MM):
          <input
            type="month"
            value={month}
            onChange={(e) => {
              console.log("Selected month:", e.target.value);
              setMonth(e.target.value);
            }}
            style={{ marginLeft: "0.5rem", padding: "0.5rem" }}
          />
        </label>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {showings.length === 0 ? (
          <li>No showings available</li>
        ) : (
          showings.map((showing) => (
            <li
              key={showing.id}
              style={{
                padding: "0.5rem",
                border: "1px solid #ccc",
                marginBottom: "0.5rem",
                borderRadius: "4px",
              }}
            >
              {showing.propertyId ? (
                <Link
                  to={`/properties/${showing.propertyId}/showings`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {new Date(showing.date).toLocaleString("en-US")} - {showing.clientName} (
                  {showing.email || "no email"}
                  {showing.phone ? `, ${showing.phone}` : ""}) - Property: [Address not loaded]
                </Link>
              ) : (
                <span>
                  {new Date(showing.date).toLocaleString("en-US")} - {showing.clientName} (
                  {showing.email || "no email"}
                  {showing.phone ? `, ${showing.phone}` : ""}) - Property: [Unknown]
                </span>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Showings;