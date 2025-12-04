import React, { useState } from "react";
import { postStories } from "../services/storyService";

function StoryWrite({ onSave }) {
  const [form, setForm] = useState({
    textarea: '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Réinitialiser les messages quand l'utilisateur tape
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les messages
    setError(null);
    setSuccess(null);

    // 👇 VALIDATIONS AVANT setLoading
    if (!form.textarea.trim()) {
      setError("Veuillez écrire une histoire");
      return;
    }

    if (form.textarea.trim().length < 5) {
      setError("Votre histoire est trop courte (minimum 5 caractères)");
      return;
    }

    if (form.textarea.length > 5000) {
      setError("Votre histoire est trop longue (maximum 5000 caractères)");
      return;
    }

    // Maintenant on peut charger
    setLoading(true);

    try {
      const response = await postStories({ content: form.textarea });
      
      if (response && response.data && response.data.story) {
        onSave(response.data.story);
        setSuccess("Histoire publiée avec succès ! 🎉");
        setForm({ textarea: "" }); // Vider le textarea
        
        // Faire disparaître le message après 3 secondes
        setTimeout(() => setSuccess(null), 3000);
      }
      
    } catch (err) {
      console.error('Erreur lors de la création de l\'histoire:', err);
      const errorMessage = err.response?.data?.error || 'Erreur lors de la création de l\'histoire';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        className="story-textarea"
        name="textarea"
        value={form.textarea}
        onChange={handleChange}
        placeholder="Écrivez votre histoire... (minimum 5 caractères)"
        rows={4}
        cols={40}
        disabled={loading}
        maxLength={5000}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '5px',
          border: error ? '2px solid #ff4444' : '1px solid #ddd',
          fontSize: '14px',
          resize: 'vertical'
        }}
      />
      
      {/* Compteur de caractères */}
      <div style={{ 
        textAlign: 'right', 
        fontSize: '12px', 
        color: form.textarea.length > 5000 ? '#ff4444' : '#666',
        marginTop: '5px',
        marginBottom: '10px'
      }}>
        {form.textarea.length} / 5000 caractères
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '10px',
          border: '1px solid #ef5350'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Messages de succès */}
      {success && (
        <div style={{
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '10px',
          border: '1px solid #66bb6a'
        }}>
          ✓ {success}
        </div>
      )}

      <button 
        type="submit" 
        className="login100-form-btn"
        disabled={loading || !form.textarea.trim()}
        style={{
          opacity: (loading || !form.textarea.trim()) ? 0.6 : 1,
          cursor: (loading || !form.textarea.trim()) ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Publication...' : 'Ajouter'}
      </button>
    </form>
  );
}

export default StoryWrite;