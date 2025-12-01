import React, { useState } from "react";

function StoryWrite({ onSave }) {
  const [form, setForm] = useState({
    textarea: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.textarea.trim()) return; 
    onSave(form.textarea);
    setForm({ textarea: "" });
  };

  // const sanitizeInput = (input) => {
  //   return input
  //     .replace(/&/g, '&amp;')
  //     .replace(/</g, '&lt;')
  //     .replace(/>/g, '&gt;')
  //     .replace(/"/g, '&quot;')
  //     .replace(/'/g, '&#x27;')
  //     .replace(/\//g, '&#x2F;');
  // };

  // const handleChange = (e) => {
  //   const sanitized = sanitizeInput(e.target.value); 
  //   setForm({ ...form, [e.target.name]: sanitized });
  // };

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
