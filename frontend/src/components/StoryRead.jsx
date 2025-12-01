import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoryWrite from "./StoryWrite";
import '../styles/RegisterStyle.css';


export default function StoryRead() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);


  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
    if (!newStory.trim()) return; 
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
            {stories.length === 0 ? (
                <p>Aucune histoire pour le moment.</p>
            ) : (
                stories.map((story, index) => (
                <div key={index} className="story-item">
                    {story}
                </div>
                ))
            )}
        </div>
      </div>
      <div className="wrap-login100-write" style={{ flexDirection: 'column', alignItems: 'center' }}>
            <StoryWrite onSave={addStory} />
      </div>
    </div>
  );
}