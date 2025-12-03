import React, { useState } from "react";
import { postStories } from "../services/storyService";

function StoryWrite({ onSave }) {
  const [form, setForm] = useState({
    textarea: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.textarea.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await postStories({ content: form.textarea });
      
      if (response && response.data && response.data.story) {
        onSave(response.data.story);
      }
      
      setForm({ textarea: "" });
    } catch (err) {
      console.error('Erreur lors de la création de l\'histoire:', err);
      setError(err.response?.data?.error || 'Erreur lors de la création de l\'histoire');
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
        placeholder="Écrivez votre histoire..."
        rows={4}
        cols={40}
      />
      <br />
      <button type="submit" className="login100-form-btn">Ajouter</button>
    </form>
  );
}

export default StoryWrite;
