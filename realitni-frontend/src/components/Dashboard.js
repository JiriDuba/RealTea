import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [stats, setStats] = useState({ totalAmount: 0, saleCount: 0 });
  const [unsoldCount, setUnsoldCount] = useState(0);
  const [activeShowingCount, setActiveShowingCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:3001/api/dashboard")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Dashboard data:", data);
        setStats(data);
      })
      .catch((error) => console.error("Error fetching stats:", error));

    fetch("http://localhost:3001/api/properties/unsold")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Unsold properties data:", data);
        setUnsoldCount(data.unsoldCount);
      })
      .catch((error) =>
        console.error("Error fetching unsold properties:", error)
      );

    fetch("http://localhost:3001/api/showings/active")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Active showings data:", data);
        setActiveShowingCount(data.activeCount);
      })
      .catch((error) =>
        console.error("Error fetching active showings:", error)
      );
  }, []);

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

      <h2>Sales Statistics 2025</h2>
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        <div
          style={{
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            flex: 1,
            textAlign: "center",
          }}
        >
          <h3>Total Amount</h3>
          <p style={{ fontSize: "1.5rem", color: "#2563eb" }}>
            {stats.totalAmount.toLocaleString("en-US")} CZK
          </p>
        </div>
        <div
          style={{
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            flex: 1,
            textAlign: "center",
          }}
        >
          <h3>Number of Sales</h3>
          <p style={{ fontSize: "1.5rem", color: "#2563eb" }}>
            {stats.saleCount}
          </p>
        </div>
      </div>

      <h2>Overview</h2>
      <div
        style={{
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
          display: "flex",
          gap: "2rem",
        }}
      >
        <div>
          <h3>Properties</h3>
          <p style={{ fontSize: "1.5rem", color: "#2563eb" }}>
            {unsoldCount}
          </p>
        </div>
        <div>
          <h3>Showings</h3>
          <p style={{ fontSize: "1.5rem", color: "#2563eb" }}>
            {activeShowingCount}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;