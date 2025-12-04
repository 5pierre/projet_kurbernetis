import React, { useEffect, useState } from 'react';
// Importez la fonction existante getUser
import { getUser } from '../services/usersService'; 
import '../styles/RegisterStyle.css'; 

export default function UserProfile({ onClose }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userIdRaw = localStorage.getItem('userId');
    const userId = Number.parseInt(userIdRaw, 10); 

    useEffect(() => {
        if (Number.isNaN(userId) || userId <= 0) { 
            setError("Aucun utilisateur connecté ou ID invalide.");
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                // Utilisation de la fonction existante getUser
                const response = await getUser(userId); 
                
                // EXTRAIRE les données de la réponse axios
                setProfile(response.data); 
                setError(null);
            } catch (err) {
                console.error("Erreur lors de la récupération du profil:", err);
                // Le backend peut renvoyer 404/401 avec un message
                const errorMessage = err.response?.data || "Impossible de charger les données du profil. Veuillez vous reconnecter.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    // ... (Reste du code du rendu (JSX) qui reste le même que ma proposition précédente) ...
    // Le code de rendu (JSX) de la modale est le même que dans la proposition précédente

    return (
        <div className="profile-modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000 
        }}>
            <div className="wrap-login100" style={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                padding: '40px',
                width: '400px', 
                position: 'relative' 
            }}>
                <button 
                    onClick={onClose} 
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#999'
                    }}
                >
                    &times; 
                </button>

                <h2 style={{ color: '#333', marginBottom: '20px' }}>👤 Mon Profil</h2>

                {loading && <p>Chargement...</p>}

                {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Erreur: {error}</p>}

                {profile && (
                    <div style={{ width: '100%' }}>
                        <p><strong>Nom :</strong> {profile.name}</p>
                        <p><strong>Email :</strong> {profile.email}</p>
                        <p><strong>Rôle :</strong> {profile.role}</p>
                    </div>
                )}
            </div>
        </div>
    );
}