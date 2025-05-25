import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

function PropertyShowings() {
  const { id } = useParams();
  const [showings, setShowings] = useState([]);
  const [property, setProperty] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShowing, setEditingShowing] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors, isValid } } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    fetch(`http://localhost:3001/api/properties`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Properties data:", data);
        const foundProperty = data.find(p => p._id === id);
        setProperty(foundProperty);
      })
      .catch(error => console.error('Error fetching property:', error));

    fetch(`http://localhost:3001/api/showings/property/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Showings data:", data);
        setShowings(data);
      })
      .catch(error => console.error('Error fetching showings:', error));
  }, [id]);

  const onSubmit = async (data) => {
    try {
      const url = editingShowing
        ? `http://localhost:3001/api/showings/${editingShowing._id}`
        : `http://localhost:3001/api/showings`;
      const method = editingShowing ? 'PUT' : 'POST';

      const date = new Date(data.date).toISOString();
      const payload = {
        propertyId: id,
        date,
        clientName: data.clientName,
        phone: data.phone || '',
        email: data.email || ''
      };

      console.log("Submitting showing data:", payload); // Debug log
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedShowing = await response.json();
        console.log("Response data:", updatedShowing);
        if (editingShowing) {
          setShowings(showings.map(s => (s._id === editingShowing._id ? updatedShowing : s)));
        } else {
          setShowings([...showings, updatedShowing]);
        }
        setIsFormOpen(false);
        setEditingShowing(null);
        reset();
      } else {
        const errorData = await response.json();
        console.error("Error saving showing:", response.status, errorData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEditShowing = (showing) => {
    setEditingShowing(showing);
    setIsFormOpen(true);
    const localDate = new Date(showing.date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setValue('date', localDateTime);
    setValue('clientName', showing.clientName);
    setValue('phone', showing.phone || '');
    setValue('email', showing.email || '');
  };

  const handleDeleteShowing = async (showingId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/showings/${showingId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setShowings(showings.filter(s => s._id !== showingId));
      } else {
        console.error('Error deleting showing:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleCreateShowing = () => {
    setEditingShowing(null);
    setIsFormOpen(true);
    reset();
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
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
            style={{ marginRight: '0.5rem' }}
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>ProperTea</h1>
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

      <h2>Showings for Property {property ? property.address : 'Loading...'}</h2>
      <button
        onClick={handleCreateShowing}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
      >
        Add New Showing
      </button>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {showings.length === 0 ? (
          <li>No showings for this property</li>
        ) : (
          showings.map(showing => (
            <li
              key={showing._id}
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                {new Date(showing.date).toLocaleString('en-US')} - {showing.clientName} (
                {showing.email || 'no email'}
                {showing.phone ? `, ${showing.phone}` : ''})
              </span>
              <div>
                <button
                  onClick={() => handleEditShowing(showing)}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '0.5rem',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteShowing(showing._id)}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
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
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '2rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          <h2>{editingShowing ? 'Edit Showing' : 'Add Showing'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label>
              Date and Time: <span style={{ color: 'red' }}>{errors.date && '(Required)'}</span>
              <input
                type="datetime-local"
                {...register('date', { required: true })}
                style={{ padding: '0.5rem', border: errors.date ? '1px solid red' : '1px solid #ccc' }}
              />
            </label>
            <label>
              Client Name: <span style={{ color: 'red' }}>{errors.clientName && '(Required)'}</span>
              <input
                {...register('clientName', { required: true })}
                style={{ padding: '0.5rem', border: errors.clientName ? '1px solid red' : '1px solid #ccc' }}
              />
            </label>
            <label>
              Phone:
              <input
                {...register('phone')}
                style={{ padding: '0.5rem', border: '1px solid #ccc' }}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                {...register('email')}
                style={{ padding: '0.5rem', border: '1px solid #ccc' }}
              />
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={!isValid}
                style={{
                  backgroundColor: isValid ? '#2563eb' : '#cccccc',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isValid ? 'pointer' : 'not-allowed',
                }}
              >
                {editingShowing ? 'Save Changes' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingShowing(null);
                  reset();
                }}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
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

export default PropertyShowings;