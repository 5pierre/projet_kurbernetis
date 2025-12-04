import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StoryWrite from "./StoryWrite";
import '../styles/RegisterStyle.css';
import Footer from './Footer';
import { getStories } from '../services/storyService';


export default function StoryRead() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);

  const fetchStories = async () => {
    try {
      setError(null);
      const response = await getStories(); 
      
      if (response && response.data && response.data.stories) {
        setStories(response.data.stories); 
      } else {
        setStories([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des histoires:', err);
      setError('Impossible de charger les histoires. Veuillez vérifier la connexion à l\'API.');
      setStories([]);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!userId);
    fetchStories();
  }, []);

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

  const addStory = (newStory) => {
    setStories([newStory, ...stories]);
  };

  return (
    <div className="container-login100">
        <button
            onClick={handleAuthClick}
            className="login100-form-btn-logout"
            style={{ textAlign: 'center' }}
            >
            {isAuthenticated ? 'Se déconnecter' : 'Inscription'}
            </button>
      <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center' }}>
        <h1>Bienvenue sur Discute Potins 🎉</h1>
        <h2>Histoires</h2>
        <div id="story" className="story">
            {error && <p style={{color: 'red'}}>Erreur: {error}</p>}
            {!error && stories.length === 0 ? (
                <p>Aucune histoire pour le moment.</p>
            ) : (
                !error && stories.map((story, index) => (
                <div key={index} className="story-item">
                    {story.content || story} 
                </div>
                ))
            )}
            
        </div>
      </div>
      <div className="wrap-login100-write" style={{ flexDirection: 'column', alignItems: 'center' }}>
            <StoryWrite onSave={addStory} />
      </div>
      <Footer />
    </div>
  );
}
