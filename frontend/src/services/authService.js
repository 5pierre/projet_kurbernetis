import axios from 'axios';

// On utilise la variable d'env ou localhost par défaut (port 80 implicite)
const BASE_URL = process.env.REACT_APP_API_URL;

export const checkAdminAccess = () => {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin';
};
  
export const logout = async () => {
    try {
      // URL propre via Nginx
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion serveur", error);
    } finally {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      window.location.href = '/register'; 
    }
};