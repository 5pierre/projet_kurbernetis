
import StoryRead from "./components/StoryRead";
import RegisterPage from "./components/RegisterPage";
import AdminPage from "./components/AdminPage";
import {BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/register" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StoryRead />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
