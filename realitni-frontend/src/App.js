import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Properties from './components/Properties';
import PropertyShowings from './components/PropertyShowings';
import Dashboard from './components/Dashboard';
import Showings from './components/Showings';
import './index.css';

function App() {
  return (
    <Router>
      <nav className="top-nav"></nav>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id/showings" element={<PropertyShowings />} />
        <Route path="/showings" element={<Showings />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;