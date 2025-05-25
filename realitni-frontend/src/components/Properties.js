import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object({
  address: yup.string().min(1, "Adresa je povinná").required(),
  type: yup.string().min(1, "Typ je povinný").required(),
  price: yup
    .number()
    .positive("Cena musí být kladná")
    .required("Cena je povinná"),
  description: yup.string().nullable(),
  sold: yup.boolean(),
  saleDate: yup.string().nullable(),
}).required();

function Properties() {
  const [properties, setProperties] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    fetch("http://localhost:3001/api/properties")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Properties data:", data);
        setProperties(data);
      })
      .catch((error) =>
        console.error("Error fetching properties:", error)
      );
  }, []);

  const onSubmit = async (data) => {
    try {
      const url = editingProperty
        ? `http://localhost:3001/api/properties/${editingProperty._id}`
        : "http://localhost:3001/api/properties";
      const method = editingProperty ? "PUT" : "POST";

      // Převod price na číslo
      const payload = {
        ...data,
        price: Number(data.price),
        saleDate: data.saleDate || null,
      };

      console.log("Submitting data:", payload);
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedProperty = await response.json();
        console.log("Response data:", updatedProperty);
        if (editingProperty) {
          setProperties(
            properties.map((p) =>
              p._id === editingProperty._id ? updatedProperty : p
            )
          );
        } else {
          setProperties([...properties, updatedProperty]);
        }
        setIsFormOpen(false);
        setEditingProperty(null);
        reset();
      } else {
        const errorData = await response.json();
        console.error("Error saving property:", response.status, errorData);
      }
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
    setValue("address", property.address);
    setValue("type", property.type);
    setValue("price", property.price);
    setValue("description", property.description);
    setValue("sold", property.sold);
    setValue(
      "saleDate",
      property.saleDate
        ? new Date(property.saleDate).toISOString().slice(0, 10)
        : ""
    );
  };

  const handleDeleteProperty = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/properties/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setProperties(properties.filter((p) => p._id !== id));
      } else {
        console.error("Error deleting property:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

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

      <h2>List of Properties</h2>
      <button
        onClick={() => {
          setEditingProperty(null);
          setIsFormOpen(true);
          reset();
        }}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        Add New Property
      </button>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {properties.length === 0 ? (
          <li>No properties available</li>
        ) : (
          properties.map((property) => (
            <li
              key={property._id}
              style={{
                padding: "0.5rem",
                border: "1px solid #ccc",
                marginBottom: "0.5rem",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Link
                to={`/properties/${property._id}/showings`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {property.address} ({property.type}, {property.price ? property.price.toLocaleString("en-US") : "Price not specified"} CZK)
              </Link>
              <div>
                <button
                  onClick={() => handleEditProperty(property)}
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    padding: "0.3rem 0.8rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "0.5rem",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProperty(property._id)}
                  style={{
                    backgroundColor: "#dc2626",
                    color: "white",
                    padding: "0.3rem 0.8rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "0.5rem",
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {isFormOpen && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "2rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          <h2>{editingProperty ? "Edit Property" : "Add Property"}</h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <label>
              Address: <span style={{ color: "red" }}>{errors.address?.message}</span>
              <input
                {...register("address")}
                style={{ padding: "0.5rem", border: errors.address ? "1px solid red" : "1px solid #ccc" }}
              />
            </label>
            <label>
              Type: <span style={{ color: "red" }}>{errors.type?.message}</span>
              <select
                {...register("type")}
                style={{ padding: "0.5rem", border: errors.type ? "1px solid red" : "1px solid #ccc" }}
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Land">Land</option>
              </select>
            </label>
            <label>
              Price: <span style={{ color: "red" }}>{errors.price?.message}</span>
              <input
                type="number"
                {...register("price")}
                style={{ padding: "0.5rem", border: errors.price ? "1px solid red" : "1px solid #ccc" }}
              />
            </label>
            <label>
              Description:
              <textarea
                {...register("description")}
                style={{ padding: "0.5rem", border: "1px solid #ccc" }}
              />
            </label>
            <label>
              Sold:
              <input type="checkbox" {...register("sold")} />
            </label>
            <label>
              Sale Date:
              <input
                type="date"
                {...register("saleDate")}
                style={{ padding: "0.5rem", border: "1px solid #ccc" }}
              />
            </label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                disabled={!isValid}
                style={{
                  backgroundColor: isValid ? "#2563eb" : "#cccccc",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isValid ? "pointer" : "not-allowed",
                }}
              >
                {editingProperty ? "Save Changes" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingProperty(null);
                  reset();
                }}
                style={{
                  backgroundColor: "#6b7280",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Properties;