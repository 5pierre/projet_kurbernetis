// src/services/authService.js

export const checkAdminAccess = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    // Vérifier si le token existe et si l'utilisateur est admin
    if (!token || userRole !== 'admin') {
      return false;
    }
    
    // Ici vous pourriez aussi vérifier la validité du token
    // en le décodant avec jwt-decode par exemple
    
    return true;
  };
  
  export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  };