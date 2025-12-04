import React, { useEffect, useState } from 'react';
import Footer from './Footer';
import '../styles/RegisterStyle.css';
import { useNavigate } from 'react-router-dom';
import UserProfile from "./UserProfile";
// 👈 AJOUTER l'importation de deleteUser du service (à créer si non existant, mais je suppose qu'il existe)
// NOTE: L'importation de deleteUser n'est pas nécessaire si vous utilisez fetch directement comme dans fetchUsers
// Cependant, si vous utilisez un fichier de service comme usersService.js que vous avez fourni, importez-le :
import { deleteUser } from '../services/usersService'; // Assurez-vous que le chemin est correct

export default function AdminPage() {
    const [users, setUsers] = useState([]); // Stocke la liste des utilisateurs
    const [loading, setLoading] = useState(true); // Gère le chargement
    const [error, setError] = useState(null); // Gère les erreurs
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    // 👈 NOUVEAU: Pour gérer les messages de succès ou d'erreur après la suppression
    const [message, setMessage] = useState(null); 

    // Fonction pour récupérer les utilisateurs
    const fetchUsers = async () => {
        // ... (votre code existant pour fetchUsers) ...
        try {
            setLoading(true);
            const response = await fetch('http://localhost:4000/api/auth/admin/allusers', { // 👈 ATTENTION: J'ai corrigé le port et la route
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                // Tente de lire le corps de la réponse pour une erreur plus détaillée
                const errorText = await response.text();
                throw new Error(`Erreur lors de la récupération des utilisateurs: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            setUsers(data); // Stocke les utilisateurs dans l'état
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    // 👈 NOUVEAU: Fonction pour supprimer un utilisateur
    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur: ${userName} (ID: ${userId})?`)) {
            return;
        }

        setMessage(null); // Réinitialiser les messages
        try {
            // Utilisation de la fonction deleteUser du service (si elle existe, sinon utilisez fetch)
            // L'URL de l'API de suppression dans auth.routes.js est `/admin/deleteuser/:id`
            const response = await fetch(`http://localhost:4000/api/auth/admin/deleteuser/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Échec de la suppression: ${errorText}`);
            }
            
            setMessage(`Utilisateur ${userName} (ID: ${userId}) supprimé avec succès.`);
            // Mettre à jour la liste des utilisateurs après la suppression
            fetchUsers(); 
        } catch (err) {
            setMessage(`Erreur lors de la suppression: ${err.message}`);
            console.error('Erreur de suppression:', err);
        }
    };


    const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    navigate('/register');
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      handleLogout();
    } else {
      navigate('/register');
    }
  };

useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!userId);

    fetchUsers();
}, []);


    return (
        <div className="container-login100">
            <button
            onClick={handleAuthClick}
            className="login100-form-btn-logout"
            style={{ textAlign: 'center' }}
            >
                {isAuthenticated ? 'Se déconnecter' : 'Inscription'}
            </button>
            {isAuthenticated && (
                <button
                    onClick={() => setShowProfile(true)} // 👈 L'appel est correct
                    className="login100-form-btn-logout"
                    style={{ textAlign: 'center', right: '150px' }} 
                >
                    Voir Mon Profil
                </button>
            )}
            {/* ... */}
            {showProfile && <UserProfile onClose={() => setShowProfile(false)} />} 
            {/* ... */}
            <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center' }}>
                <h1>Page Admin</h1>
                <p>Bienvenue sur la page d'administration.</p>

                {/* Affichage des messages de statut */}
                {message && (
                    <p style={{ color: message.startsWith('Erreur') ? 'red' : 'green', fontWeight: 'bold' }}>
                        {message}
                    </p>
                )}

                {/* Affichage pendant le chargement */}
                {loading && <p>Chargement des utilisateurs...</p>}

                {/* Affichage en cas d'erreur */}
                {error && <p style={{ color: 'red' }}>Erreur: {error}</p>}

                {/* Affichage des utilisateurs */}
                {!loading && !error && (
                    <div style={{ marginTop: '20px', width: '100%' }}>
                        <h2>Liste des utilisateurs ({users.length})</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f0f0f0' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nom</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Rôle</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th> {/* 👈 NOUVEAU */}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id_user}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {user.id_user}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {user.name}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {user.role}
                                        </td>
                                        {/* 👈 NOUVEAU: Bouton Supprimer */}
                                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                            {/* Ne pas permettre de supprimer un administrateur ou soi-même (vérification côté back-end) */}
                                            {user.role !== 'admin' ? (
                                                <button 
                                                    onClick={() => handleDelete(user.id_user, user.name)}
                                                    style={{ 
                                                        backgroundColor: 'red', 
                                                        color: 'white', 
                                                        border: 'none', 
                                                        padding: '5px 10px', 
                                                        borderRadius: '5px', 
                                                        cursor: 'pointer' 
                                                    }}
                                                >
                                                    Supprimer
                                                </button>
                                            ) : (
                                                <span style={{ color: 'gray' }}>Admin</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Si aucun utilisateur */}
                {!loading && !error && users.length === 0 && (
                    <p>Aucun utilisateur trouvé.</p>
                )}
            </div>
            <Footer />
        </div>
    );
}