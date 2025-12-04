// src/services/authService.js
import axios from 'axios';

export const checkAdminAccess = () => {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'admin') {
      return false;
    }
    
    
    return true;
  };
  
export const logout = async () => {
    try {
      await axios.post('http://localhost:4000/api/auth/logout', {}, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion serveur", error);
    } finally {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      window.location.href = '/auth'; 
    }
  };