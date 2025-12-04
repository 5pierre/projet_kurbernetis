import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/RegisterStyle.css';
import Footer from './Footer';

const RegisterPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user-non-connecte',
    profileData: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const toggleMode = () => setIsLoginMode(!isLoginMode);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'L\'email est requis';
    if (!emailRegex.test(email)) return 'Format d\'email invalide';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Le mot de passe est requis';
    if (password.length < 12) return 'Le mot de passe doit contenir au moins 12 caractères';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const typesCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (typesCount < 3) {
      return 'Le mot de passe doit contenir au moins 3 types parmi : majuscules, minuscules, chiffres, caractères spéciaux';
    }
    return '';
  };


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

   const validateForm = () => {
    const newErrors = {};

    // Validation email
    const emailError = validateEmail(form.email);
    if (emailError) newErrors.email = emailError;

    // Validation mot de passe
    const passwordError = validatePassword(form.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const endpoint = isLoginMode ? 'login' : 'register';
    const url = `http://localhost:4000/api/auth/${endpoint}`;

    try {
      const res = await axios.post(url, form, {withCredentials: true});
      
      if (res.data && res.data.user) {
        const { user } = res.data;
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userRole', user.role);

        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      const errorMessage = isLoginMode 
      ? 'Identifiants incorrects. Veuillez réessayer.' 
      : (err.response?.data?.error || 'Erreur lors de l\'inscription. Veuillez réessayer.');

      alert(`Erreur : ${errorMessage}`);
      console.error('Erreur API:', err.response?.data || err.message);
    }
  };

 return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          <form className="login100-form validate-form" onSubmit={handleSubmit}>
            <span className="login100-form-title">
              {isLoginMode ? 'Connexion' : 'Inscription'}
            </span>

            {!isLoginMode && (
              <>
                <div className="wrap-input100">
                  <input
                    className={`input100 ${errors.name ? 'has-error' : ''}`}
                    type="text"
                    name="name"
                    placeholder="Nom complet"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <span className="focus-input100"></span>
                  {errors.name && (
                    <span className="error-message" style={{ color: '#ff4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="wrap-input100">
                  <input
                    className="input100"
                    type="text"
                    name="profileData"
                    placeholder="Profil (bio, entreprise...)"
                    value={form.profileData}
                    onChange={handleChange}
                  />
                  <span className="focus-input100"></span>
                </div>
              </>
            )}

            <div className="wrap-input100 validate-input">
              <input
                className={`input100 ${errors.email ? 'has-error' : ''}`}
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <span className="focus-input100"></span>
              <span className="symbol-input100">
                <i className="fa fa-envelope" aria-hidden="true"></i>
              </span>
              {errors.email && (
                <span className="error-message" style={{ color: '#ff4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {errors.email}
                </span>
              )}
            </div>

            <div className="wrap-input100 validate-input">
              <input
                className={`input100 ${errors.password ? 'has-error' : ''}`}
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span className="focus-input100"></span>
              <span className="symbol-input100">
                <i className="fa fa-lock" aria-hidden="true"></i>
              </span>
              {errors.password && (
                <span className="error-message" style={{ color: '#ff4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {errors.password}
                </span>
              )}
            </div>

            {!isLoginMode && (
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', fontSize: '12px' }}>
                <strong>Critères du mot de passe :</strong>
                <ul style={{ marginTop: '5px', marginBottom: '0', paddingLeft: '20px' }}>
                  <li style={{ color: form.password.length >= 12 ? '#4CAF50' : '#666' }}>
                    Minimum 12 caractères
                  </li>
                  <li style={{ color: (/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) && (/[0-9]/.test(form.password) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password))) || (/[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) || (/[a-z]/.test(form.password) && /[0-9]/.test(form.password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) ? '#4CAF50' : '#666' }}>
                    Au moins 3 types : majuscules, minuscules, chiffres, spéciaux
                  </li>
                </ul>
              </div>
            )}

            <div className="container-login100-form-btn">
              {errors.api && (
                <div style={{ color: '#ff4444', marginBottom: '10px', textAlign: 'center' }}>
                  {errors.api}
                </div>
              )}
              <button 
                className="login100-form-btn" 
                type="submit"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting 
                  ? 'Chargement...' 
                  : (isLoginMode ? 'Connexion' : 'Créer un compte')
                }
              </button>
            </div>

            {!isLoginMode && (
              <div className="text-center p-t-12">
                <span className="check">
                  <input 
                      type="checkbox" 
                      name="termsAccepted" 
                      id="termsAccepted"
                      required 
                    />
                    <label htmlFor="termsAccepted" className="txt1" style={{ marginLeft: '8px', cursor: 'pointer' }}>
                        J'accepte que mes données soient utilisées pour la création et la gestion de mon compte, la publication de mes histoires et l'accès aux fonctionnalités de lecture du site.
                    </label>
                </span>
              </div>
            )}


            <div className="text-center p-t-12">
              <span className="txt1">
                {isLoginMode ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
              </span>
              <a className="txt2" href="#toggle" onClick={(e) => { e.preventDefault(); toggleMode(); }}>
                {isLoginMode ? 'Créer un compte' : 'Se connecter'}
              </a>
            </div>

          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;