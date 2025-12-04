import React, { useEffect, useState } from 'react';
import Footer from './Footer';
import '../styles/RegisterStyle.css';

export default function AdminPage() {
    const [users, setUsers] = useState([]); // Stocke la liste des utilisateurs
    const [loading, setLoading] = useState(true); // Gère le chargement
    const [error, setError] = useState(null); // Gère les erreurs

    // Fonction pour récupérer les utilisateurs
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des utilisateurs');
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

    // Exécute la fonction au chargement du composant
    useEffect(() => {
        fetchUsers();
    }, []); // [] = s'exécute une seule fois au montage

    return (
        <div className="container-login100">
            <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center' }}>
                <h1>Page Admin</h1>
                <p>Bienvenue sur la page d'administration.</p>

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
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {user.id}
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